/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 *
 * It's HTTP only, so if you want HTTPS, use a proxy.
 */
import { CompiledLayout, CompiledPage } from "../compilation/compiler";
import { LayoutInformation } from "./layout";
import { PageInformation } from "./page";
import { IncomingMessage, ServerResponse } from "http";
import { URLSearchParams } from "url";
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
    allLayouts: Map<string, LayoutInformation>;
    /** These are gathered by the compiler, you just need to pass them in. */
    allPages: Map<string, PageInformation>;
    /** These are gathered by the compiler, you just need to pass them in. */
    allStatusCodePages: Map<string, PageInformation>;
    /** These are gathered by the compiler, you just need to pass them in. */
    builtStaticPages: Map<string, CompiledPage>;
    /** These are gathered by the compiler, you just need to pass them in. */
    builtStaticLayouts: Map<string, CompiledLayout>;
};
type ServerStartupResult = {
    /** The port that we ended up actually using (might differ from the one given, if it was not available) */
    port: number;
};
/**
 * Starts the Elegance server and distributes the DIST directory to the public.
 * If hot-reloading is enabled, this also tells the clients to refresh the page.
 */
declare function serveProject(startupServerOptions: ServerOptions): Promise<ServerStartupResult>;
/** Get the current query as `URLSearchParams` */
declare function getQuery(): URLSearchParams;
/** Get the current page's request and response. */
declare function getRequest(): {
    req: IncomingMessage;
    res: ServerResponse;
};
/**
 * Get the cookies for the current request.
 * Requires a dynamic page.
 */
declare function getCookieStore(): {
    /**
     * Get a cookie value by name
     */
    get(name: string): string | undefined;
    /**
     * Check if a cookie exists
     */
    has(name: string): boolean;
    /**
     * Get all cookies as a plain object
     */
    getAll(): Record<string, string>;
    /**
     * Set a cookie
     *
     * @param name Cookie name
     * @param value Cookie value
     * @param options Optional cookie attributes
     */
    set(name: string, value: string, options?: {
        maxAge?: number;
        expires?: Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: "Strict" | "Lax" | "None";
    }): void;
    /**
     * Delete a cookie (sets it to expire immediately)
     */
    delete(name: string, path?: string, domain?: string): void;
};
declare function redirect(location: string, statusCode?: number): void;
declare const respondWith: {
    notFound(): Promise<void>;
    notAuthorized(): Promise<void>;
    forbidden(): Promise<void>;
    internalError(): Promise<void>;
};
export { serveProject, getQuery, getRequest, getCookieStore, redirect, respondWith };
