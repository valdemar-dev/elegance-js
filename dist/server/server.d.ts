import { IncomingMessage, ServerResponse } from 'http';
interface ServerOptions {
    root: string;
    port?: number;
    host?: string;
    environment?: 'production' | 'development';
    quiet?: boolean;
}
export declare function startServer({ root, port, host, environment, quiet, }: ServerOptions): import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
export {};
