// src/page_compiler.ts
import fs2 from "fs";
import path from "path";
import { registerLoader, setArcTsConfig } from "ts-arc";

// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var als = new AsyncLocalStorage();
var runAls = als.run;
var getStore = () => {
  const store = als.getStore();
  if (store === void 0)
    throw new Error("Tried to access ALS outside of ALS context.");
  return store;
};

// src/page_compiler.ts
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
  requiredClientModules = {},
  environment
}) => {
  let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  if (environment === "production") {
    StartTemplate += `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
  }
  StartTemplate += '<meta charset="UTF-8">';
  for (const [globalName] of Object.entries(requiredClientModules)) {
    StartTemplate += `<script data-module="true" src="/shipped/${globalName}.js" defer="true"></script>`;
  }
  if (addPageScriptTag === true) {
    const sanitized = pageURL === "" ? "/" : `/${pageURL}`;
    StartTemplate += `<script data-page="true" type="module" data-pathname="${sanitized}" src="${sanitized.endsWith("/") ? sanitized : sanitized + "/"}${name}_data.js" defer="true"></script>`;
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

// src/server/server.ts
import { createServer as createHttpServer } from "http";
import { promises as fs } from "fs";
import { join, normalize, extname, dirname } from "path";
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

// src/server/server.ts
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
  pagesDirectory,
  port = 3e3,
  host = "localhost",
  environment = "production",
  DIST_DIR: DIST_DIR2
}) {
  if (!root) throw new Error("Root directory must be specified.");
  if (!pagesDirectory) throw new Error("Pages directory must be specified.");
  root = normalize(root).replace(/[\\/]+$/, "");
  pagesDirectory = normalize(pagesDirectory).replace(/[\\/]+$/, "");
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
        await handleApiRequest(pagesDirectory, url.pathname, req, res);
      } else if (PAGE_MAP.has(url.pathname)) {
        await handlePageRequest(root, pagesDirectory, url.pathname, req, res, DIST_DIR2, PAGE_MAP.get(url.pathname));
      } else {
        await handleStaticRequest(root, pagesDirectory, url.pathname, req, res, DIST_DIR2);
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
async function getTargetInfo(root, pathname) {
  const originalPathname = pathname;
  const filePath = normalize(join(root, decodeURIComponent(pathname))).replace(/[\\/]+$/, "");
  if (!filePath.startsWith(root)) {
    throw new Error("Forbidden");
  }
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
  }
  let targetDir;
  if (stats) {
    targetDir = stats.isDirectory() ? filePath : dirname(filePath);
  } else {
    targetDir = originalPathname.endsWith("/") ? filePath : dirname(filePath);
  }
  return { filePath, targetDir, stats };
}
function getMiddlewareDirs(base, parts) {
  const middlewareDirs = [];
  let current = base;
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  return middlewareDirs;
}
async function collectMiddlewares(dirs) {
  const middlewares = [];
  for (const dir of dirs) {
    const mwPath = join(dir, "middleware.ts");
    let mwModule;
    try {
      await fs.access(mwPath);
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
  return middlewares;
}
async function handlePageRequest(root, pagesDirectory, pathname, req, res, DIST_DIR2, pageInfo) {
  try {
    const { filePath, targetDir, stats } = await getTargetInfo(root, pathname);
    const relDir = targetDir.slice(root.length).replace(/^[\/\\]+/, "");
    const parts = relDir.split(/[\\/]/).filter(Boolean);
    const middlewareDirs = getMiddlewareDirs(pagesDirectory, parts);
    const middlewares = await collectMiddlewares(middlewareDirs);
    let isDynamic = pageInfo.isDynamic;
    const handlerPath = isDynamic ? pageInfo.filePath : join(filePath, "index.html");
    let hasHandler = false;
    try {
      await fs.access(handlerPath);
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
          const result = await buildDynamicPage(
            DIST_DIR2,
            pathname,
            pageInfo,
            req2,
            res2
          );
          if (result === false) {
            return;
          }
          const { resultHTML } = result;
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
        const data = await fs.readFile(handlerPath);
        await sendResponse(req2, res2, 200, { "Content-Type": contentType }, data);
      }
    };
    const composed = composeMiddlewares(middlewares, finalHandler, { isApi: false, root, pathname });
    await composed(req, res);
  } catch (err) {
    if (err.message === "Forbidden") {
      await sendResponse(req, res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    } else {
      throw err;
    }
  }
}
async function handleStaticRequest(root, pagesDirectory, pathname, req, res, DIST_DIR2) {
  try {
    const { filePath, targetDir, stats } = await getTargetInfo(root, pathname);
    const relDir = targetDir.slice(root.length).replace(/^[\/\\]+/, "");
    const parts = relDir.split(/[\\/]/).filter(Boolean);
    const middlewareDirs = getMiddlewareDirs(pagesDirectory, parts);
    const middlewares = await collectMiddlewares(middlewareDirs);
    let handlerPath = filePath;
    if (stats && stats.isDirectory()) {
      handlerPath = join(filePath, "index.html");
    } else {
      handlerPath = filePath;
    }
    let hasHandler = false;
    try {
      await fs.access(handlerPath);
      hasHandler = true;
    } catch {
    }
    const finalHandler = async (req2, res2) => {
      if (!hasHandler) {
        await respondWithErrorPage(root, pathname, 404, req2, res2);
        return;
      }
      const ext = extname(handlerPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const data = await fs.readFile(handlerPath);
      await sendResponse(req2, res2, 200, { "Content-Type": contentType }, data);
    };
    const composed = composeMiddlewares(middlewares, finalHandler, { isApi: false, root, pathname });
    await composed(req, res);
  } catch (err) {
    if (err.message === "Forbidden") {
      await sendResponse(req, res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    } else {
      throw err;
    }
  }
}
async function handleApiRequest(pagesDirectory, pathname, req, res) {
  const apiSubPath = pathname.slice("/api/".length);
  const parts = apiSubPath.split("/").filter(Boolean);
  const middlewareDirs = getMiddlewareDirs(join(pagesDirectory, "api"), parts);
  const middlewares = await collectMiddlewares(middlewareDirs);
  const routeDir = middlewareDirs[middlewareDirs.length - 1];
  const routePath = join(routeDir, "route.ts");
  let hasRoute = false;
  try {
    await fs.access(routePath);
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
        await fs.access(candidate);
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
      await fs.access(fallback);
      errorFilePath = fallback;
    } catch {
    }
  }
  if (errorFilePath) {
    try {
      const html2 = await fs.readFile(errorFilePath, "utf8");
      await sendResponse(req, res, code, { "Content-Type": "text/html; charset=utf-8" }, html2);
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

// src/server/loadHook.ts
var resetLoadHooks = () => {
  const store = getStore();
  store.loadHooks = [];
};
var getLoadHooks = () => {
  const store = getStore();
  return store.loadHooks;
};

// src/server/state.ts
var initializeState = () => {
  const store = getStore();
  store.currentState = [];
};
var getState = () => {
  return getStore().currentState;
};
var initializeObjectAttributes = () => {
  getStore().currentObjectAttributes = [];
};
var getObjectAttributes = () => {
  return getStore().currentObjectAttributes;
};

// src/page_compiler.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
setArcTsConfig(__dirname);
registerLoader();
var packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  packageDir = path.resolve(__dirname, "..");
}
var clientPath = path.resolve(packageDir, "./dist/client/client.mjs");
var watcherPath = path.resolve(packageDir, "./dist/client/watcher.mjs");
var shippedModules = /* @__PURE__ */ new Map();
var modulesToShip = [];
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
var log2 = (...text) => {
  if (options.quiet) return;
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
var options = JSON.parse(process.env.OPTIONS);
var DIST_DIR = process.env.DIST_DIR;
var PAGE_MAP = /* @__PURE__ */ new Map();
var LAYOUT_MAP2 = /* @__PURE__ */ new Map();
var getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs2.readdirSync(dir, { withFileTypes: true });
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
var buildClient = async (DIST_DIR2) => {
  let clientString = "window.__name = (func) => func; ";
  clientString += fs2.readFileSync(clientPath, "utf-8");
  if (options.hotReload !== void 0) {
    clientString += `const watchServerPort = ${options.hotReload.port}`;
    clientString += fs2.readFileSync(watcherPath, "utf-8");
  }
  const transformedClient = await esbuild.transform(clientString, {
    minify: options.environment === "production",
    drop: options.environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: false,
    format: "iife",
    platform: "node",
    loader: "ts"
  });
  fs2.writeFileSync(
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
var pageToHTML = async (pageLocation, pageElements, metadata, DIST_DIR2, pageName, doWrite = true, requiredClientModules = {}, layout, pathname = "") => {
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
    pageURL: pathname,
    head: metadata,
    addPageScriptTag: doWrite,
    name: pageName,
    requiredClientModules,
    environment: options.environment
  });
  let extraBodyHTML = "";
  if (doWrite === false) {
    const state = getState();
    const pageLoadHooks = getLoadHooks();
    const userObjectAttributes = getObjectAttributes();
    const {
      result
    } = await generateClientPageData(
      pathname,
      state || {},
      [...objectAttributes, ...userObjectAttributes],
      pageLoadHooks || [],
      DIST_DIR2,
      "page",
      "pd",
      false
    );
    const sanitized = pathname === "" ? "/" : `/${pathname}`;
    extraBodyHTML = `<script data-hook="true" data-pathname="${sanitized}" type="text/plain">${result}</script>`;
    extraBodyHTML += `<script>
            const text = document.querySelector('[data-hook="true"][data-pathname="${sanitized}"][type="text/plain"').textContent;
            const blob = new Blob([text], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            
            const script = document.createElement("script");
            script.src = url;
            script.type = "module";
            script.setAttribute("data-page", "true");
            script.setAttribute("data-pathname", "${sanitized}");
            
            document.head.appendChild(script);
            
            document.currentScript.remove();
        </script>`;
    extraBodyHTML = extraBodyHTML.replace(/\s+/g, " ").replace(/\s*([{}();,:])\s*/g, "$1").trim();
  }
  const headHTML = `<!DOCTYPE html>${layout.metadata.startHTML}${layout.scriptTag}${internals}${builtMetadata}${layout.metadata.endHTML}`;
  const bodyHTML = `${layout.pageContent.startHTML}${renderedPage.bodyHTML}${extraBodyHTML}${layout.pageContent.endHTML}`;
  const resultHTML = `${headHTML}${bodyHTML}`;
  const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
  if (doWrite) {
    const dirname2 = path.dirname(htmlLocation);
    if (fs2.existsSync(dirname2) === false) {
      fs2.mkdirSync(dirname2, { recursive: true });
    }
    fs2.writeFileSync(
      htmlLocation,
      resultHTML,
      {
        encoding: "utf-8",
        flag: "w"
      }
    );
    return objectAttributes;
  }
  return resultHTML;
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR2, pageName, globalVariableName = "pd", write = true) => {
  let clientPageJSText = "";
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
      for (const loadHook2 of pageLoadHooks) {
        clientPageJSText += `{fn:${loadHook2.fn}},`;
      }
      clientPageJSText += "],";
    }
    clientPageJSText += `};`;
  }
  const pageDataPath = path.join(DIST_DIR2, pageLocation, `${pageName}_data.js`);
  let sendHardReloadInstruction = false;
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: options.environment === "production" }).catch((error) => {
    console.error("Failed to transform client page js!", error);
  });
  if (!transformedResult) return { sendHardReloadInstruction };
  if (fs2.existsSync(pageDataPath)) {
    const content = fs2.readFileSync(pageDataPath).toString();
    if (content !== transformedResult.code) {
      sendHardReloadInstruction = true;
    }
  }
  if (write) fs2.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction, result: transformedResult.code };
};
var generateLayout = async (DIST_DIR2, filePath, directory, generateDynamic = false) => {
  const store = getStore();
  const id = store.currentStateId += 1;
  const childIndicator = `<template layout-id="${id}"></template>`;
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  let layoutElements;
  let metadataElements;
  let modules = [];
  let isDynamicLayout = false;
  try {
    const {
      layout,
      metadata,
      isDynamic,
      shippedModules: shippedModules2
    } = await import("file://" + filePath);
    if (shippedModules2 !== void 0) {
      modules = shippedModules2;
    }
    layoutElements = layout;
    metadataElements = metadata;
    if (isDynamic === true) {
      isDynamicLayout = isDynamic;
    }
  } catch (e) {
    throw new Error(`Error in Page: ${directory === "" ? "/" : directory}layout.ts - ${e}`);
  }
  LAYOUT_MAP2.set(directory === "" ? "/" : `/${directory}`, {
    isDynamic: isDynamicLayout,
    filePath
  });
  if (isDynamicLayout === true && generateDynamic === false) return false;
  {
    if (!layoutElements) {
      throw new Error(`WARNING: ${filePath} should export a const layout, which is of type Layout: (child: Child) => AnyBuiltElement.`);
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
      throw new Error(`WARNING: ${filePath} should export a const metadata, which is of type LayoutMetadata: (child: Child) => AnyBuiltElement.`);
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
    directory
  );
  const metadataHTML = metadataElements ? renderRecursively(metadataElements) : "";
  await generateClientPageData(
    directory,
    state || {},
    [...objectAttributes, ...foundObjectAttributes],
    pageLoadHooks || [],
    DIST_DIR2,
    "layout",
    "ld"
  );
  return { pageContentHTML: renderedPage.bodyHTML, metadataHTML, childIndicator };
};
var builtLayouts = /* @__PURE__ */ new Map();
var buildLayouts = async () => {
  const pagesDirectory = path.resolve(options.pagesDirectory);
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(pagesDirectory, directory));
    const files = fs2.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 3);
      const isLayout = name === "layout";
      if (isLayout == false) {
        continue;
      }
      try {
        const builtLayout = await buildLayout(filePath, directory);
        if (!builtLayout) return { shouldClientHardReload: false };
        builtLayouts.set(filePath, builtLayout);
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  }
  return { shouldClientHardReload };
};
var buildLayout = async (filePath, directory, generateDynamic = false) => {
  const result = await runAls({}, async () => await generateLayout(
    DIST_DIR,
    filePath,
    directory,
    generateDynamic
  ));
  if (result === false) return false;
  const { pageContentHTML, metadataHTML, childIndicator } = result;
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
  const pathname = directory === "" ? "/" : directory;
  return {
    pageContent: splitAt(pageContentHTML, childIndicator),
    metadata: splitAround(metadataHTML, childIndicator),
    scriptTag: `<script data-layout="true" type="module" src="${pathname}layout_data.js" data-pathname="${pathname}" defer="true"></script>`
  };
};
var fetchPageLayoutHTML = async (dirname2) => {
  const relative = path.relative(options.pagesDirectory, dirname2);
  let split = relative.split(path.sep).filter(Boolean);
  split.push("/");
  split.reverse();
  let layouts = [];
  for (const dir of split) {
    if (LAYOUT_MAP2.has(dir)) {
      const filePath = path.join(path.resolve(options.pagesDirectory), dir, "layout.ts");
      const layout = LAYOUT_MAP2.get(dir);
      if (layout.isDynamic) {
        const builtLayout = await buildLayout(layout.filePath, dir, true);
        if (!builtLayout) continue;
        layouts.push(builtLayout);
      } else {
        layouts.push(builtLayouts.get(filePath));
      }
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
  const pagesDirectory = path.resolve(options.pagesDirectory);
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(pagesDirectory, directory));
    const files = fs2.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 3);
      const isPage = name === "page";
      if (isPage == false) {
        continue;
      }
      try {
        const hardReloadForPage = await runAls({}, async () => await buildPage(DIST_DIR2, directory, filePath, name));
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
  let pageElements;
  let metadata;
  let modules = {};
  let pageIgnoresLayout = false;
  let isDynamicPage = false;
  try {
    const {
      page,
      metadata: pageMetadata,
      isDynamic,
      shippedModules: shippedModules2,
      ignoreLayout
    } = await import("file://" + filePath);
    if (shippedModules2 !== void 0) {
      modules = shippedModules2;
    }
    if (ignoreLayout) {
      pageIgnoresLayout = true;
    }
    pageElements = page;
    metadata = pageMetadata;
    if (isDynamic === true) {
      isDynamicPage = isDynamic;
    }
  } catch (e) {
    throw new Error(`Error in Page: ${directory}/${name}.ts - ${e}`);
  }
  PAGE_MAP.set(directory === "" ? "/" : `/${directory}`, {
    isDynamic: isDynamicPage,
    filePath
  });
  if (isDynamicPage) return false;
  if (modules !== void 0) {
    for (const [globalName, path2] of Object.entries(modules)) {
      modulesToShip.push({ globalName, path: path2 });
    }
  }
  if (!metadata || metadata && typeof metadata !== "function") {
    console.warn(`WARNING: ${filePath} does not export a metadata function.`);
  }
  if (!pageElements) {
    console.warn(`WARNING: ${filePath} should export a const page, which is of type () => BuiltElement<"body">.`);
  }
  const pageProps = {
    pageName: directory
  };
  if (typeof pageElements === "function") {
    if (pageElements.constructor.name === "AsyncFunction") {
      pageElements = await pageElements(pageProps);
    } else {
      pageElements = pageElements(pageProps);
    }
  }
  const state = getState();
  const pageLoadHooks = getLoadHooks();
  const objectAttributes = getObjectAttributes();
  const layout = await fetchPageLayoutHTML(path.dirname(filePath));
  const foundObjectAttributes = await pageToHTML(
    path.join(DIST_DIR2, directory),
    pageElements || body(),
    metadata ?? (() => head()),
    DIST_DIR2,
    name,
    true,
    modules,
    layout,
    directory
  );
  const {
    sendHardReloadInstruction
  } = await generateClientPageData(
    directory,
    state || {},
    [...objectAttributes, ...foundObjectAttributes],
    pageLoadHooks || [],
    DIST_DIR2,
    name
  );
  return sendHardReloadInstruction === true;
};
var buildDynamicPage = async (DIST_DIR2, directory, pageInfo, req, res) => {
  directory = directory === "/" ? "" : directory;
  const filePath = pageInfo.filePath;
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  let pageElements = async (props) => body();
  let metadata = async (props) => html();
  let modules = {};
  let pageIgnoresLayout = false;
  let isDynamicPage = false;
  try {
    const {
      page,
      metadata: pageMetadata,
      isDynamic,
      shippedModules: shippedModules2,
      ignoreLayout,
      requestHook
    } = await import("file://" + filePath);
    if (requestHook) {
      const hook = requestHook;
      const doContinue = await hook(req, res);
      if (!doContinue) {
        return false;
      }
    }
    if (shippedModules2 !== void 0) {
      modules = shippedModules2;
    }
    if (ignoreLayout) {
      pageIgnoresLayout = true;
    }
    pageElements = page;
    metadata = pageMetadata;
    if (isDynamic === true) {
      isDynamicPage = isDynamic;
    }
  } catch (e) {
    throw new Error(`Error in Page: ${directory}/page.ts - ${e}`);
  }
  if (modules !== void 0) {
    for (const [globalName, path2] of Object.entries(modules)) {
      modulesToShip.push({ globalName, path: path2 });
    }
  }
  if (!metadata || metadata && typeof metadata !== "function") {
    console.warn(`WARNING: ${filePath} does not export a metadata function.`);
  }
  if (!pageElements) {
    console.warn(`WARNING: ${filePath} should export a const page, which is of type () => BuiltElement<"body">.`);
  }
  const pageProps = {
    pageName: directory
  };
  if (typeof pageElements === "function") {
    if (pageElements.constructor.name === "AsyncFunction") {
      pageElements = await pageElements(pageProps);
    } else {
      pageElements = pageElements(pageProps);
    }
  }
  const layout = await fetchPageLayoutHTML(path.dirname(filePath));
  const resultHTML = await pageToHTML(
    path.join(DIST_DIR2, directory),
    pageElements,
    metadata,
    DIST_DIR2,
    "page",
    false,
    modules,
    layout,
    directory
  );
  await shipModules();
  return { resultHTML };
};
var shipModules = async () => {
  for (const plugin of modulesToShip) {
    {
      if (shippedModules.has(plugin.globalName)) continue;
      shippedModules.set(plugin.globalName, true);
    }
    esbuild.build({
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
  modulesToShip = [];
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
      log2(bold(yellow(" -- Elegance.JS -- ")));
      if (options.environment === "production") {
        log2(
          " - ",
          bgYellow(bold(black(" NOTE "))),
          " : ",
          white("In production mode, no "),
          underline("console.log() "),
          white("statements will be shown on the client, and all code will be minified.")
        );
        log2("");
      }
    }
    if (options.preCompile) {
      options.preCompile();
    }
    const start = performance.now();
    let shouldClientHardReload;
    {
      const { shouldClientHardReload: doReload } = await buildLayouts();
      if (doReload) shouldClientHardReload = true;
    }
    {
      const { shouldClientHardReload: doReload } = await buildPages(path.resolve(DIST_DIR));
      if (doReload) shouldClientHardReload = true;
    }
    await shipModules();
    const pagesBuilt = performance.now();
    await buildClient(DIST_DIR);
    const end = performance.now();
    if (options.publicDirectory) {
      log2("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), options.publicDirectory.path);
      if (fs2.existsSync(src) === false) {
        console.warn("WARNING: Public directory not found, an attempt will be made create it..");
        fs2.mkdirSync(src, { recursive: true });
      }
      await fs2.promises.cp(src, path.join(DIST_DIR), { recursive: true });
    }
    {
      log2(`Took ${Math.round(pagesBuilt - start)}ms to Build Pages.`);
      log2(`Took ${Math.round(end - pagesBuilt)}ms to Build Client.`);
    }
    if (options.server != void 0 && options.server.runServer == true) {
      startServer({
        root: options.server.root ?? DIST_DIR,
        environment: options.environment,
        port: options.server.port ?? 3e3,
        host: options.server.host ?? "localhost",
        DIST_DIR,
        pagesDirectory: options.pagesDirectory
      });
    }
    process.send?.({ event: "message", data: "compile-finish" });
    if (shouldClientHardReload) {
      process.send({ event: "message", data: "hard-reload" });
    } else {
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
  LAYOUT_MAP2 as LAYOUT_MAP,
  PAGE_MAP,
  buildDynamicPage,
  processPageElements
};
