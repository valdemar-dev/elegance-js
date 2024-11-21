import { createElementOptions } from "../elements";

const Observer = (options, ...children) => {
    const { ids = [], scope = "local", } = options;
    
    if (!Array.isArray(ids)) {
        throw new Error("The IDs you pass into the Observer component must be an Array.");
    }

    if (scope !== "local" && scope !== "global") {
        throw new Error("Scope must be one of local or global.");
    }

    const onMount = (builtElement, elementInDocument) => {
        console.log("we mounted");
    };

    return () => ({
        tag: "div",
        getOptions: createElementOptions(options),
        children: children,
        onMount,
    });
};

export {
    Observer,
}
