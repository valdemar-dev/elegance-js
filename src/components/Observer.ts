import { getState } from "../helpers/getGlobals";
import { getRenderer } from "../renderer";

const Observer = (options: Record<string, any>, ...children: ElementChildren): BuildableElement<"div"> => {
    const state = getState();
    const renderer = getRenderer();

    const { ids = [], scope = "local", } = options;
    
    if (!Array.isArray(ids)) {
        throw new Error("The IDs you pass into the Observer component must be an Array.");
    }

    if (scope !== "local" && scope !== "global") {
        throw new Error("Scope must be one of local or global.");
    }

    const onMount = ({ builtElement, elementInDocument, buildableElement}: OnMountOptions) => {
        let currentElement: HTMLElement = elementInDocument;

        const updateCallback = (value: any) => {
            const newElement = renderer.updateElement(currentElement, buildableElement);

            if (typeof newElement === "string") return;

            currentElement = newElement as HTMLElement;

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

export {
    Observer,
}
