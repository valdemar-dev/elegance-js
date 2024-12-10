var GenerateMetadata;
(function (GenerateMetadata) {
    /**
     *
     * <head> element and subsequent elements
     * tagged with SEO, are generated at build-time, on the server.
     *
     */
    GenerateMetadata[GenerateMetadata["ON_BUILD"] = 1] = "ON_BUILD";
    /**
     * <head> element and subsequent elements
     * tagged with SEO, are generated per-request, on the server.
     *
     */
    GenerateMetadata[GenerateMetadata["PER_REQUEST"] = 2] = "PER_REQUEST";
})(GenerateMetadata || (GenerateMetadata = {}));
var RenderingMethod;
(function (RenderingMethod) {
    /**
     *
     * Each page is generated per-request, on the server.
     * Async/await is supported in the page function,
     * and things like `fs` can be accessed.
     *
     */
    RenderingMethod[RenderingMethod["SERVER_SIDE_RENDERING"] = 1] = "SERVER_SIDE_RENDERING";
    /**
     *
     * Each page is generated at build-time, on the server.
     * Async/await is supported in the page function,
     * and things like `fs` can be accessed.
     * Pages are stored as static HTML files.
     *
     */
    RenderingMethod[RenderingMethod["STATIC_GENERATION"] = 2] = "STATIC_GENERATION";
    /**
     *
     * Each page is generated per-request, on the *client*.
     * The server responds with a skeleton HTML page,
     * that sometimes may contain SEO content.
     * Async/await is not supposed in the page function,
     * things like `fs` cannot be used.
     *
     */
    RenderingMethod[RenderingMethod["CLIENT_SIDE_RENDERING"] = 3] = "CLIENT_SIDE_RENDERING";
})(RenderingMethod || (RenderingMethod = {}));

export { GenerateMetadata, RenderingMethod };
//# sourceMappingURL=Metadata.esm.mjs.map
