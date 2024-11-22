const Observer = (options, ...children) => {
    const { ids = [], scope = "local", } = options;
    
    if (!Array.isArray(ids)) {
        throw new Error("The IDs you pass into the Observer component must be an Array.");
    }

    if (scope !== "local" && scope !== "global") {
        throw new Error("Scope must be one of local or global.");
    }

    const onMount = (builtElement, elementInDocument) => {
        this.ids
    };

    return () => ({
        tag: "div",
        children: children,
        onMount,
    });
};

export {
    Observer,
}
