import type { OutputOptions } from "../constants";
import type { SecurityHeadersOptions } from "../server/security";
import type { ServerOptions } from "../server/server";
import type { ConsoleOptions } from "../logger";
import type { RuntimeOptions } from "../run";

declare global {
    type EleganceConfig = {
        security?: SecurityHeadersOptions,
        output?: OutputOptions,
        server?: ServerOptions,
        console?: ConsoleOptions,
        runtime?: RuntimeOptions,
    };
}

export {}