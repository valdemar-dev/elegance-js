/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 * 
 * It's HTTP only, so if you want HTTPS, use a proxy.
 * 
 */

import { CompiledLayout, CompiledPage } from "../compilation/compiler";
import { LayoutInformation } from "./layout";
import { PageInformation } from "./page";

import { createServer, IncomingMessage, ServerResponse, } from "http";

type ServerOptions = {
    /** If a port is not available, it will increment the port +1 in a loop until it finds a valid one. */
    port: number;

    hostname: string;

    /** Whether or not to use the built-in api handler. */
    runAPI: boolean;

    /** A path to the directory containing the files that are allowed to be served via requests. */
    serveDir: string;

    /** Set this to false to get 404's on dynamic pages instead of compiling them per-request. */
    allowDynamicCompilation: boolean;

    allLayouts: LayoutInformation[],
    allPages: PageInformation[],

    builtStaticPages: CompiledPage[],
    buildStaticLayouts: CompiledLayout[],
}

async function handleAPIRequest(req: IncomingMessage, res: ServerResponse, pathname: string) {
    
}

async function startServer(options: ServerOptions) {
    let port = options.port ?? 3000;
    
    const server = createServer(async (req, res) => {
        if (!req.url) {
            res.statusCode = 400;
            res.end("Bad request.");

            return;
        }

        const url = new URL(req.url);
        const pathname = url.pathname;

        if (url.pathname.startsWith("/api/")) {
            return handleAPIRequest(req, res, pathname);
        }
    })

    server.on("error", (error: any) => {
        if (error.code === "EADDRINUSE") {
            setTimeout(() => {
                port += 1;
                server.listen(port);
            }, 500)
        }
    })

    server.listen(options.port);
}