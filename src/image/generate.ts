import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { richError } from "../error";
import { getConfig } from "../config";
import { imageVariants, type ImageVariant } from "./core";
import { optimize } from "./optimize";

export interface OptimizeImagesOptions {
    distDir: string;
    cacheDir: string;
}

export interface OptimizeImagesSummary {
    variants: number;
    generated: number;
    reused: number;
    bytes: number;
}

interface ManifestEntry {
    sourceHash: string;
    width: number;
    format: string;
    quality: number;
}

type ImageManifest = Record<string, ManifestEntry>;

export async function optimizeImages(opts: OptimizeImagesOptions): Promise<OptimizeImagesSummary> {
    const config = await getConfig();

    const imageConfig = config.image;
    const publicDir = join(process.cwd(), config.output.publicDirectory!);

    const summary: OptimizeImagesSummary = { 
        variants: imageVariants.size, 
        generated: 0, 
        reused: 0, 
        bytes: 0 
    };

    if (!imageConfig.optimize || imageVariants.size === 0) {
        return summary;
    }

    const manifest = await loadManifest(opts.cacheDir);
    const groups = new Map<string, ImageVariant[]>();

    for (const variant of imageVariants.values()) {
        let list = groups.get(variant.src);
        if (!list) groups.set(variant.src, (list = []));

        list.push(variant);
    }

    await Promise.all([...groups.entries()].map(([src, variants]) =>
        processSource(src, variants, publicDir, opts, manifest, summary),
    ));

    for (const url of Object.keys(manifest)) {
        if (!imageVariants.has(url)) {
            delete manifest[url]; // i feel hatred -val
        }
    }

    await saveManifest(opts.cacheDir, manifest);

    return summary;
}

async function processSource(
    src: string,
    variants: ImageVariant[],
    publicDir: string,
    opts: OptimizeImagesOptions,
    manifest: ImageManifest,
    summary: OptimizeImagesSummary,
): Promise<void> {
    const srcPath = join(publicDir, src.replace(/^\/+/, ""));

    let bytes: Buffer;
    try {
        bytes = await readFile(srcPath);
    } catch {
        throw richError({
            title: "Image Source Not Found",
            cause: `The <Image> component referenced "${src}", but no such file exists in the public directory (${publicDir}).`,
            origin: srcPath,
            doShowStack: false,
        });
    }

    const sourceHash = createHash("sha1").update(bytes).digest("hex");

    for (const variant of variants) {
        const outPath = join(opts.distDir, variant.url);
        const cached = manifest[variant.url];

        if (cached && cached.sourceHash === sourceHash && existsSync(outPath)) {
            summary.reused++;

            continue;
        }

        const encoded = await optimize({
            input: bytes,
            width: variant.width,
            format: variant.format,
            quality: variant.quality,
        });

        if (!encoded) {
            throw richError({
                title: "Image Optimization Failed",
                cause: `Could not encode "${src}" at width ${variant.width} as ${variant.format}. The source file may be corrupt or in an unsupported format.`,
                origin: srcPath,
                doShowStack: false,
            });
        }

        await mkdir(dirname(outPath), { recursive: true });
        await writeFile(outPath, encoded.data);

        manifest[variant.url] = {
            sourceHash,
            width: variant.width,
            format: variant.format,
            quality: variant.quality,
        };

        summary.generated++;
        summary.bytes += encoded.data.byteLength;
    }
}

async function loadManifest(cacheDir: string): Promise<ImageManifest> {
    try {
        return JSON.parse(await readFile(join(cacheDir, "images-manifest.json"), "utf-8"));
    } catch {
        return {};
    }
}

async function saveManifest(cacheDir: string, manifest: ImageManifest): Promise<void> {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(join(cacheDir, "images-manifest.json"), JSON.stringify(manifest));
}
