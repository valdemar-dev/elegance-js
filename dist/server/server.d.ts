import { IncomingMessage, ServerResponse } from 'http';
interface ServerOptions {
    root: string;
    port?: number;
    host?: string;
    environment?: 'production' | 'development';
    https?: {
        keyPath: string;
        certPath: string;
    };
}
export declare function startServer({ root, port, host, environment, https }: ServerOptions): import("https").Server<typeof IncomingMessage, typeof ServerResponse> | import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
export {};
