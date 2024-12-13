// src/shared/bindBrowserElements.ts
var createElementOptions = (obj) => {
  return function() {
    const reevaluatedObj = {};
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
var voidElements = [
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
  "track",
  "wbr"
];
var structureElements = ["title"];
var elements = {};
var globalProperties = Object.getOwnPropertyNames(window);
for (const prop of globalProperties) {
  if (!prop.startsWith("HTML")) continue;
  const constructor = window[prop];
  if (typeof constructor !== "function" || !(constructor.prototype instanceof HTMLElement)) {
    continue;
  }
  const tagName = prop.replace(/^HTML|Element$/g, "").toLowerCase();
  if (!tagName) continue;
  if (structureElements.includes(tagName)) {
    elements[tagName] = (...children) => {
      return () => ({
        tag: tagName,
        getOptions: () => ({}),
        children
      });
    };
    continue;
  }
  if (voidElements.includes(tagName)) {
    elements[tagName] = (options) => {
      return () => ({
        tag: tagName,
        getOptions: createElementOptions(options),
        children: []
      });
    };
    continue;
  }
  elements[tagName] = (options, ...children) => {
    return () => ({
      tag: tagName,
      getOptions: createElementOptions(options),
      children
    });
  };
  Object.assign(globalThis, elements);
}
