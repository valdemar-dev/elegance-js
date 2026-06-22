import { readdir, stat, readFile } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import type esbuild from "esbuild";
import { transformJSX } from "./processing/tsx";
import { PAGES_DIR } from "./constants";
import type { CompiledLayout } from "./build/common";

export interface RouteInfo {
    pathname: string;
    pageFile: string;
    layouts:  string[];
}

export interface PageRoute extends RouteInfo {
    isDynamic: boolean;
}

export function pathnameFromFile(filePath: string): string {
    const withoutExt = filePath.replace(/\.[^.]+$/, "");
    const rel        = relative(PAGES_DIR, withoutExt);
    const normalized = rel.replace(/[\\/]?index$/, "") || "index";
    return normalized === "index" ? "/" : `/${normalized}`;
}

async function getRoutes(pagesDir: string): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    await walkDir(pagesDir, "/");
    return routes;

    async function walkDir(dir: string, urlPrefix: string) {
        const entries  = await readdir(dir, { withFileTypes: true });
        const pageFile = await resolveTs(dir, "page");
        if (pageFile) {
            const layouts = await collectLayouts(dir, pagesDir);
            routes.push({
                pathname: urlPrefix === "/" ? "/" : urlPrefix.replace(/\/$/, ""),
                pageFile,
                layouts,
            });
        }

        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_")) {
                await walkDir(join(dir, entry.name), urlPrefix + entry.name + "/");
            }
        }
    }
}

function hasSlugSegment(pathname: string): boolean {
    const segments = pathname.split("/").filter(Boolean);
    return segments.some(
        seg => /^\[.+\]$/.test(seg) || /^\.\.\.\[.+\]$/.test(seg) || /^:\[.+\]$/.test(seg),
    );
}

export async function getPageRoutes(pagesDir: string): Promise<PageRoute[]> {
    const raw    = await getRoutes(pagesDir);
    const result: PageRoute[] = [];

    for (const r of raw) {
        const pageDynamic  = await fileHasDynamicExport(r.pageFile) || hasSlugSegment(r.pathname);
        const layoutInfos  = await Promise.all(
            r.layouts.map(async (lp) => ({
                path:      lp,
                isDynamic: await fileHasDynamicExport(lp),
            })),
        );
        result.push({
            ...r,
            isDynamic: pageDynamic || layoutInfos.some(l => l.isDynamic),
        });
    }

    return result;
}

async function fileExists(path: string): Promise<boolean> {
    try {
        const s = await stat(path);
        return s.isFile();
    } catch {
        return false;
    }
}

async function resolveTs(dir: string, base: string): Promise<string | null> {
    for (const ext of [".ts", ".tsx"]) {
        const p = join(dir, base + ext);
        if (await fileExists(p)) return p;
    }
    return null;
}

export async function collectLayouts(pageDir: string, rootDir: string): Promise<string[]> {
    const layouts: string[] = [];
    let current = pageDir;

    while (current !== rootDir && current !== dirname(current)) {
        const candidate = await resolveTs(current, "layout");
        if (candidate) layouts.unshift(candidate);
        current = dirname(current);
    }

    const rootCandidate = await resolveTs(rootDir, "layout");
    if (rootCandidate) layouts.unshift(rootCandidate);

    return layouts;
}

export async function fileHasDynamicExport(path: string): Promise<boolean> {
    try {
        const source = await readFile(path, "utf-8");
        return /\bexport\s+(?:const|let)\s+isDynamic\s*=\s*true\b/.test(source);
    } catch {
        return false;
    }
}

export function sanitize(pathname: string): string {
    return pathname.replace(/\//g, "_") || "index";
}

export const eleganceTsxPlugin: esbuild.Plugin = {
    name: "elegance-tsx",
    setup(build) {
        build.onLoad({ filter: /\.tsx$/ }, async (args) => {
            const source = await readFile(args.path, "utf-8");
            return { contents: transformJSX(source, args.path), loader: "ts" };
        });
    },
};

export function composeRenderFn(
    pageModule:    any,
    layoutModules: CompiledLayout[],
): (params: any, req: any, res: any) => any {
    return (params: any, req: any, res: any): any => {
        let renderFn: (props: any) => any = (props: any) =>
            pageModule.default({ ...props, ...params, req, res });

        for (let i = layoutModules.length - 1; i >= 0; i--) {
            const layout = layoutModules[i]!;
            const inner  = renderFn;
            renderFn = (props: any) =>
                layout.default({
                    ...props,
                    child: (childProps: any) => inner(childProps ?? {}),
                });
        }

        return renderFn({});
    };
}

export async function gatherMetaFromModules(
    pageModule:    any,
    layoutModules: any[],
    params:        Record<string, any>,
): Promise<any[]> {
    const metas:   any[] = [];
    const sources = [...layoutModules, pageModule];

    for (const src of sources) {
        try {
            if (src && typeof src.metadata !== "undefined") {
                const raw =
                    typeof src.metadata === "function"
                        ? await src.metadata(params)
                        : src.metadata;
                if (Array.isArray(raw)) metas.push(...raw);
            }
        } catch {}
    }

    return metas;
}