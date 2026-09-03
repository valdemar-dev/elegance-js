import { getRoutes, hasSlugSegment, resolveEnumeratedPath } from "../page-tools";
import { generateSyntheticBundle } from "../processing/oxc";
import { computeBannedGlobs } from "./bundling";
import { generatePageHTML, createRenderContext, runWithRenderContext } from "./render";
import type { RouteInfo } from "../page-tools";
import { optimizeImages } from "../image/generate";
import { getConfig } from "../config";

import { rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

import { logger } from "../logger";
import { OUT_DIR, DIST_DIR, CACHE_DIR, PAGES_DIR, loadPaths } from "../constants";
import {
    transpileAllRoutes,
    loadRouteFromCache,
    buildClientRuntime,
    copyPublicDir,
    findAndCacheStatusCodePages,
    discoverApiRoutes,
    discoverMiddlewares,
    runBuildHooks,
    minifyHtml,
    minifyCode,
    getSlugParamName,
    fileHasExports,
    type CacheKey,
    type TranspiledRoute,
    type RouteEntry,
    type Manifest,
    layoutFileCacheKey,
    pageCacheKey,
    preClientMjsPath,
    collectServerActions,
    type ActionOwner,
} from "./common";
import { existsSync } from "node:fs";
import { isRichError, printError, richError } from "../error";

const PUBLIC_DIR = join(process.cwd(), "public");

interface StaticTask {
    route:           RouteInfo;
    transpiled:      TranspiledRoute;
    layoutCacheKeys: CacheKey[];
    cacheKey:        CacheKey;
    params:          Record<string, unknown>;
    outPathname:     string;
}

async function buildStaticTasks(tasks: StaticTask[]): Promise<void> {
    logger.info(`Building ${tasks.length} static route${tasks.length === 1 ? "" : "s"}`);

    const bannedGlobs = await computeBannedGlobs();

    await Promise.all(tasks.map(async ({ route, transpiled, layoutCacheKeys, cacheKey, params, outPathname }) => {
        if (await fileHasExports(route.pageFile) === false) {
            throw richError({
                title: "Empty Page",
                cause: "Empty pages are not allowed in production builds.",
                hint: "Try removing the file, or write a page there.",
                doShowStack: false,
            })
        }

        logger.info(`  > ${outPathname}`);

        const compiled = await loadRouteFromCache({
            pageFile:        route.pageFile,
            layouts:         route.layouts,
            layoutCacheKeys,
            cacheKey,
            pathname:        outPathname,
        });

        const ctx = createRenderContext();
        for (const { id, initial } of compiled.atomSeeds) {
            if (!ctx.atomValues.has(id)) {
                ctx.atomValues.set(id, initial);
                ctx.atomRegistry.push({ id });
            }
        }

        const routeOutDir = outPathname === "/" ? DIST_DIR : join(DIST_DIR, outPathname);

        try {
            await runWithRenderContext(ctx, async () => {
                await runBuildHooks(compiled, "pre");

                const rootNode  = await compiled.default(params);
                const metaNodes = await compiled.metadata(params);

                const bundleUrl = `${outPathname === "/" ? "" : outPathname}/bundle.js`;
                const { fullHtml } = await generatePageHTML(
                    rootNode,
                    metaNodes,
                    { ...route, pathname: outPathname },
                    bundleUrl,
                    ctx,
                    transpiled.sharedChunkPaths,
                );

                const preClientCode = await readFile(preClientMjsPath(pageCacheKey(transpiled.pathname)), "utf-8");
                
                const syntheticCode   = generateSyntheticBundle(preClientCode, outPathname, ctx.regions, layoutCacheKeys, bannedGlobs);
                const finalClientCode = await minifyCode(syntheticCode);

                await mkdir(routeOutDir, { recursive: true });
                await writeFile(join(routeOutDir, "bundle.js"),  finalClientCode);
                await writeFile(join(routeOutDir, "index.html"), minifyHtml(fullHtml));

                await runBuildHooks(compiled, "post");
            });

        } catch (err: any) {
            if (isRichError(err)) {
                throw err;
            }

            throw richError({
                title: "Failed to Render Route",
                cause: err,
                origin: route.pageFile,
                doShowStack: true,
            });
        }
    }));
}

async function buildProdAll(): Promise<void> {
    logger.info("Beginning production build...");

    if (existsSync(PAGES_DIR) === false) {
        printError(richError({
            title: "Missing pagesDirectory",
            cause: `config.pagesDirectory ${PAGES_DIR} does not exist. This is most likely due to a malformed configuration. Please create the directory and try again.`,
            doShowStack: false,
        }))

        process.exit(1);
    }

    await rm(OUT_DIR, { recursive: true, force: true });

    await mkdir(OUT_DIR,   { recursive: true });
    await mkdir(DIST_DIR,  { recursive: true });
    await mkdir(CACHE_DIR, { recursive: true });

    await copyPublicDir(PUBLIC_DIR);

    const config = await getConfig();
    await buildClientRuntime(true, false, undefined, config.client.viewTransitions);

    const allRoutes = await getRoutes(PAGES_DIR);
    const splitMap  = await transpileAllRoutes(allRoutes, true);

    const staticTasks:    StaticTask[]  = [];
    const manifestRoutes: RouteEntry[] = [];
    const actions:        Record<string, ActionOwner> = {};

    
    for (const route of allRoutes) {
        const transpiled = splitMap.get(route.pathname)!;

        if (!transpiled) {
            printError(richError({
                title:       "No transpilation result",
                cause:       "This is an internal error within Elegance, please report it.",
                doShowStack: false,
            }));

            process.exit(1);
        }

        const cacheKey       = pageCacheKey(transpiled.pathname);
        const layoutKeys     = transpiled.layouts.map(layoutFileCacheKey);

        const compiled = await loadRouteFromCache({
            pageFile:        route.pageFile,
            layouts:         route.layouts,
            layoutCacheKeys: layoutKeys,
            cacheKey:        cacheKey,
            pathname:        route.pathname,
        });

        collectServerActions(actions, {
            pageFile:        route.pageFile,
            layouts:         route.layouts,
            layoutCacheKeys: layoutKeys,
            cacheKey:        cacheKey,
        });

        if (!compiled.isDynamic && !hasSlugSegment(route.pathname)) {
            staticTasks.push({ route, transpiled, layoutCacheKeys: layoutKeys, cacheKey, params: {}, outPathname: route.pathname });
            
            manifestRoutes.push({
                pathname:         route.pathname,
                kind:             "static",
                pageFile:         route.pageFile,
                layoutCacheKeys:  layoutKeys,
                layouts:          route.layouts,
                sharedChunkPaths: transpiled.sharedChunkPaths,
                cacheKey:         cacheKey,
            });

            continue;
        }

        if (!compiled.getEnumeratedRoutes) {
            manifestRoutes.push({
                pathname:         route.pathname,
                kind:             "dynamic",
                pageFile:         route.pageFile,
                layouts:          route.layouts,
                layoutCacheKeys:  layoutKeys,
                cacheKey:         cacheKey,
                sharedChunkPaths: transpiled.sharedChunkPaths,
            });
            continue;
        }

        const rawSlugs = await compiled.getEnumeratedRoutes();

        for (const slug of rawSlugs) {
            const concretePath = resolveEnumeratedPath(route.pathname, slug);
            staticTasks.push({
                route,
                transpiled,
                layoutCacheKeys: layoutKeys,
                cacheKey,
                //params:      { [getSlugParamName(route.pathname)]: slug },
                params: { [getSlugParamName(route.pathname)]: slug.split("/") },
                outPathname: concretePath,
            });
            manifestRoutes.push({
                pathname:         concretePath,
                kind:             "enumerated",
                pageFile:         route.pageFile,
                layouts:          route.layouts,
                layoutCacheKeys:  layoutKeys,
                cacheKey:         cacheKey,
                sharedChunkPaths: transpiled.sharedChunkPaths,
                patternPathname: route.pathname,
            });
        }
    }

    if (staticTasks.length > 0) {
        await buildStaticTasks(staticTasks);
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
        actions,
    };

    await writeFile(join(OUT_DIR, "paths.json"), JSON.stringify(manifest, null, 2));
    await optimizeImages({ distDir: DIST_DIR, cacheDir: CACHE_DIR });
    await rm(join(process.cwd(), ".temp"), { recursive: true, force: true }).catch(() => {});
}

(async () => {
    await loadPaths();

    try {
        await buildProdAll();
        process.exit(0);
    } catch (err: any) {
        if (isRichError(err)) {
            printError(err)
        } else {
            console.error(err);
        }

        process.exit(1);
    }
})();