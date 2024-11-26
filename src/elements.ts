import { get } from "http";

const createElementOptions = (obj: Record<string, any>) => {
    return function () {
        const reevaluatedObj: Record<string, any> = {};

        for (const key of Object.keys(obj)) {
            const value = obj[key];

            if (typeof value === "function") {
                if (key.startsWith("on")) {
                  reevaluatedObj[key] = value;
                } else {
                  reevaluatedObj[key] = value();
                }
            } else {
                reevaluatedObj[key] = value;
            }
        }

        return reevaluatedObj;
    };
};

const createBuildableElement = (tag: ElementTags) => {
    return (options: Record<string, any>, ...children: ElementChildren) => {
        const getOptions = createElementOptions(options);

        return () => ({
            tag: tag,
            getOptions: getOptions,
            children: children,
        });
    };
};

const createOptionlessBuildableElement = (tag: OptionlessElementTags) => {
    return (...children: ElementChildren) => {
        return () => ({
            tag: tag,
            getOptions: () => ({}),
            children: children,
        });
    };
};

const createChildrenlessBuildableElement = (tag: ChildrenlessElementTags) => {
    return (options: Record<string, any>) => {
        const getOptions = createElementOptions(options)
        return () => ({
            tag: tag,
            getOptions: getOptions,
            children: [],
        });
    };
};

const createChildrenlessOptionlessBuildableElement = (tag: ChildrenlessOptionlessElementTags) => {
    return () => {
        return () => ({
            tag: tag,
            getOptions: () => ({}),
            children: [],
        })
    }
};

const optionlessElementTags: Array<OptionlessElementTags> = [
    "abbr", "b", "bdi", "bdo", "cite", "code", "dfn", "em", "i", "kbd", "mark", 
    "rp", "rt", "ruby", "s", "samp", "small", "strong", "sub", "sup", 
    "u", "var", "wbr"
];

const childrenlessElementTags: Array<ChildrenlessElementTags> = [
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", 
    "param", "source", "track"
];

const childrenlessOptionlessElementTags: Array<ChildrenlessOptionlessElementTags> = [
    "basefont", "isindex", "keygen"
];

const elementTags: Array<ElementTags> = [
    "a", "address", "article", "aside", "audio", "blockquote", "body", "button", 
    "canvas", "caption", "colgroup", "data", "datalist", "dd", "del", "details", 
    "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", 
    "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "html", 
    "iframe", "ins", "label", "legend", "li", "main", "map", "meter", "nav", 
    "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", 
    "pre", "progress", "q", "section", "select", "summary", "table", "tbody", 
    "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", 
    "ul", "video", "span"
];

const elements: { [key: string]: EleganceElement<ElementTags> } = {};
const optionlessElements: { [key: string]: EleganceOptionlessElement<OptionlessElementTags> } = {};
const childrenlessElements: { [key: string]: EleganceChildrenlessElement<ChildrenlessElementTags> } = {};
const childrenlessOptionlessElements: { [key: string]: EleganceChildrenlessOptionlessElement<ChildrenlessOptionlessElementTags> } = {};

for (const element of elementTags) {
    elements[element] = createBuildableElement(element);
}

for (const element of optionlessElementTags) {
    optionlessElements[element] = createOptionlessBuildableElement(element);
}

for (const element of childrenlessElementTags) {
    childrenlessElements[element] = createChildrenlessBuildableElement(element);
}

for (const element of childrenlessOptionlessElementTags) {
    childrenlessOptionlessElements[element] = createChildrenlessOptionlessBuildableElement(element);
}

const allElements = {
    ...elements,
    ...optionlessElements,
    ...childrenlessElements,
    ...childrenlessOptionlessElements,
}

export { 
    elements,
    optionlessElements,
    childrenlessElements,
    childrenlessOptionlessElements,
    createElementOptions,
    allElements
};

