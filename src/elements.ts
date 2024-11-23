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

const createBuildableElement = (tag: string) => {
    return (options: Record<string, any>, ...children: ElementChildren) => {
        const getOptions = createElementOptions(options);

        return () => ({
            tag: tag,
            getOptions: getOptions,
            children: children,
        });
    };
};

const createOptionlessBuildableElement = (tag: string) => {
    return (...children: ElementChildren) => {
        return () => ({
            tag: tag,
            children: children,
        });
    };
};

const elementTags = [
  "abbr", "a", "article", "aside", "audio", "base", "bdi", "bdo", "blockquote",
  "body", "button", "canvas", "caption", "cite", "code", "col", "colgroup",
  "data", "datalist", "dd", "del", "details", "dfn", "div", "dl", "dt", "em", 
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", 
  "h5", "h6", "head", "header", "hr", "html", "iframe", "img", "input", "ins", 
  "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", 
  "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
  "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", 
  "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", 
  "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", 
  "time", "title", "tr", "track", "u", "ul", "varEl", "video", "wbr"
];

const optionlessElementTags = [
    "b", "i", "br",
];

const elements: { [key: string]: (EleganceElement<any> | EleganceOptionlessElement<any>) } = {};

elementTags.forEach(tag => {
  elements[tag] = createBuildableElement(tag);
});

optionlessElementTags.forEach(tag => {
    elements[tag] = createOptionlessBuildableElement(tag);
})

export { elements, createElementOptions };

