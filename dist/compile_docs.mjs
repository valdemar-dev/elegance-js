// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

// src/build.ts
import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";

// src/shared/bindBrowserElements.ts
var elementsWithAttributesAndChildren = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "body",
  "blockquote",
  "button",
  "canvas",
  "cite",
  "code",
  "colgroup",
  "data",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
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
  "header",
  "hr",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "u",
  "ul",
  "var",
  "video",
  "details",
  "datalist"
];
var elementsWithAttributesOnly = [
  "audio",
  "base",
  "br",
  "col",
  "embed",
  "link",
  "meta",
  "noscript",
  "source",
  "track",
  "wbr",
  "area",
  "command",
  "picture",
  "progress",
  "html",
  "head"
];
var elementsWithChildrenOnly = [
  "title",
  "template"
];
var define = (tagName, hasAttr, hasChildren) => {
  return (...args) => {
    let options = {};
    let children = [];
    if (hasAttr && args.length > 0 && typeof args[0] === "object") {
      options = args[0];
      if (hasChildren && args.length > 1) {
        children = args.slice(1);
      }
    } else if (hasChildren && args.length > 0) {
      children = args;
    }
    return {
      tag: tagName,
      getOptions: options ?? {},
      children
    };
  };
};
Object.assign(globalThis, {
  ...elementsWithAttributesAndChildren.reduce((acc, el) => {
    acc[el] = define(el, true, true);
    return acc;
  }, {}),
  ...elementsWithChildrenOnly.reduce((acc, el) => {
    acc[el] = define(el, false, true);
    return acc;
  }, {}),
  ...elementsWithAttributesOnly.reduce((acc, el) => {
    acc[el] = define(el, true, false);
    return acc;
  }, {})
});

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
  for (const [attrName, attrValue] of Object.entries(element.options)) {
    if (typeof attrValue === "object") {
      throw `Internal error, attr ${attrName} has obj type.`;
    }
    returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
  }
  if (element.children.length < 1) {
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
var initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = {};
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};

// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

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
var buildClient = async (environment, DIST_DIR, isInWatchMode) => {
  let clientString = fs.readFileSync(clientPath, "utf-8");
  if (isInWatchMode) {
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
var layoutKey = 0;
var layoutKeyMap = {};
var processPageElements = (element, objectAttributes) => {
  if (typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) return element;
  if (typeof element === "string") {
    return escapeHtml(element);
  }
  for (const [option, attributeValue] of Object.entries(element.options)) {
    if (typeof attributeValue !== "object") {
      if (option.toLowerCase() === "innertext") {
        delete element.options[option];
        element.children = [attributeValue, ...element.children];
      } else if (option.toLowerCase() === "innerhtml") {
        delete element.options[option];
        element.children = [attributeValue];
      }
      continue;
    }
    ;
    let key = element.options.key;
    if (!element.options.key) {
      key = elementKey++;
      element.options.key = key;
    }
    if (!attributeValue.type) {
      const valueAsString = JSON.stringify(attributeValue);
      throw `ObjectAttributeType is missing from object attribute. Got: ${valueAsString}. For attribute: ${option}`;
    }
    const lowerCaseOption = option.toLowerCase();
    let optionFinal = lowerCaseOption;
    switch (attributeValue.type) {
      case 1 /* STATE */:
        if (typeof attributeValue.value === "function") {
          delete element.options[option];
          break;
        }
        if (lowerCaseOption === "innertext" || lowerCaseOption === "innerhtml") {
          element.children = [attributeValue.value];
          delete element.options[option];
        } else {
          delete element.options[option];
          element.options[lowerCaseOption] = attributeValue.value;
        }
        break;
      case 3 /* OBSERVER */:
        const firstValue = attributeValue.update(...attributeValue.initialValues);
        if (lowerCaseOption === "innertext" || lowerCaseOption === "innerhtml") {
          element.children = [firstValue];
          delete element.options[option];
        } else {
          delete element.options[option];
          element.options[lowerCaseOption] = firstValue;
        }
        optionFinal = option;
        break;
      case 4 /* BREAKPOINT */:
        let value = layoutKeyMap[`${attributeValue.value}`];
        if (!value) value = layoutKey++;
        layoutKeyMap[`${attributeValue.value}`] = value;
        element.options["bp"] = value;
        break;
    }
    objectAttributes.push({ ...attributeValue, key, attribute: optionFinal });
  }
  for (let child of element.children) {
    const processedChild = processPageElements(child, objectAttributes);
    child = processedChild;
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
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR, watch) => {
  let clientPageJSText = `let url="${pageLocation === "" ? "/" : `/${pageLocation}`}";`;
  clientPageJSText += `if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
  clientPageJSText += `pd[url]={`;
  if (watch) {
    clientPageJSText += "w:true,";
  }
  if (state) {
    let formattedStateString = "";
    const sortedState = Object.entries(state).sort(([, av], [, bv]) => av.id - bv.id);
    for (const [key, subject] of sortedState) {
      if (typeof subject.value === "string") {
        formattedStateString += `{id:${subject.id},value:"${subject.value}"},`;
      } else {
        formattedStateString += `{id:${subject.id},value:${subject.value}},`;
      }
    }
    clientPageJSText += `state:[${formattedStateString}],`;
  }
  const stateObjectAttributes = objectAttributes.filter((oa) => oa.type === 1 /* STATE */);
  if (stateObjectAttributes.length > 0) {
    clientPageJSText += `soa:${JSON.stringify(stateObjectAttributes)},`;
  }
  const observerObjectAttributes = objectAttributes.filter((oa) => oa.type === 3 /* OBSERVER */);
  if (observerObjectAttributes.length > 0) {
    let observerObjectAttributeString = "ooa:[";
    for (const observerObjectAttribute of observerObjectAttributes) {
      const ooa = observerObjectAttribute;
      observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",`;
      observerObjectAttributeString += `ids:[${ooa.ids}],update:${ooa.update.toString()}},`;
    }
    observerObjectAttributeString += "],";
    clientPageJSText += observerObjectAttributeString;
  }
  if (pageLoadHooks.length > 0) {
    clientPageJSText += "lh:[";
    for (const loadHook of pageLoadHooks) {
      const key = layoutKeyMap[`${loadHook.bind}`];
      if (!key) {
        if (loadHook.bind.length > 0) {
          throw `Loadhook bound to non-existent breakpoint key: ${loadHook.bind}`;
        }
      }
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
    const pagePath = path.join(DIST_DIR, page.pageLocation, "page.js");
    initializeState();
    resetLoadHooks();
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
      DIST_DIR,
      watch
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
    const absoluteFilePath = `${path.join(SERVER_DIR, builtInfoFile, "/info.js")}`;
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
    server.listen(3001, () => {
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
  watch = true
}) => {
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
  layoutKeyMap = {};
  layoutKey = 1;
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
  await buildClient(environment, DIST_DIR, watch);
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
      watch
    });
  }
  return {
    shouldClientHardReload
  };
};

// src/compile_docs.ts
import { exec } from "child_process";
import path2 from "path";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var PAGES_DIR = path2.join(__dirname2, "../src/docs");
var OUTPUT_DIR = path2.join(__dirname2, "../docs");
compile({
  writeToHTML: true,
  pagesDirectory: PAGES_DIR,
  outputDirectory: OUTPUT_DIR,
  environment: "development",
  watch: true
}).then(() => {
  exec(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --minify --watch`);
  console.log("Built Docs.");
});
