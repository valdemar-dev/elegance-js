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
  name
}) => {
  let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">';
  if (addPageScriptTag === true) {
    HTMLTemplate += `<script data-tag="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
  }
  HTMLTemplate += `<script stype="module" src="/client.js" defer="true"></script>`;
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
var processPageElements = (element, objectAttributes, parent) => {
  if (typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) return element;
  if (typeof element === "string") {
    return element;
  }
  const processElementOptionsAsChildAndReturn = () => {
    const children = element.children;
    element.children = [
      element.options,
      ...children
    ];
    element.options = {};
    for (let i = 0; i < children.length + 1; i++) {
      const child = element.children[i];
      const processedChild = processPageElements(child, objectAttributes, element);
      element.children[i] = processedChild;
    }
    return {
      ...element,
      options: {}
    };
  };
  if (typeof element.options !== "object") {
    return processElementOptionsAsChildAndReturn();
  }
  const {
    tag: elementTag,
    options: elementOptions,
    children: elementChildren
  } = element.options;
  if (elementTag && elementOptions && elementChildren) {
    return processElementOptionsAsChildAndReturn();
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
      const processedChild = processPageElements(child, objectAttributes, element);
      element.children[i] = processedChild;
    }
  }
  return element;
};
var generateSuitablePageElements = async (pageLocation, pageElements, metadata, DIST_DIR, pageName) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    return [];
  }
  const objectAttributes = [];
  const processedPageElements = processPageElements(pageElements, objectAttributes, []);
  elementKey = 0;
  const renderedPage = await serverSideRenderPage(
    processedPageElements,
    pageLocation
  );
  const template = generateHTMLTemplate({
    pageURL: path.relative(DIST_DIR, pageLocation),
    head: metadata,
    addPageScriptTag: true,
    name: pageName
  });
  const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;
  return {
    objectAttributes,
    resultHTML
  };
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR, pageName) => {
  const pageDiff = path.relative(DIST_DIR, pageLocation);
  let clientPageJSText = `let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
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
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
  try {
    const {
      construct
    } = await import("file://" + filePath);
    const {
      page,
      metadata: pageMetadata,
      isDynamicPage,
      requestHook
    } = construct();
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
    throw new Error(`Error in Dynamic Page: ${filePath} - ${e}`);
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
    }
    pageElements = pageElements();
  }
  const state = getState();
  const pageLoadHooks = getLoadHooks();
  const objectAttributes = getObjectAttributes();
  const foundObjectAttributes = await generateSuitablePageElements(
    path.dirname(filePath),
    pageElements || body(),
    metadata ?? (() => head()),
    DIST_DIR,
    "page"
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

// src/log.ts
var quiet = false;
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
  console.info(`${getTimestamp()} ${color("[INFO]:", 34)}`, ...args);
}
function logWarn(...args) {
  if (quiet) return;
  console.warn(`${getTimestamp()} ${color("[WARN]:", 33)}`, ...args);
}
function logError(...args) {
  if (quiet) return;
  console.error(`${getTimestamp()} ${color("[ERROR]:", 31)}`, ...args);
}
var log = {
  info: logInfo,
  warn: logWarn,
  error: logError
};

// src/server/server.ts
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
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad Request");
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
      const url = new URL(req.url, `https://${req.headers.host}`);
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
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
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
      log.info(`Server running at https://${host}:${p}/`);
    });
    return server;
  }
  return attemptListen(port);
}
async function handleStaticRequest(root, pathname, req, res, DIST_DIR) {
  const originalPathname = pathname;
  let filePath = normalize(join(root, decodeURIComponent(pathname))).replace(/[\\/]+$/, "");
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
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
      await respondWithErrorPage(root, pathname, 404, res2);
      return;
    }
    if (isDynamic) {
      try {
        const resultHTML = await buildDynamicPage(resolve(handlerPath), DIST_DIR, req2, res2);
        if (resultHTML === false) {
          return;
        }
        res2.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
        res2.end(resultHTML);
      } catch (err) {
        log.error("Error building dynamic page -", err);
      }
    } else {
      const ext = extname(handlerPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const data = await fs2.readFile(handlerPath);
      res2.writeHead(200, { "Content-Type": contentType });
      res2.end(data);
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
      return respondWithJsonError(res, 500, "Internal Server Error");
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
      return respondWithJsonError(res2, 404, "Not Found");
    }
    if (typeof fn !== "function") {
      return respondWithJsonError(res2, 405, "Method Not Allowed");
    }
    await fn(req2, res2);
  };
  const composed = composeMiddlewares(middlewares, finalHandler, { isApi: true });
  await composed(req, res);
}
function composeMiddlewares(mws, final, options) {
  return async function(req, res) {
    let index = 0;
    async function dispatch(err) {
      if (err) {
        if (options.isApi) {
          return respondWithJsonError(res, 500, err.message || "Internal Server Error");
        } else {
          return await respondWithErrorPage(options.root, options.pathname, 500, res);
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
function respondWithJsonError(res, code, message) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: message }));
}
async function respondWithErrorPage(root, pathname, code, res) {
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
      const html = await fs2.readFile(errorFilePath);
      res.writeHead(code, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    } catch {
    }
  }
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(`${code} Error`);
}
export {
  startServer
};
