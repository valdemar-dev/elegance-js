import type { OutputOptions } from "../constants";
import type { SecurityHeadersOptions } from "../server/security";
import type { ServerOptions } from "../server/server";
import type { ConsoleOptions } from "../logger";
import type { RuntimeOptions } from "../run";
import type { ImageConfig } from "../image/core";

type ClientOptions = {
    viewTransitions?: boolean,
};

type BundlingOptions = {
    /** 
     * Describe paths that should by default be bundled into a page or layout.
     * This accepts glob-paths like my-client-package/\*. 
     */
    include?: string[],
    /** 
     * Describe paths that should *never* end up in the client-bundle for a page or layout.
     * This accepts glob-paths like my-server-package/\*. 
     */
    noBundle?: string[],
};

declare global {
    type EleganceConfig = {
        security?: SecurityHeadersOptions,
        output?: OutputOptions,
        server?: ServerOptions,
        console?: ConsoleOptions,
        runtime?: RuntimeOptions,
        image?: ImageConfig,
        client?: ClientOptions,
        bundling?: BundlingOptions,
    };
}

export {}