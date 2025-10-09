import { IncomingMessage, ServerResponse } from 'http';
interface ServerOptions {
    root: string;
    port?: number;
    host?: string;
    environment?: 'production' | 'development';
}
export declare function startServer({ root, port, host, environment, }: ServerOptions): import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
export {};
