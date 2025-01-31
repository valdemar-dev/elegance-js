export declare enum GenerateMetadata {
    /**
     *
     * <head> element and subsequent elements
     * tagged with SEO, are generated at build-time, on the server.
     *
     */
    ON_BUILD = 1,
    /**
     * <head> element and subsequent elements
     * tagged with SEO, are generated per-request, on the server.
     *
     */
    PER_REQUEST = 2
}
export declare enum CacheSSRResultHTML {
    NO = 0,
    YES = 1
}
