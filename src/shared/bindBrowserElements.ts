const createElementOptions = (obj: Record<string, any>) => {
    return function () {
        const reevaluatedObj: Record<string, any> = {};

        for (const key of Object.keys(obj)) {
            const value = obj[key];

            if (typeof value !== "function") {
                reevaluatedObj[key] = value;
                continue;
            }

            if (key.startsWith("on")) {
                reevaluatedObj[key] = value;
                continue;
            }

            reevaluatedObj[key] = value();
        }

        return reevaluatedObj;
    };
};

const voidElements = [
    "area", "base",
    "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
];

const structureElements = [ "title", ];

const elements: {
    [key: string]:
    ((...children: ElementChildren) => () => ({
        tag: string,
        getOptions: () => ({}),
        children: ElementChildren,
    })) | 
    ((options: Record<string, any>) => () => ({
        tag: string,
        getOptions: ReturnType<typeof createElementOptions>,
        children: [],
    })) | 
    ((options: Record<string, any>, ...children: ElementChildren) => () => ({
        tag: string,
        getOptions: ReturnType<typeof createElementOptions>,
        children: ElementChildren,
    }))
} = {};

const globalProperties: string[] = Object.getOwnPropertyNames(window);

interface Window {
    [key:string]: any;
}

for (const prop of globalProperties) {
    if (!prop.startsWith("HTML")) continue;

    const constructor = window[prop];

    if (
        typeof constructor !== "function" ||
        !(constructor.prototype instanceof HTMLElement)
    ) {
        continue;
    }

    const tagName = prop.replace(/^HTML|Element$/g, "").toLowerCase();
    if (!tagName) continue;

    if (structureElements.includes(tagName)) {
        elements[tagName] = ((...children: ElementChildren) => {
            return () => ({
                tag: tagName,
                getOptions: () => ({}),
                children: children,
            });
        })

        continue;
    }

    if (voidElements.includes(tagName)) {
        elements[tagName] = ((options: Record<string, any>) => {
            return () => ({
                tag: tagName,
                getOptions: createElementOptions(options),
                children: [],
            });
        })
        continue;
    }

    elements[tagName] = ((options: Record<string, any>, ...children: ElementChildren) => {
        return () => ({
            tag: tagName,
            getOptions: createElementOptions(options),
            children: children,
        });
    })

    Object.assign(globalThis, elements);
}
