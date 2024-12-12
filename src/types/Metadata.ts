export enum GenerateMetadata {
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
    PER_REQUEST = 2,
}

export enum RenderingMethod {
    /**
     *
     * Each page is generated per-request, on the server.
     * Async/await is supported in the page function,
     * and things like `fs` can be accessed.
     *
     */
    SERVER_SIDE_RENDERING = 1,
    
    /**
     *
     * Each page is generated at build-time, on the server.
     * Async/await is supported in the page function,
     * and things like `fs` can be accessed.
     * Pages are stored as static HTML files.
     *
     */
    STATIC_GENERATION = 2,

    /**
     *
     * Each page is generated per-request, on the *client*.
     * The server responds with a skeleton HTML page,
     * that sometimes may contain SEO content.
     * Async/await is not supposed in the page function,
     * things like `fs` cannot be used.
     *
     */
    CLIENT_SIDE_RENDERING = 3,
}
