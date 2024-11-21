const createElementOptions = (obj) => {
    return function () {
        const reevaluatedObj = {};

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

const createBuildableElement = (tag) => {
    return (options, ...children) => {
        const getOptions = createElementOptions(options);

        return () => ({
            tag: tag,
            getOptions: getOptions,
            children: children,
        });
    };
};

const elementTags = [
  "meta", "footer", "link", "header", "p", "body", "main", "div",
  "button", "input", "a", "h1", "h2", "h3", "h4", "h5", "h6", "pre",
  "html", "script", "span", "title", "head", "style"
];

const elements = {};

elementTags.forEach(tag => {
  elements[tag] = createBuildableElement(tag);
});

export { elements, createElementOptions };

