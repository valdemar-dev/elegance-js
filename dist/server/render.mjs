import "../shared/bindServerElements";
const renderRecursively = (element) => {
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
const serverSideRenderPage = async (page, pathname) => {
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
