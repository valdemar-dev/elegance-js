/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 * 
 * It's HTTP only, so if you want HTTPS, use a proxy.
 */

import { join, normalize, relative, resolve } from "path";
import { CompiledLayout, CompiledPage, compilePage, compilerOptions, CompilerOptions, generatePageCompilationContext } from "../compilation/compiler";
import { LayoutInformation } from "./layout";
import { PageInformation } from "./page";

import { createServer, IncomingMessage, Server, ServerResponse, } from "http";
import { Dirent, existsSync, readdirSync, readFileSync, statSync } from "fs";

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
        res.end("Route does not exist.");

        return;
    }

    if (!req.method) {
        res.statusCode = 400;
        res.end("Bad request");

        return;
    }

    const method = route.exports.methods[req.method as keyof typeof route.exports.methods];

    if (!method) {
        res.statusCode = 405;
        res.end("Method not allowed");

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

/** Take any directory pathname, and make it into this format: /path */
function sanitizePathname(pathname: string = ""): string {
    if (!pathname) return "/";

    pathname = "/" + pathname;

    pathname = pathname.replace(/\/+/g, "/");

    if (pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
    }

    return pathname;
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
        res.end(message);

        return;
    }

    const compiledPage = await compilePage(serverOptions.allLayouts, statusCodePage);

    res.statusCode = 200;
    res.end(compiledPage.pageHTML);
}

async function respondWithStatusCode(req: IncomingMessage, res: ServerResponse, pathname: string, statusCode: number, message: string) {
    if (serverOptions.allowStatusCodePages === true) {
        return respondWithStatusCodePage(req, res, pathname, statusCode, message);
    }

    res.statusCode = statusCode;
    res.end(message);
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

async function handlePageRequest(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const pageInformation = serverOptions.allPages.get(pathname)!;

    if (pageInformation.exports.isDynamic) {
        if (serverOptions.allowDynamic === false) {
            return respondWithStatusCode(req, res, pathname, 404, "Page not found.");
        }

        const result = await compilePage(serverOptions.allLayouts, pageInformation);

        res.statusCode = 200;
        res.end(result.pageHTML);

        return;
    }

    const { pageHTML } = serverOptions.builtStaticPages.get(pathname)!

    res.statusCode = 200;
    res.end(pageHTML);
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
};

async function handleFileRequest(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const safePath = await getSafePath(pathname);

    if (!safePath) {
        return respondWithStatusCodePage(req, res, pathname, 404, "File not found.");
    }

    if (statSync(safePath).isDirectory()) {
        res.statusCode = 400;
        res.end("Bad request.");

        return;
    }

    const ext = safePath.slice(safePath.lastIndexOf(".")).toLowerCase();
    const mime = mimeByExt[ext] ?? "application/octet-stream";

    res.statusCode = 200;
    res.setHeader("Content-Type", mime);
    res.end(readFileSync(safePath));
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

async function requestHandler(req: IncomingMessage, res: ServerResponse) {
    if (!req.url) {
        res.statusCode = 400;
        res.end("Bad request.");

        return;
    }

    const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);

    if (serverOptions.base && url.pathname.startsWith(serverOptions.base) === false) {
        res.statusCode = 501;
        res.end("Path does not start with basename.");

        return;
    }

    const pathname = sanitizePathname(serverOptions.base ? removePrefix(serverOptions.base!, url.pathname) : url.pathname);
    
    runMiddleware(req, res, pathname);

    if (!res.writable) return;

    if (pathname.startsWith("/api/")) {
        return handleAPIRequest(req, res, pathname);
    }

    if (serverOptions.allPages.has(pathname)) {
        return handlePageRequest(req, res, pathname);
    }

    return handleFileRequest(req, res, pathname);
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

export {
    serveProject,
}