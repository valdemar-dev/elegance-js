import { IncomingMessage, ServerResponse } from 'http';
interface ServerOptions {
    root: string;
    pagesDirectory: string;
    port?: number;
    host?: string;
    environment?: 'production' | 'development';
    DIST_DIR: string;
}
export declare function startServer({ root, pagesDirectory, port, host, environment, DIST_DIR }: ServerOptions): import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
export {};
