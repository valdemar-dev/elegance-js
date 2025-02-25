// src/build.ts
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
  "track"
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
  "title"
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
    for (const [attrName, attrValue] of Object.entries(element.options)) {
      if (typeof attrValue === "object") {
        throw `Internal error, attr ${attrName} has obj type.`;
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
  head,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">';
  if (addPageScriptTag === true) {
    HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page_data.js" defer="true"></script>`;
  }
  HTMLTemplate += `<script stype="module" src="/client.js" defer="true"></script>`;
  const builtHead = head();
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

// src/build.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var clientPath = path.resolve(packageDir, "./src/client/client.ts");
var watcherPath = path.resolve(packageDir, "./src/client/watcher.ts");
var bindElementsPath = path.resolve(packageDir, "./src/shared/bindServerElements.ts");
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
var white_100 = (text) => {
  return `\x1B[38;2;255;239;204m${text}`;
};
var green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
};
var red = (text) => {
  return `\x1B[38;2;255;100;103m${text}`;
};
var log = (...text) => {
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
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
var getFile = (dir, fileName) => {
  const dirent = dir.find((dirent2) => path.parse(dirent2.name).name === fileName);
  if (dirent) return dirent;
  return false;
};
var getProjectFiles = (pagesDirectory) => {
  const pageFiles = [];
  const infoFiles = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);
    const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".js") || f.name.endsWith(".ts"));
    const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
    const infoFileInSubdirectory = getFile(subdirectoryFiles, "info");
    if (!pageFileInSubdirectory && !infoFileInSubdirectory) continue;
    else if (!infoFileInSubdirectory) {
      const name = pageFileInSubdirectory.name;
      throw `/${subdirectory}/${name} is missing it's accompanying info.js/ts file.`;
    } else if (!pageFileInSubdirectory) {
      const name = infoFileInSubdirectory.name;
      throw `/${subdirectory}/${name} is missing it's accompanying page.js/ts file.`;
    }
    pageFiles.push(pageFileInSubdirectory);
    infoFiles.push(infoFileInSubdirectory);
  }
  return {
    pageFiles,
    infoFiles
  };
};
var buildClient = async (environment, DIST_DIR, isInWatchMode, watchServerPort) => {
  let clientString = fs.readFileSync(clientPath, "utf-8");
  if (isInWatchMode) {
    clientString += `const watchServerPort = ${watchServerPort}`;
    clientString += fs.readFileSync(watcherPath, "utf-8");
  }
  const transformedClient = await esbuild.transform(clientString, {
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: true,
    format: "iife",
    platform: "node",
    loader: "ts"
  });
  fs.writeFileSync(
    path.join(DIST_DIR, "/client.js"),
    transformedClient.code
  );
};
var buildInfoFiles = async (infoFiles, environment, SERVER_DIR) => {
  const mappedInfoFileNames = infoFiles.map((f) => `${f.parentPath}/${f.name}`);
  await esbuild.build({
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    entryPoints: mappedInfoFileNames,
    bundle: true,
    outdir: SERVER_DIR,
    loader: {
      ".js": "js",
      ".ts": "ts"
    },
    inject: [bindElementsPath],
    format: "esm",
    platform: "node"
  });
};
var escapeHtml = (str) => {
  const replaced = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\r?\n|\r/g, "");
  return replaced;
};
var elementKey = 0;
var processOptionAsObjectAttribute = (element, optionName, optionValue, objectAttributes) => {
  const lcOptionName = optionName.toLowerCase();
  const options = element.options;
  let key = options.key;
  if (!key) {
    key = elementKey++;
    options.key = key;
  }
  if (!optionValue.type) {
    throw `ObjectAttributeType is missing from object attribute.`;
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
var processPageElements = (element, objectAttributes) => {
  if (typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) return element;
  if (typeof element === "string") {
    return escapeHtml(element);
  }
  const processElementOptionsAsChildAndReturn = () => {
    const children = element.children;
    element.children = [
      element.options,
      ...children
    ];
    for (let child of children) {
      const processedChild = processPageElements(child, objectAttributes);
      child = processedChild;
    }
    return element;
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
      } else if (lcOptionName === "innerhtml") {
        if (element.children === null) {
          throw `Cannot use innerText or innerHTML on childrenless elements.`;
        }
        delete options[optionName];
        element.children = [optionValue];
      }
      continue;
    }
    ;
    processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
  }
  if (element.children) {
    for (let child of element.children) {
      const processedChild = processPageElements(child, objectAttributes);
      child = processedChild;
    }
  }
  return element;
};
var generateSuitablePageElements = async (pageLocation, pageElements, metadata, DIST_DIR, writeToHTML) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    return [];
  }
  const objectAttributes = [];
  const processedPageElements = processPageElements(pageElements, objectAttributes);
  elementKey = 0;
  if (!writeToHTML) {
    fs.writeFileSync(
      path.join(DIST_DIR, pageLocation, "page.json"),
      JSON.stringify(processedPageElements),
      "utf-8"
    );
    return objectAttributes;
  }
  const renderedPage = await serverSideRenderPage(
    processedPageElements,
    pageLocation
  );
  const template = generateHTMLTemplate({
    pageURL: pageLocation,
    head: metadata,
    addPageScriptTag: true
  });
  const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;
  const htmlLocation = path.join(DIST_DIR, pageLocation, "index.html");
  fs.writeFileSync(
    htmlLocation,
    resultHTML,
    {
      encoding: "utf-8",
      flag: "w"
    }
  );
  const infoLocation = path.join(DIST_DIR, pageLocation, "info.js");
  if (fs.existsSync(infoLocation)) {
    fs.unlinkSync(infoLocation);
  }
  return objectAttributes;
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR) => {
  let clientPageJSText = `let url="${pageLocation === "" ? "/" : `/${pageLocation}`}";`;
  if (state) {
  }
  clientPageJSText += `if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
  clientPageJSText += `pd[url]={`;
  if (state) {
    const nonBoundState = state.filter((subj) => subj.bind === void 0);
    clientPageJSText += `state:[`;
    for (const subject of nonBoundState) {
      if (typeof subject.value === "string") {
        clientPageJSText += `{id:${subject.id},value:"${subject.value}"},`;
      } else {
        clientPageJSText += `{id:${subject.id},value:${subject.value}},`;
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
            clientPageJSText += `{id:${subject.id},value:"${subject.value}"},`;
          } else {
            clientPageJSText += `{id:${subject.id},value:${subject.value}},`;
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
  clientPageJSText += `}`;
  const pageDataPath = path.join(DIST_DIR, pageLocation, "page_data.js");
  let sendHardReloadInstruction = false;
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: true });
  if (fs.existsSync(pageDataPath)) {
    const existingPageData = fs.readFileSync(pageDataPath, "utf-8");
    if (existingPageData.toString() !== transformedResult.code) {
      sendHardReloadInstruction = true;
    }
  }
  fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var buildPages = async (pages, DIST_DIR, writeToHTML, watch) => {
  let shouldClientHardReload = false;
  for (const page of pages) {
    if (!writeToHTML) {
      if (page.generateMetadata === 1 /* ON_BUILD */) {
        const template = generateHTMLTemplate({
          pageURL: page.pageLocation,
          head: page.metadata,
          addPageScriptTag: true
        });
        fs.writeFileSync(
          path.join(DIST_DIR, page.pageLocation, "metadata.html"),
          template,
          "utf-8"
        );
      }
    }
    const pagePath = path.resolve(path.join(DIST_DIR, page.pageLocation, "page.js"));
    initializeState();
    resetLoadHooks();
    resetLayouts();
    const { page: pageElements } = await import(pagePath + `?${Date.now()}`);
    const state = getState();
    const pageLoadHooks = getLoadHooks();
    if (!pageElements) {
      throw `/${page.pageLocation}/page.js must export a const page, which is of type BuiltElement<"body">.`;
    }
    const objectAttributes = await generateSuitablePageElements(
      page.pageLocation,
      pageElements,
      page.metadata,
      DIST_DIR,
      writeToHTML
    );
    const {
      sendHardReloadInstruction
    } = await generateClientPageData(
      page.pageLocation,
      state || {},
      objectAttributes,
      pageLoadHooks || [],
      DIST_DIR
    );
    if (sendHardReloadInstruction === true) shouldClientHardReload = true;
  }
  return {
    shouldClientHardReload
  };
};
var getPageCompilationDirections = async (pageFiles, pagesDirectory, SERVER_DIR) => {
  const builtInfoFiles = [...getAllSubdirectories(SERVER_DIR), ""];
  const compilationDirections = [];
  for (const builtInfoFile of builtInfoFiles) {
    const absoluteFilePath = `${path.resolve(process.cwd(), path.join(SERVER_DIR, builtInfoFile, "/info.js"))}`;
    const pagePath = path.join(pagesDirectory, builtInfoFile);
    const pageFile = pageFiles.find((page) => page.parentPath === pagePath);
    if (!pageFile) continue;
    const infoFileExports = await import(absoluteFilePath + `?${Date.now()}`);
    const {
      metadata,
      executeOnServer,
      generateMetadata = 1 /* ON_BUILD */
    } = infoFileExports;
    if (!metadata) {
      throw `File ${builtInfoFile}/info.js does not export a function \`metadata\`. Info files must export a \`metadata\` function which resolves into a <head> element.`;
    }
    if (typeof metadata !== "function") {
      throw `${builtInfoFile} The function \`metadata\` is not a function which resolves into a <head> element.`;
    }
    compilationDirections.push({
      metadata,
      executeOnServer: executeOnServer ?? null,
      generateMetadata,
      pageFilepath: `${pageFile.parentPath}/${pageFile.name}`,
      pageLocation: builtInfoFile
    });
  }
  return compilationDirections;
};
var doesHTTPWatchServerExist = false;
var isTimedOut = false;
var httpStream;
var currentWatchers = [];
var rebuild = async (props) => {
  try {
    const {
      shouldClientHardReload
    } = await compile({ ...props });
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
    log(red(bold(`Build Failed at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`)));
    console.error(e);
  }
  isTimedOut = false;
};
var registerListener = async (props) => {
  if (!doesHTTPWatchServerExist) {
    doesHTTPWatchServerExist = true;
    const server = http.createServer((req, res) => {
      if (req.url === "/events") {
        log(white("Client listening for changes.."));
        res.writeHead(200, {
          "X-Accel-Buffering": "no",
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Content-Encoding": "none",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*"
        });
        httpStream = res;
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });
    server.listen(props.watchServerPort, () => {
      log(bold(green("Hot-Reload server online!")));
    });
  }
  for (const watcher of currentWatchers) {
    watcher.close();
  }
  const subdirectories = [...getAllSubdirectories(props.pagesDirectory), ""];
  for (const directory of subdirectories) {
    const fullPath = path.join(props.pagesDirectory, directory);
    const watcher = fs.watch(
      fullPath,
      async () => {
        if (isTimedOut) return;
        isTimedOut = true;
        process.stdout.write("\x1Bc");
        setTimeout(async () => {
          await rebuild(props);
        }, 100);
      }
    );
    currentWatchers.push(watcher);
  }
};
var compile = async ({
  writeToHTML = false,
  pagesDirectory,
  outputDirectory,
  environment,
  watchServerPort = 3001
}) => {
  const watch = environment === "development";
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }
  const DIST_DIR = writeToHTML ? outputDirectory : path.join(outputDirectory, "dist");
  const SERVER_DIR = writeToHTML ? outputDirectory : path.join(outputDirectory, "server");
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
  }
  if (!fs.existsSync(SERVER_DIR)) {
    fs.mkdirSync(SERVER_DIR);
  }
  log(bold(yellow(" -- Elegance.JS -- ")));
  log(white(`Beginning build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}..`));
  log("");
  if (environment === "production") {
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
  const start = performance.now();
  const { pageFiles, infoFiles } = getProjectFiles(pagesDirectory);
  await buildInfoFiles(infoFiles, environment, SERVER_DIR);
  const pages = await getPageCompilationDirections(pageFiles, pagesDirectory, SERVER_DIR);
  await esbuild.build({
    entryPoints: [
      ...pages.map((page) => page.pageFilepath)
    ],
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    bundle: true,
    outdir: DIST_DIR,
    loader: {
      ".js": "js",
      ".ts": "ts"
    },
    format: "esm",
    platform: "node"
  });
  const {
    shouldClientHardReload
  } = await buildPages(pages, DIST_DIR, writeToHTML, watch);
  await buildClient(environment, DIST_DIR, watch, watchServerPort);
  const end = performance.now();
  log(bold(yellow(" -- Elegance.JS -- ")));
  log(white(`Finished build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}.`));
  log(green(bold(`Created ${pageFiles.length} pages in ${Math.ceil(end - start)}ms!`)));
  log("");
  log(white("  Pages:"));
  for (const page of pages) {
    log(white_100(`    - /${page.pageLocation}`));
  }
  if (watch) {
    await registerListener({
      writeToHTML,
      pagesDirectory,
      outputDirectory,
      environment,
      watch,
      watchServerPort
    });
  }
  return {
    shouldClientHardReload
  };
};
export {
  compile
};
