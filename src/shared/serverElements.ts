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
    return (options: Record<string, any>, ...children: ElementChildren) => ({
	tag: tag,
	options: options,
	children: children,
    });
};

const createOptionlessBuildableElement = (tag: OptionlessElementTags) => {
    return (...children: ElementChildren) => ({
	tag: tag,
	options: {},
	children: children,
    });
};

const createChildrenlessBuildableElement = (tag: ChildrenlessElementTags) => {
    return (options: Record<string, any>) => ({
	tag: tag,
	options: options,
	children: [],
    });

};

const optionlessElementTags: Array<OptionlessElementTags> = [
    "abbr", "b", "bdi", "bdo", "cite", "code", "dfn", "em", "i", "kbd", "mark", 
    "rp", "rt", "ruby", "s", "samp", "small", "strong", "sub", "sup", 
    "u", "wbr", "title",
];

const childrenlessElementTags: Array<ChildrenlessElementTags> = [
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", 
    "source", "track"
];

const elementTags: Array<ElementTags> = [
    "a", "address", "article", "aside", "audio", "blockquote", "body", "button", 
    "canvas", "caption", "colgroup", "data", "datalist", "dd", "del", "details", 
    "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", 
    "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "html", 
    "iframe", "ins", "label", "legend", "li", "main", "map", "meter", "nav", 
    "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", 
    "pre", "progress", "q", "section", "select", "summary", "table", "tbody", 
    "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", 
    "ul", "video", "span"
];

const elements: { [key: string]: EleganceElement<ElementTags> } = {};
const optionlessElements: { [key: string]: EleganceOptionlessElement<OptionlessElementTags> } = {};
const childrenlessElements: { [key: string]: EleganceChildrenlessElement<ChildrenlessElementTags> } = {};

for (const element of elementTags) {
    elements[element] = createBuildableElement(element);
}

for (const element of optionlessElementTags) {
    optionlessElements[element] = createOptionlessBuildableElement(element);
}

for (const element of childrenlessElementTags) {
    childrenlessElements[element] = createChildrenlessBuildableElement(element);
}

const allElements = {
    ...elements,
    ...optionlessElements,
    ...childrenlessElements,
}

export { 
    elements,
    optionlessElements,
    childrenlessElements,
    createElementOptions,
    allElements
};

