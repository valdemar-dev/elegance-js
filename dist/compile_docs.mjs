// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

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
  head,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">';
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

// src/helpers/camelToKebab.ts
var camelToKebabCase = (input) => {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

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
var green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
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
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);
    const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".js") || f.name.endsWith(".ts"));
    const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
    if (!pageFileInSubdirectory) continue;
    pageFiles.push(pageFileInSubdirectory);
  }
  return pageFiles;
};
var buildClient = async (environment2, DIST_DIR, isInWatchMode, watchServerPort) => {
  let clientString = fs.readFileSync(clientPath, "utf-8");
  if (isInWatchMode) {
    clientString += `const watchServerPort = ${watchServerPort}`;
    clientString += fs.readFileSync(watcherPath, "utf-8");
  }
  const transformedClient = await esbuild.transform(clientString, {
    minify: environment2 === "production",
    drop: environment2 === "production" ? ["console", "debugger"] : void 0,
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
var processPageElements = (element, objectAttributes) => {
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
      const processedChild = processPageElements(child, objectAttributes);
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
      delete options[optionName];
      options[camelToKebabCase(optionName)] = optionValue;
      continue;
    }
    ;
    processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
  }
  if (element.children) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const processedChild = processPageElements(child, objectAttributes);
      element.children[i] = processedChild;
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
      path.join(pageLocation, "page.json"),
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
    pageURL: path.relative(DIST_DIR, pageLocation),
    head: metadata,
    addPageScriptTag: true
  });
  const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;
  const htmlLocation = path.join(pageLocation, "index.html");
  fs.writeFileSync(
    htmlLocation,
    resultHTML,
    {
      encoding: "utf-8",
      flag: "w"
    }
  );
  return objectAttributes;
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR) => {
  const pageDiff = path.relative(DIST_DIR, pageLocation);
  let clientPageJSText = `let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
  clientPageJSText += `if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
  clientPageJSText += `pd[url]={`;
  if (state) {
    const nonBoundState = state.filter((subj) => subj.bind === void 0);
    clientPageJSText += `state:[`;
    for (const subject of nonBoundState) {
      if (typeof subject.value === "string") {
        clientPageJSText += `{id:${subject.id},value:"${JSON.stringify(subject.value)}"},`;
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
            clientPageJSText += `{id:${subject.id},value:"${JSON.stringify(subject.value)}"},`;
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
  clientPageJSText += `}`;
  const pageDataPath = path.join(pageLocation, "page_data.js");
  let sendHardReloadInstruction = false;
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: true });
  fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var buildPages = async (DIST_DIR, writeToHTML) => {
  resetLayouts();
  const subdirectories = [...getAllSubdirectories(DIST_DIR), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const pagePath = path.resolve(path.join(DIST_DIR, directory));
    initializeState();
    resetLoadHooks();
    const {
      page: pageElements,
      generateMetadata,
      metadata
    } = await import(pagePath + `/page.js?${Date.now()}`);
    if (!metadata || metadata && typeof metadata !== "function") {
      throw `${pagePath} is not exporting a metadata function.`;
    }
    if (!pageElements) {
      throw `${pagePath} must export a const page, which is of type BuiltElement<"body">.`;
    }
    const state = getState();
    const pageLoadHooks = getLoadHooks();
    let objectAttributes = [];
    try {
      objectAttributes = await generateSuitablePageElements(
        pagePath,
        pageElements,
        metadata,
        DIST_DIR,
        writeToHTML
      );
    } catch (error) {
      console.error(
        "Failed to generate suitable page elements.",
        pagePath + "/page.js",
        error
      );
      return {
        shouldClientHardReload: false
      };
    }
    const {
      sendHardReloadInstruction
    } = await generateClientPageData(
      pagePath,
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
var isTimedOut = false;
var httpStream;
var currentWatchers = [];
var registerListener = async (props) => {
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
  server.listen(props.watchServerPort, () => {
    log(bold(green("Hot-Reload server online!")));
  });
};
var build = async ({
  writeToHTML = false,
  pagesDirectory,
  outputDirectory,
  environment: environment2,
  watchServerPort = 3001,
  postCompile,
  preCompile,
  publicDirectory,
  DIST_DIR
}) => {
  const watch = environment2 === "development";
  log(bold(yellow(" -- Elegance.JS -- ")));
  log(white(`Beginning build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}..`));
  log("");
  if (environment2 === "production") {
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
  if (preCompile) {
    preCompile();
  }
  const pageFiles = getProjectFiles(pagesDirectory);
  const existingCompiledPages = [...getAllSubdirectories(DIST_DIR), ""];
  for (const page of existingCompiledPages) {
    const pageFile = pageFiles.find((dir) => path.relative(pagesDirectory, dir.parentPath) === page);
    if (!pageFile) {
      fs.rmdirSync(path.join(DIST_DIR, page), { recursive: true });
    }
    console.log("Deleted old file, ", pageFile);
  }
  const start = performance.now();
  await esbuild.build({
    entryPoints: [
      ...pageFiles.map((page) => path.join(page.parentPath, page.name))
    ],
    minify: environment2 === "production",
    drop: environment2 === "production" ? ["console", "debugger"] : void 0,
    bundle: true,
    outdir: DIST_DIR,
    loader: {
      ".js": "js",
      ".ts": "ts"
    },
    format: "esm",
    platform: "node"
  });
  const pagesTranspiled = performance.now();
  const {
    shouldClientHardReload
  } = await buildPages(DIST_DIR, writeToHTML);
  const pagesBuilt = performance.now();
  await buildClient(environment2, DIST_DIR, watch, watchServerPort);
  const end = performance.now();
  if (publicDirectory) {
    if (environment2 === "development") {
      console.log("Creating a symlink for the public directory.");
      if (!fs.existsSync(path.join(DIST_DIR, "public"))) {
        fs.symlinkSync(publicDirectory.path, path.join(DIST_DIR, "public"), "dir");
      }
    } else if (environment2 === "production") {
      console.log("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), publicDirectory.path);
      if (fs.existsSync(path.join(DIST_DIR, "public"))) {
        fs.rmSync(path.join(DIST_DIR, "public"), { recursive: true });
      }
      await fs.promises.cp(src, path.join(DIST_DIR, "public"), { recursive: true });
    }
  }
  console.log(`${Math.round(pagesTranspiled - start)}ms to Transpile Pages`);
  console.log(`${Math.round(pagesBuilt - pagesTranspiled)}ms to Build Pages`);
  console.log(`${Math.round(end - pagesBuilt)}ms to Build Client`);
  log(green(bold(`Compiled ${pageFiles.length} pages in ${Math.ceil(end - start)}ms!`)));
  if (postCompile) {
    postCompile();
  }
  if (!watch) return;
  for (const watcher of currentWatchers) {
    watcher.close();
  }
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  const watcherFn = async () => {
    if (isTimedOut) return;
    isTimedOut = true;
    process.stdout.write("\x1Bc");
    setTimeout(async () => {
      await build({
        writeToHTML,
        pagesDirectory,
        outputDirectory,
        environment: environment2,
        watchServerPort,
        postCompile,
        preCompile,
        publicDirectory,
        DIST_DIR
      });
      isTimedOut = false;
    }, 100);
  };
  for (const directory of subdirectories) {
    const fullPath = path.join(pagesDirectory, directory);
    const watcher = fs.watch(
      fullPath,
      {},
      watcherFn
    );
    currentWatchers.push(watcher);
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
};
var compile = async (props) => {
  const watch = props.environment === "development";
  const BUILD_FLAG = path.join(props.outputDirectory, "ELEGANCE_BUILD_FLAG");
  if (!fs.existsSync(props.outputDirectory)) {
    fs.mkdirSync(props.outputDirectory);
    fs.writeFileSync(
      path.join(BUILD_FLAG),
      "This file just marks this directory as one containing an Elegance Build.",
      "utf-8"
    );
  } else {
    if (!fs.existsSync(BUILD_FLAG)) {
      throw `The output directory already exists, but is not an Elegance Build directory.`;
    }
  }
  const DIST_DIR = props.writeToHTML ? props.outputDirectory : path.join(props.outputDirectory, "dist");
  if (!fs.existsSync(DIST_DIR)) {
    console.log("Made dist dir", DIST_DIR);
    fs.mkdirSync(DIST_DIR);
  }
  if (watch) {
    await registerListener(props);
  }
  await build({ ...props, DIST_DIR });
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
  writeToHTML: true,
  pagesDirectory: PAGES_DIR,
  outputDirectory: OUTPUT_DIR,
  environment,
  watchServerPort: 3001,
  publicDirectory: {
    path: PUBLIC_DIR,
    method: environment === "production" ? "recursive-copy" : "symlink"
  },
  preCompile: async () => {
  }
}).then(() => {
  if (environment === "production") {
    execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --minify`);
  } else {
    execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --watch=always`);
  }
});
