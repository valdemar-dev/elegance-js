import { existsSync } from "fs";
import { join } from "path";

// Make all properties required recursively
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends (...args: any[]) => any
        ? T[P]
        : T[P] extends object
            ? DeepRequired<NonNullable<T[P]>>
            : NonNullable<T[P]>;
};

type SafeEleganceConfig = DeepRequired<EleganceConfig>;

/**
 * Contains the default options of Elegance.
 * *EVERY* field value should be defined here, as the library defaults to this config when the user doesn't provide an override.
 */
const defaultConfig: SafeEleganceConfig = {
    security: {
        contentSecurityPolicy: {
            defaultSrc: [],
            scriptSrc: ["'self'", "blob:"],
            scriptSrcElem: ["'self'", "blob:"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: [],
            connectSrc: [],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: false,
        },
        strictTransportSecurity: {
            maxAge: 31536000,
            includeSubDomains: true,
        },
        xFrameOptions: "DENY",
        xContentTypeOptions: true,
        referrerPolicy: "strict-origin-when-cross-origin",
        permissionsPolicy: {
            camera: ["'none'"],
            microphone: ["'none'"],
            geolocation: ["'none'"],
        },
        crossOriginOpenerPolicy: "same-origin",
        crossOriginResourcePolicy: "same-origin",
        xDnsPrefetchControl: "off",
    },

    output: {
        outputDirectory: ".elegance",
        pagesDirectory: "pages",
    },

    server: {
        port: 3000,
        serveAPI: true,
        allowDynamicPages: true,
        allowStatusCodePages: true, 
    }
};

let userConfig: EleganceConfig;

async function loadConfig(): Promise<void> {
    const CONFIG_PATH = join(process.cwd(), "elegance.config.ts");

    if (!existsSync(CONFIG_PATH)) {
        userConfig = defaultConfig;

        return;
    }

    const module = await import(CONFIG_PATH);

    if (module.config) {
        userConfig = module.config;

        return;
    }

    userConfig = defaultConfig;
}

function deepMerge<T>(defaults: T, overrides: Partial<T>): T {
    const result = { ...defaults };

    for (const key in overrides) {
        const override = overrides[key];
        const defaultValue = defaults[key];

        if (
            override &&
            typeof override === "object" &&
            !Array.isArray(override) &&
            defaultValue &&
            typeof defaultValue === "object" &&
            !Array.isArray(defaultValue)
        ) {
            result[key] = deepMerge(defaultValue, override as any);
        } else if (override !== undefined) {
            result[key] = override as any;
        }
    }

    return result;
}

export async function getConfig(): Promise<SafeEleganceConfig> {
    if (!userConfig) {
        await loadConfig();
    }

    return deepMerge(defaultConfig, userConfig);
}