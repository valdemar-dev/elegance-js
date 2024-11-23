declare function Observer(
    options: {
        ids: Array<string>,
        scope?: "local" | "global",
    }, 
    ...children: Array<AllowedElementChildren>
): () => BuiltElement<"div">

export { Observer }
