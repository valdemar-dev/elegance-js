import { getState } from '../helpers/getGlobals.esm.mjs';
import { getRenderer } from '../renderer.esm.mjs';

const Observer = (options, ...children) => {
    const state = getState();
    const renderer = getRenderer();
    const { ids = [], scope = "local", } = options;
    if (!Array.isArray(ids)) {
        throw new Error("The IDs you pass into the Observer component must be an Array.");
    }
    if (scope !== "local" && scope !== "global") {
        throw new Error("Scope must be one of local or global.");
    }
    const onMount = ({ builtElement, elementInDocument, buildableElement }) => {
        let currentElement = elementInDocument;
        const updateCallback = (value) => {
            const newElement = renderer.updateElement(currentElement, buildableElement);
            if (typeof newElement === "string")
                return;
            currentElement = newElement;
            console.log("dupated");
        };
        for (const id of ids) {
            const subject = state.get(id);
            subject.observe(updateCallback);
        }
    };
    return () => ({
        tag: "div",
        children: children,
        getOptions: () => ({}),
        onMount,
    });
};

export { Observer };
//# sourceMappingURL=Observer.esm.mjs.map
