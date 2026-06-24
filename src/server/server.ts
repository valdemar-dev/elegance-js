import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import { join, dirname, extname, relative, basename } from "node:path";
import {
    gzip as gzipCb,
    brotliCompress as brotliCb,
    constants as zlibConstants,
} from "node:zlib";
import { promisify } from "node:util";

const gzipAsync   = promisify(gzipCb);
const brotliAsync = promisify(brotliCb);

import { performance } from "node:perf_hooks";

import { generateSyntheticBundle } from "../processing/oxc";
import { generatePageHTML, generateDynamicPageHTML, createRenderContext, runWithRenderContext } from "../build/render";
import type { CompiledRoute, Manifest, RouteEntry, CacheKey } from "../build/common";
import { loadRouteFromCache, runBuildHooks, preClientMjsPath } from "../build/common";

import { OUT_DIR, DIST_DIR, PAGES_DIR, loadPaths } from "../constants";
import { getConfig } from "../config";
import { createSecurityHeaders } from "./security";
import { isRichError, printError, richError } from "../error";
import { logger } from "../logger";

// Make all properties required recursively
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends (...args: any[]) => any
        ? T[P]
        : T[P] extends object
            ? DeepRequired<NonNullable<T[P]>>
            : NonNullable<T[P]>;
};

export type ServerOptions = {
    serveAPI?:             boolean;
    allowDynamicPages?:    boolean;
    allowStatusCodePages?: boolean;
    port?:                 number;
};

const config = await getConfig();
await loadPaths();

let serverOptions: DeepRequired<ServerOptions>;

const IS_DEV = process.env.ELEGANCE_DEV_MODE === "dev";

interface ApiRouteModule {
    GET?:    (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    POST?:   (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    PUT?:    (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    DELETE?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    PATCH?:  (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}

type MiddlewareFn = (
    req:  IncomingMessage,
    res:  ServerResponse,
    next: () => Promise<void>,
) => void | Promise<void>;

interface CachedFileHeaders {
    raw:    Record<string, string | number>;
    gzip:   Record<string, string | number>;
    brotli: Record<string, string | number>;
}

interface CachedFile {
    raw:     Buffer;
    gzip:    Buffer;
    brotli:  Buffer;
    mime:    string;
    etag:    string;
    headers: CachedFileHeaders;
}

export interface MatchedRoute {
    pathname:          string;
    pageFile:          string;
    layouts:           string[];
    layoutCacheKeys:   CacheKey[];
    cacheKey:          CacheKey;
    sharedChunkPaths:  string[];
    isDynamic:         boolean;
    patternPathname?:  string | undefined;
    matcher:           (pathname: string) => Record<string, string | string[] | undefined> | null;
}

class LRU<K, V> {
    private readonly map = new Map<K, V>();
    constructor(private readonly max: number) {}

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined;
        const v = this.map.get(key) as V;
        this.map.delete(key);
        this.map.set(key, v);
        return v;
    }

    set(key: K, val: V): void {
        if (this.map.has(key)) this.map.delete(key);
        else if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value!);
        this.map.set(key, val);
    }

    has(key: K): boolean { return this.map.has(key); }
    delete(key: K): void { this.map.delete(key); }
}

export const staticCache        = new Map<string, CachedFile>();
export const dynamicModuleCache = new LRU<string, CompiledRoute>(256);
export const aotStaticCache     = new Map<string, CompiledRoute>();
export const statusCodePageCache = new Map<string, {
    compiled:        CompiledRoute;
    pageFile:        string;
    layouts:         string[];
    layoutCacheKeys: CacheKey[];
    cacheKey:        CacheKey;
}>();
export const middlewareChainCache = new Map<string, MiddlewareFn[]>();
export const encCache           = new LRU<string, Encoding>(512);

export let staticRouteMap:    Map<string, MatchedRoute> | null = null;
export let paramRoutes:       MatchedRoute[] | null            = null;
export let apiRoutesCache:    Map<string, ApiRouteModule> | null = null;
export let middlewareMapCache: Map<string, MiddlewareFn[]> | null = null;

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html",
    ".js":   "application/javascript",
    ".mjs":  "application/javascript",
    ".css":  "text/css",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".svg":  "image/svg+xml",
    ".json": "application/json",
    ".ico":  "image/x-icon",
    ".txt":  "text/plain",
};

const GZIP_PARAMS    = { level: 6 };
const BROTLI_PARAMS  = { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } };
const BODY_TIMEOUT_MS = parseInt(process.env.BODY_TIMEOUT_MS ?? "10000", 10);

let SECURITY_HEADERS: Record<string, string>;

async function initSecurityHeaders(): Promise<void> {
    const config = await getConfig();
    SECURITY_HEADERS = createSecurityHeaders(config.security);
}

function buildCachedFileHeaders(
    mime:         string,
    etag:         string,
    rawLen:       number,
    gzipLen:      number,
    brotliLen:    number,
    cacheControl = "public, max-age=31536000, immutable",
): CachedFileHeaders {
    const base = {
        ...SECURITY_HEADERS,
        "ETag":          etag,
        "Cache-Control": cacheControl,
        "Vary":          "Accept-Encoding",
    };
    return {
        raw:    { ...base, "Content-Type": mime, "Content-Length": rawLen },
        gzip:   { ...base, "Content-Type": mime, "Content-Length": gzipLen,   "Content-Encoding": "gzip" },
        brotli: { ...base, "Content-Type": mime, "Content-Length": brotliLen, "Content-Encoding": "br" },
    };
}

export async function primeStaticCache(): Promise<void> {
    async function walk(dir: string) {
        let entries;
        try { entries = await readdir(dir, { withFileTypes: true }); }
        catch { return; }

        await Promise.all(entries.map(async (e) => {
            const full    = join(dir, e.name);
            if (e.isDirectory()) { await walk(full); return; }

            const urlPath            = "/" + relative(DIST_DIR, full).replace(/\\/g, "/");
            const [raw, filestat]    = await Promise.all([readFile(full), stat(full)]);
            const [gzip, brotli]     = await Promise.all([
                gzipAsync(raw, GZIP_PARAMS),
                brotliAsync(raw, BROTLI_PARAMS),
            ]);

            const mime = MIME_TYPES[extname(full)] ?? "application/octet-stream";
            const etag = `"${filestat.size}-${filestat.mtimeMs}"`;

            staticCache.set(urlPath, {
                raw, gzip, brotli, mime, etag,
                headers: buildCachedFileHeaders(mime, etag, raw.length, gzip.length, brotli.length),
            });
        }));
    }

    await walk(DIST_DIR);
}

export function compileRouteMatcher(
    pattern: string,
): (pathname: string) => Record<string, string | string[] | undefined> | null {
    const norm = (p: string) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p) || "/";
    const normalisedPattern = norm(pattern);

    if (!normalisedPattern.includes("[")) {
        return (pathname: string) => norm(pathname) === normalisedPattern ? {} : null;
    }

    type ParamMeta = { name: string; catchAll: boolean; optional: boolean };
    const paramMeta: ParamMeta[] = [];

    const reSource = normalisedPattern
        .split("/")
        .filter(Boolean)
        .map((seg) => {
            if (seg.startsWith("[...") && seg.endsWith("]")) {
                paramMeta.push({ name: seg.slice(4, -1), catchAll: true, optional: false });
                return "(.+)";
            }
            if (seg.startsWith(":[") && seg.endsWith("]")) {
                paramMeta.push({ name: seg.slice(2, -1), catchAll: false, optional: true });
                return "([^/]+)?";
            }
            if (seg.startsWith("[") && seg.endsWith("]")) {
                paramMeta.push({ name: seg.slice(1, -1), catchAll: false, optional: false });
                return "([^/]+)";
            }
            return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/");

    const re = new RegExp(`^/?${reSource}/?$`);

    return (pathname: string) => {
        const m = re.exec(pathname);
        if (!m) return null;
        const params: Record<string, string | string[] | undefined> = {};
        for (let i = 0; i < paramMeta.length; i++) {
            const { name, catchAll, optional } = paramMeta[i]!;
            const val = m[i + 1];
            if (catchAll) {
                params[name] = val ? val.split("/") : [];
            } else {
                params[name] = optional && !val ? undefined : val;
            }
        }
        return params;
    };
}

function routeEntryToMatched(entry: RouteEntry): MatchedRoute {
    let matcher: MatchedRoute["matcher"];

    if (entry.kind === "enumerated") {
        const patternMatcher = compileRouteMatcher(entry.patternPathname);
        const norm           = (p: string) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p) || "/";
        const concreteNorm   = norm(entry.pathname);
        matcher = (pathname: string) => norm(pathname) === concreteNorm ? patternMatcher(pathname) : null;
    } else {
        matcher = compileRouteMatcher(entry.pathname);
    }

    return {
        pathname:          entry.pathname,
        pageFile:          entry.pageFile,
        layouts:           entry.layouts,
        layoutCacheKeys:   entry.layoutCacheKeys,
        cacheKey:          entry.cacheKey,
        sharedChunkPaths:  entry.sharedChunkPaths,
        isDynamic:         entry.kind === "dynamic",
        patternPathname:   entry.kind === "enumerated" ? entry.patternPathname : undefined,
        matcher,
    };
}

export async function warmDynamicCaches(manifest: Manifest): Promise<{
    staticRouteMap: Map<string, MatchedRoute>;
    paramRoutes:    MatchedRoute[];
}> {
    const sMap:    Map<string, MatchedRoute> = new Map();
    const pRoutes: MatchedRoute[]            = [];

    await Promise.all(manifest.routes.map(async (entry) => {
        const route = routeEntryToMatched(entry);

        if (entry.kind === "enumerated") {
            pRoutes.push(route);
        } else {
            sMap.set(entry.pathname, route);
        }

        if (entry.kind === "dynamic") {
            try {
                const compiled = await loadRouteFromCache(route);
                dynamicModuleCache.set(entry.pathname, compiled);
            } catch (err: any) {
                if (isRichError(err)) throw err;
                throw richError({
                    title:       "Failed to Load Cached Route",
                    cause:       `${err}`,
                    origin:      entry.pageFile,
                    doShowStack: false,
                });
            }
        }

        if (entry.kind !== "dynamic" && IS_DEV) {
            try {
                const compiled = await loadRouteFromCache(route);
                aotStaticCache.set(entry.pathname, compiled);
            } catch (err: any) {
                if (isRichError(err)) throw err;
                throw richError({
                    title:       "Failed to Load Cached Route",
                    cause:       `${err}`,
                    origin:      entry.pageFile,
                    doShowStack: false,
                });
            }
        }
    }));

    await Promise.all(manifest.statusCodePages.map(async (ep) => {
        try {
            const compiled = await loadRouteFromCache({
                pageFile:        ep.pageFile,
                layouts:         ep.layouts,
                layoutCacheKeys: ep.layoutCacheKeys,
                cacheKey:        ep.cacheKey,
                pathname:        "",
            });

            const code = parseInt(basename(ep.pageFile), 10);
            statusCodePageCache.set(
                `${dirname(ep.pageFile)}:${isNaN(code) ? 0 : code}`,
                {
                    compiled,
                    pageFile:        ep.pageFile,
                    layouts:         ep.layouts,
                    layoutCacheKeys: ep.layoutCacheKeys,
                    cacheKey:        ep.cacheKey,
                },
            );
        } catch (err: any) {
            if (isRichError(err)) throw err;
            throw richError({
                title:       "Failed to Load Status Code Route",
                cause:       err,
                origin:      ep.pageFile,
                doShowStack: false,
            });
        }
    }));

    return { staticRouteMap: sMap, paramRoutes: pRoutes };
}

export async function loadApiRoutes(manifest: Manifest): Promise<Map<string, ApiRouteModule>> {
    if (apiRoutesCache) return apiRoutesCache;

    apiRoutesCache = new Map();

    await Promise.all(manifest.apiRoutes.map(async (entry) => {
        apiRoutesCache!.set(entry.pathname, await import(entry.file));
    }));

    return apiRoutesCache;
}

export async function loadMiddlewareMap(manifest: Manifest): Promise<Map<string, MiddlewareFn[]>> {
    if (middlewareMapCache) return middlewareMapCache;

    middlewareMapCache = new Map();

    await Promise.all(manifest.middlewares.map(async (entry) => {
        const mod = await import(entry.file);

        if (!mod.default) {
            printError(richError({
                title:       "Invalid Middleware",
                cause:       "Could not get module.default within a middleware file, which is required for the middleware to function.",
                hint:        "Did you forget the *default* keyword when exporting your function?",
                origin:      entry.file,
                doShowStack: false,
            }));

            process.exit(1);
        }

        middlewareMapCache!.set(dirname(entry.file), [typeof mod.default === "function" ? mod.default : mod]);
    }));

    return middlewareMapCache;
}

function getMiddlewareChain(routePattern: string): MiddlewareFn[] {
    if (middlewareChainCache.has(routePattern)) return middlewareChainCache.get(routePattern)!;

    const dirMap = middlewareMapCache!;
    const parts  = routePattern.replace(/^\//, "").split("/").filter(Boolean);
    const chain: MiddlewareFn[] = [];

    let dir = PAGES_DIR;
    if (dirMap.has(dir)) chain.push(...dirMap.get(dir)!);
    for (const part of parts) {
        dir = join(dir, part);
        if (dirMap.has(dir)) chain.push(...dirMap.get(dir)!);
    }

    middlewareChainCache.set(routePattern, chain);
    return chain;
}

function extractPathname(rawUrl: string | undefined): string {
    if (!rawUrl) return "/";

    let end = rawUrl.length;
    for (let i = 0; i < rawUrl.length; i++) {
        const ch = rawUrl.charCodeAt(i);
        if (ch === 63 || ch === 35) { end = i; break; }
    }

    const path = rawUrl.slice(0, end) || "/";

    if (path.indexOf("%") !== -1) {
        try { return decodeURIComponent(path); } catch { return path; }
    }

    return path;
}

type Encoding = "br" | "gzip" | null;

function acceptEncoding(req: IncomingMessage): Encoding {
    const raw = req.headers["accept-encoding"] as string | undefined;
    if (!raw) return null;

    const cached = encCache.get(raw);
    if (cached !== undefined) return cached;

    const result: Encoding = raw.includes("br") ? "br" : raw.includes("gzip") ? "gzip" : null;
    encCache.set(raw, result);
    return result;
}

async function buildRouteHTML(
    compiled:         CompiledRoute,
    route:            MatchedRoute,
    params:           Record<string, string | string[] | undefined>,
    requestPathname:  string,
    req:              IncomingMessage,
    res:              ServerResponse,
): Promise<string> {
    const ctx = createRenderContext();
    for (const { id, initial } of compiled.atomSeeds) {
        if (!ctx.atomValues.has(id)) {
            ctx.atomValues.set(id, initial);
            ctx.atomRegistry.push({ id });
        }
    }

    const preClientCode = await readFile(preClientMjsPath(route.cacheKey), "utf-8");

    let html = await runWithRenderContext(ctx, async () => {
        const [rootNode, metaNodes] = await Promise.all([
            compiled.default(params, req, res),
            compiled.metadata(params, req, res),
        ]);

        const getClientCode = (): string => generateSyntheticBundle(
            preClientCode,
            requestPathname,
            ctx.regions,
            route.layoutCacheKeys,
        );

        return generateDynamicPageHTML(rootNode, metaNodes, route, getClientCode, ctx);
    });

    const chunks = route.sharedChunkPaths.filter(chunkPath => preClientCode.includes(chunkPath));
    if (chunks.length > 0) {
        const preloadTags = chunks.map(p => `<link rel="modulepreload" href="${p}">`).join("");
        html = html.replace("</head>", `${preloadTags}</head>`);
    }

    return html;
}

async function pipeRouteToResponse(
    compiled:        CompiledRoute,
    route:           MatchedRoute,
    params:          Record<string, string | string[] | undefined>,
    requestPathname: string,
    req:             IncomingMessage,
    res:             ServerResponse,
    statusCode = 200,
): Promise<void> {
    const start = IS_DEV ? performance.now() : 0;

    const html = await buildRouteHTML(compiled, route, params, requestPathname, req, res);

    if (IS_DEV) {
        logger.debug(`rendered ${requestPathname} (${(performance.now() - start).toFixed(1)}ms)`);
    }

    if (res.writableEnded || res.destroyed) return;

    const enc  = acceptEncoding(req);
    const body = enc === "br"   ? await brotliAsync(html, BROTLI_PARAMS)
               : enc === "gzip" ? await gzipAsync(html, GZIP_PARAMS)
               : Buffer.from(html);

    const headers: Record<string, string | number> = {
        ...SECURITY_HEADERS,
        "Content-Type":   "text/html",
        "Content-Length": body.length,
        "Vary":           "Accept-Encoding",
        "Cache-Control":  "no-store",
    };
    if (enc) headers["Content-Encoding"] = enc;

    res.writeHead(statusCode, headers);
    res.end(body);
}

async function lazyBuildStaticPage(
    compiled:        CompiledRoute,
    route:           MatchedRoute,
    params:          Record<string, string | string[] | undefined>,
    requestPathname: string,
    req:             IncomingMessage,
    res:             ServerResponse,
): Promise<void> {
    const overallStart = performance.now();
    const timings: Record<string, number> = {};

    await runBuildHooks(compiled, "pre");

    const ctx = createRenderContext();
    for (const { id, initial } of compiled.atomSeeds) {
        if (!ctx.atomValues.has(id)) {
            ctx.atomValues.set(id, initial);
            ctx.atomRegistry.push({ id });
        }
    }

    let t          = performance.now();
    const bundleUrl = `${route.pathname === "/" ? "" : route.pathname}/bundle.js`;

    const { fullHtml } = await runWithRenderContext(ctx, async () => {
        const [rootNode, metaNodes] = await Promise.all([
            compiled.default(params, req, res),
            compiled.metadata(params, req, res),
        ]);
        timings["render"] = performance.now() - t;

        t = performance.now();
        const result = await generatePageHTML(
            rootNode, metaNodes, route, bundleUrl, ctx, route.sharedChunkPaths,
        );
        timings["html"] = performance.now() - t;
        return result;
    });

    const preClientCode = await readFile(preClientMjsPath(route.cacheKey), "utf-8");

    t = performance.now();
    const syntheticCode = generateSyntheticBundle(
        preClientCode,
        requestPathname,
        ctx.regions,
        route.layoutCacheKeys,
    );
    timings["bundle"] = performance.now() - t;

    await runBuildHooks(compiled, "post");

    t = performance.now();
    const routeOutDir = route.pathname === "/" ? DIST_DIR : join(DIST_DIR, route.pathname);
    await mkdir(routeOutDir, { recursive: true });
    await Promise.all([
        writeFile(join(routeOutDir, "index.html"), fullHtml),
        writeFile(join(routeOutDir, "bundle.js"),  syntheticCode),
    ]);
    timings["write"] = performance.now() - t;

    t = performance.now();
    const htmlBuf = Buffer.from(fullHtml);
    const jsBuf   = Buffer.from(syntheticCode);
    const [htmlGzip, htmlBrotli, jsGzip, jsBrotli] = await Promise.all([
        gzipAsync(htmlBuf,  GZIP_PARAMS),
        brotliAsync(htmlBuf, BROTLI_PARAMS),
        gzipAsync(jsBuf,    GZIP_PARAMS),
        brotliAsync(jsBuf,   BROTLI_PARAMS),
    ]);
    timings["compress"] = performance.now() - t;

    const htmlMime = "text/html";
    const jsMime   = "application/javascript";
    const now      = Date.now();
    const htmlEtag = `"${htmlBuf.length}-${now}"`;
    const jsEtag   = `"${jsBuf.length}-${now}"`;

    const htmlCached: CachedFile = {
        raw: htmlBuf, gzip: htmlGzip, brotli: htmlBrotli,
        mime: htmlMime, etag: htmlEtag,
        headers: buildCachedFileHeaders(htmlMime, htmlEtag, htmlBuf.length, htmlGzip.length, htmlBrotli.length, "no-store"),
    };
    const jsCached: CachedFile = {
        raw: jsBuf, gzip: jsGzip, brotli: jsBrotli,
        mime: jsMime, etag: jsEtag,
        headers: buildCachedFileHeaders(jsMime, jsEtag, jsBuf.length, jsGzip.length, jsBrotli.length, "no-store"),
    };

    staticCache.set(resolveStaticIndexKey(route.pathname), htmlCached);
    staticCache.set(bundleUrl, jsCached);

    const total = performance.now() - overallStart;
    const steps = Object.entries(timings)
        .map(([step, ms], i, arr) =>
            `  ${i === arr.length - 1 ? "└─" : "├─"} ${step}: ${ms.toFixed(1)}ms`,
        )
        .join("\n");
    logger.debug(`built ${route.pathname} (${total.toFixed(1)}ms total)\n${steps}`);

    serveCachedFile(req, res, htmlCached);
}

async function runMiddlewareChain(
    mws:   MiddlewareFn[],
    req:   IncomingMessage,
    res:   ServerResponse,
    final: () => Promise<void>,
) {
    let i = 0;
    const next = async () => {
        if (i < mws.length) await mws[i++]!(req, res, next);
        else await final();
    };
    await next();
}

async function respondWithStatusCode(
    code:            number,
    requestPathname: string,
    params:          Record<string, string | string[] | undefined>,
    req:             IncomingMessage,
    res:             ServerResponse,
): Promise<void> {
    if (serverOptions.allowStatusCodePages) {
        let bestEntry: ReturnType<typeof statusCodePageCache.get> | null = null;
        let bestDepth = -1;

        for (const [key, entry] of statusCodePageCache) {
            const colonIdx = key.lastIndexOf(":");
            const dirPath  = key.slice(0, colonIdx);
            const keyCode  = parseInt(key.slice(colonIdx + 1), 10);

            if (keyCode !== code && keyCode !== 0) continue;

            const relDir      = relative(PAGES_DIR, dirPath);
            const dirPattern  = relDir === "" ? "/" : `/${relDir.replace(/\\/g, "/")}`;
            const trailPattern = dirPattern === "/" ? "/[...__trail]" : `${dirPattern}/[...__trail]`;

            const exactMatches = compileRouteMatcher(dirPattern)(requestPathname);
            const trailMatches = compileRouteMatcher(trailPattern)(requestPathname);

            if (exactMatches === null && trailMatches === null) continue;

            const depth = dirPattern === "/" ? 0 : dirPattern.split("/").filter(Boolean).length;
            if (depth > bestDepth) {
                bestEntry = entry;
                bestDepth = depth;
            }
        }

        if (bestEntry) {
            const route: MatchedRoute = {
                pathname:         requestPathname,
                pageFile:         bestEntry.pageFile,
                layouts:          bestEntry.layouts,
                layoutCacheKeys:  bestEntry.layoutCacheKeys,
                cacheKey:         bestEntry.cacheKey,
                sharedChunkPaths: [],
                isDynamic:        true,
                matcher:          () => ({}),
            };
            await pipeRouteToResponse(bestEntry.compiled, route, params, requestPathname, req, res, code);
            return;
        }
    }

    res.writeHead(code);
    res.end();
}

function stripTrailingSlash(p: string): string {
    return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function resolveStaticIndexKey(pathname: string): string {
    if (extname(pathname)) return pathname;
    const clean = pathname.replace(/\/$/, "") || "/";
    return clean === "/" ? "/index.html" : `${clean}/index.html`;
}

function serveCachedFile(
    req:        IncomingMessage,
    res:        ServerResponse,
    cached:     CachedFile,
    statusCode = 200,
): void {
    if (req.headers["if-none-match"] === cached.etag) {
        res.writeHead(304); res.end(); return;
    }
    const enc = acceptEncoding(req);
    if (enc === "br")        { res.writeHead(statusCode, cached.headers.brotli); res.end(cached.brotli); }
    else if (enc === "gzip") { res.writeHead(statusCode, cached.headers.gzip);   res.end(cached.gzip);   }
    else                     { res.writeHead(statusCode, cached.headers.raw);    res.end(cached.raw);    }
}

function getRequestBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let totalLen = 0;

        const timer = setTimeout(() => {
            req.socket.destroy();
            reject(new Error("Request body timeout"));
        }, BODY_TIMEOUT_MS);

        req.on("data", (chunk: Buffer) => {
            totalLen += chunk.length;
            if (totalLen > 1e6) {
                clearTimeout(timer);
                req.socket.destroy();
                reject(new Error("Request body too large"));
                return;
            }
            chunks.push(chunk);
        });

        req.on("end", () => {
            clearTimeout(timer);
            const body = Buffer.concat(chunks).toString("utf8");
            try { resolve(JSON.parse(body)); } catch { resolve(body); }
        });

        req.on("error", (err: unknown) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

async function runServerAction(req: IncomingMessage, res: ServerResponse) {
    let actionId: string;
    {
        const header = req.headers["elegance-action"];

        if (!header || Array.isArray(header)) {
            res.statusCode = 400;
            res.end();
            return;
        }

        actionId = header;
    }

    const serverAction = globalThis.__serverActions.find(a => a.id === actionId);

    if (!serverAction) {
        res.statusCode = 404;
        res.end();
        return;
    }

    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end();
        return;
    }

    const requestParams = await getRequestBody(req) as Record<any, unknown>;

    if (!requestParams || typeof requestParams !== "object" || Array.isArray(requestParams)) {
        res.statusCode = 400;
        res.end();
        return;
    }

    if (serverAction.props) {
        for (const [key, value] of Object.entries(serverAction.props) as [string, PropSchema][]) {
            const requestParam = requestParams[key as keyof typeof requestParams];

            function badRequest(reason: string) {
                res.statusCode = 400;
                res.end(reason);
            }

            if (requestParam === undefined || requestParam === null) {
                if (value.required) return badRequest(`${key} is a required value`);
                continue;
            }

            switch (value.type) {
                case "string":
                    if (typeof requestParam !== "string")
                        return badRequest(`${key} is not of type string`);
                    if (value.length && requestParam.length < value.length[0])
                        return badRequest(`${key} is too short (min ${value.length[0]})`);
                    if (value.length && requestParam.length > value.length[1])
                        return badRequest(`${key} is too long (max ${value.length[1]})`);
                    break;

                case "array":
                    if (!Array.isArray(requestParam))
                        return badRequest(`${key} is not an Array`);
                    if (value.length && requestParam.length < value.length[0])
                        return badRequest(`${key} is too short (min ${value.length[0]})`);
                    if (value.length && requestParam.length > value.length[1])
                        return badRequest(`${key} is too long (max ${value.length[1]})`);
                    break;

                case "boolean":
                    if (typeof requestParam !== "boolean")
                        return badRequest(`${key} is not of type boolean`);
                    break;

                case "number":
                    if (typeof requestParam !== "number")
                        return badRequest(`${key} is not of type number`);
                    if (value.min && requestParam < value.min)
                        return badRequest(`${key} is too small`);
                    if (value.max && requestParam > value.max)
                        return badRequest(`${key} is too large`);
                    break;
            }

            if (typeof requestParam !== value.type) {
                res.statusCode = 400;
                res.end();
                return;
            }
        }
    }

    try {
        const returnValue = await serverAction.callback({ ...requestParams, req, res });

        if (res.writableEnded || res.destroyed) return;

        res.end(JSON.stringify(returnValue));
        return;
    } catch {
        res.statusCode = 500;
        res.end();
        return;
    }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
    req.socket.setNoDelay(IS_DEV);

    const pathname = extractPathname(req.url);

    if (IS_DEV) logger.info(`- ${req.method} : ${pathname}`);

    if (pathname === "/__action") { runServerAction(req, res); return; }

    const cached = staticCache.get(pathname);
    if (cached) { serveCachedFile(req, res, cached); return; }

    const apiModule = apiRoutesCache!.get(stripTrailingSlash(pathname));
    if (apiModule) {
        const handler = apiModule[req.method as keyof ApiRouteModule] as (...params: any) => Promise<void>;

        if (typeof handler !== "function") {
            res.writeHead(405);
            res.end();
            return;
        }

        runMiddlewareChain(getMiddlewareChain(pathname), req, res, async () => {
            handler(req, res).catch((e) => {
                res.writeHead(500);
                res.end();

                printError(richError({
                    title:       "API Route Threw",
                    cause:       "An API Route threw an error whilst it was being executed.",
                    origin:      pathname,
                    doShowStack: false,
                }));

                logger.error(e);
            });
        });

        return;
    }

    const normalizedPathname = stripTrailingSlash(pathname) || "/";

    let matchedRoute: MatchedRoute | null = staticRouteMap!.get(normalizedPathname) ?? null;
    let params: Record<string, string | string[] | undefined> = {};

    if (!matchedRoute) {
        for (const r of paramRoutes!) {
            const match = r.matcher(pathname);
            if (match) { matchedRoute = r; params = match; break; }
        }
    }

    await runMiddlewareChain(getMiddlewareChain(matchedRoute?.pathname ?? pathname), req, res, async () => {
        if (!matchedRoute) {
            const staticIndex = staticCache.get(resolveStaticIndexKey(pathname));

            if (staticIndex) {
                serveCachedFile(req, res, staticIndex);
                return;
            }

            await respondWithStatusCode(404, pathname, params, req, res);
            return;
        }

        if (matchedRoute.isDynamic) {
            const compiled = dynamicModuleCache.get(matchedRoute.pathname);

            if (!compiled) {
                printError(richError({
                    title:       "No Cached Module for Dynamic Route",
                    cause:       "A dynamic route was not warmed during server startup, this is likely an internal error.",
                    origin:      matchedRoute.pathname,
                    doShowStack: true,
                }));

                await respondWithStatusCode(500, pathname, params, req, res);
                return;
            }

            await pipeRouteToResponse(compiled, matchedRoute, params, pathname, req, res, 200);
            return;
        }

        if (IS_DEV) {
            const builtHtml = staticCache.get(resolveStaticIndexKey(matchedRoute.pathname));
            if (builtHtml) {
                serveCachedFile(req, res, builtHtml);
                return;
            }

            const compiled = aotStaticCache.get(matchedRoute.pathname);
            if (!compiled) {
                printError(richError({
                    title:       "Internal Error",
                    cause:       "A static route was not cached during lazy compilation on the server.",
                    origin:      matchedRoute.pathname,
                    doShowStack: false,
                }));

                await respondWithStatusCode(500, pathname, params, req, res);
                return;
            }

            try {
                await lazyBuildStaticPage(compiled, matchedRoute, params, pathname, req, res);
            } catch (e) {
                respondWithStatusCode(500, pathname, {}, req, res);

                if (isRichError(e)) throw e;

                throw richError({
                    title:       "Failed to lazy build a static page.",
                    cause:       e,
                    doShowStack: true,
                });
            }

            return;
        }

        const pageCached = staticCache.get(resolveStaticIndexKey(matchedRoute.pathname));
        if (pageCached) {
            serveCachedFile(req, res, pageCached);
            return;
        }

        await respondWithStatusCode(404, pathname, params, req, res);
    }).catch((e: unknown) => {
        if (isRichError(e)) { printError(e); return; }

        printError(richError({
            title:       "Failed to run request.",
            cause:       e,
            doShowStack: true,
        }));
    });
}

async function startMainServer(): Promise<ReturnType<typeof createServer>> {
    const port = serverOptions.port;

    if (!IS_DEV) {
        return new Promise<ReturnType<typeof createServer>>((resolve, reject) => {
            const srv = createServer(handleRequest);
            srv.keepAliveTimeout = 65_000;
            srv.headersTimeout   = 66_000;
            srv.once("error", (err: NodeJS.ErrnoException) => {
                if (err.code === "EADDRINUSE") {
                    printError(richError({
                        title:       "Busy Port",
                        cause:       `The port ${port} is already hogged by another process. Please kill the process hogging it, or change the port.`,
                        doShowStack: true,
                    }));
                    process.exit(1);
                }
                reject(err);
            });
            srv.listen(port, "0.0.0.0", () => {
                logger.success(`Live at: http://localhost:${port}`);
                resolve(srv);
            });
        });
    }

    for (let i = port; i < port + 100; i++) {
        try {
            return await new Promise<ReturnType<typeof createServer>>((resolve, reject) => {
                const srv = createServer(handleRequest);
                srv.keepAliveTimeout = 65_000;
                srv.headersTimeout   = 66_000;
                srv.once("error", reject);
                srv.listen(i, "0.0.0.0", () => {
                    logger.success(`Live at: http://localhost:${i}`);
                    resolve(srv);
                });
            });
        } catch {}
    }

    throw new Error("Could not find an available port");
}

export async function serve(): Promise<void> {
    serverOptions = config.server as DeepRequired<ServerOptions>;

    if (config.runtime.init) {
        await import(config.runtime.init);
    }

    const manifest: Manifest = JSON.parse(
        await readFile(join(OUT_DIR, "paths.json"), "utf-8"),
    );

    const routes = await warmDynamicCaches(manifest);
    staticRouteMap = routes.staticRouteMap;
    paramRoutes    = routes.paramRoutes;

    await Promise.all([
        primeStaticCache(),
        serverOptions.serveAPI ? loadApiRoutes(manifest) : Promise.resolve(),
        loadMiddlewareMap(manifest),
        initSecurityHeaders(),
    ]);

    await startMainServer();

    if (process.send) process.send({ type: "ready" });
}