import fs from "fs";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate";
import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
import { serverSideRenderPage } from "../server/render";
import { getState, initializeState, initializeObjectAttributes, getObjectAttributes } from "../server/state";
import { getLoadHooks, resetLoadHooks } from "../server/loadHook";
import { resetLayouts } from "../server/layout";
import { renderRecursively } from "../server/render";
let PAGE_MAP = /* @__PURE__ */ new Map();
let LAYOUT_MAP = /* @__PURE__ */ new Map();
function populateServerMaps(pageMap, layoutMap) {
  LAYOUT_MAP = layoutMap;
  PAGE_MAP = pageMap;
}
let options;
let DIST_DIR;
let elementKey = 0;
const shippedModules = /* @__PURE__ */ new Map();
let modulesToShip = [];
let packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  packageDir = path.resolve(__dirname, "..");
}
const clientPath = path.resolve(packageDir, "./dist/client/client.mjs");
const watcherPath = path.resolve(packageDir, "./dist/client/watcher.mjs");
function setCompilationOptions(newOptions, distDir) {
  options = newOptions;
  DIST_DIR = distDir;
}
function getAllSubdirectories(dir, baseDir = dir) {
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
}
;
async function buildClient(DIST_DIR2) {
  let clientString = "window.__name = (func) => func; ";
  clientString += fs.readFileSync(clientPath, "utf-8");
  if (options.hotReload !== void 0) {
    clientString += `const watchServerPort = ${options.hotReload.port};`;
    clientString += fs.readFileSync(watcherPath, "utf-8");
  }
  await esbuild.build({
    minify: options.environment === "production",
    drop: options.environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: false,
    bundle: true,
    format: "iife",
    entryPoints: [clientPath],
    platform: "browser",
    outfile: path.join(DIST_DIR2, "/client.js"),
    loader: { ".ts": "ts" }
  });
}
;
function processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes) {
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
    case ObjectAttributeType.STATE:
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
    case ObjectAttributeType.OBSERVER:
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
    case ObjectAttributeType.REFERENCE:
      options2["ref"] = optionValue.value;
      break;
  }
  objectAttributes.push({ ...optionValue, key, attribute: optionFinal });
}
;
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
function processPageElements(element, objectAttributes, recursionLevel, stack = []) {
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
}
;
async function pageToHTML(pageLocation, pageElements, metadata, DIST_DIR2, pageName, doWrite = true, requiredClientModules = {}, layout, pathname = "") {
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
    const dirname = path.dirname(htmlLocation);
    if (fs.existsSync(dirname) === false) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(
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
}
;
async function generateClientPageData(pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR2, pageName, globalVariableName = "pd", write = true) {
  let clientPageJSText = "";
  {
    clientPageJSText += `${globalThis.__SERVER_PAGE_DATA_BANNER__}`;
  }
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
    const stateObjectAttributes = objectAttributes.filter((oa) => oa.type === ObjectAttributeType.STATE);
    if (stateObjectAttributes.length > 0) {
      const processed = [...stateObjectAttributes].map((soa) => {
        delete soa.type;
        return soa;
      });
      clientPageJSText += `soa:${JSON.stringify(processed)},`;
    }
    const observerObjectAttributes = objectAttributes.filter((oa) => oa.type === ObjectAttributeType.OBSERVER);
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
  const pageDataPath = path.join(DIST_DIR2, pageLocation, `${pageName}_data.js`);
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
  if (write) fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction, result: transformedResult.code };
}
;
async function generateLayout(DIST_DIR2, filePath, directory, childIndicator, generateDynamic = false) {
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
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
  LAYOUT_MAP.set(directory === "" ? "/" : `/${directory}`, {
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
  return { pageContentHTML: renderedPage.bodyHTML, metadataHTML };
}
;
const builtLayouts = /* @__PURE__ */ new Map();
async function buildLayouts() {
  const pagesDirectory = path.resolve(options.pagesDirectory);
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(pagesDirectory, directory));
    const files = fs.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
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
}
async function buildLayout(filePath, directory, generateDynamic = false) {
  const id = globalThis.__SERVER_CURRENT_STATE_ID__ += 1;
  const childIndicator = `<template layout-id="${id}"></template>`;
  const result = await generateLayout(
    DIST_DIR,
    filePath,
    directory,
    childIndicator,
    generateDynamic
  );
  if (result === false) return false;
  const { pageContentHTML, metadataHTML } = result;
  function splitAround(str, sub) {
    const i = str.indexOf(sub);
    if (i === -1) {
      throw new Error(`Whilst layout ${directory}, the splitter could not be found. Make sure to use the "child" prop passed into the layout.`);
    }
    return {
      startHTML: str.substring(0, i),
      endHTML: str.substring(i + sub.length)
    };
  }
  function splitAt(str, sub) {
    const i = str.indexOf(sub) + sub.length;
    if (i === -1) {
      throw new Error(`Whilst layout ${directory}, the splitter could not be found. Make sure to use the "child" prop passed into the layout's head.`);
    }
    return {
      startHTML: str.substring(0, i),
      endHTML: str.substring(i)
    };
  }
  const pathname = directory === "" ? "/" : directory;
  return {
    pageContent: splitAt(pageContentHTML, childIndicator),
    metadata: splitAround(metadataHTML, childIndicator),
    scriptTag: `<script data-layout="true" type="module" src="${pathname}layout_data.js" data-pathname="${pathname}" defer="true"></script>`
  };
}
;
async function fetchPageLayoutHTML(dirname) {
  const relative = path.relative(options.pagesDirectory, dirname);
  let split = relative.split(path.sep).filter(Boolean);
  split.push("/");
  split.reverse();
  let layouts = [];
  for (const dir of split) {
    if (!LAYOUT_MAP.has(dir)) {
      console.warn("A layout was not found within the layout map for a path:", dir, "This is normally not meant to be possible, so you might have royally screwed up.");
      continue;
    }
    const filePath = path.join(path.resolve(options.pagesDirectory), dir, "layout.ts");
    const layout = LAYOUT_MAP.get(dir);
    if (layout.isDynamic) {
      const builtLayout = await buildLayout(layout.filePath, dir, true);
      if (!builtLayout) continue;
      layouts.push(builtLayout);
    } else {
      if (!builtLayouts.has(filePath)) {
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
}
;
async function buildPages(DIST_DIR2) {
  resetLayouts();
  const pagesDirectory = path.resolve(options.pagesDirectory);
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(pagesDirectory, directory));
    const files = fs.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 3);
      const isPage = name === "page";
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
}
;
async function buildPage(DIST_DIR2, directory, filePath, name) {
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
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
    pageName: directory,
    middlewareData: {}
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
}
;
async function shipModules() {
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
}
;
function retrievePageAndLayoutMaps() {
  return { LAYOUT_MAP, PAGE_MAP };
}
export {
  LAYOUT_MAP,
  PAGE_MAP,
  buildClient,
  buildLayout,
  buildLayouts,
  buildPage,
  buildPages,
  fetchPageLayoutHTML,
  generateClientPageData,
  generateLayout,
  getAllSubdirectories,
  modulesToShip,
  pageToHTML,
  populateServerMaps,
  processPageElements,
  retrievePageAndLayoutMaps,
  setCompilationOptions,
  shipModules
};
