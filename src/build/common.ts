import esbuild from "esbuild";
import {
    sanitize,
    eleganceTsxPlugin,
    collectLayouts,
    composeRenderFn,
    gatherMetaFromModules,
} from "../page-tools";
import { transformBundle, transformChunk, generateLayoutBundle } from "../processing/oxc";

import { hookGlobals } from "../globals";
hookGlobals();

import type { RouteInfo } from "../page-tools";

import {
    readFile,
    mkdir,
    writeFile,
    copyFile,
    cp,
    stat as fsStat,
    unlink,
    readdir,
    rm,
} from "node:fs/promises";

import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

import { join, dirname, resolve, relative, basename } from "node:path";

import { DIST_DIR, CACHE_DIR, PAGES_DIR } from "../constants";
import { isRichError, printError, richError } from "../error";
import { AsyncLocalStorage } from "node:async_hooks";

const SINGLE_PARAM_RE = /\[([^\]]+)\]/;
const PARAM_STRIP_RE  = /^\.{3}/;
const EXPORT_RE       = /\bexport\b/;

export type PublishEntry = { input: string; target: string };

const IS_DEV = process.env.ELEGANCE_DEV_MODE === "dev";

type ImportContext = {
    preBuildHooks:  Array<() => Promise<void>>;
    postBuildHooks: Array<() => Promise<void>>;
    buildCallbacks: Array<() => Promise<void>>;
    publishFiles:   Array<PublishEntry>;
    atomSeeds:      Array<{ id: string; initial: any }>;
};

export const importContext = new AsyncLocalStorage<ImportContext>();

type ImportedModule = {
    module:         any;
    preBuildHooks:  Array<() => Promise<void>>;
    postBuildHooks: Array<() => Promise<void>>;
    buildCallbacks: Array<() => Promise<void>>;
    publishFiles:   Array<PublishEntry>;
    atomSeeds:      Array<{ id: string; initial: any }>;
};

export async function importModule(path: string): Promise<ImportedModule> {
    const store: ImportContext = {
        preBuildHooks:  [],
        postBuildHooks: [],
        buildCallbacks: [],
        publishFiles:   [],
        atomSeeds:      [],
    };

    const module = await importContext.run(store, async () => await import(path));

    return { module, ...store };
}

const importedModules = new Map<string, ImportedModule>();

async function importCompiledModule(sourceFile: string, filePath: string): Promise<ImportedModule> {
    const contents = await readFile(filePath);

    if (importedModules.has(sourceFile)) {
        return importedModules.get(sourceFile)!;
    }

    const tmpDir  = join(process.cwd(), ".temp");
    await mkdir(tmpDir, { recursive: true });

    const tmpPath = join(tmpDir, `${Date.now() + Math.random() * 1000}.mjs`);
    await writeFile(tmpPath, contents);

    try {
        return await importModule(`copycat://${resolve(sourceFile)}?real=${resolve(tmpPath)}`);
    } catch (err) {
        if (isRichError(err)) throw err;

        throw richError({
            title:       "Failed to Import Module",
            cause:       err,
            doShowStack: true,
        });
    } finally {
        await unlink(tmpPath);
    }
}

export interface CompiledRoute {
    default:              Function;
    metadata:                 (...params: unknown[]) => Promise<VirtualNode[]>;
    getEnumeratedRoutes?: () => Promise<string[]>;
    pathname:             string;
    preBuildHooks:        Array<() => Promise<void>>;
    postBuildHooks:       Array<() => Promise<void>>;
    buildCallbacks:       Array<() => Promise<void>>;
    publishFiles:         Array<PublishEntry>;
    atomSeeds:            Array<{ id: string; initial: any }>;
}

export interface CompiledLayout extends CompiledRoute {}

export interface TranspiledRoute {
    pathname:         string;
    pageFile:         string;
    layouts:          string[];
    serverCode:       string;
    preClientCode:    string;
    sharedChunkPaths: string[];
}

export type CacheKey = string & { readonly __brand: unique symbol };

export function pageCacheKey(pathname: string): CacheKey {
    return `route_${sanitize(pathname.replace(/^\//, "")) || "index"}` as CacheKey;
}

export function layoutFileCacheKey(layoutPath: string): CacheKey {
    let s = sanitize(relative(PAGES_DIR, layoutPath).replace(/\.tsx?$/, ""));
    if (s.endsWith("_layout")) s = s.slice(0, -7);
    return `layout_${s}` as CacheKey;
}

export function statusCodeCacheKey(filePath: string): CacheKey {
    return `statusCode_${sanitize(relative(PAGES_DIR, filePath).replace(/\.tsx?$/, ""))}` as CacheKey;
}

export function serverMjsPath(key: CacheKey):     string { return join(CACHE_DIR, `${key}.server.mjs`); }
export function preClientMjsPath(key: CacheKey):  string { return join(CACHE_DIR, `${key}.pre_client.mjs`); }
export function clientMjsPath(key: CacheKey):     string { return join(CACHE_DIR, `${key}.client.mjs`); }
export function chunkClientPath(key: CacheKey):   string { return join(DIST_DIR, "chunks", `${key}.client.mjs`); }

export interface ApiRouteEntry {
    pathname: string;
    file:     string;
}

export interface MiddlewareEntry {
    file: string;
}

export interface StatusCodePageEntry {
    pageFile:        string;
    layouts:         string[];
    layoutCacheKeys: CacheKey[];
    cacheKey:        CacheKey;
}

interface RouteEntryBase {
    pageFile:         string;
    layouts:          string[];
    layoutCacheKeys:  CacheKey[];
    cacheKey:         CacheKey;
    sharedChunkPaths: string[];
}

export interface StaticRouteEntry extends RouteEntryBase {
    kind:             "static";
    pathname:         string;
}

export interface EnumeratedRouteEntry extends RouteEntryBase {
    kind:             "enumerated";
    pathname:         string;
    patternPathname:  string;
}

export interface DynamicRouteEntry extends RouteEntryBase {
    kind:             "dynamic";
    pathname:         string;
}

export type RouteEntry = StaticRouteEntry | EnumeratedRouteEntry | DynamicRouteEntry;

export interface Manifest {
    buildTime:        number;
    routes:           RouteEntry[];
    statusCodePages:  StatusCodePageEntry[];
    apiRoutes:        ApiRouteEntry[];
    middlewares:      MiddlewareEntry[];
}

export async function runBuildHooks(compiled: CompiledRoute, stage: "pre" | "post"): Promise<void> {
    if (stage === "pre") {
        const buildCallbacks = compiled.buildCallbacks.splice(0);

        try {
            await Promise.all(buildCallbacks.map(cb => cb()));
        } catch (err) {
            if (isRichError(err)) throw err;
            throw richError({ title: "Build Hook Failed to Run", cause: err, origin: compiled.pathname, doShowStack: true });
        }

        try {
            await Promise.all(compiled.preBuildHooks.map(cb => cb()));
        } catch (err) {
            if (isRichError(err)) throw err;
            throw richError({ title: "Build Hook Failed to Run", cause: err, origin: compiled.pathname, doShowStack: true });
        }

        return;
    }

    try {
        await Promise.all(compiled.postBuildHooks.map(cb => cb()));
    } catch (err) {
        if (isRichError(err)) throw err;
        throw richError({ title: "Build Hook Failed to Run", cause: err, origin: compiled.pathname, doShowStack: true });
    }

    await Promise.all(
        compiled.publishFiles.map(async ({ input, target }) => {
            const dest = join(DIST_DIR, target);
            await mkdir(dirname(dest), { recursive: true });
            try {
                await copyFile(input, dest);
            } catch (err: any) {
                const error = richError({
                    title:       "Failed to Publish File",
                    cause:       `A post-build hook attempted to call publishFile() on a file that did not exist during the build.\nFile: ${input}`,
                    origin:      compiled.pathname,
                    doShowStack: false,
                });

                printError(error);
                throw err;
            }
        }),
    );
}

export function minifyHtml(html: string): string {
    return html.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

export async function minifyCode(code: string): Promise<string> {
    const result = await esbuild.transform(code, { minify: true, loader: "js" });
    return result.code;
}

export function getSlugParamName(pattern: string): string {
    const match = SINGLE_PARAM_RE.exec(pattern);
    if (!match) return "slug";
    return match[1]!.replace(PARAM_STRIP_RE, "");
}

export async function fileHasExports(filePath: string): Promise<boolean> {
    try {
        const content = await readFile(filePath, "utf-8");
        return EXPORT_RE.test(content);
    } catch (err: any) {
        const error = richError({
            title:       "Internal Error",
            cause:       "Elegance attempted to check if a file had exports, but ran into an unexpected error.",
            hint:        "If the error persists, please report it.",
            origin:      filePath,
            doShowStack: true,
        });

        console.error(error);
        printError(error);
        throw err;
    }
}

export async function computeFileHash(filePath: string): Promise<string> {
    const content = await readFile(filePath);
    return createHash("sha1").update(content).digest("hex");
}

export interface IncrementalState {
    fileHashes:       Record<string, string>;
    clientCodeHashes: Record<string, string>;
}

export async function loadIncrementalState(): Promise<IncrementalState> {
    const path = join(CACHE_DIR, "incremental.json");
    try {
        return JSON.parse(await readFile(path, "utf-8"));
    } catch {
        return { fileHashes: {}, clientCodeHashes: {} };
    }
}

export async function saveIncrementalState(state: IncrementalState): Promise<void> {
    const path = join(CACHE_DIR, "incremental.json");
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(path, JSON.stringify(state));
}

export async function copyPublicDir(publicDir: string): Promise<void> {
    if (!existsSync(publicDir)) return;
    await cp(publicDir, DIST_DIR, { recursive: true });
}

export async function copyPublicDirIncremental(publicDir: string): Promise<void> {
    if (!existsSync(publicDir)) return;

    const dirEnsured = new Map<string, Promise<string | undefined>>();
    const ensureDir  = (dir: string) => {
        let p = dirEnsured.get(dir);
        if (!p) dirEnsured.set(dir, p = mkdir(dir, { recursive: true }));
        return p;
    };

    async function walk(srcDir: string, destDir: string): Promise<void> {
        let entries;
        try { entries = await readdir(srcDir, { withFileTypes: true }); }
        catch { return; }

        await Promise.all(entries.map(async (e) => {
            const src  = join(srcDir,  e.name);
            const dest = join(destDir, e.name);

            if (e.isDirectory()) { await walk(src, dest); return; }

            try {
                const [ss, ds] = await Promise.all([fsStat(src), fsStat(dest)]);
                if (ds.mtimeMs >= ss.mtimeMs && ds.size === ss.size) return;
            } catch {}

            await ensureDir(destDir);
            await copyFile(src, dest);
        }));
    }

    await walk(publicDir, DIST_DIR);
}

export async function buildClientRuntime(minify: boolean): Promise<void> {
    await esbuild.build({
        entryPoints: [join(import.meta.dirname, "..", "client.js")],
        bundle:      true,
        outfile:     join(DIST_DIR, "client.js"),
        minify,
        format:      "esm",
        platform:    "browser",
        target:      "es2020",
        treeShaking: true,
        loader:      { ".ts": "ts", ".tsx": "ts" },
        plugins:     [eleganceTsxPlugin],
    });
}

export const ROUTE_ESBUILD_BASE = {
    bundle:        true,
    write:         false,
    format:        "esm"      as const,
    target:        `node${process.versions.node}`,
    legalComments: "inline"   as const,
    packages:      "external" as const,
    external:      ["../../../v11/user-utils"],
    loader:        { ".ts": "ts", ".tsx": "ts" } as Record<string, "ts">,
    plugins:       [eleganceTsxPlugin],
    minify:        false,
    treeShaking:   false,
};

async function walkPagesDir(dir: string, onDir: (dir: string) => Promise<void>): Promise<void> {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }

    const subdirs = entries
        .filter(e => e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_"))
        .map(e => join(dir, e.name));

    await Promise.all(subdirs.map(sub => walkPagesDir(sub, onDir)));
    await onDir(dir);
}

export async function discoverApiRoutes(pagesDir: string): Promise<ApiRouteEntry[]> {
    const entries: ApiRouteEntry[] = [];
    await walkPagesDir(pagesDir, async (dir) => {
        const candidate = join(dir, "route.ts");
        if (existsSync(candidate)) {
            const pathname = dir === pagesDir ? "/" : dir.slice(pagesDir.length);
            entries.push({ pathname, file: candidate });
        }
    });
    return entries;
}

export async function discoverMiddlewares(pagesDir: string): Promise<MiddlewareEntry[]> {
    const entries: MiddlewareEntry[] = [];
    await walkPagesDir(pagesDir, async (dir) => {
        const candidate = join(dir, "middleware.ts");
        if (existsSync(candidate)) entries.push({ file: candidate });
    });
    return entries;
}

async function compileServerFiles(
    files: Map<CacheKey, string>,
    stamp: number,
    label: string,
): Promise<Map<CacheKey, { serverCode: string; preClientCode: string }>> {
    if (files.size === 0) return new Map();

    const tmpDir = join(process.cwd(), ".temp", `${label}_${stamp}`);
    await mkdir(tmpDir, { recursive: true });

    try {
        await esbuild.build({
            ...ROUTE_ESBUILD_BASE,
            entryPoints: Object.fromEntries(files),
            write:       true,
            outdir:      tmpDir,
            splitting:   false,
            minify:      false,
        });

        const result = new Map<CacheKey, { serverCode: string; preClientCode: string }>();

        await Promise.all([...files.keys()].map(async (key) => {
            const raw = await readFile(join(tmpDir, `${key}.js`), "utf-8");
            const { serverCode, preClientCode } = transformBundle(raw, files.get(key)!);
            result.set(key, { serverCode, preClientCode });
        }));

        return result;
    } finally {
        await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
}

export async function findAndCacheStatusCodePages(): Promise<StatusCodePageEntry[]> {
    const candidates: Array<{ full: string; dir: string }> = [];

    async function walk(dir: string): Promise<void> {
        let dirents;
        try { dirents = await readdir(dir, { withFileTypes: true }); }
        catch { return; }

        await Promise.all(
            dirents
                .filter(ent => ent.isDirectory())
                .map(ent  => walk(join(dir, ent.name))),
        );

        for (const ent of dirents) {
            if (!ent.isDirectory() && /^\d{3}\.tsx?$/.test(ent.name))
                candidates.push({ full: join(dir, ent.name), dir });
        }
    }

    await walk(PAGES_DIR);
    if (candidates.length === 0) return [];

    await mkdir(CACHE_DIR, { recursive: true });

    const settled = await Promise.allSettled(
        candidates.map(async ({ full, dir }) => {
            const layouts        = await collectLayouts(dir, PAGES_DIR);
            const layoutKeys     = layouts.map(layoutFileCacheKey);
            const cacheKey       = statusCodeCacheKey(full);
            const stamp          = Date.now();

            const allFiles = new Map<CacheKey, string>();
            allFiles.set(cacheKey, full);
            for (let i = 0; i < layouts.length; i++) {
                allFiles.set(layoutKeys[i]!, layouts[i]!);
            }

            const compiled = await compileServerFiles(allFiles, stamp, `sc_${cacheKey}`);

            await Promise.all(
                [...compiled.entries()].map(([k, { serverCode }]) =>
                    writeFile(serverMjsPath(k), serverCode),
                ),
            );

            await Promise.all(
                layoutKeys.map(async (lk, i) => {
                    if (existsSync(clientMjsPath(lk))) return;
                    const { preClientCode } = compiled.get(lk) ?? {};
                    if (!preClientCode) return;
                    let bundle = generateLayoutBundle(preClientCode, layouts[i]!);
                    if (!IS_DEV) bundle = await minifyCode(bundle);
                    await Promise.all([
                        writeFile(clientMjsPath(lk),  bundle),
                        writeFile(chunkClientPath(lk), bundle),
                    ]);
                }),
            );

            const { preClientCode: pagePreClient } = compiled.get(cacheKey)!;
            await writeFile(
                preClientMjsPath(cacheKey),
                IS_DEV ? pagePreClient : await minifyCode(pagePreClient),
            );

            return {
                pageFile:        full,
                layouts,
                layoutCacheKeys: layoutKeys,
                cacheKey,
            } satisfies StatusCodePageEntry;
        }),
    );

    const entries: StatusCodePageEntry[] = [];
    for (let i = 0; i < settled.length; i++) {
        const result = settled[i]!;
        if (result.status === "fulfilled") {
            entries.push(result.value);
        } else {
            const { full } = candidates[i]!;
            const error = richError({
                title:       "Compilation Error",
                cause:       "A status code page threw an error whilst it was being compiled. (full error below).",
                origin:      full,
                doShowStack: false,
            });

            console.error(error);
            printError(error);
        }
    }

    return entries;
}

export async function transpileAllRoutes(
    routes: RouteInfo[],
    minify: boolean,
    skipServerKeys: ReadonlySet<CacheKey> = new Set(),
): Promise<Map<string, TranspiledRoute>> {
    if (routes.length === 0) return new Map();

    const stamp        = Date.now();
    const clientTmpOut = join(process.cwd(), ".temp", `client_out_${stamp}`);
    const serverTmpOut = join(process.cwd(), ".temp", `server_out_${stamp}`);
    const chunksDir    = join(DIST_DIR, "chunks");

    const keyToRoute:      Map<CacheKey, RouteInfo>  = new Map();
    const keyToLayoutPath: Map<CacheKey, string>     = new Map();
    const clientEntryPoints: Record<string, string>  = {};
    const allServerFiles:  Map<CacheKey, string>     = new Map();

    for (const route of routes) {
        const key = pageCacheKey(route.pathname);
        clientEntryPoints[key] = route.pageFile;
        keyToRoute.set(key, route);

        if (!skipServerKeys.has(key))
            allServerFiles.set(key, route.pageFile);

        for (const layoutPath of route.layouts) {
            const lk = layoutFileCacheKey(layoutPath);
            if (!keyToLayoutPath.has(lk)) {
                clientEntryPoints[lk] = layoutPath;
                keyToLayoutPath.set(lk, layoutPath);
            }
            if (!skipServerKeys.has(lk))
                allServerFiles.set(lk, layoutPath);
        }
    }

    const hasServerWork = allServerFiles.size > 0;

    await Promise.all([
        mkdir(clientTmpOut, { recursive: true }),
        mkdir(chunksDir,    { recursive: true }),
        mkdir(CACHE_DIR,    { recursive: true }),
        hasServerWork ? mkdir(serverTmpOut, { recursive: true }) : Promise.resolve(),
    ]);

    const serverBuildProm: Promise<void> = hasServerWork
        ? esbuild.build({
              ...ROUTE_ESBUILD_BASE,
              entryPoints: Object.fromEntries(allServerFiles),
              write:       true,
              outdir:      serverTmpOut,
              splitting:   false,
              minify:      false,
          }).then(() => undefined)
        : Promise.resolve();

    await esbuild.build({
        ...ROUTE_ESBUILD_BASE,
        entryPoints: clientEntryPoints,
        write:       true,
        outdir:      clientTmpOut,
        splitting:   true,
        minify:      false,
    });

    const clientOutputs = await readdir(clientTmpOut);
    const entryStems    = new Set([...keyToRoute.keys(), ...keyToLayoutPath.keys()]);
    const chunkFiles    = clientOutputs.filter(
        f => f.endsWith(".js") && !entryStems.has(basename(f, ".js") as CacheKey),
    );

    const chunkUrlMap = new Map<string, string>();

    await Promise.all(chunkFiles.map(async (chunkFile) => {
        const raw       = await readFile(join(clientTmpOut, chunkFile), "utf-8");
        const processed = transformChunk(raw, chunkFile);

        chunkUrlMap.set(`./${chunkFile}`, `/chunks/${chunkFile}`);
        await writeFile(join(chunksDir, chunkFile), processed);
    }));

    let replaceChunkUrls: (code: string) => string;

    if (chunkUrlMap.size > 0) {
        const escapedKeys = [...chunkUrlMap.keys()].map(
            k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        );
        const chunkRe = new RegExp(escapedKeys.join("|"), "g");
        replaceChunkUrls = (code: string) => code.replace(chunkRe, m => chunkUrlMap.get(m)!);
    } else {
        replaceChunkUrls = (code: string) => code;
    }

    await serverBuildProm;

    if (hasServerWork) {
        await Promise.all([...allServerFiles.entries()].map(async ([key, filePath]) => {
            const raw = await readFile(join(serverTmpOut, `${key}.js`), "utf-8");
            const { serverCode } = transformBundle(raw, filePath);
            await writeFile(serverMjsPath(key), serverCode);
        }));
    }

    await Promise.all([...keyToLayoutPath.entries()].map(async ([lk, layoutPath]) => {
        const raw = await readFile(join(clientTmpOut, `${lk}.js`), "utf-8");
        const { preClientCode: rawPre } = transformBundle(raw, layoutPath);
        const preClientCode = replaceChunkUrls(rawPre);
        let layoutBundle = generateLayoutBundle(preClientCode, layoutPath);
        if (minify) layoutBundle = await minifyCode(layoutBundle);
        await Promise.all([
            writeFile(clientMjsPath(lk),  layoutBundle),
            writeFile(chunkClientPath(lk), layoutBundle),
        ]);
    }));

    const results = new Map<string, TranspiledRoute>();

    await Promise.all([...keyToRoute.entries()].map(async ([key, route]) => {
        const [clientRaw, rawServerCode] = await Promise.all([
            readFile(join(clientTmpOut, `${key}.js`), "utf-8"),
            readFile(serverMjsPath(key), "utf-8"),
        ]);

        const { preClientCode: rawPreClientCode } = transformBundle(clientRaw, route.pageFile);

        let preClientCode = replaceChunkUrls(rawPreClientCode);

        const sharedChunkPaths = chunkFiles
            .filter(f  => clientRaw.includes(`./${f}`))
            .map(f => `/chunks/${f}`);

        await writeFile(preClientMjsPath(key), preClientCode);

        results.set(route.pathname, {
            pathname:         route.pathname,
            pageFile:         route.pageFile,
            layouts:          route.layouts,
            serverCode:       rawServerCode,
            preClientCode,
            sharedChunkPaths,
        } satisfies TranspiledRoute);
    }));

    await Promise.all([
        rm(clientTmpOut, { recursive: true, force: true }).catch(() => {}),
        rm(serverTmpOut, { recursive: true, force: true }).catch(() => {}),
    ]);

    return results;
}

export async function loadLayoutFromCache(pathname: string, cacheKey: CacheKey): Promise<CompiledLayout> {
    try {
        const { module, buildCallbacks, postBuildHooks, preBuildHooks, publishFiles, atomSeeds } =
            await importModule(`copycat://${resolve(pathname)}?real=${serverMjsPath(cacheKey)}`);

        if (typeof module.default !== "function") {
            throw richError({
                title:       "Invalid Layout",
                cause:       "Could not get default export. For a layout to be valid, it must export a function that resolved into a VirtualNode",
                hint:        "Did you forget the *export* keyword?",
                doShowStack: false,
            });
        }

        if (module.meta && typeof module.meta !== "function") {
            throw richError({
                title:       "Invalid Layout",
                cause:       "Meta export is not of type \"function\"",
                hint:        "The 'meta' export of a layout should be a function that resolves into an array of VirtualNodes.",
                doShowStack: false,
            });
        }

        return {
            default:       module.default,
            metadata:          module.metadata ? module.metadata : () => ([]),
            pathname,
            buildCallbacks,
            postBuildHooks,
            preBuildHooks,
            publishFiles,
            atomSeeds,
        };
    } catch (err) {
        if (isRichError(err)) throw err;

        throw richError({
            title:       "Failed to Import Layout",
            cause:       err,
            origin:      pathname,
            doShowStack: true,
        });
    }
}

export async function loadRouteFromCache(entry: {
    pageFile:        string;
    layouts:         string[];
    layoutCacheKeys: CacheKey[];
    cacheKey:        CacheKey;
    pathname:        string;
}): Promise<CompiledRoute> {
    const { module, preBuildHooks, buildCallbacks, postBuildHooks, publishFiles, atomSeeds } =
        await importCompiledModule(entry.pageFile, serverMjsPath(entry.cacheKey));

    if (typeof module.default !== "function") {
        throw richError({
            title:       "Invalid Page",
            cause:       "Could not find default export.",
            hint:        "Did you forget the *default* keyword?",
            doShowStack: false,
        });
    }

    const layoutModules = await Promise.all(
        entry.layouts.map((layoutPath, i) =>
            loadLayoutFromCache(layoutPath, entry.layoutCacheKeys[i]!),
        ),
    );

    for (const layout of layoutModules) {
        preBuildHooks.push(...layout.preBuildHooks);
        postBuildHooks.push(...layout.postBuildHooks);
        buildCallbacks.push(...layout.buildCallbacks);
        publishFiles.push(...layout.publishFiles);
        atomSeeds.push(...layout.atomSeeds);
    }

    return {
        default:             composeRenderFn(module, layoutModules),
        metadata:                async (params?: any) => gatherMetaFromModules(module, layoutModules, params ?? {}),
        getEnumeratedRoutes: module.getEnumeratedRoutes,
        pathname:            entry.pathname,
        preBuildHooks,
        buildCallbacks,
        postBuildHooks,
        publishFiles,
        atomSeeds,
    } satisfies CompiledRoute;
}