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
    private out = "";
    append(s: string) { this.out += s; }
    join(): string { return this.out; }
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

    const hydrationPayload = JSON.stringify({ atoms: getAtomSnapshot(ctx) }).replace(/</g, "\\u003c");
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
    const hydrationPayload = JSON.stringify({ atoms: getAtomSnapshot(ctx) }).replace(/</g, "\\u003c");

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
    let i = 0;
    const n = str.length;

    for (; i < n; i++) {
        const c = str.charCodeAt(i);
        if (c === 38 || c === 60 || c === 62 || c === 34 || c === 39) break;
    }
    if (i === n) return str;

    let result = "";
    let last = 0;
    for (;;) {
        for (; i < n; i++) {
            const c = str.charCodeAt(i);
            if (c === 38 || c === 60 || c === 62 || c === 34 || c === 39) break;
        }
        if (i === n) break;

        const c = str.charCodeAt(i);
        const esc =
            c === 38 ? "&amp;" :
            c === 60 ? "&lt;" :
            c === 62 ? "&gt;" :
            c === 34 ? "&quot;" :
            "&#39;";
        result += str.slice(last, i) + esc;
        i++;
        last = i;
    }
    return result + str.slice(last);
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

    if ((node as any).__type === "element") {
        return renderElement(node as ElementDescriptor, into, ctx);
    }

    if ((node as any).__type === "live") {
        return renderLiveComponent(node as any, into, ctx);
    }

    if ((node as any).__rawHTML) {
        into.append((node as any).content);
        return;
    }

    if (node instanceof Promise)
        return (node as Promise<VirtualNode>).then((resolved) =>
            renderChildren([resolved], into, ctx)
        );
}

function renderElement(
    element: ElementDescriptor,
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    const tag = element.tag;
    let open = `<${tag}`;

    if (ctx.insideComponentDepth === 0) {
        const eid = element.options.__eid;
        if (typeof eid === "number") {
            open += ` e-id="${eid}"`;
        }
    }

    const options = element.options;
    for (const optionName in options) {
        if (optionName.startsWith("on")) continue;
        if (optionName === "__eid") continue;

        const value = options[optionName];
        const htmlOptionName = optionName === "className" ? "class" : optionName;

        open += ` ${htmlOptionName}="${escapeHtml(typeof value === "string" ? value : String(value))}"`;
    }

    if (SELF_CLOSING_TAGS.has(tag)) {
        into.append(open + "/>");
        return;
    }

    into.append(open + ">");

    const children = element.children;

    if (children.length === 1) {
        const single = children[0];
        if (typeof single === "string") {
            into.append(escapeHtml(single));
            into.append(`</${tag}>`);
            return;
        }
        if (typeof single === "number") {
            into.append(String(single));
            into.append(`</${tag}>`);
            return;
        }
    }

    const childResult = renderChildren(children, into, ctx);

    if (childResult) {
        return childResult.then(() => {
            into.append(`</${tag}>`);
        });
    }

    into.append(`</${tag}>`);
}

function renderChildren(
    children: VirtualNode[],
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (c === null || c === false || c === undefined) continue;
        if (Array.isArray(c)) {
            const flat: VirtualNode[] = [];
            flattenVNodes(flat, children.slice(i) as VirtualNode[]);
            return renderChildrenFlat(flat, into, ctx);
        }
        if (isLiveNode(c)) {
            const flat: VirtualNode[] = [];
            flattenVNodes(flat, children.slice(i) as VirtualNode[]);
            return renderChildrenAsyncFrom(flat, 0, into, ctx);
        }
        const r = renderChildNode(c, into, ctx);
        if (r) return r.then(() => renderChildrenAsyncFrom(children.slice(i + 1) as VirtualNode[], 0, into, ctx));
    }
}

function isLiveNode(child: VirtualNode): boolean {
    return (
        typeof child === "object" &&
        child !== null &&
        !Array.isArray(child) &&
        (child as any).__type === "live"
    );
}

function renderChildNode(
    child: VirtualNode,
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    if (typeof child === "string") {
        into.append(escapeHtml(child));
        return;
    }
    if (typeof child === "number") {
        into.append(String(child));
        return;
    }
    if ((child as any).__type === "element") {
        return renderElement(child as ElementDescriptor, into, ctx);
    }
    if ((child as any).__rawHTML) {
        into.append((child as any).content);
        return;
    }

    if (child instanceof Promise)
        return (child as Promise<VirtualNode>).then((resolved) =>
            renderChildren([resolved], into, ctx)
        );
}

function renderChildrenFlat(
    flat: VirtualNode[],
    into: HtmlSink,
    ctx: RenderContext,
): void | Promise<void> {
    for (let i = 0; i < flat.length; i++) {
        const child = flat[i]!;
        if (isLiveNode(child)) {
            return renderChildrenAsyncFrom(flat, i, into, ctx);
        }
        const r = renderChildNode(child, into, ctx);
        if (r) return r.then(() => renderChildrenAsyncFrom(flat, i + 1, into, ctx));
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