import type { OutputOptions } from "../constants";
import type { SecurityHeadersOptions } from "../server/security";
import type { ServerOptions } from "../server/server";

declare global {
    type EleganceConfig = {
        security?: SecurityHeadersOptions,
        output?: OutputOptions,
        server?: ServerOptions,
    };
}

export {}