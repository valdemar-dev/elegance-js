// src/dynamic_page.ts
import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";

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
  const {
    tag: elementTag,
    options: elementOptions,
    children: elementChildren
  } = element.options;
  if (elementTag && elementOptions && elementChildren) {
    const children = element.children;
    element.children = [
      element.options,
      ...children
    ];
    element.options = {};
    for (let i = 0; i < children.length + 1; i++) {
      const child = element.children[i];
      returnString += renderRecursively(child);
    }
    returnString += `</${element.tag}>`;
    return returnString;
  }
  if (typeof element.options === "object") {
    for (const [attrName, attrValue] of Object.entries(element.options)) {
      if (typeof attrValue === "object") {
        throw `Attr ${attrName}, for element ${element.tag} has obj type. Got: ${JSON.stringify(element)}`;
      }
      returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
    }
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

// src/server/generateHTMLTemplate.ts
var generateHTMLTemplate = ({
  pageURL,
  head: head2,
  serverData = null,
  addPageScriptTag = true,
  name,
  requiredClientModules = []
}) => {
  let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">';
  for (const module of requiredClientModules) {
    HTMLTemplate += `<script src="/shipped/${module}.js" defer="true"></script>`;
  }
  if (addPageScriptTag === true) {
    HTMLTemplate += `<script data-tag="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
  }
  HTMLTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
  const builtHead = head2();
  for (const child of builtHead.children) {
    HTMLTemplate += renderRecursively(child);
  }
  if (serverData) {
    HTMLTemplate += serverData;
  }
  HTMLTemplate += "</head>";
  return HTMLTemplate;
};

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}
var initializeState = () => {
  globalThis.__SERVER_CURRENT_STATE__ = [];
};
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};
var initializeObjectAttributes = () => globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__ = [];
var getObjectAttributes = () => {
  return globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__;
};

// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

// src/dynamic_page.ts
var packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  packageDir = path.resolve(__dirname, "..");
}
var elementKey = 0;
var processOptionAsObjectAttribute = (element, optionName, optionValue, objectAttributes) => {
  const lcOptionName = optionName.toLowerCase();
  const options = element.options;
  let key = options.key;
  if (key == void 0) {
    key = elementKey += 1;
    options.key = key;
  }
  if (!optionValue.type) {
    throw `ObjectAttributeType is missing from object attribute. ${element.tag}: ${optionName}/${optionValue}`;
  }
  let optionFinal = lcOptionName;
  switch (optionValue.type) {
    case 1 /* STATE */:
      const SOA = optionValue;
      if (typeof SOA.value === "function") {
        delete options[optionName];
        break;
      }
      if (lcOptionName === "innertext" || lcOptionName === "innerhtml") {
        element.children = [SOA.value];
        delete options[optionName];
      } else {
        delete options[optionName];
        options[lcOptionName] = SOA.value;
      }
      break;
    case 2 /* OBSERVER */:
      const OOA = optionValue;
      const firstValue = OOA.update(...OOA.initialValues);
      if (lcOptionName === "innertext" || lcOptionName === "innerhtml") {
        element.children = [firstValue];
        delete options[optionName];
      } else {
        delete options[optionName];
        options[lcOptionName] = firstValue;
      }
      optionFinal = optionName;
      break;
    case 4 /* REFERENCE */:
      options["ref"] = optionValue.value;
      break;
  }
  objectAttributes.push({ ...optionValue, key, attribute: optionFinal });
};
var processPageElements = async (element, objectAttributes, parent) => {
  if (typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) return element;
  if (typeof element === "string") {
    return element;
  }
  const processElementOptionsAsChildAndReturn = async () => {
    const children = element.children;
    element.children = [
      element.options,
      ...children
    ];
    element.options = {};
    for (let i = 0; i < children.length + 1; i++) {
      const child = element.children[i];
      const processedChild = await processPageElements(child, objectAttributes, element);
      element.children[i] = processedChild;
    }
    return {
      ...element,
      options: {}
    };
  };
  if (typeof element.options !== "object") {
    return await processElementOptionsAsChildAndReturn();
  }
  const {
    tag: elementTag,
    options: elementOptions,
    children: elementChildren
  } = element.options;
  if (elementTag && elementOptions && elementChildren) {
    return await processElementOptionsAsChildAndReturn();
  }
  const options = element.options;
  for (const [optionName, optionValue] of Object.entries(options)) {
    const lcOptionName = optionName.toLowerCase();
    if (typeof optionValue !== "object") {
      if (lcOptionName === "innertext") {
        delete options[optionName];
        if (element.children === null) {
          throw `Cannot use innerText or innerHTML on childrenless elements.`;
        }
        element.children = [optionValue, ...element.children];
        continue;
      } else if (lcOptionName === "innerhtml") {
        if (element.children === null) {
          throw `Cannot use innerText or innerHTML on childrenless elements.`;
        }
        delete options[optionName];
        element.children = [optionValue];
        continue;
      }
      continue;
    }
    ;
    processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
  }
  if (element.children) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const processedChild = await processPageElements(child, objectAttributes, element);
      element.children[i] = processedChild;
    }
  }
  return element;
};
var generateSuitablePageElements = async (pageLocation, pageElements, metadata, DIST_DIR, pageName, requiredClientModules) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    return [];
  }
  const objectAttributes = [];
  const processedPageElements = await processPageElements(pageElements, objectAttributes, []);
  elementKey = 0;
  const renderedPage = await serverSideRenderPage(
    processedPageElements,
    pageLocation
  );
  const template = generateHTMLTemplate({
    pageURL: path.relative(DIST_DIR, pageLocation),
    head: metadata,
    addPageScriptTag: true,
    name: pageName,
    requiredClientModules
  });
  const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;
  return {
    objectAttributes,
    resultHTML
  };
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR, pageName) => {
  const pageDiff = path.relative(DIST_DIR, pageLocation);
  let clientPageJSText = `${globalThis.__SERVER_PAGE_DATA_BANNER__}
/*ELEGANCE_JS*/
let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
  {
    clientPageJSText += `export const data = {`;
    if (state) {
      const nonBoundState = state.filter((subj) => subj.bind === void 0);
      clientPageJSText += `state:[`;
      for (const subject of nonBoundState) {
        if (typeof subject.value === "string") {
          const stringified = JSON.stringify(subject.value);
          clientPageJSText += `{id:${subject.id},value:${stringified}},`;
        } else if (typeof subject.value === "function") {
          clientPageJSText += `{id:${subject.id},value:${subject.value.toString()}},`;
        } else {
          clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
        }
      }
      clientPageJSText += `],`;
      const formattedBoundState = {};
      const stateBinds = state.map((subj) => subj.bind).filter((bind) => bind !== void 0);
      for (const bind of stateBinds) {
        formattedBoundState[bind] = [];
      }
      ;
      const boundState = state.filter((subj) => subj.bind !== void 0);
      for (const subject of boundState) {
        const bindingState = formattedBoundState[subject.bind];
        delete subject.bind;
        bindingState.push(subject);
      }
      const bindSubjectPairing = Object.entries(formattedBoundState);
      if (bindSubjectPairing.length > 0) {
        clientPageJSText += "binds:{";
        for (const [bind, subjects] of bindSubjectPairing) {
          clientPageJSText += `${bind}:[`;
          for (const subject of subjects) {
            if (typeof subject.value === "string") {
              clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
            } else {
              clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
            }
          }
          clientPageJSText += "]";
        }
        clientPageJSText += "},";
      }
    }
    const stateObjectAttributes = objectAttributes.filter((oa) => oa.type === 1 /* STATE */);
    if (stateObjectAttributes.length > 0) {
      const processed = [...stateObjectAttributes].map((soa) => {
        delete soa.type;
        return soa;
      });
      clientPageJSText += `soa:${JSON.stringify(processed)},`;
    }
    const observerObjectAttributes = objectAttributes.filter((oa) => oa.type === 2 /* OBSERVER */);
    if (observerObjectAttributes.length > 0) {
      let observerObjectAttributeString = "ooa:[";
      for (const observerObjectAttribute of observerObjectAttributes) {
        const ooa = observerObjectAttribute;
        observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",update:${ooa.update.toString()},`;
        observerObjectAttributeString += `refs:[`;
        for (const ref of ooa.refs) {
          observerObjectAttributeString += `{id:${ref.id}`;
          if (ref.bind !== void 0) observerObjectAttributeString += `,bind:${ref.bind}`;
          observerObjectAttributeString += "},";
        }
        observerObjectAttributeString += "]},";
      }
      observerObjectAttributeString += "],";
      clientPageJSText += observerObjectAttributeString;
    }
    if (pageLoadHooks.length > 0) {
      clientPageJSText += "lh:[";
      for (const loadHook of pageLoadHooks) {
        const key = loadHook.bind;
        clientPageJSText += `{fn:${loadHook.fn},bind:"${key || ""}"},`;
      }
      clientPageJSText += "],";
    }
    clientPageJSText += `};`;
  }
  clientPageJSText += "if(!globalThis.pd) { globalThis.pd = {}; globalThis.pd[url] = data}";
  const pageDataPath = path.join(pageLocation, `${pageName}_data.js`);
  let sendHardReloadInstruction = false;
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: true }).catch((error) => {
    console.error("Failed to transform client page js!", error);
  });
  if (!transformedResult) return { sendHardReloadInstruction };
  fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var buildDynamicPage = async (filePath, DIST_DIR, req, res) => {
  let pageElements;
  let metadata;
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
  let modules = [];
  try {
    const {
      construct
    } = await import("file://" + filePath);
    const {
      page,
      metadata: pageMetadata,
      isDynamicPage,
      requestHook,
      requiredClientModules
    } = construct();
    if (requiredClientModules !== void 0) {
      modules = requiredClientModules;
    }
    if (typeof requestHook === "function") {
      if (requestHook.constructor.name === "AsyncFunction") {
        const doProcessRequest = await requestHook(req, res);
        if (doProcessRequest !== void 0 == doProcessRequest === false) {
          return false;
        }
      } else {
        const doProcessRequest = requestHook(req, res);
        if (doProcessRequest !== void 0 == doProcessRequest === false) {
          return false;
        }
      }
    }
    pageElements = page;
    metadata = pageMetadata;
    if (isDynamicPage === false) {
      throw new Error("Cannot dynamically render a non-dynamic page.");
    }
  } catch (e) {
    throw `${filePath} - ${e}
${e?.stack ?? "No stack."}

`;
  }
  if (!metadata || metadata && typeof metadata !== "function") {
    console.warn(`WARNING: Dynamic ${filePath} does not export a metadata function. This is *highly* recommended.`);
  }
  if (!pageElements) {
    console.warn(`WARNING: Dynamic ${filePath} should export a const page, which is of type BuiltElement<"body">.`);
  }
  if (typeof pageElements === "function") {
    if (pageElements.constructor.name === "AsyncFunction") {
      pageElements = await pageElements();
    } else {
      pageElements = pageElements();
    }
  }
  const state = getState();
  const pageLoadHooks = getLoadHooks();
  const objectAttributes = getObjectAttributes();
  const foundObjectAttributes = await generateSuitablePageElements(
    path.dirname(filePath),
    pageElements || body(),
    metadata ?? (() => head()),
    DIST_DIR,
    "page",
    modules
  );
  await generateClientPageData(
    path.dirname(filePath),
    state || {},
    [...objectAttributes, ...foundObjectAttributes.objectAttributes],
    pageLoadHooks || [],
    DIST_DIR,
    "page"
  );
  return foundObjectAttributes.resultHTML;
};
export {
  buildDynamicPage,
  processPageElements
};
