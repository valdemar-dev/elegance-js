import { IncomingMessage, ServerResponse } from "node:http";
import type { CompiledRoute, Manifest, CacheKey } from "../build/common";
export type ServerOptions = {
    serveAPI?: boolean;
    allowDynamicPages?: boolean;
    allowStatusCodePages?: boolean;
    port?: number;
};
interface ApiRouteModule {
    GET?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    POST?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    PUT?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    DELETE?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    PATCH?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}
type MiddlewareFn = (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => void | Promise<void>;
interface CachedFileHeaders {
    raw: Record<string, string | number>;
    gzip: Record<string, string | number>;
    brotli: Record<string, string | number>;
}
interface CachedFile {
    raw: Buffer;
    gzip: Buffer;
    brotli: Buffer;
    mime: string;
    etag: string;
    headers: CachedFileHeaders;
}
export interface MatchedRoute {
    pathname: string;
    pageFile: string;
    layouts: string[];
    layoutCacheKeys: CacheKey[];
    cacheKey: CacheKey;
    sharedChunkPaths: string[];
    isDynamic: boolean;
    patternPathname?: string | undefined;
    matcher: (pathname: string) => Record<string, string | string[] | undefined> | null;
}
declare class LRU<K, V> {
    private readonly max;
    private readonly map;
    constructor(max: number);
    get(key: K): V | undefined;
    set(key: K, val: V): void;
    has(key: K): boolean;
    delete(key: K): void;
}
export declare const staticCache: Map<string, CachedFile>;
export declare const dynamicModuleCache: LRU<string, CompiledRoute>;
export declare const aotStaticCache: Map<string, CompiledRoute>;
export declare const statusCodePageCache: Map<string, {
    compiled: CompiledRoute;
    pageFile: string;
    layouts: string[];
    layoutCacheKeys: CacheKey[];
    cacheKey: CacheKey;
}>;
export declare const middlewareChainCache: Map<string, MiddlewareFn[]>;
export declare const encCache: LRU<string, Encoding>;
export declare let staticRouteMap: Map<string, MatchedRoute> | null;
export declare let paramRoutes: MatchedRoute[] | null;
export declare let apiRoutesCache: Map<string, ApiRouteModule> | null;
export declare let middlewareMapCache: Map<string, MiddlewareFn[]> | null;
export declare function primeStaticCache(): Promise<void>;
export declare function compileRouteMatcher(pattern: string): (pathname: string) => Record<string, string | string[] | undefined> | null;
export declare function warmDynamicCaches(manifest: Manifest): Promise<{
    staticRouteMap: Map<string, MatchedRoute>;
    paramRoutes: MatchedRoute[];
}>;
export declare function loadApiRoutes(manifest: Manifest): Promise<Map<string, ApiRouteModule>>;
export declare function loadMiddlewareMap(manifest: Manifest): Promise<Map<string, MiddlewareFn[]>>;
type Encoding = "br" | "gzip" | null;
export declare function serve(): Promise<void>;
export {};
//# sourceMappingURL=server.d.ts.map