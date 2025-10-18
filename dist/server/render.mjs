// src/shared/serverElements.ts
var createBuildableElement = (tag) => {
  return (options, ...children) => ({
    tag,
    options: options || {},
    children
  });
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => ({
    tag,
    options: options || {},
    children: null
  });
};
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
  "source",
  "track",
  "path",
  "rect"
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
  "tr",
  "ul",
  "video",
  "span",
  "script",
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
  "wbr",
  "title",
  "svg"
];
var elements = {};
var childrenlessElements = {};
for (const element of elementTags) {
  elements[element] = createBuildableElement(element);
}
for (const element of childrenlessElementTags) {
  childrenlessElements[element] = createChildrenlessBuildableElement(element);
}
var allElements = {
  ...elements,
  ...childrenlessElements
};

// src/shared/bindServerElements.ts
Object.assign(globalThis, elements);
Object.assign(globalThis, childrenlessElements);

// src/server/render.ts
var renderRecursively = (element) => {
  let returnString = "";
  if (typeof element === "boolean") return returnString;
  else if (typeof element === "number" || typeof element === "string") {
    return returnString + element;
  } else if (Array.isArray(element)) {
    return returnString + element.join(", ");
  }
  returnString += `<${element.tag}`;
  if (typeof element.options === "object") {
    const {
      tag: elementTag,
      options: elementOptions,
      children: elementChildren
    } = element.options;
    if (elementTag !== void 0 && elementOptions !== void 0 && elementChildren !== void 0) {
      const children = element.children;
      element.children = [
        element.options,
        ...children
      ];
      element.options = {};
    } else {
      for (const [attrName, attrValue] of Object.entries(element.options)) {
        if (typeof attrValue === "object") {
          throw `Attr ${attrName}, for element ${element.tag} has obj type. Got: ${JSON.stringify(element, null, 2)}`;
        }
        returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
      }
    }
  } else if (typeof element.options !== "object" && element.options !== void 0) {
    element.children = [element.options, ...element.children || []];
  }
  if (element.children === null) {
    returnString += "/>";
    return returnString;
  }
  returnString += ">";
  for (const child of element.children) {
    returnString += renderRecursively(child);
  }
  returnString += `</${element.tag}>`;
  return returnString;
};
var serverSideRenderPage = async (page, pathname) => {
  if (!page) {
    throw `No Page Provided.`;
  }
  if (typeof page === "function") {
    throw `Unbuilt page provided to ssr page.`;
  }
  const bodyHTML = renderRecursively(page);
  return {
    bodyHTML
  };
};
export {
  renderRecursively,
  serverSideRenderPage
};
