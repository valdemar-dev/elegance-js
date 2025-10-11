import { buildDynamicPage } from "../dynamic_page";
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { promises as fs, readFileSync } from 'fs';
import { join, normalize, extname, dirname, resolve, relative } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { log } from "../log";


const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
};

interface ServerOptions {
    root: string;
    port?: number;
    host?: string;
    environment?: 'production' | 'development';
    DIST_DIR: string,
}

export function startServer({ 
    root, 
    port = 3000, 
    host = 'localhost', 
    environment = 'production',
    DIST_DIR
}: ServerOptions) {
    if (!root) throw new Error('Root directory must be specified.');

    root = normalize(root).replace(/[\\/]+$/, '');

    const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!req.url) {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Bad Request');
                return;
            }
            
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                
                if (environment === 'development') {
                    log.info(req.method, '::', req.url, '-', res.statusCode);
                }
                
                return;
            }

            const url = new URL(req.url, `https://${req.headers.host}`);

            if (url.pathname.startsWith('/api/')) {
                await handleApiRequest(root, url.pathname, req, res);
            } else {
                await handleStaticRequest(root, url.pathname, req, res, DIST_DIR);
            }

            if (environment === 'development') {
                log.info(req.method, '::', req.url, '-', res.statusCode);
            }
        } catch (err) {
            log.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Internal Server Error');
        }
    };

    function attemptListen(p: number) {
        const server = createHttpServer(requestHandler);

        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                attemptListen(p + 1);
            } else {
                console.error(err);
            }
        });

        server.listen(p, host, () => {
            log.info(`Server running at https://${host}:${p}/`);
        });

        return server;
    }

    return attemptListen(port);
}


async function handleStaticRequest(root: string, pathname: string, req: IncomingMessage, res: ServerResponse, DIST_DIR: string) {
    const originalPathname = pathname;
    let filePath = normalize(join(root, decodeURIComponent(pathname))).replace(/[\\/]+$/, '');
    if (!filePath.startsWith(root)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    let stats;
    try {
        stats = await fs.stat(filePath);
    } catch {}

    let pageDir: string;
    if (stats) {
        if (stats.isDirectory()) {
            pageDir = filePath;
        } else {
            pageDir = dirname(filePath);
        }
    } else {
        if (originalPathname.endsWith('/')) {
            pageDir = filePath;
        } else {
            pageDir = dirname(filePath);
        }
    }

    const relDir = pageDir.slice(root.length).replace(/^[\/\\]+/, '');
    const parts = relDir.split(/[\\/]/).filter(Boolean);

    const middlewareDirs: string[] = [];
    let current = root;
    middlewareDirs.push(current);
    for (const part of parts) {
        current = join(current, part);
        middlewareDirs.push(current);
    }

    const middlewares: ((req: IncomingMessage, res: ServerResponse, next: (err?: any) => Promise<void>) => Promise<void>)[] = [];
    for (const dir of middlewareDirs) {
        const mwPath = join(dir, 'middleware.mjs');
        let mwModule;
        try {
            await fs.access(mwPath);
            const url = pathToFileURL(mwPath).href;
            mwModule = await import(url);
        } catch {
            continue;
        }

        const mwKeys = Object.keys(mwModule).sort();
        for (const key of mwKeys) {
            const f = mwModule[key];
            if (typeof f === 'function' && !middlewares.some(existing => existing === f)) {
                middlewares.push(f);
            }
        }
    }

    let isDynamic = false;
    let handlerPath = filePath;
    if (stats && stats.isDirectory()) {
        const pageMjsPath = join(filePath, 'page.cjs');
        try {
            await fs.access(pageMjsPath);
            handlerPath = pageMjsPath;
            isDynamic = true;
        } catch {
            handlerPath = join(filePath, 'index.html');
            isDynamic = false;
        }
    } else {
        handlerPath = filePath;
        isDynamic = false;
    }

    let hasHandler = false;
    try {
        await fs.access(handlerPath);
        hasHandler = true;
    } catch {}

    const finalHandler = async (req: IncomingMessage, res: ServerResponse) => {
        if (!hasHandler) {
            await respondWithErrorPage(root, pathname, 404, res);
            return;
        }

        if (isDynamic) {
            try {
                const resultHTML = await buildDynamicPage(resolve(handlerPath), DIST_DIR, req);
                
                res.writeHead(200, { 'Content-Type': MIME_TYPES[".html"] });
                res.end(resultHTML);
            } catch(err) {
                log.error("Error building dynamic page -", err);
            }
            
        } else {
            const ext = extname(handlerPath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            
            const data = await fs.readFile(handlerPath);
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    };

    const composed = composeMiddlewares(middlewares, finalHandler, { isApi: false, root, pathname });
    await composed(req, res);
}

async function handleApiRequest(root: string, pathname: string, req: IncomingMessage, res: ServerResponse) {
    const apiSubPath = pathname.slice('/api/'.length);
    const parts = apiSubPath.split('/').filter(Boolean);
    const routeDir = join(root, pathname);
    const routePath = join(routeDir, 'route.mjs');

    let hasRoute = false;
    
    try {
        await fs.access(routePath);
        
        hasRoute = true;
    } catch {}

    let fn = null;
    let module: any = null;
    
    if (hasRoute) {
        try {
            const moduleUrl = pathToFileURL(routePath).href;
            
            module = await import(moduleUrl);
            fn = module[req.method as keyof typeof module];
        } catch (err) {
            console.error(err);
            
            return respondWithJsonError(res, 500, 'Internal Server Error');
        }
    }
    
    const middlewareDirs: string[] = [];
    let current = join(root, 'api');
    
    middlewareDirs.push(current);
    
    for (const part of parts) {
        current = join(current, part);
        middlewareDirs.push(current);
    }

    const middlewares: ((req: IncomingMessage, res: ServerResponse, next: (err?: any) => Promise<void>) => Promise<void>)[] = [];
    for (const dir of middlewareDirs) {
        const mwPath = join(dir, 'middleware.mjs');
        let mwModule;
        try {
            await fs.access(mwPath);
            const url = pathToFileURL(mwPath).href;
            mwModule = await import(url);
        } catch {
            continue;
        }

        const mwKeys = Object.keys(mwModule).sort();
        for (const key of mwKeys) {
            const f = mwModule[key];
            if (typeof f === 'function' && !middlewares.some(existing => existing === f)) {
                middlewares.push(f);
            }
        }
    }

    const finalHandler = async (req: IncomingMessage, res: ServerResponse) => {
        if (!hasRoute) {
            return respondWithJsonError(res, 404, 'Not Found');
        }
        if (typeof fn !== 'function') {
            return respondWithJsonError(res, 405, 'Method Not Allowed');
        }
        await fn(req, res);
    };

    const composed = composeMiddlewares(middlewares, finalHandler, { isApi: true });
    await composed(req, res);
}

interface ComposeOptions {
    isApi: boolean;
    root?: string;
    pathname?: string;
}

function composeMiddlewares(
    mws: ((req: IncomingMessage, res: ServerResponse, next: (err?: any) => Promise<void>) => Promise<void>)[],
    final: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
    options: ComposeOptions
) {
    return async function (req: IncomingMessage, res: ServerResponse) {
        let index = 0;

        async function dispatch(err?: any): Promise<void> {
            if (err) {
                if (options.isApi) {
                    return respondWithJsonError(res, 500, err.message || 'Internal Server Error');
                } else {
                    return await respondWithErrorPage(options.root!, options.pathname!, 500, res);
                }
            }

            if (index >= mws.length) {
                return await final(req, res);
            }

            const thisMw = mws[index++];

            const next = (e?: any) => dispatch(e);

            const onceNext = (nextFn: (e?: any) => Promise<void>) => {
                let called = false;
                return async (e?: any) => {
                    if (called) {
                        log.warn('next() was called in a middleware more than once.');
                        return;
                    }
                    called = true;
                    await nextFn(e);
                };
            };

            try {
                await thisMw(req, res, onceNext(next));
            } catch (error) {
                await dispatch(error);
            }
        }

        await dispatch();
    };
}

function respondWithJsonError(res: ServerResponse, code: number, message: string) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: message }));
}

async function respondWithErrorPage(root: string, pathname: string, code: number, res: ServerResponse) {
    let currentPath = normalize(join(root, decodeURIComponent(pathname)));
    let tried = new Set<string>();
    let errorFilePath: string | null = null;

    while (currentPath.startsWith(root)) {
        const candidate = join(currentPath, `${code}.html`);
        if (!tried.has(candidate)) {
            try {
                await fs.access(candidate);
                errorFilePath = candidate;
                break;
            } catch {}
            tried.add(candidate);
        }
        const parent = dirname(currentPath);
        if (parent === currentPath) break;
        currentPath = parent;
    }

    if (!errorFilePath) {
        const fallback = join(root, `${code}.html`);
        try {
            await fs.access(fallback);
            errorFilePath = fallback;
        } catch {}
    }

    if (errorFilePath) {
        try {
            const html = await fs.readFile(errorFilePath);
            res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
            return;
        } catch {}
    }

    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${code} Error`);
}