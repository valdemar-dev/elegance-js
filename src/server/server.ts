/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 * 
 * It's HTTP only, so if you want HTTPS, use a proxy.
 */

import { join, normalize, relative, resolve } from "path";
import { CompiledLayout, CompiledPage, compilePage, compilerOptions, CompilerOptions, compilerStore, generatePageCompilationContext } from "../compilation/compiler";
import { LayoutInformation } from "./layout";
import { PageInformation } from "./page";

import { createServer, IncomingMessage, Server, ServerResponse, } from "http";
import { Dirent, existsSync, readdirSync, readFileSync, statSync, createReadStream } from "fs";
import * as zlib from "zlib";
import { promisify } from "util";
import { URLSearchParams } from "url";

const gzipAsync = promisify(zlib.gzip);

type ServerOptions = {
    /** If a port is not available, it will increment the port +1 in a loop until it finds a valid one. */
    port: number;

    hostname: string;

    /** Whether or not to use the built-in api handler. */
    serveAPI: boolean;

    /** 
     * Setting this to true allows dynamic pages to be compiled whenever a user requests them.
     */
    allowDynamic: boolean;

    /** 
     * Setting this to true will make statuscode pages like 404.ts be returned in-favor of simple HTTP error codes.
     */
    allowStatusCodePages: boolean;

    /**
     * If basename is /my-website/, and the user makes a request to `/my-website/home`,
     * the page that we will look for will be `/home`.
     */
    base?: string;

    /** These are gathered by the compiler, you just need to pass them in. */
    allLayouts: Map<string, LayoutInformation>,
    /** These are gathered by the compiler, you just need to pass them in. */
    allPages: Map<string, PageInformation>,
    /** These are gathered by the compiler, you just need to pass them in. */
    allStatusCodePages: Map<string, PageInformation>,
    /** These are gathered by the compiler, you just need to pass them in. */
    builtStaticPages: Map<string, CompiledPage>,
    /** These are gathered by the compiler, you just need to pass them in. */
    builtStaticLayouts: Map<string, CompiledLayout>,
}

type MiddlewareFunction = (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>;

type MiddlewareExports = {
    middleware: MiddlewareFunction,
};

type MiddlewareInformation = {
    /** The absolute path to the .ts file containing the module for this middleware. */
    modulePath: string,

    /** The pathname of this middleware relative to pagesDirectory */
    pathname: string,

    exports: MiddlewareExports,
};

type APIRouteFunction = (req: IncomingMessage, res: ServerResponse) => Promise<any>;

type APIRouteExports = {
    methods: {
        POST: APIRouteFunction | undefined,
        GET: APIRouteFunction | undefined,
        PUT: APIRouteFunction | undefined,
        DELETE: APIRouteFunction | undefined,
        OPTIONS: APIRouteFunction | undefined,    
    },
}
type APIRouteInformation = {
    /** The absolute path to the .ts file containing the module for this middleware. */
    modulePath: string,

    /** The pathname of this middleware relative to pagesDirectory */
    pathname: string,

    exports: APIRouteExports,
}

type ServerStartupResult = {
    /** The port that we ended up actually using (might differ from the one given, if it was not available) */
    port: number;
};

function removePrefix(str: string, prefix: string) {
    return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

let serverOptions: ServerOptions;

const allAPIRoutes = new Map<string, APIRouteInformation>();
async function gatherAPIRoutes() {
    await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
        if (file.name !== "route.ts") return;

        const pathname = sanitizePathname(relative(compilerOptions.pagesDirectory, file.parentPath));
        const fullPath = join(file.parentPath, file.name);

        const { POST, GET, PUT, DELETE, OPTIONS  } = await import("file://" + fullPath);

        const methods = {POST, GET, PUT, DELETE, OPTIONS};

        for (const [name, method] of Object.entries(methods)) {
            if (method && typeof method !== "function") {
                throw new Error(`In file: "${fullPath}":\nThe export ${method} is not of type "function". Got: ${typeof method}`);
            }
        }

        const apiRouteInformation: APIRouteInformation = {
            exports: {
                methods,
            },
            modulePath: fullPath,
            pathname: pathname,
        };

        allAPIRoutes.set(pathname, apiRouteInformation);
    });
} 


async function handleAPIRequest(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const route = allAPIRoutes.get(pathname);

    if (!route) {
        res.statusCode = 404;
        await sendResponse(req, res, "Route does not exist.");
        return;
    }

    if (!req.method) {
        res.statusCode = 400;
        await sendResponse(req, res, "Bad request");
        return;
    }

    const method = route.exports.methods[req.method as keyof typeof route.exports.methods];

    if (!method) {
        res.statusCode = 405;
        await sendResponse(req, res, "Method not allowed");
        return;
    }

    method(req, res);
}

/** 
 * Go through a directory, including all it's subdirectories, 
 * and call callback() for each file.
 */
async function walkDirectory(fullPath: string, callback: (file: Dirent) => Promise<void>) {
    const stack: Dirent[] = [];

    stack.push(...readdirSync(fullPath, { withFileTypes: true, }));

    while (true) {
        const entry = stack.pop();
        if (!entry) break;

        if (entry.isDirectory()) {
            const fullPath = join(entry.parentPath, entry.name);

            stack.push(...readdirSync(fullPath, { withFileTypes: true, }));

            continue;
        }

        if (!entry.isFile()) continue;

        await callback(entry);
    }
}

function safePercentDecode(input: string): string {
    return input.replace(/%[0-9A-Fa-f]{2}/g, (m) =>
        String.fromCharCode(parseInt(m.slice(1), 16))
    );
}

function sanitizePathname(pathname: string = ""): string {
    if (!pathname) return "/";

    pathname = safePercentDecode(pathname);

    pathname = "/" + pathname;

    pathname = pathname.replace(/\/+/g, "/");

    const segments = pathname.split("/");

    const resolved: string[] = [];

    for (const segment of segments) {
        if (!segment || segment === ".") continue;

        if (segment === "..") {
            resolved.pop();
            continue;
        }

        resolved.push(segment);
    }

    const encoded = resolved.map((s) => encodeURIComponent(s));

    return "/" + encoded.join("/");
}

function getStatusCodePage(
    statusCode: number,
    pathname: string,
) {
    const pages = serverOptions.allStatusCodePages;
    let currentPath = pathname;

    if (!currentPath.startsWith("/")) {
        currentPath = "/" + currentPath;
    }

    while (true) {
        let candidate: string;

        if (currentPath === "/") {
            candidate = `/${statusCode}`;
        } else {
            candidate = `${currentPath.replace(/\/$/, "")}/${statusCode}`;
        }

        const pageInfo = pages.get(candidate);

        if (pageInfo) {
            pageInfo.pathname = pathname;

            return pageInfo;
        }

        if (currentPath === "/") {
            break;
        }

        const lastSlash = currentPath.lastIndexOf("/");

        if (lastSlash <= 0) {
            currentPath = "/";
        } else {
            currentPath = currentPath.slice(0, lastSlash);
        }
    }
}

async function respondWithStatusCodePage(
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string,
    statusCode: number,
    message: string,
) {
    const statusCodePage = getStatusCodePage(statusCode, pathname);
    
    if (!statusCodePage) {
        res.statusCode = statusCode;
        await sendResponse(req, res, message);
        return;
    }

    const compiledPage = await compilePage(serverOptions.allLayouts, statusCodePage, { req, res });

    res.statusCode = 200;
    await sendResponse(req, res, compiledPage.pageHTML, "text/html");
}

async function respondWithStatusCode(req: IncomingMessage, res: ServerResponse, pathname: string, statusCode: number, message: string) {
    if (serverOptions.allowStatusCodePages === true) {
        return respondWithStatusCodePage(req, res, pathname, statusCode, message);
    }

    res.statusCode = statusCode;
    await sendResponse(req, res, message);
}

/**
 * Ensure a given pathname is safe, and does not escape the root directory.
 * @param userInputPath The path to turn into a safe path 
 * @returns A safe path, or null if the path was not safe, or does not exist.
 */
async function getSafePath(userInputPath: string): Promise<string | null> {
    const rootDirectory = resolve(join(compilerOptions.outputDirectory, "DIST"));

    const decodedPath = decodeURIComponent(userInputPath);

    const normalizedPath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');

    const finalPath = join(rootDirectory, normalizedPath);

    const resolvedFinalPath = resolve(finalPath);

    if (!resolvedFinalPath.startsWith(rootDirectory) || existsSync(resolvedFinalPath) === false) {
        return null;
    }

    return resolvedFinalPath;
}

async function handlePageRequest(req: IncomingMessage, res: ServerResponse, pathname: string, pageInformation: PageInformation, matchHit: PathnameMatch) {
    if (pageInformation.exports.isDynamic) {
        if (serverOptions.allowDynamic === false) {
            return respondWithStatusCode(req, res, pathname, 404, "Page not found.");
        }

        const informationClone = {
            ...pageInformation,
        };

        informationClone.pathname = pathname;

        const result = await compilePage(serverOptions.allLayouts, informationClone, { req, res }, matchHit.params);

        res.statusCode = 200;
        await sendResponse(req, res, result.pageHTML, "text/html");
        return;
    }

    const { pageHTML } = serverOptions.builtStaticPages.get(pageInformation.pathname)!

    res.statusCode = 200;
    await sendResponse(req, res, pageHTML, "text/html");
}

const mimeByExt: Record<string, string> = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
};

function isCompressible(mime: string): boolean {
    return mime.startsWith('text/') ||
           mime === 'application/javascript' ||
           mime === 'application/json' ||
           mime === 'image/svg+xml';
}

async function handleFileRequest(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const safePath = await getSafePath(pathname);

    if (!safePath) {
        return respondWithStatusCode(req, res, pathname, 404, "File not found.");
    }

    const stats = statSync(safePath);

    if (stats.isDirectory()) {
        return respondWithStatusCode(req, res, pathname, 404, "File not found.");
    }

    const fileSize = stats.size;
    const ext = safePath.slice(safePath.lastIndexOf(".")).toLowerCase();
    const mime = mimeByExt[ext] ?? "application/octet-stream";

    const acceptEncoding = req.headers["accept-encoding"] as string || "";
    const rangeHeader = req.headers.range as string | undefined;

    if (!rangeHeader) {
        const useGzip = acceptEncoding.includes('gzip') && isCompressible(mime);

        const head: Record<string, string | number> = {
            'Content-Type': mime,
            'Accept-Ranges': 'bytes',
        };

        if (!useGzip) {
            head['Content-Length'] = fileSize;
        }

        if (useGzip) {
            head['Content-Encoding'] = 'gzip';
            head['Vary'] = 'Accept-Encoding';
        }

        res.writeHead(200, head);

        const stream = createReadStream(safePath);

        if (useGzip) {
            const gzip = zlib.createGzip();
            stream.pipe(gzip).pipe(res);
        } else {
            stream.pipe(res);
        }
        return;
    }

    const ranges = rangeHeader.replace(/bytes=/, '').split('-');
    let start = parseInt(ranges[0], 10);
    let end = ranges[1] ? parseInt(ranges[1], 10) : fileSize - 1;

    if (isNaN(start)) start = 0;
    if (isNaN(end) || end >= fileSize) end = fileSize - 1;

    if (start >= fileSize || start > end) {
        res.writeHead(416, {
            'Content-Range': `bytes */${fileSize}`,
        });
        res.end();
        return;
    }

    const contentLength = end - start + 1;
    const headers = {
        'Content-Type': mime,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': contentLength,
    };

    res.writeHead(206, headers);

    const stream = createReadStream(safePath, { start, end });
    stream.pipe(res);
}

function getPathSubparts(path: string) {
    const rawParts = path.split('/').filter(Boolean);
    const parts = [...rawParts];

    if (parts.length > 0 && parts[parts.length - 1].includes('.')) {
        parts.pop();
    }

    const result = ['/'];
    let current = '';

    for (const part of parts) {
        current += '/' + part;
        result.push(current);
    }

    return result;
}

const allMiddleware = new Map<string, MiddlewareInformation>();
async function gatherMiddleware() {
    await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
        if (file.name !== "middleware.ts") return;

        const pathname = sanitizePathname(relative(compilerOptions.pagesDirectory, file.parentPath));
        const fullPath = join(file.parentPath, file.name);

        const { middleware } = await import("file://" + fullPath);
        if (!middleware || typeof middleware !== "function") {
            throw new Error(`In file: "${fullPath}":\nThe export middleware is not of type "function". Got: ${typeof middleware}`);
        }

        const middlewareInformation: MiddlewareInformation = {
            exports: {
                middleware,
            },
            modulePath: fullPath,
            pathname: pathname,
        };

        allMiddleware.set(pathname, middlewareInformation);
    });
} 

async function runMiddleware(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const parts = getPathSubparts(pathname);

    const middlewares: MiddlewareInformation[] = [];
    for (const part of parts) {
        if (allMiddleware.has(part) === false) {
            continue;
        }

        middlewares.push(allMiddleware.get(part)!);
    }

    if (middlewares.length < 1) return;

    const next = (idx: number) => {
        if (idx >= middlewares.length) {
            return;
        }

        const middleware = middlewares[idx];

        const localNext = () => {
            next(idx + 1);
        };
        
        middleware.exports.middleware(req, res, localNext);
    };

    next(0);
}

async function sendResponse(
    req: IncomingMessage,
    res: ServerResponse,
    data: string | Buffer,
    contentType: string = "text/plain"
) {
    let buffer: Buffer = typeof data === "string" ? Buffer.from(data) : data;
    const acceptEncoding = req.headers["accept-encoding"] as string || "";

    if (acceptEncoding.match(/\bgzip\b/)) {
        try {
            buffer = await gzipAsync(buffer);
            res.setHeader("Content-Encoding", "gzip");
            res.setHeader("Vary", "Accept-Encoding");
        } catch (err) {
            console.error("Gzip compression error:", err);
        }
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length.toString());
    res.end(buffer);
}

async function requestHandler(req: IncomingMessage, res: ServerResponse) {
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Allow": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": req.headers["access-control-request-headers"] || "*",
            "Access-Control-Max-Age": "86400",
        });
        res.end();
        return;
    }

    if (!req.url) {
        res.statusCode = 400;
        await sendResponse(req, res, "Bad request.");
        return;
    }

    const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);

    if (serverOptions.base && url.pathname.startsWith(serverOptions.base) === false) {
        res.statusCode = 501;
        await sendResponse(req, res, "Path does not start with basename.");
        return;
    }

    const pathname = sanitizePathname(serverOptions.base ? removePrefix(serverOptions.base!, url.pathname) : url.pathname);
    
    runMiddleware(req, res, pathname);

    if (!res.writable) return;

    if (pathname.startsWith("/api/")) {
        return handleAPIRequest(req, res, pathname);
    }

    const matchingPage = matchPathnameToPathParts(pathname, [...serverOptions.allPages.values()].map(v => getPathPattern(v)));
    if (!matchingPage) {
        return handleFileRequest(req, res, pathname);
    }

    handlePageRequest(req, res, pathname, serverOptions.allPages.get(matchingPage.matchedPathname)!, matchingPage);
}

function getPathPattern(value: any) {
    return {
        pathname: value.pathname,
        pathnameParts: value.pathnameParts,
    }
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Take a set of pathname parts, like ["blog", ":[postId]"], and turn that into a regex string to match a pathname against.
 * @param pathnameParts Parts to turn into a regex string
 * @returns Regex string
 */
function buildRegexStrFromParts(pathnameParts: string[]): string {
    let patternRegex = '^/';

    let hasPart = false;

    let previousCanSkip = false;

    for (let part of pathnameParts) {
        if (part === '') {
            continue;
        }

        const optional = part.startsWith(':');

        const currentPart = optional ? part.slice(1) : part;

        const isCatchAll = currentPart.startsWith('*') && currentPart.endsWith('*');
        const isDynamic = currentPart.startsWith('[') && currentPart.endsWith(']');

        let matcher: string;

        if (isCatchAll) {
            matcher = '[^/]+(?:/[^/]+)*';
        } else if (isDynamic) {
            matcher = '[^/]+';
        } else {
            matcher = escapeRegExp(currentPart);
        }

        if (isCatchAll || isDynamic) {
            const paramName = currentPart.slice(1, -1);

            matcher = `(?<${paramName}>${matcher})`;
        }

        let sep: string;

        if (hasPart) {
            sep = previousCanSkip ? '/?' : '/';
        } else {
            sep = '';
        }

        let addition = sep + matcher;
        
        if (optional) {
            if (hasPart || sep !== '') {
                addition = '(?:' + sep + matcher + ')?';
            } else {
                addition = '(?:' + matcher + ')?';
            }
            
            previousCanSkip = true;
        } else {
            previousCanSkip = false;
        }

        patternRegex += addition;
        hasPart = true;
    }

    if (patternRegex === '^/') {
        patternRegex = '^/?';
    }

    patternRegex += '$';

    return patternRegex;
}

interface PathPattern {
    pathname: string;
    pathnameParts: string[];
}

type PathnameMatch = { matchedPathname: string, params: Record<string, unknown> }
/**
 * Find a pathname in a given set of pathnames that use the Elegance routing convention - that matches.
 *
 * For example, for an input of `pathname="/recipes/cake"` `allPatterns=[{ pathname: "/recipes/[name]", pathnameParts: ["recipes", "[name]"]}]`
 *
 * You'd get: { matchedPathname: "/recipes/[name]", params: { name: "cake" } }.
 *
 * @param pathname The pathname to find a match for.
 * @param allPatterns Patterns to match against, use getPathPattern to generate.
 * @returns A hit with params, or undefined matchedPathname if none.
 */
function matchPathnameToPathParts(pathname: string, allPatterns: PathPattern[]): PathnameMatch | null {
    const last = pathname.split('/').pop()!;

    if (last.includes('.')) {
        return null;
    }

    const candidates: { pattern: PathPattern, fixedCount: number, dynamicSingleCount: number, catchallCount: number, optionalCount: number, totalDynamic: number, match: RegExpMatchArray }[] = [];
    
    for (const pattern of allPatterns) {
        const patternParts = pattern.pathnameParts;

        const regexStr = buildRegexStrFromParts(patternParts);
        const regex = new RegExp(regexStr);
        
        const match = pathname.match(regex);

        if (match) {
            const getBasePart = (p: string) => p.startsWith(':') ? p.slice(1) : p;
            const isDynamicPart = (p: string) => p.startsWith(':') || p.startsWith('[') || p.startsWith('*');

            const fixedCount = patternParts.filter(p => p !== '' && !isDynamicPart(p)).length;

            const dynamicSingleCount = patternParts.filter(p => {
                const pp = getBasePart(p);

                return pp.startsWith('[') && pp.endsWith(']');
            }).length;

            const catchallCount = patternParts.filter(p => {
                const pp = getBasePart(p);

                return pp.startsWith('*') && pp.endsWith('*');
            }).length;

            const optionalCount = patternParts.filter(p => p.startsWith(':')).length;
            const totalDynamic = dynamicSingleCount + catchallCount;

            candidates.push({ pattern, fixedCount, dynamicSingleCount, catchallCount, optionalCount, totalDynamic, match });
        }
    }

    if (candidates.length === 0) {
        return null;
    }

    candidates.sort((a, b) => {
        if (a.fixedCount !== b.fixedCount) {
            return b.fixedCount - a.fixedCount;
        }
        
        if (a.totalDynamic !== b.totalDynamic) {
            return a.totalDynamic - b.totalDynamic;
        }

        if (a.catchallCount !== b.catchallCount) {
            return a.catchallCount - b.catchallCount;
        }

        if (a.optionalCount !== b.optionalCount) {
            return a.optionalCount - b.optionalCount;
        }

        return 0;
    });
    const best = candidates[0];
    return { matchedPathname: best.pattern.pathname, params: best.match.groups || {} };
}


/**
 * Starts the Elegance server and distributes the DIST directory to the public.
 * If hot-reloading is enabled, this also tells the clients to refresh the page.
 */
async function serveProject(startupServerOptions: ServerOptions): Promise<ServerStartupResult> {
    serverOptions = startupServerOptions;

    if (serverOptions.base && serverOptions.base.startsWith("/") === false) {
        throw new Error("Failed to serve the Elegance project, the `base` option in the startUpServerOptions must start with a / in order to be a valid pathname. Currently, it is:" + serverOptions.base);
    }

    await gatherMiddleware();
    await gatherAPIRoutes();

    let port = serverOptions.port ?? 3000;
    
    const server = createServer(requestHandler);

    /** Prefer to sacrifice port desireability in-exchange for getting the thing running */
    server.on("error", (error: any) => {
        if (error.code === "EADDRINUSE") {
            setTimeout(() => {
                port += 1;
                server.listen(port);
            }, 500)
        }
    })

    server.listen({ port: serverOptions.port, hostname: serverOptions.hostname, }, () => {
        if (compilerOptions.doHotReload) {
            process.send?.("hot-reload-finish")
        }
    });

    return {
        port,
    };
}

/** Get the current query as `URLSearchParams` */
function getQuery(): URLSearchParams {
    const store = compilerStore.getStore();

    if (!store) {
        throw new Error("getQuery() cannot be called outside of a page or layout.");
    }

    if (!store.req) {
        throw new Error("getQuery() cannot be used inside of a static page, since it depends on the *request query*.");
    }

    if (!store.req.url) {
        throw new Error("Invalid req.url");
    }

    return new URLSearchParams(new URL(`http://${process.env.HOST ?? 'localhost'}${store.req.url}`).searchParams);
}

/** Get the current page's request and response. */
function getRequest(): { req: IncomingMessage, res: ServerResponse } {
    const store = compilerStore.getStore();

    if (!store) {
        throw new Error("getQuery() cannot be called outside of a page or layout.");
    }

    if (!store.req || !store.res) {
        throw new Error("getQuery() cannot be used inside of a static page, since it depends on the *request query*.");
    }

    return { req: store.req, res: store.res };
}



/**
 * Get the cookies for the current request.
 * Requires a dynamic page.
 */
function getCookieStore() {
    const { req, res } = getRequest();

    let cookieMap: Map<string, string> | null = null;

    const getCookies = (): Map<string, string> => {
        if (cookieMap) return cookieMap;

        cookieMap = new Map<string, string>();

        if (req.headers.cookie) {
            req.headers.cookie.split(';').forEach(part => {
                const trimmed = part.trim();
                if (!trimmed) return;

                const [name, ...valueParts] = trimmed.split('=');
                if (name) {
                    const value = valueParts.join('=').trim();
                    cookieMap!.set(name, decodeURIComponent(value));
                }
            });
        }

        return cookieMap;
    };

    return {
        /**
         * Get a cookie value by name
         */
        get(name: string): string | undefined {
            return getCookies().get(name);
        },

        /**
         * Check if a cookie exists
         */
        has(name: string): boolean {
            return getCookies().has(name);
        },

        /**
         * Get all cookies as a plain object
         */
        getAll(): Record<string, string> {
            return Object.fromEntries(getCookies());
        },

        /**
         * Set a cookie
         * 
         * @param name Cookie name
         * @param value Cookie value
         * @param options Optional cookie attributes
         */
        set(
            name: string,
            value: string,
            options: {
                maxAge?: number;      // seconds not ms
                expires?: Date;
                path?: string;
                domain?: string;
                secure?: boolean;
                httpOnly?: boolean;
                sameSite?: 'Strict' | 'Lax' | 'None';
            } = {}
        ): void {
            let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

            if (options.maxAge !== undefined) {
                cookieStr += `; Max-Age=${Math.floor(options.maxAge)}`;
            }
            if (options.expires) {
                cookieStr += `; Expires=${options.expires.toUTCString()}`;
            }
            if (options.path) {
                cookieStr += `; Path=${options.path}`;
            }
            if (options.domain) {
                cookieStr += `; Domain=${options.domain}`;
            }
            if (options.secure) {
                cookieStr += `; Secure`;
            }
            if (options.httpOnly) {
                cookieStr += `; HttpOnly`;
            }
            if (options.sameSite) {
                cookieStr += `; SameSite=${options.sameSite}`;
            }

            const existing = res.getHeader('Set-Cookie');

            if (existing) {
                if (Array.isArray(existing)) {
                res.setHeader('Set-Cookie', [...existing, cookieStr]);
                } else {
                res.setHeader('Set-Cookie', [existing as string, cookieStr]);
                }
            } else {
                res.setHeader('Set-Cookie', cookieStr);
            }
        },

        /**
         * Delete a cookie (sets it to expire immediately)
         */
        delete(name: string, path: string = '/', domain?: string): void {
            this.set(name, '', {
                maxAge: 0,
                expires: new Date(0),
                path,
                domain,
            });
        },
    };
}

export {
    serveProject,
    getQuery,
    getRequest,
    getCookieStore,
}