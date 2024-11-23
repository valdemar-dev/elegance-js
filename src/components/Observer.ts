const Observer = (options: Record<string, any>, ...children: ElementChildren): BuildableElement<"div"> => {
    const { ids = [], scope = "local", } = options;
    
    if (!Array.isArray(ids)) {
        throw new Error("The IDs you pass into the Observer component must be an Array.");
    }

    if (scope !== "local" && scope !== "global") {
        throw new Error("Scope must be one of local or global.");
    }

    const onMount = (builtElement: AnyBuiltElement, elementInDocument: HTMLElement) => {
        console.log(ids)
    };

    return () => ({
        tag: "div",
        children: children,
        getOptions: () => ({}),
        onMount,
    });
};

export {
    Observer,
}
