import path from "path";
import crypto from "crypto";
import { EleganceElement, SpecialElementOption } from "../elements/element";
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, watch, writeFileSync } from "fs";
import esbuild from "esbuild";
import { invalidPageError } from "../server/page";
import { invalidLayoutError } from "../server/layout";
import { allElements } from "../elements/element_list";
import { ObserverOption, ServerObserver } from "../client/observer";
import { fileURLToPath } from "url";
import util from "util";
import { AsyncLocalStorage } from "async_hooks";
import { ServerSubject } from "../client/state";
import { EventListenerOption, EventListener } from "../client/eventListener";
import { LoadHook } from "../client/loadHook";
import { formattedLog, LogLevel } from "../server/log";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { raw, unwrapAllRaw } from "../elements/raw";
let compilerOptions;
const compilerStore = new AsyncLocalStorage();
function getDistDir() {
  const fullPath = path.join(compilerOptions.outputDirectory, "DIST");
  if (existsSync(fullPath) === false) {
    mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
}
function setCompilerOptions(newOptions) {
  newOptions.pagesDirectory = path.resolve(newOptions.pagesDirectory);
  newOptions.outputDirectory = path.resolve(newOptions.outputDirectory);
  newOptions.publicDirectory = path.resolve(newOptions.publicDirectory);
  if (existsSync(newOptions.pagesDirectory) === false) {
    throw new Error("The directory: " + newOptions.pagesDirectory + " does not exist, and thus cannot be used as the pagesDirectory.");
  }
  if (existsSync(newOptions.publicDirectory) === false) {
    throw new Error("The directory: " + newOptions.publicDirectory + " does not exist, and thus cannot be used as the publicDirectory");
  }
  if (existsSync(newOptions.outputDirectory) === false) {
    mkdirSync(newOptions.outputDirectory, { recursive: true });
  }
  compilerOptions = newOptions;
}
function invalidElementError(element, fullPath, reason) {
  const stacktrace = formatStacktrace(fullPath);
  return "Direct Parent Trace:\n" + stacktrace + '\nThe element "' + util.inspect(element, { depth: 1, colors: true }) + '" is an invalid element. Reason:\n' + reason;
}
function generateId(compilationContext) {
  let id;
  let tries = 0;
  while (true) {
    compilationContext.idCounter += 1;
    id = crypto.createHash("sha256").update(compilationContext.pathname + compilationContext.kind.toString() + ":" + compilationContext.idCounter.toString()).digest("base64url").slice(0, 11);
    if (!compilationContext.usedHashes.includes(id)) {
      break;
    }
    tries += 1;
    if (tries > 100) {
      throw new Error("Failed to generate a unique id after 100+ attempts");
    }
  }
  compilationContext.usedHashes.push(id);
  return id;
}
function generateLayoutId(layoutInformation) {
  return crypto.createHash("sha256").update(layoutInformation.pathname).digest("base64url").slice(0, 11);
}
function internalCompilerError(reason) {
  return new Error(`The compiler has encountered an internal error.
${reason}`);
}
function sanitizePathname(pathname = "") {
  if (!pathname) return "/";
  pathname = "/" + pathname;
  pathname = pathname.replace(/\/+/g, "/");
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}
function getElementKey(compilationContext, element) {
  if (element.key) return element.key;
  element.key = generateId(compilationContext);
  return element.key;
}
function generatePageCompilationContext(pathname) {
  pathname = sanitizePathname(pathname);
  return {
    pathname,
    idCounter: 0,
    usedHashes: [],
    kind: "page"
  };
}
function generateLayoutCompilationContext(pathname) {
  pathname = sanitizePathname(pathname);
  const absPath = path.join(getDistDir(), pathname);
  if (!existsSync(absPath)) mkdirSync(absPath, { recursive: true });
  return {
    pathname,
    idCounter: 0,
    usedHashes: [],
    kind: "layout"
  };
}
const builtPackages = /* @__PURE__ */ new Map();
class ShippedPackage {
  constructor(globalName, packagePath) {
    this.globalName = globalName;
    this.packagePath = packagePath;
  }
  serialize() {
    return `<script data-package="true" src="/__packages/${this.globalName}.js"></script>`;
  }
}
function clientPackages(packages) {
  for (const [globalName, packagePath] of Object.entries(packages)) {
    const store = compilerStore.getStore();
    if (!store) {
      throw formattedLog(LogLevel.ERROR, "Invalid invocation of clientPackages(). Ensure this function is never called outside of a page or layout constructor.");
    }
    const shippedPackage = new ShippedPackage(globalName, packagePath);
    store?.addClientToken(shippedPackage);
    if (builtPackages.has(globalName + packagePath)) {
      continue;
    }
    const fullPath = packagePath;
    esbuild.build({
      entryPoints: [fullPath],
      bundle: true,
      outfile: path.join(getDistDir(), "__packages", globalName + ".js"),
      format: "iife",
      platform: "browser",
      globalName,
      loader: {
        ".ts": "ts",
        ".js": "js",
        ".cjs": "js",
        ".mjs": "js"
      },
      footer: {
        "js": `;window["${globalName}"}=${globalName};`
      },
      minify: true,
      treeShaking: true
    }).catch((error) => {
      formattedLog(LogLevel.ERROR, 'Failed to ship package "', globalName, '".');
      console.error(error);
    });
  }
}
function serializeProp(key, value) {
  if (key === "class" || key === "className") {
    if (!value) return "";
    return ` class="${String(value)}"`;
  }
  if (key === "style") {
    if (!value) return "";
    if (typeof value === "string") {
      return ` style="${value}"`;
    }
    if (typeof value === "object") {
      const styleString = Object.entries(value).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`).join(";");
      return styleString ? ` style="${styleString}"` : "";
    }
  }
  if (typeof value === "function") {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? ` ${key}` : "";
  }
  if (value == null) {
    return "";
  }
  return ` ${key}="${String(value)}"`;
}
function serializeEleganceElement(compilationContext, element, path2 = []) {
  let serializedElement = "";
  let specialElementOptions = [];
  serializedElement += `<${element.tag}`;
  {
    const entries = Object.entries(element.options);
    for (const [optionName, optionValue] of entries) {
      if (optionValue instanceof SpecialElementOption) {
        optionValue.mutate(element, optionName);
        const elementKey = getElementKey(compilationContext, element);
        specialElementOptions.push({ elementKey, optionName, optionValue });
      } else {
        serializedElement += serializeProp(optionName, optionValue);
      }
    }
  }
  if (element.key) {
    serializedElement += ` key="${element.key}"`;
  }
  serializedElement += ">";
  {
    if (element.children === null) {
      return { serializedElement, specialElementOptions };
    }
    if (element.children.length > 0) {
      for (const child of element.children) {
        const result = serializeElement(compilationContext, child, path2);
        serializedElement += result.serializedElement;
        specialElementOptions.push(...result.specialElementOptions);
      }
    }
  }
  serializedElement += `</${element.tag}>`;
  return { serializedElement, specialElementOptions };
}
function serializeElement(compilationContext, element, path2 = []) {
  const currentRepr = getElementRepr(element);
  const fullPath = [...path2, currentRepr];
  let serializedElement;
  let specialElementOptions = [];
  if (element === void 0) {
    return { serializedElement: "", specialElementOptions };
  }
  switch (typeof element) {
    case "object":
      if (Array.isArray(element)) {
        let serializedElements = "";
        for (const [index, subElement] of element.entries()) {
          const childPath = [...path2, `${currentRepr} at index ${index}`];
          const serializationResult = serializeElement(compilationContext, subElement, childPath);
          serializedElements += serializationResult.serializedElement;
          specialElementOptions.push(...serializationResult.specialElementOptions);
        }
        serializedElement = serializedElements;
        break;
      }
      if (element instanceof EleganceElement) {
        const result = serializeEleganceElement(compilationContext, element, fullPath);
        serializedElement = result.serializedElement;
        specialElementOptions.push(...result.specialElementOptions);
        break;
      }
      if (element instanceof ServerSubject) {
        serializedElement = element.generateObserverNode();
        break;
      }
      throw invalidElementError(element, fullPath, `This element is an arbitrary object, and arbitrary objects are not valid children. Please make sure all elements are one of: EleganceElement, boolean, number, string or Array.`);
    case "boolean":
      serializedElement = `${element}`;
      break;
    case "number":
      serializedElement = element.toString();
      break;
    case "string":
      serializedElement = unwrapAllRaw(element);
      break;
    default:
      throw invalidElementError(element, fullPath, `The typeof of this element is not one of EleganceElement, boolean, number, string or Array. Please convert it into one of these types.`);
  }
  return { serializedElement, specialElementOptions };
}
function prettyObj(obj, level = 0) {
  const ind = "  ".repeat(level);
  const entries = Object.entries(obj);
  if (entries.length === 0) return "{}";
  let str = "{\n";
  for (const [key, value] of entries) {
    let valRepr;
    if (typeof value === "object" && value !== null) {
      valRepr = prettyObj(value, level + 1);
    } else {
      valRepr = JSON.stringify(value);
    }
    str += `${ind}  ${key}: ${valRepr},
`;
  }
  str = str.slice(0, -2);
  str += `
${ind}}`;
  return str;
}
function getElementRepr(element) {
  if (element === null) return "null";
  if (element === void 0) return "undefined";
  if (typeof element === "string") return `"${element.replace(/"/g, '\\"')}"`;
  if (typeof element === "number") return element.toString();
  if (typeof element === "boolean") return element.toString();
  if (Array.isArray(element)) {
    return `Array(length: ${element.length})`;
  }
  if (element instanceof EleganceElement) {
    const tag = element.tag || "unknown";
    const options = element.options || {};
    if (Object.keys(options).length === 0) {
      return `${tag}({})`;
    }
    return `${tag}(${prettyObj(options)})`;
  }
  return `Unknown(${typeof element})`;
}
function formatStacktrace(path2) {
  let lastReprColumn = 0;
  const result = [];
  path2.forEach((repr, index) => {
    const isLast = index === path2.length - 1;
    const lines = repr.split("\n");
    let prefix = "";
    if (index > 0) {
      prefix = " ".repeat(lastReprColumn + 1) + "\u221F> ";
    }
    let firstLine = prefix + lines[0];
    if (isLast) {
      firstLine = prefix + `\x1B[41;30m${lines[0]}`;
    }
    result.push(firstLine);
    const reprColumn = lines[0].search(/\S|$/);
    lastReprColumn = prefix.length + reprColumn;
    for (let i = 1; i < lines.length; i++) {
      const subLine = " ".repeat(prefix.length) + lines[i];
      result.push(subLine);
    }
    if (isLast) {
      result[result.length - 1] += `\x1B[0m`;
    }
  });
  return result.join("\n");
}
async function generatePageDataScript(compilationContext, specialElementOptions, clientTokens) {
  let dataScriptContent = `export const data = {`;
  const serverSubjects = clientTokens.filter((t) => t instanceof ServerSubject);
  const loadHooks = clientTokens.filter((t) => t instanceof LoadHook);
  const eventListeners = clientTokens.filter((t) => t instanceof EventListener);
  const serverObservers = clientTokens.filter((t) => t instanceof ServerObserver);
  {
    dataScriptContent += "subjects:[";
    for (const serverSubject of serverSubjects) {
      dataScriptContent += serverSubject.serialize() + ",";
    }
    dataScriptContent += "],";
  }
  {
    dataScriptContent += "loadHooks:[";
    for (const loadHook of loadHooks) {
      dataScriptContent += loadHook.serialize();
      dataScriptContent += ",";
    }
    dataScriptContent += "],";
  }
  {
    dataScriptContent += "eventListeners:[";
    for (const eventListener of eventListeners) {
      dataScriptContent += eventListener.serialize();
      dataScriptContent += ",";
    }
    dataScriptContent += "],";
  }
  {
    dataScriptContent += "observers:[";
    for (const serverObserver of serverObservers) {
      dataScriptContent += serverObserver.serialize();
      dataScriptContent += ",";
    }
    dataScriptContent += "],";
  }
  {
    const eventListenerOptions = specialElementOptions.filter((seo) => seo.optionValue instanceof EventListenerOption);
    dataScriptContent += "eventListenerOptions:[";
    for (const eventListenerOption of eventListenerOptions) {
      const eventListener = eventListenerOption.optionValue;
      const optionName = eventListenerOption.optionName;
      const elementKey = eventListenerOption.elementKey;
      const result = eventListener.serialize(optionName, elementKey);
      dataScriptContent += `${result},`;
    }
    dataScriptContent += "],";
  }
  {
    const observerOptions = specialElementOptions.filter((seo) => seo.optionValue instanceof ObserverOption);
    dataScriptContent += "observerOptions:[";
    for (const observerOption of observerOptions) {
      const observer = observerOption.optionValue;
      const optionName = observerOption.optionName;
      const elementKey = observerOption.elementKey;
      const result = observer.serialize(optionName, elementKey);
      dataScriptContent += `${result},`;
    }
    dataScriptContent += "]";
  }
  dataScriptContent += "};\n";
  const transformedResult = await esbuild.transform(dataScriptContent, { minify: true });
  dataScriptContent = transformedResult.code;
  let dataScript = `<script data-hook="true" data-pathname="${compilationContext.pathname}" type="text/plain">${dataScriptContent}</script>`;
  let dataLoaderScript = `<script>
            const dataScript = document.querySelector('[data-hook="true"][data-pathname="${compilationContext.pathname}"][type="text/plain"');
            const text = dataScript.textContent;
            dataScript.remove();
            const blob = new Blob([text], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            
            const script = document.createElement("script");
            script.src = url;
            script.type = "module";
            script.setAttribute("data-page", "true");
            script.setAttribute("data-pathname", "${compilationContext.pathname}");
            
            document.head.appendChild(script);
            
            document.currentScript.remove();
        </script>`.replace(" ", "").replace("\n", "");
  const shippedPackages = clientTokens.filter((t) => t instanceof ShippedPackage);
  let packagesString = "";
  for (const shippedPackage of shippedPackages) {
    packagesString += shippedPackage.serialize();
  }
  return packagesString + dataScript + dataLoaderScript;
}
async function walkDirectory(fullPath, callback) {
  const stack = [];
  stack.push(...readdirSync(fullPath, { withFileTypes: true }));
  while (true) {
    const entry = stack.pop();
    if (!entry) break;
    if (entry.isDirectory()) {
      const fullPath2 = path.join(entry.parentPath, entry.name);
      stack.push(...readdirSync(fullPath2, { withFileTypes: true }));
      continue;
    }
    if (!entry.isFile()) continue;
    await callback(entry);
  }
}
async function getPageExports(modulePath) {
  const rawExports = await import("file://" + modulePath).catch((err) => {
    console.error(`Encountered an error in file:
    ${modulePath}`);
    throw err;
  });
  let isDynamic = rawExports?.isDynamic === true;
  const pageConstructor = rawExports.page;
  {
    if (pageConstructor === void 0) {
      throw invalidPageError(compilerOptions, modulePath, "This page does note export a `page` function. Did you forget the keyword `export`?");
    }
    if (typeof pageConstructor !== "function") {
      throw invalidPageError(compilerOptions, modulePath, 'The type of the export "page" is not a function, and is instead of type: ' + typeof pageConstructor);
    }
  }
  const pageMetadataConstructor = rawExports.metadata;
  {
    if (pageMetadataConstructor === void 0) {
      throw invalidPageError(compilerOptions, modulePath, "This page does note export a `metadata` function. Did you forget the keyword `export`?");
    }
    if (typeof pageMetadataConstructor !== "function") {
      throw invalidPageError(compilerOptions, modulePath, 'The type of the export "metadata" is not a function, and is instead of type: ' + typeof pageMetadataConstructor);
    }
  }
  return {
    isDynamic,
    pageConstructor,
    pageMetadataConstructor
  };
}
async function getLayoutExports(modulePath) {
  const rawExports = await import("file://" + modulePath);
  let isDynamic = rawExports?.isDynamic === true;
  const layoutConstructor = rawExports.layout;
  {
    if (layoutConstructor === void 0) {
      throw invalidPageError(compilerOptions, modulePath, "This layout does note export a `layout` function. Did you forget the keyword `export`?");
    }
    if (typeof layoutConstructor !== "function") {
      throw invalidLayoutError(compilerOptions, modulePath, 'The type of the export "layout" is not a function, and is instead of type: ' + typeof layoutConstructor);
    }
  }
  const layoutMetadataConstructor = rawExports.metadata;
  {
    if (layoutMetadataConstructor === void 0) {
      throw invalidPageError(compilerOptions, modulePath, "This layout does note export a `metadata` function. Did you forget the keyword `export`?");
    }
    if (typeof layoutMetadataConstructor !== "function") {
      throw invalidLayoutError(compilerOptions, modulePath, 'The type of the export "metadata" is not a function, and is instead of type: ' + typeof layoutMetadataConstructor);
    }
  }
  return {
    isDynamic,
    layoutConstructor,
    layoutMetadataConstructor
  };
}
async function getApplicablePageLayouts(allLayouts, pagePathname) {
  const pageLayouts = [];
  for (const [_, layoutInformation] of allLayouts.entries()) {
    const doesLayoutApply = pagePathname.startsWith(layoutInformation.pathname);
    if (!doesLayoutApply) continue;
    pageLayouts.push(layoutInformation);
  }
  pageLayouts.sort((a, b) => a.pathname.length - b.pathname.length);
  return pageLayouts;
}
async function generatePageInformation(file, allLayouts) {
  const fullPath = path.join(file.parentPath, file.name);
  const pathname = sanitizePathname(path.relative(compilerOptions.pagesDirectory, file.parentPath));
  const exports = await getPageExports(fullPath);
  const applicablePageLayouts = await getApplicablePageLayouts(allLayouts, pathname);
  const parts = pathname.split("/");
  let containsCatchAllParts = false;
  for (const part of parts) {
    const isCatchAll = part.startsWith("[") && part.endsWith("]");
    if (isCatchAll) {
      containsCatchAllParts = true;
      break;
    }
  }
  if (containsCatchAllParts && exports.isDynamic === false) {
    throw invalidPageError(compilerOptions, fullPath, "A page that uses a catch-all route, eg. [product] must be dynamic, since it depends on the request pathname. Set `export const isDynamic` to true.");
  }
  const pageInformation = {
    modulePath: fullPath,
    exports,
    pathname,
    applicableLayouts: applicablePageLayouts,
    pathnameParts: parts,
    containsCatchAllParts
  };
  return pageInformation;
}
async function gatherAllPages(allLayouts) {
  const pageMap = /* @__PURE__ */ new Map();
  await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
    if (file.name !== "page.ts") return;
    const pageInformation = await generatePageInformation(file, allLayouts);
    pageMap.set(pageInformation.pathname, pageInformation);
  });
  return pageMap;
}
async function gatherAllStatusCodePages(allLayouts) {
  const pageMap = /* @__PURE__ */ new Map();
  await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
    const re = /\b\d{3}\.ts\b/;
    if (re.test(file.name) === false) return;
    const code = file.name.slice(0, file.name.length - 3);
    const fullPath = path.join(file.parentPath, file.name);
    const pathname = sanitizePathname(path.relative(compilerOptions.pagesDirectory, file.parentPath));
    const exports = await getPageExports(fullPath);
    const applicablePageLayouts = await getApplicablePageLayouts(allLayouts, pathname);
    const parts = pathname.split("/");
    let containsCatchAllParts = false;
    for (const part of parts) {
      const isCatchAll = part.startsWith("[") && part.endsWith("]");
      if (isCatchAll) {
        containsCatchAllParts = true;
        break;
      }
    }
    if (containsCatchAllParts && exports.isDynamic === false) {
      throw invalidPageError(compilerOptions, fullPath, "A page that uses a catch-all route, eg. [product] must be dynamic, since it depends on the request pathname. Set `export const isDynamic` to true.");
    }
    const pageInformation = {
      modulePath: fullPath,
      exports,
      pathname: pathname + code,
      applicableLayouts: applicablePageLayouts,
      pathnameParts: parts,
      containsCatchAllParts
    };
    pageMap.set(pathname + code, pageInformation);
  });
  return pageMap;
}
async function gatherAllLayouts() {
  const layoutMap = /* @__PURE__ */ new Map();
  await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
    if (file.name !== "layout.ts") return;
    const fullPath = path.join(file.parentPath, file.name);
    const pathname = sanitizePathname(path.relative(compilerOptions.pagesDirectory, file.parentPath));
    const exports = await getLayoutExports(fullPath);
    const layoutInformation = {
      modulePath: fullPath,
      exports,
      pathname
    };
    layoutMap.set(pathname, layoutInformation);
  });
  return layoutMap;
}
const compiledStaticLayouts = /* @__PURE__ */ new Map();
async function getCompiledLayout(layoutInformation, allLayouts) {
  if (layoutInformation.exports.isDynamic === true) {
    return await compileLayout(layoutInformation, allLayouts);
  }
  if (compiledStaticLayouts.has(layoutInformation.pathname)) {
    return compiledStaticLayouts.get(layoutInformation.pathname);
  }
  const compiledLayout = await compileLayout(layoutInformation, allLayouts);
  compiledStaticLayouts.set(layoutInformation.pathname, compiledLayout);
  return compiledLayout;
}
async function compilePageToDisk(allLayouts, pageInformation) {
  const compiledPage = await compilePage(allLayouts, pageInformation);
  const absPath = path.join(getDistDir(), pageInformation.pathname);
  if (!existsSync(absPath)) mkdirSync(absPath, { recursive: true });
  const targetPath = path.join(
    getDistDir(),
    pageInformation.pathname,
    "index.html"
  );
  writeFileSync(targetPath, compiledPage.pageHTML);
  return compiledPage;
}
function getEnforcedMetadata() {
  return `<meta charset="utf-8"><script defer="true" src="/client.js"></script>`;
}
async function compilePage(allLayouts, pageInformation) {
  const compilationContext = generatePageCompilationContext(pageInformation.pathname);
  const exports = pageInformation.exports;
  const pageConstructor = exports.pageConstructor;
  const pageMetadataConstructor = exports.pageMetadataConstructor;
  const clientTokens = [];
  const storeTools = {
    generateId: () => generateId(compilationContext),
    addClientToken: (value) => {
      clientTokens.push(value);
    },
    compilationContext
  };
  let compiledLayouts = [];
  let allLayoutProps = {};
  if (pageInformation.applicableLayouts.length > 0) {
    for (const layout of pageInformation.applicableLayouts) {
      compiledLayouts.push(await getCompiledLayout(layout, allLayouts));
    }
    for (const compiledLayout of compiledLayouts) {
      allLayoutProps = { ...allLayoutProps, ...compiledLayout.layoutProps };
    }
  }
  const pageProps = allLayoutProps;
  let pageRootElement = await compilerStore.run(storeTools, async () => {
    return await pageConstructor(pageProps);
  });
  let pageRootMetadataElement = await compilerStore.run(storeTools, async () => {
    return await pageMetadataConstructor(pageProps);
  });
  let pageSerializationResult;
  let pageMetadataSerializationResult;
  try {
    pageSerializationResult = serializeElement(compilationContext, pageRootElement);
    pageMetadataSerializationResult = serializeElement(compilationContext, pageRootMetadataElement);
  } catch (e) {
    formattedLog(LogLevel.ERROR, `${pageInformation.pathname}/page.ts - Element serialization failed.`);
    throw e;
  }
  const allClientTokens = [...clientTokens];
  const allSpecialElementOptions = [
    ...pageSerializationResult.specialElementOptions,
    ...pageMetadataSerializationResult.specialElementOptions
  ];
  for (const compiledLayout of compiledLayouts) {
    allClientTokens.push(...compiledLayout.clientTokens);
    allSpecialElementOptions.push(...compiledLayout.specialElementOptions);
  }
  const pageHTML = pageSerializationResult.serializedElement;
  const pageMetadataHTML = pageMetadataSerializationResult.serializedElement;
  let finalHTML = "<!DOCTYPE html>";
  if (pageInformation.applicableLayouts.length > 0) {
    const compiledRootLayout = compiledLayouts[0];
    const htmlTagIndex = compiledRootLayout.layoutHTMLStart.indexOf("<html");
    const htmlTagEndIndex = compiledRootLayout.layoutHTMLStart.indexOf(">");
    if (htmlTagIndex === -1 || htmlTagEndIndex === -1) {
      throw invalidLayoutError(compilerOptions, pageInformation.applicableLayouts[0].modulePath, "The root layout must start with an html() element.");
    }
    if (compiledRootLayout.layoutHTMLStart.includes("<body") === false) {
      throw invalidLayoutError(compilerOptions, pageInformation.applicableLayouts[0].modulePath, "The root layout must contain the body() element.");
    }
    const beforeHead = compiledRootLayout.layoutHTMLStart.substring(0, htmlTagEndIndex + 1);
    const afterHead = compiledRootLayout.layoutHTMLStart.substring(htmlTagEndIndex + 1);
    let headContent = "";
    {
      headContent += "<head>";
      headContent += getEnforcedMetadata();
      for (const compiledLayout of compiledLayouts) {
        headContent += compiledLayout.layoutMetadataHTML;
      }
      headContent += pageMetadataHTML;
      headContent += "</head>";
    }
    finalHTML += beforeHead + headContent + afterHead;
    for (let i = 1; i < compiledLayouts.length; i++) {
      finalHTML += compiledLayouts[i].layoutHTMLStart;
    }
    finalHTML += pageHTML;
    let endString = "";
    for (const compiledLayout of [...compiledLayouts].reverse()) {
      endString += compiledLayout.layoutHTMLEnd;
    }
    const htmlEndTagIndex = endString.indexOf("</body>");
    if (htmlEndTagIndex === -1) {
      throw internalCompilerError("Failed to find </body> tag whilst compiling a page");
    }
    const beforeEndTag = endString.substring(0, htmlEndTagIndex);
    const afterEndTag = endString.substring(htmlEndTagIndex);
    const pageDataScript = await generatePageDataScript(compilationContext, allSpecialElementOptions, allClientTokens);
    finalHTML += beforeEndTag + pageDataScript + afterEndTag;
  } else {
    finalHTML += `<html lang="en-us">`;
    finalHTML += "<head>";
    finalHTML += getEnforcedMetadata();
    finalHTML += pageMetadataHTML;
    finalHTML += "</head>";
    finalHTML += "<body>";
    finalHTML += pageHTML;
    const pageDataScript = await generatePageDataScript(compilationContext, allSpecialElementOptions, allClientTokens);
    finalHTML += pageDataScript;
    finalHTML += "</body>";
    finalHTML += `</html>`;
  }
  const compiledPage = {
    pageHTML: finalHTML
  };
  return compiledPage;
}
async function compileStaticPages(allLayouts, allPages) {
  const compiledPages = /* @__PURE__ */ new Map();
  for (const [pagePathname, pageInformation] of allPages) {
    if (pageInformation.exports.isDynamic === true) continue;
    const compiledPage = await compilePage(allLayouts, pageInformation);
    compiledPages.set(pagePathname, compiledPage);
  }
  return compiledPages;
}
async function compileStaticPagesToDisk(allLayouts, allPages) {
  const compiledPages = /* @__PURE__ */ new Map();
  for (const [pagePathname, pageInformation] of allPages) {
    if (pageInformation.exports.isDynamic === true) continue;
    const compiledPage = await compilePageToDisk(allLayouts, pageInformation);
    compiledPages.set(pagePathname, compiledPage);
  }
  return compiledPages;
}
async function compileLayoutToDisk(layoutInformation, allLayouts) {
  const compiledLayout = await compileLayout(layoutInformation, allLayouts);
  const directory = path.join(getDistDir(), layoutInformation.pathname);
  const htmlFullPath = path.join(directory, "layout.html");
  const htmlMetadataFullPath = path.join(directory, "layout_metadata.html");
  const jsFullPath = path.join(directory, "layout_data.js");
  writeFileSync(htmlFullPath, compiledLayout.layoutHTMLStart + compiledLayout.layoutHTMLEnd);
  writeFileSync(htmlMetadataFullPath, compiledLayout.layoutMetadataHTML);
  writeFileSync(jsFullPath, compiledLayout.specialElementOptions.join(","));
}
async function compileLayout(layoutInformation, allLayouts) {
  const compilationContext = generateLayoutCompilationContext(layoutInformation.pathname);
  let parentLayoutProps = {};
  {
    const parentLayout = sanitizePathname(path.dirname(layoutInformation.pathname));
    const isSameLayout = layoutInformation.pathname === parentLayout;
    if (!isSameLayout && allLayouts.has(parentLayout)) {
      const compiledParent = await getCompiledLayout(allLayouts.get(parentLayout), allLayouts);
      parentLayoutProps = compiledParent.layoutProps;
    }
  }
  const exports = layoutInformation.exports;
  const layoutConstructor = exports.layoutConstructor;
  const layoutMetadataConstructor = exports.layoutMetadataConstructor;
  const layoutId = generateLayoutId(layoutInformation);
  const markerElement = `<template layout-id="${layoutId}"></template>`;
  const wrappedElement = raw(markerElement);
  const clientTokens = [];
  const storeTools = {
    generateId: () => generateId(compilationContext),
    addClientToken: (value) => {
      clientTokens.push(value);
    },
    compilationContext
  };
  let layoutProps = {};
  const propPasser = (props) => {
    layoutProps = {
      ...layoutProps,
      ...props
    };
    return wrappedElement;
  };
  let layoutRootElement = await compilerStore.run(storeTools, async () => await layoutConstructor({ props: parentLayoutProps, child: propPasser }));
  let layoutRootMetadataElement = await compilerStore.run(storeTools, async () => await layoutMetadataConstructor());
  let layoutSerializationResult;
  let layoutMetadataSerializationResult;
  try {
    layoutSerializationResult = serializeElement(compilationContext, layoutRootElement);
    layoutMetadataSerializationResult = serializeElement(compilationContext, layoutRootMetadataElement);
  } catch (e) {
    console.error(`${layoutInformation.pathname}/layout.ts - Failed to serialize elements.`);
    throw e;
  }
  const layoutHTML = layoutSerializationResult.serializedElement;
  const layoutMetadataHTML = layoutMetadataSerializationResult.serializedElement;
  const layoutHTMLMarkerElementIndex = layoutHTML.indexOf(markerElement);
  if (layoutHTMLMarkerElementIndex === -1) {
    throw invalidLayoutError(compilerOptions, layoutInformation.modulePath, 'The marker element was not found in the compiled layout HTML. Make sure to use the "child" paramater passed into the layout function.');
  }
  const layoutHTMLStart = layoutHTML.slice(0, layoutHTMLMarkerElementIndex + markerElement.length);
  const layoutHTMLEnd = layoutHTML.slice(layoutHTMLMarkerElementIndex + markerElement.length);
  const specialElementOptions = [
    ...layoutSerializationResult.specialElementOptions,
    ...layoutMetadataSerializationResult.specialElementOptions
  ];
  const compiledLayout = {
    layoutHTMLStart,
    layoutHTMLEnd,
    layoutMetadataHTML,
    specialElementOptions,
    clientTokens,
    layoutProps
  };
  return compiledLayout;
}
async function transpileClientRuntime() {
  const clientTsPath = path.join(__dirname, "..", "client", "runtime.mjs");
  if (!existsSync(clientTsPath)) {
    throw internalCompilerError("Failed to find the client runtime at path:" + clientTsPath);
  }
  const targetPath = path.join(
    getDistDir(),
    "client.js"
  );
  await esbuild.build({
    bundle: true,
    entryPoints: [clientTsPath],
    outfile: targetPath,
    format: "iife",
    platform: "browser",
    target: "esnext",
    minify: compilerOptions.environment === "production",
    external: ["util"],
    treeShaking: true,
    loader: {
      ".ts": "ts"
    },
    dropLabels: [
      compilerOptions.environment === "production" ? "DEV_BUILD" : "PROD_BUILD"
    ],
    define: compilerOptions.environment === "production" ? {
      "DEV_BUILD": "false",
      "PROD_BUILD": "true"
    } : {
      "PROD_BUILD": "false",
      "DEV_BUILD": "true"
    },
    sourcemap: compilerOptions.environment === "production" ? void 0 : "inline"
  });
}
function createRecursiveWatcher(targetDir, callback) {
  const watchers = /* @__PURE__ */ new Map();
  const timeouts = /* @__PURE__ */ new Map();
  function debouncedCallback(fullPath) {
    const existingTimeout = timeouts.get(fullPath);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const timeout = setTimeout(async function() {
      try {
        await callback(fullPath);
      } catch (err) {
        console.error(err);
      } finally {
        timeouts.delete(fullPath);
      }
    }, 100);
    timeouts.set(fullPath, timeout);
  }
  function unregisterWatcher(path2) {
    for (const [dir, watcher] of watchers.entries()) {
      if (dir === path2 || dir.startsWith(path2 + "/")) {
        watcher.close();
        watchers.delete(dir);
        const timeout = timeouts.get(dir);
        if (timeout) {
          clearTimeout(timeout);
          timeouts.delete(dir);
        }
      }
    }
  }
  function registerWatcher(dirPath) {
    if (watchers.has(dirPath)) return;
    try {
      const watcher = watch(dirPath, { recursive: false }, function(event, filename) {
        if (!filename) return;
        const fullPath = path.join(dirPath, filename);
        try {
          const stats = lstatSync(fullPath);
          if (stats.isDirectory()) {
            registerWatcher(fullPath);
          }
          debouncedCallback(fullPath);
        } catch (err) {
          if (err.code === "ENOENT") {
            unregisterWatcher(fullPath);
            debouncedCallback(fullPath);
          }
        }
      });
      watcher.on("error", function() {
        unregisterWatcher(dirPath);
      });
      watchers.set(dirPath, watcher);
      const files = readdirSync(dirPath);
      for (const file of files) {
        const childPath = path.join(dirPath, file);
        try {
          if (lstatSync(childPath).isDirectory()) {
            registerWatcher(childPath);
          }
        } catch (e) {
        }
      }
    } catch (e) {
    }
  }
  registerWatcher(targetDir);
}
async function compileEntireProject() {
  Object.assign(globalThis, allElements);
  const gracefulErr = (err) => {
    console.error(err);
  };
  process.on("uncaughtException", gracefulErr);
  process.on("unhandledRejection", gracefulErr);
  if (compilerOptions.doHotReload) {
    createRecursiveWatcher(compilerOptions.pagesDirectory, async (path2) => {
      process.send?.(`restart-me`);
    });
  }
  const allLayouts = await gatherAllLayouts();
  const allPages = await gatherAllPages(allLayouts);
  const allStatusCodePages = await gatherAllStatusCodePages(allLayouts);
  const compiledStaticPages = await compileStaticPagesToDisk(allLayouts, allPages);
  await transpileClientRuntime();
  cpSync(compilerOptions.publicDirectory, getDistDir(), { recursive: true });
  process.off("uncaughtException", gracefulErr);
  process.off("unhandledRejection", gracefulErr);
  return {
    allPages,
    allLayouts,
    allStatusCodePages,
    compiledStaticPages,
    compiledStaticLayouts
  };
}
async function compileEntireProjectToDisk() {
  throw new Error("Not yet implemented.");
}
export {
  clientPackages,
  compileEntireProject,
  compileEntireProjectToDisk,
  compileLayout,
  compileLayoutToDisk,
  compilePage,
  compilePageToDisk,
  compilerOptions,
  compilerStore,
  generateLayoutCompilationContext,
  generatePageCompilationContext,
  generatePageDataScript,
  serializeElement,
  setCompilerOptions
};
