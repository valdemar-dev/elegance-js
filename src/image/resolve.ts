import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseSync } from "oxc-parser";
import { applyEdits, forEachChild, type Edit } from "../processing/oxc";
import { richError, type RichError } from "../error";
import { getConfig } from "../config";
import { readDims, type ImageDims } from "./dims";

import {
    deriveWidths,
    registerVariant,
    type ImageConfig,
    type ImageFormat,
    type ImageProps,
} from "./core";

const ELEGANCE_IMPORT = "elegance-js";

const dimsCache = new Map<string, Promise<ImageDims | null>>();

function getDims(srcPath: string): Promise<ImageDims | null> {
    let cached = dimsCache.get(srcPath);

    if (!cached) {
        cached = readDims(srcPath);
        dimsCache.set(srcPath, cached);
    }

    return cached;
}

export interface ResolvedImage {
    source: string;
}

const FORWARDED_KEYS = ["alt", "className", "id", "loading", "decoding"];

const RESERVED_KEYS = new Set([
    "src", "sizes", "fill", "priority", "quality",
    "formats", "widths", "unoptimized", "placeholder",
]);

const OPTIMIZABLE = new Set<ImageFormat>(["png", "jpeg", "webp"]);

function mimeFor(format: ImageFormat): string {
    if (format === "webp") return "image/webp";
    if (format === "jpeg") return "image/jpeg";

    return "image/png";
}

function qualityFor(format: ImageFormat, props: ImageProps, config: ImageConfig): number {
    return props.quality ?? config.quality[format];
}

function srcsetString(entries: Array<{ url: string; width: number }>): string {
    return entries.map((e) => `${e.url} ${e.width}w`).join(", ");
}

function pickWidths(props: ImageProps, intrinsicWidth: number, config: ImageConfig): number[] {
    let widths = (props.widths ?? deriveWidths(props.sizes, config)).filter((w) => w <= intrinsicWidth);

    if (widths.length === 0 && props.width) {
        widths = [props.width, props.width * 2].filter((w) => w <= intrinsicWidth);
    }

    if (widths.length === 0) {
        widths.push(intrinsicWidth);
    }

    return [...new Set(widths)].sort((a, b) => a - b);
}

function passthroughSource(props: ImageProps): string {
    const attrs = [`src: ${JSON.stringify(props.src)}`];

    for (const key of Object.keys(props)) {
        if (RESERVED_KEYS.has(key)) {
            continue;
        }

        attrs.push(`${key}: ${JSON.stringify(props[key])}`);
    }

    return `__tags.img({ ${attrs.join(", ")} })`;
}

function imgSource(
    props: ImageProps,
    dims: { width: number; height: number },
    variants: Array<{ url: string; width: number }>,
    sizes: string | undefined,
): string {
    const attrs: string[] = [];

    attrs.push(`src: ${JSON.stringify(variants[variants.length - 1].url)}`);
    attrs.push(`srcset: ${JSON.stringify(srcsetString(variants))}`);

    if (sizes) {
        attrs.push(`sizes: ${JSON.stringify(sizes)}`);
    }

    attrs.push(`width: ${dims.width}`);
    attrs.push(`height: ${dims.height}`);

    for (const key of FORWARDED_KEYS) {
        const value = props[key];
        if (value === undefined) continue;

        attrs.push(`${key}: ${JSON.stringify(value)}`);
    }

    if (props.fill) {
        attrs.push(`style: ${JSON.stringify(`${props.style ?? ""}position:absolute;inset:0;width:100%;height:100%;object-fit:cover`)}`);
    } else if (props.style) {
        attrs.push(`style: ${JSON.stringify(props.style)}`);
    }

    return `__tags.img({ ${attrs.join(", ")} })`;
}

export function buildImageSource(
    props: ImageProps,
    dims: { width: number; height: number; format: string },
    config: ImageConfig,
): ResolvedImage {
    const displayWidth = props.width ?? dims.width;
    const displayHeight = props.height ?? Math.max(1, Math.round((displayWidth * dims.height) / dims.width));

    const displayDims = {
        width: displayWidth, 
        height: displayHeight 
    };

    if (!config.optimize || props.unoptimized || !OPTIMIZABLE.has(dims.format as ImageFormat)) {
        return { 
            source: passthroughSource(props), 
        };
    }

    const widths = pickWidths(props, dims.width, config);
    const sourceFormat = dims.format as ImageFormat;
    const formats = props.formats ?? config.formats;
    const pictureFormats = formats.filter((f) => f !== sourceFormat);
    const sizes = props.sizes;


    if (pictureFormats.length === 0) {
        const variants = widths.map((w) => ({
            url: registerVariant(props.src, w, sourceFormat, qualityFor(sourceFormat, props, config)),
            width: w,
        }));

        return { 
            source: imgSource(props, displayDims, variants, sizes), 
        };
    }

    const children: string[] = [];
    for (const format of pictureFormats) {
        const variants = widths.map((w) => ({
            url: registerVariant(props.src, w, format, qualityFor(format, props, config)),
            width: w,
        }));

        const attrs = [
            `type: ${JSON.stringify(mimeFor(format))}`,
            `srcset: ${JSON.stringify(srcsetString(variants))}`,
        ];

        if (sizes) {
            attrs.push(`sizes: ${JSON.stringify(sizes)}`);
        }

        children.push(`__tags.source({ ${attrs.join(", ")} })`);
    }

    const fallback = widths.map((w) => ({
        url: registerVariant(props.src, w, sourceFormat, qualityFor(sourceFormat, props, config)),
        width: w,
    }));

    children.push(imgSource(props, displayDims, fallback, sizes));

    return { 
        source: `__tags.picture({}, ${children.join(", ")})`, 
    };
}

export async function resolveImagesInSource(
    source: string,
    filePath: string,
): Promise<string> {
    if (!source.includes("Image")) {
        return source;
    }

    const config = await getConfig();
    const publicDir = join(process.cwd(), config.output.publicDirectory!);
    const imageConfig = config.image;

    let ast: any;
    try {
        ast = parseSync(filePath, source, { sourceType: "module" });
    } catch {
        return source;
    }

    const localNames = findImageLocalNames(ast);

    if (localNames.size === 0) {
        return source;
    }

    const calls: Array<{ node: any }> = [];
    collectImageCalls(ast.program, localNames, calls);

    if (calls.length === 0) {
        return source;
    }

    const edits: Edit[] = [];
    for (const { node } of calls) {
        const replacement = await resolveCall(node, source, filePath, publicDir, imageConfig);

        if (replacement !== null) {
            edits.push({ 
                start: node.start, 
                end: node.end, 
                replacement 
            });
        }
    }

    if (edits.length === 0) return source;

    return applyEdits(source, edits);
}

function findImageLocalNames(ast: any): Set<string> {
    const names = new Set<string>();

    for (const node of ast.program.body) {
        if (node.type !== "ImportDeclaration") continue;
        if (node.source.value !== ELEGANCE_IMPORT) continue;

        for (const spec of node.specifiers ?? []) {
            if (spec.type === "ImportSpecifier" && spec.imported.name === "Image") {
                names.add(spec.local.name);
            }
        }
    }

    return names;
}

function collectImageCalls(node: any, names: Set<string>, into: Array<{ node: any }>): void {
    if (!node || typeof node !== "object" || typeof node.type !== "string") return;

    if (node.type === "CallExpression" && node.callee?.type === "Identifier" && names.has(node.callee.name)) {
        into.push({ node });

        return;
    }

    forEachChild(node, (child) => collectImageCalls(child, names, into));
}

async function resolveCall(
    node: any,
    source: string,
    filePath: string,
    publicDir: string,
    config: ImageConfig,
): Promise<string | null> {
    const args = node.arguments ?? [];
    const first = args[0];

    if (!first || first.type !== "ObjectExpression") return null;

    if (hasLiteralTrue(first, "unoptimized")) {
        const rawObj = source.slice(first.start, first.end);

        return `__tags.img(${rawObj})`;
    }

    const props = extractLiteralProps(first);

    if (!props || typeof props.src !== "string") {
        throw imageResolutionError(node, source, filePath, "could not be resolved because it has non-literal props");
    }

    const srcPath = join(publicDir, props.src.replace(/^\/+/, ""));

    if (!existsSync(srcPath)) {
        throw imageResolutionError(node, source, filePath, `source file "${props.src}" does not exist`);
    }

    const dims = await getDims(srcPath);

    if (!dims) {
        return passthroughSource(props as ImageProps);
    }

    const resolved = buildImageSource(props as ImageProps, dims, config);

    return resolved.source;
}

function hasLiteralTrue(obj: any, key: string, ): boolean {
    for (const prop of obj.properties ?? []) {
        if (prop.type !== "Property") continue;

        const k = propKey(prop);

        if (k === key) {
            const v = literalValue(prop.value);
            return v === true;
        }
    }

    return false;
}

function extractLiteralProps(obj: any): Record<string, unknown> | null {
    const props: Record<string, unknown> = {};

    for (const prop of obj.properties ?? []) {
        if (prop.type !== "Property") return null;
        const key = propKey(prop);

        if (key === null) return null;
        const value = literalValue(prop.value);

        if (value === undefined) return null;

        props[key] = value;
    }

    return props;
}

function propKey(prop: any): string | null {
    const key = prop.key;

    if (key.type === "Identifier") {
        return key.name;
    }

    if (key.type === "StringLiteral" || key.type === "Literal") {
        return String(key.value);
    }

    return null;
}

function literalValue(node: any): unknown {
    switch (node.type) {
        case "Literal":
            return node.value;
        case "ArrayExpression": {
            const arr: unknown[] = [];

            for (const el of node.elements ?? []) {
                if (el === null) return undefined;

                const v = literalValue(el);
                if (v === undefined) return undefined;
                
                arr.push(v);
            }

            return arr;
        }
        case "UnaryExpression":
            if (node.operator === "-") {
                const v = literalValue(node.argument);

                return typeof v === "number" ? -v : undefined;
            }

            return undefined;
        default:
            return undefined;
    }
}

function imageResolutionError(node: any, source: string, filePath: string, detail: string): RichError {
    const { line, col } = offsetToLineCol(source, node.start);

    return richError({
        title: "Unresolvable <Image/>",
        cause: `The <Image/> component at ${filePath}:${line}:${col} ${detail}.`,
        hint: "Use literal props (src, sizes, widths, quality, formats), or set unoptimized for dynamic props.",
        origin: filePath,
        doShowStack: false,
    });
}

function offsetToLineCol(src: string, offset: number): { line: number; col: number } {
    let line = 1;
    let col = 1;

    const end = Math.min(offset, src.length);

    for (let i = 0; i < end; i++) {
        if (src[i] === "\n") { 
            line++; col = 1; 
        } else { 
            col++; 
        }
    }
    
    return { line, col };
}