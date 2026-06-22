import type { RouteInfo } from "../page-tools";
import { hookGlobals } from "../globals";
import { AsyncLocalStorage } from "node:async_hooks";

hookGlobals();

export interface RenderContext {
    atomValues: Map<string, any>;
    atomRegistry: Array<{ id: string }>;
    regions: Array<any[]>;
    regionCounter: number;
    insideComponentDepth: number;
}

export const renderContextStorage = new AsyncLocalStorage<RenderContext>();

export function createRenderContext(): RenderContext {
    return {
        atomValues: new Map(),
        atomRegistry: [],
        regions: [],
        regionCounter: 0,
        insideComponentDepth: 0,
    };
}

export async function runWithRenderContext<T>(
    ctx: RenderContext,
    fn: () => Promise<T>
): Promise<T> {
    return renderContextStorage.run(ctx, fn);
}

export function getAtomSnapshot(ctx: RenderContext): Record<string, any> {
    const snapshot: Record<string, any> = {};
    for (const { id } of ctx.atomRegistry) {
        snapshot[id] = ctx.atomValues.get(id);
    }
    return snapshot;
}

const SELF_CLOSING_TAGS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "source", "track", "wbr",
]);

function flattenVNodes(into: VirtualNode[], vs: VirtualNode[]): void {
    for (const v of vs) {
        if (v === null || v === false || v === undefined) continue;
        if (Array.isArray(v)) flattenVNodes(into, v as VirtualNode[]);
        else into.push(v);
    }
}

export interface HtmlSink {
    append(s: string): void;
}

export class HtmlBuilder implements HtmlSink {
    private parts: string[] = [];
    append(s: string) { this.parts.push(s); }
    join(): string { return this.parts.join(""); }
}

export interface GeneratePageHtmlResult {
    fullHtml: string;
}

export async function generatePageHTML(
    pageRoot: VirtualNode,
    metaNodes: VirtualNode[],
    route: RouteInfo,
    bundleSrc: string,
    ctx: RenderContext,
    extraScripts?: string[],
): Promise<GeneratePageHtmlResult> {
    const bodyBuilder = new HtmlBuilder();
    await renderTopLevel(pageRoot, bodyBuilder, ctx);

    const headBuilder = new HtmlBuilder();
    for (const node of metaNodes) {
        const r = renderVirtualNode(node, headBuilder, ctx);
        if (r) await r;
        headBuilder.append("\n");
    }

    const hydrationPayload = JSON.stringify({ atoms: getAtomSnapshot(ctx) });
    const bodyHtml = bodyBuilder.join();

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="modulepreload" href="/client.js">
  <link rel="modulepreload" href="${bundleSrc}">
  ${(extraScripts || []).map(src => `<link rel="modulepreload" href="${src}">`).join('')}
  <script type="module" src="/client.js"></script>
  <script data-pathname="${route.pathname}" type="module" data-bundle="true" src="${bundleSrc}"></script>
  ${headBuilder.join()}
</head>
<body>
  ${bodyHtml}
  <script data-tag="iav" type="application/json">${hydrationPayload}</script>
</body>
</html>`;

    return { fullHtml };
}

export async function generateDynamicPageHTML(
    pageRoot: VirtualNode,
    metaNodes: VirtualNode[],
    route: RouteInfo,
    getClientCode: () => string,
    ctx: RenderContext
): Promise<string> {
    const bodyBuilder = new HtmlBuilder();
    const bodyResult = renderTopLevel(pageRoot, bodyBuilder, ctx);
    if (bodyResult) await bodyResult;

    const headBuilder = new HtmlBuilder();
    for (const node of metaNodes) {
        const r = renderVirtualNode(node, headBuilder, ctx);
        if (r) await r;
        headBuilder.append("\n");
    }

    const clientCode = getClientCode();
    const hydrationPayload = JSON.stringify({ atoms: getAtomSnapshot(ctx) });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="modulepreload" href="/client.js">
  ${headBuilder.join()}
  <script type="module" src="/client.js"></script>
</head>
<body>
  ${bodyBuilder.join()}
  <script data-pathname="${route.pathname}" type="text/plain" data-bundle="true" id="__dyn_bundle">${clientCode}</script>
  <script data-tag="iav" type="application/json">${hydrationPayload}</script>
</body>
</html>`;
}

function renderTopLevel(
    node: VirtualNode,
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    if (node === null || node === false || node === undefined) return;
    if (Array.isArray(node)) return renderChildren(node as VirtualNode[], into, ctx);
    if (typeof node === "object" && (node as any).__type === "live") return renderChildren([node], into, ctx);
    return renderVirtualNode(node, into, ctx);
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderVirtualNode(
    node: VirtualNode,
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    if (node === false || node === undefined || node === null) return;

    if (typeof node === "string") {
        into.append(escapeHtml(node));
        return;
    }
    if (typeof node === "number") {
        into.append(String(node));
        return;
    }

    if (Array.isArray(node)) {
        return renderChildren(node as VirtualNode[], into, ctx);
    }

    if (typeof node === "object" && "__rawHTML" in node) {
        into.append((node as any).content);
        return;
    }

    if ((node as any).__type === "live") {
        return renderLiveComponent(node as any, into, ctx);
    }

    if ((node as any).__type === "element") {
        return renderElement(node as ElementDescriptor, into, ctx);
    }
}

function renderElement(
    element: ElementDescriptor,
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    into.append(`<${element.tag}`);

    if (ctx.insideComponentDepth === 0) {
        const eid = element.options.__eid;
        if (typeof eid === "number") {
            into.append(` e-id="${eid}"`);
        }
    }

    for (const optionName in element.options) {
        if (optionName.startsWith("on")) continue;
        if (optionName === "__eid") continue;

        const value = element.options[optionName];

        const htmlOptionName =
            optionName === "className" ? "class" : optionName;

        into.append(
            ` ${htmlOptionName}="${escapeHtml(String(value))}"`
        );
    }

    if (SELF_CLOSING_TAGS.has(element.tag)) {
        into.append("/>");
        return;
    }

    into.append(">");

    const childResult = renderChildren(element.children, into, ctx);

    if (childResult) {
        return childResult.then(() => {
            into.append(`</${element.tag}>`);
        });
    }

    into.append(`</${element.tag}>`);
}

function renderChildren(
    children: VirtualNode[],
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    const flat: VirtualNode[] = [];
    flattenVNodes(flat, children);

    for (let i = 0; i < flat.length; i++) {
        const child = flat[i]!;
        const isLive =
            typeof child === "object" &&
            child !== null &&
            !Array.isArray(child) &&
            (child as any).__type === "live";

        if (isLive) {
            return renderChildrenAsyncFrom(flat, i, into, ctx);
        }

        const result = renderVirtualNode(child, into, ctx);
        if (result) {
            return result.then(() => renderChildrenAsyncFrom(flat, i + 1, into, ctx));
        }
    }
}

async function renderChildrenAsyncFrom(
    flat: VirtualNode[],
    startI: number,
    into: HtmlSink,
    ctx: RenderContext,
): Promise<void> {
    let i = startI;
    while (i < flat.length) {
        const child = flat[i]!;
        const isLive =
            typeof child === "object" &&
            child !== null &&
            !Array.isArray(child) &&
            (child as any).__type === "live";

        if (isLive) {
            const regionIdx = ctx.regionCounter++;
            ctx.regions[regionIdx] = [];
            into.append(`<template data-region="${regionIdx}"></template>`);

            while (i < flat.length) {
                const c = flat[i]!;
                const stillLive =
                    typeof c === "object" &&
                    c !== null &&
                    !Array.isArray(c) &&
                    (c as any).__type === "live";
                if (!stillLive) break;
                ctx.regions[regionIdx]!.push(c);
                await renderLiveComponent(c as any, into, ctx);
                i++;
            }
        } else {
            const result = renderVirtualNode(child, into, ctx);
            if (result) await result;
            i++;
        }
    }
}

async function renderLiveComponent(
    component: any,
    into: HtmlSink,
    ctx: RenderContext,
): Promise<void> {
    const definition = component.__definition;
    const props = component.props ?? {};
    if (definition.serverInit) await definition.serverInit(ctx, props);

    ctx.insideComponentDepth++;
    try {
        const vnode = definition.render(props);
        const result = renderVirtualNode(vnode, into, ctx);
        if (result) await result;
    } finally {
        ctx.insideComponentDepth--;
    }
}