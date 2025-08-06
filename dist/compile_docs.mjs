// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

// src/build.ts
import fs2 from "fs";
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

// src/build.ts
import http from "http";

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};

// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

// src/server/layout.ts
var resetLayouts = () => globalThis.__SERVER_CURRENT_LAYOUTS__ = /* @__PURE__ */ new Map();
if (!globalThis.__SERVER_CURRENT_LAYOUT_ID__) globalThis.__SERVER_CURRENT_LAYOUT_ID__ = 1;
var layoutId = globalThis.__SERVER_CURRENT_LAYOUT_ID__;

// src/server/server.ts
import { createServer as createHttpServer } from "http";
import { promises as fs } from "fs";
import { join, normalize, extname, dirname } from "path";
import { pathToFileURL } from "url";
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
function startServer({ root, port = 3e3, host = "0.0.0.0", environment: environment2 = "production" }) {
  if (!root) throw new Error("Root directory must be specified.");
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
        if (environment2 === "development") {
          console.log(req.method, "::", req.url, "-", res.statusCode);
        }
        return;
      }
      const url = new URL(req.url, `https://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(root, url.pathname, req, res);
      } else {
        await handleStaticRequest(root, url.pathname, res);
      }
      if (environment2 === "development") {
        console.log(req.method, "::", req.url, "-", res.statusCode);
      }
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
    }
  };
  let server = createHttpServer(requestHandler);
  server.listen(port, host, () => {
    console.log(`Server running at https://${host}:${port}/`);
  });
  return server;
}
async function handleStaticRequest(root, pathname, res) {
  let filePath = normalize(join(root, decodeURIComponent(pathname)));
  root = normalize(root);
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
  }
  try {
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    await respondWithErrorPage(root, pathname, 404, res);
  }
}
async function handleApiRequest(root, pathname, req, res) {
  const routePath = join(root, pathname, "route.js");
  try {
    await fs.access(routePath);
  } catch {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  try {
    const moduleUrl = pathToFileURL(routePath).href;
    const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE, CONNECT } = await import(moduleUrl);
    let fn;
    switch (req.method) {
      case "GET":
        fn = GET;
        break;
      case "HEAD":
        fn = HEAD;
        break;
      case "POST":
        fn = POST;
        break;
      case "PUT":
        fn = PUT;
        break;
      case "PATCH":
        fn = PATCH;
        break;
      case "DELETE":
        fn = DELETE;
        break;
      case "OPTIONS":
        fn = OPTIONS;
        break;
      case "TRACE":
        fn = TRACE;
        break;
      case "CONNECT":
        fn = CONNECT;
        break;
      default:
        fn = null;
        return;
    }
    if (fn === null) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Unsupported method for route." }));
      return;
    }
    if (typeof fn !== "function") {
      throw new Error('API route module must export a "route" function.');
    }
    await fn(req, res);
  } catch {
    await respondWithErrorPage(root, pathname, 404, res);
  }
}
async function respondWithErrorPage(root, pathname, code, res) {
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
      const html = await fs.readFile(errorFilePath);
      res.writeHead(code, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    } catch {
    }
  }
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(`${code} Error`);
}

// src/build.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var clientPath = path.resolve(packageDir, "./src/client/client.ts");
var watcherPath = path.resolve(packageDir, "./src/client/watcher.ts");
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
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
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
var getProjectFiles = (pagesDirectory) => {
  const pageFiles = [];
  const apiFiles = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);
    const subdirectoryFiles = fs2.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".js") || f.name.endsWith(".ts"));
    for (const file of subdirectoryFiles) {
      if (file.name === "route.ts") {
        apiFiles.push(file);
        continue;
      } else if (file.name === "page.ts") {
        pageFiles.push(file);
        continue;
      }
      const name = file.name.slice(0, file.name.length - 3);
      const numberName = parseInt(name);
      if (isNaN(numberName) === false) {
        if (numberName >= 400 && numberName <= 599) {
          pageFiles.push(file);
          continue;
        }
      }
    }
  }
  return {
    pageFiles,
    apiFiles
  };
};
var buildClient = async (DIST_DIR) => {
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
    path.join(DIST_DIR, "/client.js"),
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
  const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
  fs2.writeFileSync(
    htmlLocation,
    resultHTML,
    {
      encoding: "utf-8",
      flag: "w"
    }
  );
  return objectAttributes;
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
  fs2.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var buildPages = async (DIST_DIR) => {
  resetLayouts();
  const subdirectories = [...getAllSubdirectories(DIST_DIR), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(DIST_DIR, directory));
    const files = fs2.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".js"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 3);
      const tempPath = file.parentPath + "/" + Date.now().toString() + ".mjs";
      await fs2.promises.copyFile(filePath, tempPath);
      const bytes = fs2.readFileSync(tempPath);
      const isPage = bytes.toString().startsWith("//__ELEGANCE_JS_PAGE_MARKER__");
      if (isPage == false) {
        fs2.rmSync(tempPath, { force: true });
        continue;
      }
      fs2.rmSync(filePath, { force: true });
      initializeState();
      resetLoadHooks();
      let pageElements;
      let metadata;
      try {
        const {
          page,
          metadata: pageMetadata
        } = await import("file://" + tempPath);
        pageElements = page;
        metadata = pageMetadata;
      } catch (e) {
        fs2.rmSync(tempPath, { force: true });
        throw `Error in Page: ${directory === "" ? "/" : directory}${file.name} - ${e}`;
      }
      fs2.rmSync(tempPath, { force: true });
      if (!metadata || metadata && typeof metadata !== "function") {
        console.warn(`WARNING: ${filePath} does not export a metadata function. This is *highly* recommended.`);
      }
      if (!pageElements) {
        console.warn(`WARNING: ${filePath} should export a const page, which is of type BuiltElement<"body">.`);
      }
      const state = getState();
      const pageLoadHooks = getLoadHooks();
      const objectAttributes = await generateSuitablePageElements(
        file.parentPath,
        pageElements || body(),
        metadata ?? (() => head()),
        DIST_DIR,
        name
      );
      const {
        sendHardReloadInstruction
      } = await generateClientPageData(
        file.parentPath,
        state || {},
        objectAttributes,
        pageLoadHooks || [],
        DIST_DIR,
        name
      );
      if (sendHardReloadInstruction === true) shouldClientHardReload = true;
    }
  }
  return {
    shouldClientHardReload
  };
};
var isTimedOut = false;
var httpStream;
var currentWatchers = [];
var registerListener = async () => {
  const server = http.createServer((req, res) => {
    if (req.url === "/events") {
      log(white("Client listening for changes.."));
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
    log(bold(green("Hot-Reload server online!")));
  });
};
var build = async (DIST_DIR) => {
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
    const { pageFiles, apiFiles } = getProjectFiles(options.pagesDirectory);
    {
      const existingCompiledPages = [...getAllSubdirectories(DIST_DIR), ""];
      for (const page of existingCompiledPages) {
        const pageFile = pageFiles.find((dir) => path.relative(options.pagesDirectory, dir?.parentPath ?? "") === page);
        const apiFile = apiFiles.find((dir) => path.relative(options.pagesDirectory, dir?.parentPath ?? "") === page);
        if (!pageFile && !apiFile) {
          const dir = path.join(DIST_DIR, page);
          if (fs2.existsSync(dir) === false) {
            continue;
          }
          fs2.rmdirSync(dir, { recursive: true });
          console.log("Deleted old file, ", pageFile);
        }
      }
    }
    const start = performance.now();
    {
      await esbuild.build({
        entryPoints: [
          ...pageFiles.map((page) => path.join(page.parentPath, page.name))
        ],
        minify: options.environment === "production",
        drop: options.environment === "production" ? ["console", "debugger"] : void 0,
        bundle: true,
        outdir: DIST_DIR,
        loader: {
          ".js": "js",
          ".ts": "ts"
        },
        format: "esm",
        platform: "node",
        keepNames: false,
        banner: {
          js: "//__ELEGANCE_JS_PAGE_MARKER__"
        }
      });
      await esbuild.build({
        entryPoints: [
          ...apiFiles.map((route) => path.join(route.parentPath, route.name))
        ],
        minify: options.environment === "production",
        drop: options.environment === "production" ? ["console", "debugger"] : void 0,
        bundle: false,
        outbase: path.join(options.pagesDirectory, "/api"),
        outdir: path.join(DIST_DIR, "/api"),
        loader: {
          ".js": "js",
          ".ts": "ts"
        },
        format: "esm",
        platform: "node",
        keepNames: false
      });
    }
    const pagesTranspiled = performance.now();
    const {
      shouldClientHardReload
    } = await buildPages(DIST_DIR);
    const pagesBuilt = performance.now();
    await buildClient(DIST_DIR);
    const end = performance.now();
    if (options.publicDirectory) {
      console.log("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), options.publicDirectory.path);
      await fs2.promises.cp(src, path.join(DIST_DIR), { recursive: true });
    }
    {
      log(`${Math.round(pagesTranspiled - start)}ms to Transpile Pages`);
      log(`${Math.round(pagesBuilt - pagesTranspiled)}ms to Build Pages`);
      log(`${Math.round(end - pagesBuilt)}ms to Build Client`);
      log(green(bold(`Compiled ${pageFiles.length} pages in ${Math.ceil(end - start)}ms!`)));
      for (const pageFile of pageFiles) {
        console.log(
          "- /" + path.relative(options.pagesDirectory, pageFile.parentPath),
          "(Page)"
        );
      }
      for (const apiFile of apiFiles) {
        "- /" + path.relative(options.pagesDirectory, apiFile.parentPath), "(API Route)";
      }
    }
    if (options.postCompile) {
      log(
        white("Calling post-compile hook..")
      );
      options.postCompile();
    }
    if (shouldClientHardReload) {
      console.log("Sending hard reload..");
      httpStream?.write(`data: hard-reload

`);
    } else {
      console.log("Sending soft reload..");
      httpStream?.write(`data: reload

`);
    }
  } catch (e) {
    console.error("Build Failed! Received Error:");
    console.error(e);
    return false;
  }
  return true;
};
var options;
var compile = async (props) => {
  options = props;
  const watch = options.hotReload !== void 0;
  const BUILD_FLAG = path.join(options.outputDirectory, "ELEGANCE_BUILD_FLAG");
  if (!fs2.existsSync(options.outputDirectory)) {
    fs2.mkdirSync(options.outputDirectory);
    fs2.writeFileSync(
      path.join(BUILD_FLAG),
      "This file just marks this directory as one containing an Elegance Build.",
      "utf-8"
    );
  } else {
    if (!fs2.existsSync(BUILD_FLAG)) {
      throw `The output directory already exists, but is not an Elegance Build directory.`;
    }
  }
  const DIST_DIR = path.join(props.outputDirectory, "dist");
  if (!fs2.existsSync(DIST_DIR)) {
    fs2.mkdirSync(DIST_DIR);
  }
  if (props.server != void 0 && props.server.runServer == true) {
    startServer({
      root: props.server.root ?? DIST_DIR,
      environment: props.environment,
      port: props.server.port ?? 3e3
    });
  }
  if (watch) {
    await registerListener();
    for (const watcher of currentWatchers) {
      watcher.close();
    }
    const subdirectories = [...getAllSubdirectories(options.pagesDirectory), ""];
    log(yellow("Hot-Reload Watching Subdirectories: "), ...subdirectories.join(", "));
    const watcherFn = async () => {
      if (isTimedOut) return;
      isTimedOut = true;
      process.stdout.write("\x1Bc");
      setTimeout(async () => {
        await build(DIST_DIR);
        isTimedOut = false;
      }, 100);
    };
    for (const directory of subdirectories) {
      const fullPath = path.join(options.pagesDirectory, directory);
      const watcher = fs2.watch(
        fullPath,
        {},
        watcherFn
      );
      currentWatchers.push(watcher);
    }
  }
  const success = await build(DIST_DIR);
  if (!success) return;
};

// src/compile_docs.ts
import { execSync } from "child_process";
import path2 from "path";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var PAGES_DIR = path2.join(__dirname2, "../src/docs");
var PUBLIC_DIR = path2.join(__dirname2, "../src/docs/public");
var OUTPUT_DIR = path2.join(__dirname2, "../docs");
var environmentArg = process.argv.find((arg) => arg.startsWith("--environment"));
if (!environmentArg) environmentArg = "--environment='production'";
var environment = environmentArg.split("=")[1];
console.log(`Environment: ${environment}`);
compile({
  pagesDirectory: PAGES_DIR,
  outputDirectory: OUTPUT_DIR,
  environment,
  publicDirectory: {
    path: PUBLIC_DIR,
    method: environment === "production" ? "recursive-copy" : "symlink"
  }
}).then(() => {
  if (environment === "production") {
    execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/dist/index.css --minify`);
  } else {
    execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/dist/index.css --watch=always`);
  }
});
