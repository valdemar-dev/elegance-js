// src/elements.ts
var createElementOptions = (obj) => {
  return function() {
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
var createBuildableElement = (tag) => {
  return (options, ...children) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children
    });
  };
};
var createOptionlessBuildableElement = (tag) => {
  return (...children) => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children
    });
  };
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children: []
    });
  };
};
var createChildrenlessOptionlessBuildableElement = (tag) => {
  return () => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children: []
    });
  };
};
var optionlessElementTags = [
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "strong",
  "sub",
  "sup",
  "u",
  "var",
  "wbr"
];
var childrenlessElementTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track"
];
var childrenlessOptionlessElementTags = [
  "basefont",
  "isindex",
  "keygen"
];
var elementTags = [
  "a",
  "address",
  "article",
  "aside",
  "audio",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dialog",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "html",
  "iframe",
  "ins",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "summary",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "ul",
  "video",
  "span"
];
var elements = {};
var optionlessElements = {};
var childrenlessElements = {};
var childrenlessOptionlessElements = {};
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
var allElements = {
  ...elements,
  ...optionlessElements,
  ...childrenlessElements,
  ...childrenlessOptionlessElements
};

// src/bindElements.ts
Object.assign(globalThis, elements);
Object.assign(globalThis, optionlessElements);
Object.assign(globalThis, childrenlessElements);
Object.assign(globalThis, childrenlessOptionlessElements);
