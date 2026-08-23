import { createHash } from "node:crypto";

export type ImageFormat = "webp" | "png" | "jpeg";

export interface ImageProps {
    src: string;
    sizes?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    formats?: ImageFormat[];
    widths?: number[];
    unoptimized?: boolean;
    alt?: string;
    className?: string;
    id?: string;
    style?: string;
    loading?: "lazy" | "eager";
    decoding?: "async" | "sync" | "auto";

    [key: string]: unknown;
}

export interface ImageConfig {
    optimize: boolean;
    formats: ImageFormat[];
    quality: Record<ImageFormat, number>;
    viewports: number[];
    maxVariantsPerImage: number;
    outDir: string;
}

export const defaultImageConfig: ImageConfig = {
    optimize: true,
    formats: ["webp"],
    quality: { webp: 75, png: 80, jpeg: 80 },
    viewports: [320, 375, 414, 768, 1024, 1280, 1440, 1920, 2560],
    maxVariantsPerImage: 6,
    outDir: "/images",
};

export interface ImageVariant {
    src: string;
    width: number;
    format: ImageFormat;
    quality: number;
    url: string;
}

export const imageVariants = new Map<string, ImageVariant>();

export function registerVariant(src: string, width: number, format: ImageFormat, quality: number): string {
    const url = variantUrl(src, width, format, quality);

    if (!imageVariants.has(url)) {
        imageVariants.set(url, { src, width, format, quality, url });
    }

    return url;
}

export function variantUrl(
    src: string,
    width: number,
    format: ImageFormat,
    quality: number,
    outDir = defaultImageConfig.outDir,
): string {
    const hash = createHash("sha256")
        .update(`${src}\x00${width}\x00${format}\x00${quality}`)
        .digest("hex")
        .slice(0, 12);

    return `${outDir}/${hash}.${format}`;
}

export interface SizesRule {
    media?: string;
    expr: string;
}

const SIZES_RULE_RE = /^\s*(\([^)]*\))?\s*(.+?)\s*$/;

export function parseSizes(sizes: string): SizesRule[] {
    const rules: SizesRule[] = [];

    let depth = 0;
    let start = 0;

    for (let i = 0; i < sizes.length; i++) {
        const c = sizes[i];

        if (c === "(") depth++;
        else if (c === ")") depth--;
        else if (c === "," && depth === 0) {
            pushRule(rules, sizes.slice(start, i));

            start = i + 1;
        }
    }

    pushRule(rules, sizes.slice(start));

    return rules;
}

function pushRule(into: SizesRule[], raw: string): void {
    const match = SIZES_RULE_RE.exec(raw);
    if (!match) return;

    if (match[1]) {
        into.push({ media: match[1], expr: match[2] });
    } else {
        into.push({ expr: match[2] });
    }
}

export function evalSizeExpr(expr: string, viewport: number): number {
    const vw = /^([\d.]+)vw$/i.exec(expr.trim());
    if (vw) return Math.round((parseFloat(vw[1]) / 100) * viewport);

    const px = /^([\d.]+)px$/i.exec(expr.trim());
    if (px) return Math.round(parseFloat(px[1]));

    const calcPx = /^calc\(([\d.]+)px\)$/i.exec(expr.trim());
    if (calcPx) return Math.round(parseFloat(calcPx[1]));

    return viewport;
}

export function mediaMatches(media: string, viewport: number): boolean {
    const min = /min-width\s*:\s*(\d+)px/i.exec(media);
    if (min && viewport < parseInt(min[1], 10)) return false;

    const max = /max-width\s*:\s*(\d+)px/i.exec(media);
    if (max && viewport > parseInt(max[1], 10)) return false;

    return true;
}

export function deriveWidths(
    sizes: string | undefined,
    config: Pick<ImageConfig, "viewports" | "maxVariantsPerImage">,
): number[] {
    const widths = new Set<number>();

    if (sizes) {
        for (const rule of parseSizes(sizes)) {
            for (const viewport of config.viewports) {
                if (rule.media && !mediaMatches(rule.media, viewport)) {
                    continue;
                }

                widths.add(evalSizeExpr(rule.expr, viewport));
            }
        }
    }

    const sorted = [...widths].filter((w) => w > 0).sort((a, b) => a - b);

    return capWidths(sorted, config.maxVariantsPerImage);
}

function capWidths(sorted: number[], max: number): number[] {
    if (sorted.length <= max) return sorted;

    const out: number[] = [];

    for (let i = 0; i < max; i++) {
        const idx = Math.round((i / (max - 1)) * (sorted.length - 1));

        out.push(sorted[idx]);
    }

    return [...new Set(out)];
}
