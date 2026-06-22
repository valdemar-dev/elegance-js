import { getPageRoutes } from "../page-tools";
import { rm, mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

import { c, logger } from "../logger";
import { OUT_DIR, DIST_DIR, CACHE_DIR, PAGES_DIR, loadPaths } from "../constants";
import {
    transpileAllRoutes,
    buildClientRuntime,
    copyPublicDir,
    copyPublicDirIncremental,
    findAndCacheStatusCodePages,
    discoverApiRoutes,
    discoverMiddlewares,
    computeFileHash,
    loadIncrementalState,
    saveIncrementalState,
    loadRouteFromCache,
    pageCacheKey,
    layoutFileCacheKey,
    type CacheKey,
    type RouteEntry,
    type Manifest,
} from "./common";
import { existsSync } from "node:fs";
import { isRichError, printError, richError } from "../error";

const PUBLIC_DIR     = join(process.cwd(), "public");
const IS_INCREMENTAL = process.env.ELEGANCE_BUILD_MODE === "incremental";
const SLUG_PATTERN   = /\[([^\]]+)\]/;

async function buildDevAll(): Promise<void> {
    logger.info(`Beginning build.. (${IS_INCREMENTAL ? "incremental" : "full"})`);

    const start = performance.now();

    if (existsSync(PAGES_DIR) === false) {
        logger.warn("config.pagesDirectory did not exist, it will be created.");
        await mkdir(PAGES_DIR, { recursive: true });
    }

    if (IS_INCREMENTAL) {
        await rm(DIST_DIR, { recursive: true, force: true });
        await mkdir(DIST_DIR,  { recursive: true });
        await mkdir(CACHE_DIR, { recursive: true });
        await copyPublicDirIncremental(PUBLIC_DIR);
        await buildClientRuntime(false);
    } else {
        await rm(OUT_DIR, { recursive: true, force: true });
        await mkdir(OUT_DIR,   { recursive: true });
        await mkdir(DIST_DIR,  { recursive: true });
        await mkdir(CACHE_DIR, { recursive: true });
        await copyPublicDir(PUBLIC_DIR);
        await buildClientRuntime(false);
    }

    const allRoutes = await getPageRoutes(PAGES_DIR);

    if (IS_INCREMENTAL) {
        await pruneStaleOutputs(allRoutes.map(r => r.pageFile));
    }

    for (const route of allRoutes) {
        if (!route.isDynamic && SLUG_PATTERN.test(route.pathname)) {
            printError(richError({
                title:       "Missing Enumerations",
                cause:       `Route ${route.pathname} is marked as a [slug] route, and is currently set to isDynamic = false.` +
                             `For a [slug] route to be static, it must export getEnumeratedRoutes(); so that all possible paths can be generated statically.`,
                origin:      route.pathname,
                doShowStack: false,
            }));

            process.exit(1);
        }
    }

    const prevState                           = IS_INCREMENTAL ? await loadIncrementalState() : { fileHashes: {}, clientCodeHashes: {} };
    const nextFileHashes: Record<string, string> = {};
    const skipServerKeys                      = new Set<CacheKey>();
    const unchangedPathnames                  = new Set<string>();

    const allFiles = new Set<string>();
    for (const route of allRoutes) {
        allFiles.add(route.pageFile);
        for (const l of route.layouts) allFiles.add(l);
    }
    await Promise.all([...allFiles].map(async (f) => {
        nextFileHashes[f] = await computeFileHash(f);
    }));

    if (IS_INCREMENTAL) {
        for (const route of allRoutes) {
            const key           = pageCacheKey(route.pathname);
            const pageChanged   = nextFileHashes[route.pageFile] !== prevState.fileHashes[route.pageFile];
            const layoutChanged = route.layouts.some(l => nextFileHashes[l] !== prevState.fileHashes[l]);

            if (!pageChanged && !layoutChanged && existsSync(join(CACHE_DIR, `${key}.server.mjs`))) {
                skipServerKeys.add(key);
                unchangedPathnames.add(route.pathname);

                for (const l of route.layouts) {
                    const lk = layoutFileCacheKey(l);
                    if (existsSync(join(CACHE_DIR, `${lk}.server.mjs`)))
                        skipServerKeys.add(lk);
                }
            }
        }
    }

    const transpiled = await transpileAllRoutes(allRoutes, false, skipServerKeys);

    let prevManifest: Manifest | null = null;
    if (IS_INCREMENTAL) {
        try {
            prevManifest = JSON.parse(await readFile(join(OUT_DIR, "paths.json"), "utf-8"));
        } catch {}
    }

    const manifestRoutes: RouteEntry[] = [];

    for (const route of allRoutes) {
        const t = transpiled.get(route.pathname);
        if (!t) {
            printError(richError({
                title:       "No transpilation result",
                cause:       "This is an internal error within Elegance, please report it.",
                doShowStack: false,
            }));

            process.exit(1);
        }

        const key            = pageCacheKey(t.pathname);
        const layoutKeys     = t.layouts.map(layoutFileCacheKey);
        const sharedChunks   = t.sharedChunkPaths;

        if (!route.isDynamic) {
            manifestRoutes.push({
                kind:             "static",
                pathname:         route.pathname,
                pageFile:         route.pageFile,
                layouts:          route.layouts,
                layoutCacheKeys:  layoutKeys,
                cacheKey:         key,
                sharedChunkPaths: sharedChunks,
            });
            continue;
        }

        const mod = await loadRouteFromCache({
            pageFile:        route.pageFile,
            layouts:         route.layouts,
            layoutCacheKeys: layoutKeys,
            cacheKey:        key,
            pathname:        route.pathname,
        });

        if (!mod.getEnumeratedRoutes) {
            if (unchangedPathnames.has(route.pathname) && prevManifest) {
                const prevEntry = prevManifest.routes.find(r => r.pathname === route.pathname);
                if (prevEntry) {
                    manifestRoutes.push(prevEntry);
                    continue;
                }
            }

            manifestRoutes.push({
                kind:             "dynamic",
                pathname:         route.pathname,
                pageFile:         route.pageFile,
                layouts:          route.layouts,
                layoutCacheKeys:  layoutKeys,
                cacheKey:         key,
                sharedChunkPaths: sharedChunks,
            });
            continue;
        }

        const slugs = await mod.getEnumeratedRoutes();
        const freshPaths = new Set(slugs.map(slug => route.pathname.replace(/\[([^\]]+)\]/g, slug)));

        if (IS_INCREMENTAL && prevManifest) {
            const prevEnumerated = prevManifest.routes.filter(
                r => r.kind === "enumerated" && r.patternPathname === route.pathname,
            );
            await Promise.all(prevEnumerated
                .filter(r => !freshPaths.has(r.pathname))
                .map(r => {
                    const dir = r.pathname === "/" ? DIST_DIR : join(DIST_DIR, r.pathname);
                    return Promise.all([
                        unlink(join(dir, "index.html")).catch(() => {}),
                        unlink(join(dir, "bundle.js")).catch(() => {}),
                    ]);
                })
            );
        }

        for (const slug of slugs) {
            const concretePath = route.pathname.replace(/\[([^\]]+)\]/g, slug);
            manifestRoutes.push({
                kind:             "enumerated",
                pathname:         concretePath,
                patternPathname:  route.pathname,
                pageFile:         route.pageFile,
                layouts:          route.layouts,
                layoutCacheKeys:  layoutKeys,
                cacheKey:         key,
                sharedChunkPaths: sharedChunks,
            });
        }
    }

    const [statusCodePages, apiRoutes, middlewares] = await Promise.all([
        findAndCacheStatusCodePages(),
        discoverApiRoutes(PAGES_DIR),
        discoverMiddlewares(PAGES_DIR),
    ]);

    const manifest: Manifest = {
        buildTime: Date.now(),
        routes:    manifestRoutes,
        statusCodePages,
        apiRoutes,
        middlewares,
    };

    await writeFile(join(OUT_DIR, "paths.json"), JSON.stringify(manifest, null, 2));
    await saveIncrementalState({ fileHashes: nextFileHashes, clientCodeHashes: {} });
    await rm(join(process.cwd(), ".temp"), { recursive: true, force: true }).catch(() => {});

    logger.debug(`Built in ${c.dim}${(performance.now() - start).toFixed(1)}ms${c.reset}`);
}

async function pruneStaleOutputs(livePageFiles: string[]): Promise<void> {
    let prev: Manifest;
    try {
        prev = JSON.parse(await readFile(join(OUT_DIR, "paths.json"), "utf-8"));
    } catch {
        return;
    }

    const live     = new Set(livePageFiles);
    const removals: Promise<void>[] = [];

    for (const entry of prev.routes) {
        if (live.has(entry.pageFile)) continue;

        const dir = entry.pathname === "/" ? DIST_DIR : join(DIST_DIR, entry.pathname);
        removals.push(unlink(join(dir, "index.html")).catch(() => {}));
        removals.push(unlink(join(dir, "bundle.js")).catch(() => {}));
    }

    if (removals.length === 0) return;

    await Promise.all(removals);
}

(async () => {
    await loadPaths();

    try {
        await buildDevAll();
        process.exit(0);
    } catch (err: any) {
        if (isRichError(err)) {
            printError(err);
        } else {
            console.error(err);
        }

        process.exit(1);
    }
})();