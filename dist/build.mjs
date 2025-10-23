// src/build.ts
import fs3 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import child_process from "node:child_process";
import http from "http";

// src/log.ts
var quiet = false;
function setQuiet(value) {
  quiet = value;
}
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.toLocaleString(void 0, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function color(text, code) {
  return `\x1B[${code}m${text}\x1B[0m`;
}
function logInfo(...args) {
  if (quiet) return;
  console.info(`Elegance.JS: ${getTimestamp()} ${color("[INFO]:", 34)}`, ...args);
}
function logWarn(...args) {
  if (quiet) return;
  console.warn(`Elegance.JS: ${getTimestamp()} ${color("[WARN]:", 33)}`, ...args);
}
function logError(...args) {
  console.error(`Elegance.JS: ${getTimestamp()} ${color("[ERROR]:", 31)}`, ...args);
}
var log = {
  info: logInfo,
  warn: logWarn,
  error: logError
};

// src/dynamic_page.ts
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
  for (const child2 of element.children) {
    returnString += renderRecursively(child2);
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
  requiredClientModules = [],
  environment
}) => {
  let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  if (environment === "production") {
    StartTemplate += `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
  }
  StartTemplate += '<meta charset="UTF-8">';
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

// src/dynamic_page.ts
var packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  const __filename2 = fileURLToPath(import.meta.url);
  const __dirname2 = path.dirname(__filename2);
  packageDir = path.resolve(__dirname2, "..");
}
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
      const child2 = element.children[i];
      const processedChild = await processPageElements(child2, objectAttributes, element);
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
      const child2 = element.children[i];
      const processedChild = await processPageElements(child2, objectAttributes, element);
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
  const template = await generateHTMLTemplate({
    pageURL: path.relative(DIST_DIR, pageLocation),
    head: metadata,
    addPageScriptTag: true,
    name: pageName,
    requiredClientModules,
    environment: "production"
  });
  const resultHTML = `<!DOCTYPE html>${template}${renderedPage.bodyHTML}`;
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

// src/server/server.ts
import { createServer as createHttpServer } from "http";
import { promises as fs2 } from "fs";
import { join, normalize, extname, dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { gzip, deflate } from "zlib";
import { promisify } from "util";
var gzipAsync = promisify(gzip);
var deflateAsync = promisify(deflate);
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};
function startServer({
  root,
  port = 3e3,
  host = "localhost",
  environment = "production",
  DIST_DIR
}) {
  if (!root) throw new Error("Root directory must be specified.");
  root = normalize(root).replace(/[\\/]+$/, "");
  const requestHandler = async (req, res) => {
    try {
      if (!req.url) {
        await sendResponse(req, res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        if (environment === "development") {
          log.info(req.method, "::", req.url, "-", res.statusCode);
        }
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(root, url.pathname, req, res);
      } else {
        await handleStaticRequest(root, url.pathname, req, res, DIST_DIR);
      }
      if (environment === "development") {
        log.info(req.method, "::", req.url, "-", res.statusCode);
      }
    } catch (err) {
      log.error(err);
      await sendResponse(req, res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal Server Error");
    }
  };
  function attemptListen(p) {
    const server = createHttpServer(requestHandler);
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        attemptListen(p + 1);
      } else {
        console.error(err);
      }
    });
    server.listen(p, host, () => {
      log.info(`Server running at http://${host}:${p}/`);
    });
    return server;
  }
  return attemptListen(port);
}
async function handleStaticRequest(root, pathname, req, res, DIST_DIR) {
  const originalPathname = pathname;
  let filePath = normalize(join(root, decodeURIComponent(pathname))).replace(/[\\/]+$/, "");
  if (!filePath.startsWith(root)) {
    await sendResponse(req, res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    return;
  }
  let stats;
  try {
    stats = await fs2.stat(filePath);
  } catch {
  }
  let pageDir;
  if (stats) {
    if (stats.isDirectory()) {
      pageDir = filePath;
    } else {
      pageDir = dirname(filePath);
    }
  } else {
    if (originalPathname.endsWith("/")) {
      pageDir = filePath;
    } else {
      pageDir = dirname(filePath);
    }
  }
  const relDir = pageDir.slice(root.length).replace(/^[\/\\]+/, "");
  const parts = relDir.split(/[\\/]/).filter(Boolean);
  const middlewareDirs = [];
  let current = root;
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  const middlewares = [];
  for (const dir of middlewareDirs) {
    const mwPath = join(dir, "middleware.mjs");
    let mwModule;
    try {
      await fs2.access(mwPath);
      const url = pathToFileURL(mwPath).href;
      mwModule = await import(url);
    } catch {
      continue;
    }
    const mwKeys = Object.keys(mwModule).sort();
    for (const key of mwKeys) {
      const f = mwModule[key];
      if (typeof f === "function" && !middlewares.some((existing) => existing === f)) {
        middlewares.push(f);
      }
    }
  }
  let isDynamic = false;
  let handlerPath = filePath;
  if (stats && stats.isDirectory()) {
    const pageMjsPath = join(filePath, "page.mjs");
    try {
      await fs2.access(pageMjsPath);
      handlerPath = pageMjsPath;
      isDynamic = true;
    } catch {
      handlerPath = join(filePath, "index.html");
      isDynamic = false;
    }
  } else {
    handlerPath = filePath;
    isDynamic = false;
  }
  let hasHandler = false;
  try {
    await fs2.access(handlerPath);
    hasHandler = true;
  } catch {
  }
  const finalHandler = async (req2, res2) => {
    if (!hasHandler) {
      await respondWithErrorPage(root, pathname, 404, req2, res2);
      return;
    }
    if (isDynamic) {
      try {
        const resultHTML = await buildDynamicPage(resolve(handlerPath), DIST_DIR, req2, res2);
        if (resultHTML === false) {
          return;
        }
        await sendResponse(req2, res2, 200, { "Content-Type": MIME_TYPES[".html"] }, resultHTML);
      } catch (err) {
        log.error("Error building dynamic page -", err);
      }
    } else {
      const ext = extname(handlerPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const data = await fs2.readFile(handlerPath);
      await sendResponse(req2, res2, 200, { "Content-Type": contentType }, data);
    }
  };
  const composed = composeMiddlewares(middlewares, finalHandler, { isApi: false, root, pathname });
  await composed(req, res);
}
async function handleApiRequest(root, pathname, req, res) {
  const apiSubPath = pathname.slice("/api/".length);
  const parts = apiSubPath.split("/").filter(Boolean);
  const routeDir = join(root, pathname);
  const routePath = join(routeDir, "route.mjs");
  let hasRoute = false;
  try {
    await fs2.access(routePath);
    hasRoute = true;
  } catch {
  }
  let fn = null;
  let module = null;
  if (hasRoute) {
    try {
      const moduleUrl = pathToFileURL(routePath).href;
      module = await import(moduleUrl);
      fn = module[req.method];
    } catch (err) {
      console.error(err);
      return respondWithJsonError(req, res, 500, "Internal Server Error");
    }
  }
  const middlewareDirs = [];
  let current = join(root, "api");
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  const middlewares = [];
  for (const dir of middlewareDirs) {
    const mwPath = join(dir, "middleware.mjs");
    let mwModule;
    try {
      await fs2.access(mwPath);
      const url = pathToFileURL(mwPath).href;
      mwModule = await import(url);
    } catch {
      continue;
    }
    const mwKeys = Object.keys(mwModule).sort();
    for (const key of mwKeys) {
      const f = mwModule[key];
      if (typeof f === "function" && !middlewares.some((existing) => existing === f)) {
        middlewares.push(f);
      }
    }
  }
  const finalHandler = async (req2, res2) => {
    if (!hasRoute) {
      return respondWithJsonError(req2, res2, 404, "Not Found");
    }
    if (typeof fn !== "function") {
      return respondWithJsonError(req2, res2, 405, "Method Not Allowed");
    }
    await fn(req2, res2);
  };
  const composed = composeMiddlewares(middlewares, finalHandler, { isApi: true });
  await composed(req, res);
}
function composeMiddlewares(mws, final, options2) {
  return async function(req, res) {
    let index = 0;
    async function dispatch(err) {
      if (err) {
        if (options2.isApi) {
          return respondWithJsonError(req, res, 500, err.message || "Internal Server Error");
        } else {
          return await respondWithErrorPage(options2.root, options2.pathname, 500, req, res);
        }
      }
      if (index >= mws.length) {
        return await final(req, res);
      }
      const thisMw = mws[index++];
      const next = (e) => dispatch(e);
      const onceNext = (nextFn) => {
        let called = false;
        return async (e) => {
          if (called) {
            log.warn("next() was called in a middleware more than once.");
            return;
          }
          called = true;
          await nextFn(e);
        };
      };
      try {
        await thisMw(req, res, onceNext(next));
      } catch (error) {
        await dispatch(error);
      }
    }
    await dispatch();
  };
}
async function respondWithJsonError(req, res, code, message) {
  const body2 = JSON.stringify({ error: message });
  await sendResponse(req, res, code, { "Content-Type": "application/json; charset=utf-8" }, body2);
}
async function respondWithErrorPage(root, pathname, code, req, res) {
  let currentPath = normalize(join(root, decodeURIComponent(pathname)));
  let tried = /* @__PURE__ */ new Set();
  let errorFilePath = null;
  while (currentPath.startsWith(root)) {
    const candidate = join(currentPath, `${code}.html`);
    if (!tried.has(candidate)) {
      try {
        await fs2.access(candidate);
        errorFilePath = candidate;
        break;
      } catch {
      }
      tried.add(candidate);
    }
    const parent = dirname(currentPath);
    if (parent === currentPath) break;
    currentPath = parent;
  }
  if (!errorFilePath) {
    const fallback = join(root, `${code}.html`);
    try {
      await fs2.access(fallback);
      errorFilePath = fallback;
    } catch {
    }
  }
  if (errorFilePath) {
    try {
      const html = await fs2.readFile(errorFilePath, "utf8");
      await sendResponse(req, res, code, { "Content-Type": "text/html; charset=utf-8" }, html);
      return;
    } catch {
    }
  }
  await sendResponse(req, res, code, { "Content-Type": "text/plain; charset=utf-8" }, `${code} Error`);
}
function isCompressible(contentType) {
  if (!contentType) return false;
  return /text\/|javascript|json|xml|svg/.test(contentType);
}
async function sendResponse(req, res, status, headers, body2) {
  if (typeof body2 === "string") {
    body2 = Buffer.from(body2);
  }
  const accept = req.headers["accept-encoding"] || "";
  let encoding = null;
  if (accept.match(/\bgzip\b/)) {
    encoding = "gzip";
  } else if (accept.match(/\bdeflate\b/)) {
    encoding = "deflate";
  }
  if (!encoding || !isCompressible(headers["Content-Type"] || "")) {
    res.writeHead(status, headers);
    res.end(body2);
    return;
  }
  const compressor = encoding === "gzip" ? gzipAsync : deflateAsync;
  try {
    const compressed = await compressor(body2);
    headers["Content-Encoding"] = encoding;
    headers["Vary"] = "Accept-Encoding";
    res.writeHead(status, headers);
    res.end(compressed);
  } catch (err) {
    log.error("Compression error:", err);
    res.writeHead(status, headers);
    res.end(body2);
  }
}

// src/build.ts
var __filename = fileURLToPath3(import.meta.url);
var __dirname = path2.dirname(__filename);
var packageDir2 = path2.resolve(__dirname, "..");
var builderPath = path2.resolve(packageDir2, "./dist/page_compiler.mjs");
var yellow = (text) => {
  return `\x1B[38;2;238;184;68m${text}`;
};
var bold = (text) => {
  return `\x1B[1m${text}`;
};
var white = (text) => {
  return `\x1B[38;2;255;247;229m${text}`;
};
var green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
};
var finishLog = (...text) => {
  log.info(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
var options = process.env.OPTIONS;
var getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs3.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path2.join(dir, item.name);
      const relativePath = path2.relative(baseDir, fullPath);
      directories.push(relativePath);
      directories = directories.concat(getAllSubdirectories(fullPath, baseDir));
    }
  }
  return directories;
};
var child = void 0;
var isBuilding = false;
var runBuild = (filepath, DIST_DIR) => {
  const optionsString = JSON.stringify(options);
  if (isBuilding) {
    return;
  }
  if (child !== void 0) {
    child.removeAllListeners();
    child.kill("SIGKILL");
  }
  child = child_process.spawn("node", [filepath], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
    env: { ...process.env, DIST_DIR, OPTIONS: optionsString, PACKAGE_PATH: packageDir2 }
  });
  child.on("error", () => {
    log.error("Failed to start child process.");
  });
  child.on("exit", () => {
    isBuilding = false;
    log.info("Builder process complete");
  });
  child.on("message", (message) => {
    const { data } = message;
    if (data === "hard-reload") {
      httpStream?.write(`data: hard-reload

`);
    } else if (data === "soft-reload") {
      httpStream?.write(`data: reload

`);
    } else if (data === "compile-finish") {
      isBuilding = false;
      if (options.postCompile) {
        finishLog(
          white("Calling post-compile hook..")
        );
        options.postCompile();
      }
    } else if (data === "set-layouts") {
      globalThis.__SERVER_CURRENT_LAYOUTS__ = new Map(JSON.parse(message.layouts));
      globalThis.__SERVER_CURRENT_LAYOUT_ID__ = parseInt(message.currentLayoutId);
    }
  });
};
var build = (DIST_DIR) => {
  runBuild(builderPath, DIST_DIR);
};
var isTimedOut = false;
var currentWatchers = [];
var httpStream;
var registerListener = async () => {
  const server = http.createServer((req, res) => {
    if (req.url === "/events") {
      finishLog(white("Client listening for changes.."));
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
      });
      httpStream = res;
      httpStream.write(`data: ping

`);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  server.listen(options.hotReload.port, () => {
    finishLog(bold(green("Hot-Reload server online!")));
  });
};
var compile = async (props) => {
  options = props;
  setQuiet(options.quiet ?? false);
  const watch = options.hotReload !== void 0;
  const BUILD_FLAG = path2.join(options.outputDirectory, "ELEGANCE_BUILD_FLAG");
  if (!fs3.existsSync(options.outputDirectory)) {
    fs3.mkdirSync(options.outputDirectory, { recursive: true });
    fs3.writeFileSync(
      path2.join(BUILD_FLAG),
      "This file just marks this directory as one containing an Elegance Build.",
      "utf-8"
    );
  } else {
    if (!fs3.existsSync(BUILD_FLAG)) {
      throw `The output directory already exists, but is not an Elegance Build directory.`;
    }
  }
  const DIST_DIR = path2.join(props.outputDirectory, "dist");
  if (!fs3.existsSync(DIST_DIR)) {
    fs3.mkdirSync(DIST_DIR, { recursive: true });
  }
  if (props.server != void 0 && props.server.runServer == true) {
    startServer({
      root: props.server.root ?? DIST_DIR,
      environment: props.environment,
      port: props.server.port ?? 3e3,
      host: props.server.host ?? "localhost",
      DIST_DIR
    });
  }
  if (watch) {
    await registerListener();
    for (const watcher of currentWatchers) {
      watcher.close();
    }
    let extra = [];
    if (options.hotReload?.extraWatchDirectories) {
      const dirs = options.hotReload?.extraWatchDirectories ?? [];
      if (dirs.length !== 0) {
        for (const dir of dirs) {
          const subdirs = getAllSubdirectories(dir).map((f) => path2.join(dir, f));
          extra.push(...subdirs);
        }
      }
    }
    const pagesSubDirs = getAllSubdirectories(options.pagesDirectory).map((f) => path2.join(options.pagesDirectory, f));
    const subdirectories = [...pagesSubDirs, options.pagesDirectory, ...extra];
    finishLog(yellow("Hot-Reload Watching Subdirectories: "), ...subdirectories.join(", "));
    const watcherFn = async () => {
      return;
      if (isTimedOut) return;
      isTimedOut = true;
      process.stdout.write("\x1Bc");
      setTimeout(async () => {
        build(DIST_DIR);
        isTimedOut = false;
      }, 100);
    };
    for (const directory of subdirectories) {
      const watcher = fs3.watch(
        directory,
        {},
        watcherFn
      );
      currentWatchers.push(watcher);
    }
  }
  build(DIST_DIR);
};
export {
  compile
};
