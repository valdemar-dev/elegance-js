/**
 * The Elegance.JS server.
 * This server can be used to run your project.
 * 
 * It's HTTP only, so if you want HTTPS, use a proxy.
 * 
 */

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
}