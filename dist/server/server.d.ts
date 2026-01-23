/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 *
 * It's HTTP only, so if you want HTTPS, use a proxy.
 */
import { CompiledLayout, CompiledPage } from "../compilation/compiler";
import { LayoutInformation } from "./layout";
import { PageInformation } from "./page";
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
export { serveProject, };
