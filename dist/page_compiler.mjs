// src/page_compiler.ts
import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";

// src/shared/serverElements.ts
var createBuildableElement = (tag) => {
  return (options2, ...children) => ({
    tag,
    options: options2 || {},
    children
  });
};
var createChildrenlessBuildableElement = (tag) => {
  return (options2) => ({
    tag,
    options: options2 || {},
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

// src/server/generateHTMLTemplate.ts
var generateHTMLTemplate = async ({
  pageURL,
  head: head2,
  serverData = null,
  addPageScriptTag = true,
  name,
  requiredClientModules = []
}) => {
  let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  StartTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">';
  for (const module of requiredClientModules) {
    StartTemplate += `<script data-module="true" src="/shipped/${module}.js" defer="true"></script>`;
  }
  if (addPageScriptTag === true) {
    StartTemplate += `<script data-page="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
  }
  StartTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
  let builtHead;
  if (head2.constructor.name === "AsyncFunction") {
    builtHead = await head2();
  } else {
    builtHead = head2();
  }
  let HTMLTemplate = renderRecursively(builtHead);
  if (serverData) {
    HTMLTemplate += serverData;
  }
  return {
    internals: StartTemplate,
    builtMetadata: HTMLTemplate
  };
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

// src/server/layout.ts
var resetLayouts = () => globalThis.__SERVER_CURRENT_LAYOUTS__ = /* @__PURE__ */ new Map();
if (!globalThis.__SERVER_CURRENT_LAYOUT_ID__) globalThis.__SERVER_CURRENT_LAYOUT_ID__ = 1;

// src/page_compiler.ts
var packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  packageDir = path.resolve(__dirname, "..");
}
var clientPath = path.resolve(packageDir, "./dist/client/client.mjs");
var watcherPath = path.resolve(packageDir, "./dist/client/watcher.mjs");
var yellow = (text) => {
  return `\x1B[38;2;238;184;68m${text}`;
};
var black = (text) => {
  return `\x1B[38;2;0;0;0m${text}`;
};
var bgYellow = (text) => {
  return `\x1B[48;2;238;184;68m${text}`;
};
var bold = (text) => {
  return `\x1B[1m${text}`;
};
var underline = (text) => {
  return `\x1B[4m${text}`;
};
var white = (text) => {
  return `\x1B[38;2;255;247;229m${text}`;
};
var green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
};
var log = (...text) => {
  if (options.quiet) return;
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
var options = JSON.parse(process.env.OPTIONS);
var DIST_DIR = process.env.DIST_DIR;
var getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);
      directories.push(relativePath);
      directories = directories.concat(getAllSubdirectories(fullPath, baseDir));
    }
  }
  return directories;
};
var getProjectFiles = (pagesDirectory) => {
  const files = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);
    const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
    files.push(...subdirectoryFiles);
  }
  return files;
};
var buildClient = async (DIST_DIR2) => {
  let clientString = "window.__name = (func) => func; ";
  clientString += fs.readFileSync(clientPath, "utf-8");
  if (options.hotReload !== void 0) {
    clientString += `const watchServerPort = ${options.hotReload.port}`;
    clientString += fs.readFileSync(watcherPath, "utf-8");
  }
  const transformedClient = await esbuild.transform(clientString, {
    minify: options.environment === "production",
    drop: options.environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: false,
    format: "iife",
    platform: "node",
    loader: "ts"
  });
  fs.writeFileSync(
    path.join(DIST_DIR2, "/client.js"),
    transformedClient.code
  );
};
var elementKey = 0;
var processOptionAsObjectAttribute = (element, optionName, optionValue, objectAttributes) => {
  const lcOptionName = optionName.toLowerCase();
  const options2 = element.options;
  let key = options2.key;
  if (key == void 0) {
    key = elementKey += 1;
    options2.key = key;
  }
  if (!optionValue.type) {
    throw `ObjectAttributeType is missing from object attribute. ${element.tag}: ${optionName}/${optionValue}`;
  }
  let optionFinal = lcOptionName;
  switch (optionValue.type) {
    case 1 /* STATE */:
      const SOA = optionValue;
      if (typeof SOA.value === "function") {
        delete options2[optionName];
        break;
      }
      if (lcOptionName === "innertext" || lcOptionName === "innerhtml") {
        element.children = [SOA.value];
        delete options2[optionName];
      } else {
        delete options2[optionName];
        options2[lcOptionName] = SOA.value;
      }
      break;
    case 2 /* OBSERVER */:
      const OOA = optionValue;
      const firstValue = OOA.update(...OOA.initialValues);
      if (lcOptionName === "innertext" || lcOptionName === "innerhtml") {
        element.children = [firstValue];
        delete options2[optionName];
      } else {
        delete options2[optionName];
        options2[lcOptionName] = firstValue;
      }
      optionFinal = optionName;
      break;
    case 4 /* REFERENCE */:
      options2["ref"] = optionValue.value;
      break;
  }
  objectAttributes.push({ ...optionValue, key, attribute: optionFinal });
};
function buildTrace(stack, indent = 4) {
  try {
    if (!stack || stack.length === 0) return "[]";
    let traceObj = stack[stack.length - 1] && typeof stack[stack.length - 1] === "object" ? JSON.parse(JSON.stringify(stack[stack.length - 1])) : { value: stack[stack.length - 1] };
    traceObj._error = "This is the element where the error occurred";
    for (let i = stack.length - 2; i >= 0; i--) {
      const parent = stack[i];
      const child = stack[i + 1];
      if (!parent || typeof parent !== "object") {
        traceObj = { value: parent, _errorChild: traceObj };
        continue;
      }
      let parentClone;
      try {
        parentClone = JSON.parse(JSON.stringify(parent));
      } catch {
        parentClone = { value: parent };
      }
      let index = -1;
      if (Array.isArray(parentClone.children)) {
        index = parentClone.children.findIndex((c) => c === child);
      }
      if (index !== -1 && parentClone.children) {
        parentClone.children = parentClone.children.slice(0, index + 1);
        parentClone.children[index] = traceObj;
      } else {
        parentClone._errorChild = traceObj;
      }
      traceObj = parentClone;
    }
    return JSON.stringify(traceObj, null, indent).replace(/^/gm, " ".repeat(indent));
  } catch {
    return "Could not build stack-trace.";
  }
}
var processPageElements = (element, objectAttributes, recursionLevel, stack = []) => {
  stack.push(element);
  try {
    if (typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) {
      stack.pop();
      return element;
    }
    if (typeof element === "string") {
      stack.pop();
      return element;
    }
    const processElementOptionsAsChildAndReturn = () => {
      try {
        const children = element.children;
        element.children = [
          element.options,
          ...children
        ];
        element.options = {};
        for (let i = 0; i < children.length + 1; i++) {
          const child = element.children[i];
          const processedChild = processPageElements(child, objectAttributes, recursionLevel + 1, stack);
          element.children[i] = processedChild;
        }
        return {
          ...element,
          options: {}
        };
      } catch (e) {
        const errorString = `Could not process element options as a child. ${e}.`;
        throw new Error(errorString);
      }
    };
    if (typeof element.options !== "object") {
      const result = processElementOptionsAsChildAndReturn();
      stack.pop();
      return result;
    }
    const {
      tag: elementTag,
      options: elementOptions,
      children: elementChildren
    } = element.options;
    if (elementTag && elementOptions && elementChildren) {
      const result = processElementOptionsAsChildAndReturn();
      stack.pop();
      return result;
    }
    const options2 = element.options;
    for (const [optionName, optionValue] of Object.entries(options2)) {
      const lcOptionName = optionName.toLowerCase();
      if (typeof optionValue !== "object") {
        if (lcOptionName === "innertext") {
          delete options2[optionName];
          if (element.children === null) {
            throw `Cannot use innerText or innerHTML on childrenless elements.`;
          }
          element.children = [optionValue, ...element.children];
          continue;
        } else if (lcOptionName === "innerhtml") {
          if (element.children === null) {
            throw `Cannot use innerText or innerHTML on childrenless elements.`;
          }
          delete options2[optionName];
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
        const processedChild = processPageElements(child, objectAttributes, recursionLevel + 1, stack);
        element.children[i] = processedChild;
      }
    }
    stack.pop();
    return element;
  } catch (e) {
    const trace = buildTrace(stack);
    if (recursionLevel === 0) {
      throw new Error(`${e}

Trace:
${trace}`);
    } else {
      throw e;
    }
  }
};
var pageToHTML = async (pageLocation, pageElements, metadata, DIST_DIR2, pageName, doWrite = true, requiredClientModules = [], layout) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    throw new Error(`The root element of a page / layout must be a built element, not just a Child. Received: ${typeof pageElements}.`);
  }
  const objectAttributes = [];
  const stack = [];
  const processedPageElements = processPageElements(pageElements, objectAttributes, 0, stack);
  const renderedPage = await serverSideRenderPage(
    processedPageElements,
    pageLocation
  );
  const { internals, builtMetadata } = await generateHTMLTemplate({
    pageURL: path.relative(DIST_DIR2, pageLocation),
    head: metadata,
    addPageScriptTag: true,
    name: pageName,
    requiredClientModules
  });
  const headHTML = `<!DOCTYPE html>${layout.metadata.startHTML}${layout.scriptTag}${internals}${builtMetadata}${layout.metadata.endHTML}`;
  const bodyHTML = `${layout.pageContent.startHTML}${renderedPage.bodyHTML}${layout.pageContent.endHTML}`;
  const resultHTML = `${headHTML}${bodyHTML}`;
  const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
  if (doWrite) {
    fs.writeFileSync(
      htmlLocation,
      resultHTML,
      {
        encoding: "utf-8",
        flag: "w"
      }
    );
    return objectAttributes;
  } else {
    return {
      objectAttributes,
      resultHTML
    };
  }
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR2, pageName, globalVariableName = "pd") => {
  const pageDiff = path.relative(DIST_DIR2, pageLocation);
  let clientPageJSText = `${globalThis.__SERVER_PAGE_DATA_BANNER__}let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
  {
    clientPageJSText += `export const data = {`;
    if (state) {
      clientPageJSText += `state:[`;
      for (const subject of state) {
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
          observerObjectAttributeString += `{id:${ref.id}},`;
        }
        observerObjectAttributeString += "]},";
      }
      observerObjectAttributeString += "],";
      clientPageJSText += observerObjectAttributeString;
    }
    if (pageLoadHooks.length > 0) {
      clientPageJSText += "lh:[";
      for (const loadHook of pageLoadHooks) {
        clientPageJSText += `{fn:${loadHook.fn}},`;
      }
      clientPageJSText += "],";
    }
    clientPageJSText += `};`;
  }
  clientPageJSText += `if(!globalThis.${globalVariableName}) { globalThis.${globalVariableName} = {}; }; globalThis.${globalVariableName}[url] = data;`;
  const pageDataPath = path.join(pageLocation, `${pageName}_data.js`);
  let sendHardReloadInstruction = false;
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: options.environment === "production" }).catch((error) => {
    console.error("Failed to transform client page js!", error);
  });
  if (!transformedResult) return { sendHardReloadInstruction };
  if (fs.existsSync(pageDataPath)) {
    const content = fs.readFileSync(pageDataPath).toString();
    if (content !== transformedResult.code) {
      sendHardReloadInstruction = true;
    }
  }
  fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var generateLayout = async (DIST_DIR2, filePath, childIndicator) => {
  const directory = path.dirname(filePath);
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
  let layoutElements;
  let metadataElements;
  let modules = [];
  try {
    const {
      layout,
      metadata,
      isDynamic,
      requiredClientModules
    } = await import("file://" + filePath);
    if (requiredClientModules !== void 0) {
      modules = requiredClientModules;
    }
    layoutElements = layout;
    metadataElements = metadata;
    if (isDynamic === true) {
      const result = await esbuild.build({
        entryPoints: [filePath],
        bundle: false,
        format: "iife",
        globalName: "__exports",
        write: false,
        platform: "node",
        plugins: [externalPackagesPlugin]
      });
      let iifeCode = result.outputFiles[0].text;
      iifeCode = iifeCode.replace(/^var __exports = /, "");
      const wrappedCode = `import { createRequire } from 'module'; const require = createRequire(import.meta.url);

export function construct() {
  ${iifeCode} 
return __exports
}`;
      fs.writeFileSync(filePath, wrappedCode);
      return { pageContentHTML: "", metadataHTML: "" };
    }
    fs.rmSync(filePath, { force: true });
  } catch (e) {
    throw new Error(`Error in Page: ${directory === "" ? "/" : directory}layout.mjs - ${e}`);
  }
  {
    if (!layoutElements) {
      throw new Error(`WARNING: ${filePath} should export a const layout, which is of type (child: Child) => AnyBuiltElement.`);
    }
    if (typeof layoutElements === "function") {
      if (layoutElements.constructor.name === "AsyncFunction") {
        layoutElements = await layoutElements(childIndicator);
      } else {
        layoutElements = layoutElements(childIndicator);
      }
    }
  }
  {
    if (!metadataElements) {
      throw new Error(`WARNING: ${filePath} should export a const layout, which is of type (child: Child) => AnyBuiltElement.`);
    }
    if (typeof metadataElements === "function") {
      if (metadataElements.constructor.name === "AsyncFunction") {
        metadataElements = await metadataElements(childIndicator);
      } else {
        metadataElements = metadataElements(childIndicator);
      }
    }
  }
  const state = getState();
  const pageLoadHooks = getLoadHooks();
  const objectAttributes = getObjectAttributes();
  if (typeof layoutElements === "string" || typeof layoutElements === "boolean" || typeof layoutElements === "number" || Array.isArray(layoutElements)) {
    throw new Error(`The root element of a page / layout must be a built element, not just a Child. Received: ${typeof layoutElements}.`);
  }
  const foundObjectAttributes = [];
  const stack = [];
  const processedPageElements = processPageElements(layoutElements, foundObjectAttributes, 0, stack);
  const renderedPage = await serverSideRenderPage(
    processedPageElements,
    path.dirname(filePath)
  );
  const metadataHTML = metadataElements ? renderRecursively(metadataElements) : "";
  await generateClientPageData(
    path.dirname(filePath),
    state || {},
    [...objectAttributes, ...foundObjectAttributes],
    pageLoadHooks || [],
    DIST_DIR2,
    "layout",
    "ld"
  );
  return { pageContentHTML: renderedPage.bodyHTML, metadataHTML };
};
var builtLayouts = /* @__PURE__ */ new Map();
var buildLayout = async (filePath) => {
  const storedState = globalThis.__SERVER_CURRENT_STATE__;
  const storedObjectAttributes = globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__;
  const storedLoadHooks = globalThis.__SERVER_CURRENT_LOADHOOKS__;
  const storedPageDataBanner = globalThis.__SERVER_PAGE_DATA_BANNER__;
  const id = globalThis.__SERVER_CURRENT_STATE_ID__ += 1;
  const childIndicator = `<template layout-id="${id}"></template>`;
  const { pageContentHTML, metadataHTML } = await generateLayout(
    DIST_DIR,
    filePath,
    childIndicator
  );
  const splitAround = (str, sub) => {
    const i = str.indexOf(sub);
    if (i === -1) throw new Error("substring does not exist in parent string");
    return {
      startHTML: str.substring(0, i),
      endHTML: str.substring(i + sub.length)
    };
  };
  const splitAt = (str, sub) => {
    const i = str.indexOf(sub) + sub.length;
    if (i === -1) throw new Error("substring does not exist in parent string");
    return {
      startHTML: str.substring(0, i),
      endHTML: str.substring(i)
    };
  };
  const pageURL = path.relative(DIST_DIR, path.dirname(filePath));
  globalThis.__SERVER_CURRENT_STATE__ = storedState;
  globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__ = storedObjectAttributes;
  globalThis.__SERVER_CURRENT_LOADHOOKS__ = storedLoadHooks;
  globalThis.__SERVER_PAGE_DATA_BANNER__ = storedPageDataBanner;
  return {
    pageContent: splitAt(pageContentHTML, childIndicator),
    metadata: splitAround(metadataHTML, childIndicator),
    scriptTag: `<script data-layout="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/layout_data.js" defer="true"></script>`
  };
};
var fetchPageLayoutHTML = async (dirname) => {
  const relative = path.relative(DIST_DIR, dirname);
  let split = relative.split(path.sep).filter(Boolean);
  split.push("/");
  split.reverse();
  let layouts = [];
  for (const dir of split) {
    const filePath = path.resolve(path.join(DIST_DIR, dir, "layout.mjs"));
    if (builtLayouts.has(filePath)) {
      layouts.push(builtLayouts.get(filePath));
    } else if (fs.existsSync(filePath)) {
      const built = await buildLayout(filePath);
      builtLayouts.set(filePath, built);
      layouts.push(built);
    }
  }
  const pageContent = {
    startHTML: "",
    endHTML: ""
  };
  const metadata = {
    startHTML: "",
    endHTML: ""
  };
  let scriptTags = "";
  for (const layout of layouts) {
    pageContent.startHTML += layout.pageContent.startHTML;
    metadata.startHTML += layout.metadata.startHTML;
    scriptTags += layout.scriptTag;
    pageContent.endHTML += layout.pageContent.endHTML;
    metadata.endHTML += layout.metadata.endHTML;
  }
  return { pageContent, metadata, scriptTag: scriptTags };
};
var buildPages = async (DIST_DIR2) => {
  resetLayouts();
  const subdirectories = [...getAllSubdirectories(DIST_DIR2), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(DIST_DIR2, directory));
    const files = fs.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".mjs"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 4);
      const isPage = file.name.includes("page");
      if (isPage == false) {
        continue;
      }
      try {
        const hardReloadForPage = await buildPage(DIST_DIR2, directory, filePath, name);
        if (hardReloadForPage) {
          shouldClientHardReload = true;
        }
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  }
  return {
    shouldClientHardReload
  };
};
var buildPage = async (DIST_DIR2, directory, filePath, name) => {
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
  let pageElements;
  let metadata;
  let modules = [];
  let pageIgnoresLayout = false;
  try {
    const {
      page,
      metadata: pageMetadata,
      isDynamicPage,
      requiredClientModules,
      ignoreLayout
    } = await import("file://" + filePath);
    if (requiredClientModules !== void 0) {
      modules = requiredClientModules;
    }
    if (ignoreLayout) {
      pageIgnoresLayout = true;
    }
    pageElements = page;
    metadata = pageMetadata;
    if (isDynamicPage === true) {
      const result = await esbuild.build({
        entryPoints: [filePath],
        bundle: false,
        format: "iife",
        globalName: "__exports",
        write: false,
        platform: "node",
        plugins: [externalPackagesPlugin]
      });
      let iifeCode = result.outputFiles[0].text;
      iifeCode = iifeCode.replace(/^var __exports = /, "");
      const wrappedCode = `import { createRequire } from 'module'; const require = createRequire(import.meta.url);

export function construct() {
  ${iifeCode} 
return __exports
}`;
      fs.writeFileSync(filePath, wrappedCode);
      return false;
    }
    fs.rmSync(filePath, { force: true });
  } catch (e) {
    throw new Error(`Error in Page: ${directory === "" ? "/" : directory}${name}.mjs - ${e}`);
  }
  if (!metadata || metadata && typeof metadata !== "function") {
    console.warn(`WARNING: ${filePath} does not export a metadata function. This is *highly* recommended.`);
  }
  if (!pageElements) {
    console.warn(`WARNING: ${filePath} should export a const page, which is of type () => BuiltElement<"body">.`);
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
  const layout = await fetchPageLayoutHTML(path.dirname(filePath));
  const foundObjectAttributes = await pageToHTML(
    path.dirname(filePath),
    pageElements || body(),
    metadata ?? (() => head()),
    DIST_DIR2,
    name,
    true,
    modules,
    layout
  );
  const {
    sendHardReloadInstruction
  } = await generateClientPageData(
    path.dirname(filePath),
    state || {},
    [...objectAttributes, ...foundObjectAttributes],
    pageLoadHooks || [],
    DIST_DIR2,
    name
  );
  return sendHardReloadInstruction === true;
};
var recursionFlag = Symbol("external-node-modules-recursion");
var externalPackagesPlugin = {
  name: "external-packages",
  setup(build2) {
    build2.onResolve({ filter: /^[^./]/ }, async (args) => {
      if (args.pluginData?.[recursionFlag]) {
        return;
      }
      const result = await build2.resolve(args.path, {
        resolveDir: args.resolveDir,
        kind: args.kind,
        importer: args.importer,
        pluginData: { [recursionFlag]: true }
      });
      if (result.errors.length > 0 || result.external || !result.path) {
        return { path: args.path, external: true };
      }
      const nodeModulesIndex = result.path.indexOf("node_modules");
      if (nodeModulesIndex === -1) {
        return result;
      }
      const isNested = result.path.includes("node_modules", nodeModulesIndex + 14);
      if (args.path.startsWith("elegance-js")) {
        return result;
      }
      if (isNested) {
        return { path: args.path, external: true };
      }
      return { path: args.path, external: true };
    });
  }
};
var shippedPlugins = /* @__PURE__ */ new Map();
var pluginsToShip = [];
var shipPlugin = {
  name: "ship",
  setup(build2) {
    build2.onLoad({ filter: /\.(js|ts|jsx|tsx)$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, "utf8");
      const lines = contents.split(/\r?\n/);
      let prepender = "";
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].trim() === "//@ship") {
          const nextLine = lines[i + 1].trim();
          const starRegex = /import\s*\*\s*as\s*(\w+)\s*from\s*["']([^"']+)["']\s*;/;
          const defaultRegex = /import\s*(\w+)\s*from\s*["']([^"']+)["']\s*;/;
          let match = nextLine.match(starRegex);
          let importName;
          let pkgPath;
          if (match) {
            importName = match[1];
            pkgPath = match[2];
          } else {
            match = nextLine.match(defaultRegex);
            if (match) {
              importName = match[1];
              pkgPath = match[2];
            } else {
              continue;
            }
          }
          if (prepender === "") {
            prepender = "export const requiredClientModules = [\n";
          }
          prepender += `"${importName}",
`;
          pluginsToShip.push({
            path: pkgPath,
            globalName: importName
          });
          const replacement = `const ${importName} = globalThis.${importName};`;
          lines.splice(i, 2, replacement);
          i--;
        }
      }
      if (prepender !== "") {
        prepender += "];";
      }
      contents = lines.join("\n");
      return {
        contents: prepender + contents,
        loader: path.extname(args.path).slice(1)
      };
    });
  }
};
var build = async () => {
  if (options.quiet === true) {
    console.log = function() {
    };
    console.error = function() {
    };
    console.warn = function() {
    };
  }
  try {
    {
      log(bold(yellow(" -- Elegance.JS -- ")));
      log(white(`Beginning build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}..`));
      log("");
      if (options.environment === "production") {
        log(
          " - ",
          bgYellow(bold(black(" NOTE "))),
          " : ",
          white("In production mode, no "),
          underline("console.log() "),
          white("statements will be shown on the client, and all code will be minified.")
        );
        log("");
      }
    }
    if (options.preCompile) {
      log(
        white("Calling pre-compile hook..")
      );
      options.preCompile();
    }
    const projectFiles = getProjectFiles(options.pagesDirectory);
    const start = performance.now();
    {
      pluginsToShip = [];
      await esbuild.build({
        entryPoints: projectFiles.map((f) => path.join(f.parentPath, f.name)),
        bundle: true,
        outdir: DIST_DIR,
        outExtension: { ".js": ".mjs" },
        plugins: [externalPackagesPlugin, shipPlugin],
        loader: {
          ".ts": "ts"
        },
        format: "esm",
        platform: "node",
        keepNames: false,
        define: {
          "DEV": options.environment === "development" ? "true" : "false",
          "PROD": options.environment === "development" ? "false" : "true"
        }
      });
      for (const plugin of pluginsToShip) {
        {
          if (shippedPlugins.has(plugin.globalName)) continue;
          shippedPlugins.set(plugin.globalName, true);
        }
        await esbuild.build({
          entryPoints: [plugin.path],
          bundle: true,
          outfile: path.join(DIST_DIR, "shipped", plugin.globalName + ".js"),
          format: "iife",
          platform: "browser",
          globalName: plugin.globalName,
          minify: true,
          treeShaking: true
        });
      }
    }
    const pagesTranspiled = performance.now();
    let shouldClientHardReload;
    {
      const { shouldClientHardReload: doReload } = await buildPages(DIST_DIR);
      if (doReload) shouldClientHardReload = true;
    }
    const pagesBuilt = performance.now();
    await buildClient(DIST_DIR);
    const end = performance.now();
    if (options.publicDirectory) {
      log("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), options.publicDirectory.path);
      if (fs.existsSync(src) === false) {
        console.warn("WARNING: Public directory not found, an attempt will be made create it..");
        fs.mkdirSync(src, { recursive: true });
      }
      await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true });
    }
    {
      log(`${Math.round(pagesTranspiled - start)}ms to Transpile Fales`);
      log(`${Math.round(pagesBuilt - pagesTranspiled)}ms to Build Pages`);
      log(`${Math.round(end - pagesBuilt)}ms to Build Client`);
      log(green(bold(`Compiled ${projectFiles.length} files in ${Math.ceil(end - start)}ms!`)));
    }
    process.send({ event: "message", data: "set-layouts", layouts: JSON.stringify(Array.from(__SERVER_CURRENT_LAYOUTS__)), currentLayouTId: __SERVER_CURRENT_LAYOUT_ID__ });
    process.send({ event: "message", data: "compile-finish" });
    if (shouldClientHardReload) {
      log("Sending hard reload..");
      process.send({ event: "message", data: "hard-reload" });
    } else {
      log("Sending soft reload..");
      process.send({ event: "message", data: "soft-reload" });
    }
  } catch (e) {
    console.error("Build Failed! Received Error:");
    console.error(e);
    return false;
  }
  return true;
};
(async () => {
  await build();
})();
export {
  processPageElements
};
