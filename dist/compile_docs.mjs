// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

// src/build.ts
import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";

// src/helpers/generateHTMLTemplate.ts
var renderElement = (element) => {
  if (typeof element === "string") {
    return element;
  }
  if (typeof element === "number") {
    return element;
  }
  if (typeof element === "boolean") return null;
  if (Array.isArray(element)) {
    return element.join(", ");
  }
  let returnHTML = "";
  returnHTML += `<${element.tag}`;
  if (Object.hasOwn(element, "options")) {
    const options = element.options;
    for (const [key, value] of Object.entries(options)) {
      returnHTML += ` ${key}="${value}"`;
    }
  }
  if (!element.children) {
    returnHTML += "/>";
    return returnHTML;
  }
  returnHTML += ">";
  for (const child of element.children) {
    returnHTML += renderElement(child);
  }
  returnHTML += `</${element.tag}>`;
  return returnHTML;
};
var generateHTMLTemplate = ({
  pageURL,
  head,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  if (addPageScriptTag === true) {
    HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page.js" defer="true"></script>`;
  }
  HTMLTemplate += `<script stype="module" src="/client.js" defer="true"></script>`;
  const builtHead = head();
  for (const child of builtHead.children) {
    HTMLTemplate += renderElement(child);
  }
  if (serverData) {
    HTMLTemplate += serverData;
  }
  return HTMLTemplate;
};

// src/build.ts
import http from "http";

// src/server/state.ts
var debounce = (delay) => {
  let timer;
  return (callback) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, delay);
  };
};
var Subject = class {
  constructor(initialValue, id, enforceRuntimeTypes = false, debounceUpdateMs = null, pathname = "", scope = 1 /* LOCAL */, resetOnPageLeave = false) {
    this.observers = [];
    this.enforceRuntimeTypes = enforceRuntimeTypes;
    this.value = initialValue;
    this.id = id;
    this.pathname = pathname;
    this.scope = scope;
    this.resetOnPageLeave = resetOnPageLeave;
    if (debounceUpdateMs) {
      this.debounce = debounce(debounceUpdateMs);
    }
  }
  set(newValue) {
    if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
      console.error(`Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`);
      return;
    }
    this.value = newValue;
  }
  add(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The add method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    this.value.push(entry);
  }
  remove(entry) {
    if (!Array.isArray(this.value)) {
      console.error(`The remove method of a subject may only be used if the subject's value is an Array.`);
      return;
    }
    const index = this.value.indexOf(entry);
    if (!index) console.error(`Element ${entry} does not exist in this subject, therefore it cannot be removed.`);
    this.value.splice(index, 1);
  }
  get() {
    return this.value;
  }
};
var ServerStateController = class {
  constructor(pathname) {
    this.subjectStore = [];
    this.observerStore = [];
    this.pathname = pathname;
  }
  create(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.pathname === this.pathname && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cSubject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      this.pathname,
      1 /* LOCAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  createGlobal(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      "",
      2 /* GLOBAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  getGlobal(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (!subject) {
      throw new Error(`Could not find a global subject with the ID of ${id}.`);
    }
    return subject;
  }
  get(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.pathname === this.pathname && sub.id === id;
    });
    if (!subject) {
      console.error(`Could not find a subject with the ID of ${id} in the page ${this.pathname}`);
      return;
    }
    return subject;
  }
  storeObserver(id, scope) {
    this.observerStore.push({ [id]: scope });
  }
};

// src/server/renderer.ts
var renderRecursively = (element, index) => {
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
  returnString += ">";
  for (const child of element.children) {
    returnString += renderRecursively(child, index + 1);
  }
  returnString += `</${element.tag}>`;
  return returnString;
};

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
var serverSideRenderPage = async (page, pathname) => {
  if (!page) {
    throw `No Page Provided.`;
  }
  const state = new ServerStateController(pathname);
  const bodyHTML = renderRecursively(page, 0);
  return {
    bodyHTML,
    storedEventListeners: [],
    storedState: state.subjectStore,
    storedObservers: state.observerStore,
    onHydrateFinish: void 0
  };
};

// src/build.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var SSRClientPath = path.resolve(packageDir, "./src/client/client.ts");
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
    else if (!infoFileInSubdirectory)
      throw "Each page.js/ts file must have an accompanying info.js/ts file.";
    else if (!pageFileInSubdirectory)
      throw "Each info.js/ts file must have an accompanying page.js/ts file.";
    pageFiles.push(pageFileInSubdirectory);
    infoFiles.push(infoFileInSubdirectory);
  }
  return {
    pageFiles,
    infoFiles
  };
};
var buildClient = async (environment, DIST_DIR) => {
  await esbuild.build({
    bundle: true,
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: true,
    entryPoints: [SSRClientPath],
    outdir: DIST_DIR,
    format: "iife",
    platform: "node"
  });
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
var processPageElements = (element, objectAttributes, key) => {
  if (typeof element === "string" || typeof element === "boolean" || typeof element === "number" || Array.isArray(element)) return element;
  for (const [option, attributeValue] of Object.entries(element.options)) {
    if (typeof attributeValue !== "object") {
      if (option.toLowerCase() === "innertext") {
        element.children = [attributeValue, ...element.children];
      } else if (option.toLowerCase() === "innerhtml") {
        element.children = [attributeValue];
      }
      continue;
    }
    ;
    if (!element.options.key) {
      element.options.key = key;
    }
    if (!attributeValue.type) {
      throw `ObjectAttributeType is missing from object attribute. Got: ${JSON.stringify(attributeValue)}. For attribute: ${option}`;
    }
    switch (attributeValue.type) {
      case 1 /* STATE */:
        if (typeof attributeValue.value === "function") {
          if (!option.toLowerCase().startsWith("on")) {
            throw `ObjectAttribute.STATE type object attributes may not have their value be a function, unless their attribute is an event handler.`;
          }
          delete element.options[option];
          break;
        }
        if (option.toLowerCase() === "innertext") {
          element.children = [attributeValue.value, ...element.children];
          delete element.options[option];
        } else if (option.toLowerCase() === "innerhtml") {
          element.children = [attributeValue.value];
          delete element.options[option];
        } else {
          element.options[option] = attributeValue.value;
        }
        break;
      case 3 /* OBSERVER */:
        const firstValue = attributeValue.update(...attributeValue.initialValues);
        if (option.toLowerCase() === "innertext") {
          element.children = [firstValue, ...element.children];
          delete element.options[option];
        } else if (option.toLowerCase() === "innerhtml") {
          element.children = [firstValue];
          delete element.options[option];
        } else {
          element.options[option] = firstValue;
        }
        break;
    }
    objectAttributes.push({ ...attributeValue, key, attribute: option });
  }
  for (let child of element.children) {
    const processedChild = processPageElements(child, objectAttributes, key + 1);
    child = processedChild;
  }
  return element;
};
var generateSuitablePageElements = async (pageLocation, pageElements, metadata, DIST_DIR, writeToHTML) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    return [];
  }
  const objectAttributes = [];
  const processedPageElements = processPageElements(pageElements, objectAttributes, 1);
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
var generateClientPageData = async (pageLocation, state, objectAttributes, DIST_DIR, watch) => {
  let clientPageJSText = `let url="${pageLocation === "" ? "/" : pageLocation}";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
  if (watch) {
    clientPageJSText += "pd[url]={...pd[url],w:true};";
  }
  if (state) {
    let formattedStateString = "";
    for (const [key, subject] of Object.entries(state)) {
      if (typeof subject.value === "string") {
        formattedStateString += `${key}:{id:${subject.id},value:"${subject.value}"},`;
      } else {
        formattedStateString += `${key}:{id:${subject.id},value:${subject.value}},`;
      }
    }
    clientPageJSText += `pd[url]={...pd[url],state:{${formattedStateString}}};`;
  }
  const stateObjectAttributes = objectAttributes.filter((oa) => oa.type === 1 /* STATE */);
  if (stateObjectAttributes.length > 0) {
    clientPageJSText += `pd[url]={...pd[url],soa:${JSON.stringify(stateObjectAttributes)}};`;
  }
  const observerObjectAttributes = objectAttributes.filter((oa) => oa.type === 3 /* OBSERVER */);
  if (observerObjectAttributes.length > 0) {
    let observerObjectAttributeString = "pd[url]={...pd[url],ooa:[";
    for (const observerObjectAttribute of observerObjectAttributes) {
      const ooa = observerObjectAttribute;
      observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",ids:[${ooa.ids}],update:${ooa.update.toString()}},`;
    }
    observerObjectAttributeString += "]};";
    clientPageJSText += observerObjectAttributeString;
  }
  fs.writeFileSync(
    path.join(DIST_DIR, pageLocation, "page.js"),
    clientPageJSText,
    "utf-8"
  );
};
var buildPages = async (pages, environment, DIST_DIR, writeToHTML, watch) => {
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
    const { page: pageElements, state } = await import(pagePath + `?${Date.now()}`);
    const objectAttributes = await generateSuitablePageElements(page.pageLocation, pageElements, page.metadata, DIST_DIR, writeToHTML);
    await generateClientPageData(page.pageLocation, state, objectAttributes, DIST_DIR, watch);
  }
};
var getPageCompilationDirections = async (pageFiles, pagesDirectory, SERVER_DIR) => {
  const builtInfoFiles = [...getAllSubdirectories(SERVER_DIR), ""];
  const compilationDirections = [];
  for (const builtInfoFile of builtInfoFiles) {
    const absoluteFilePath = `${path.join(SERVER_DIR, builtInfoFile, "/info.js")}`;
    const pagePath = path.join(pagesDirectory, builtInfoFile);
    const pageFile = pageFiles.find((page) => page.parentPath === pagePath);
    if (!pageFile) continue;
    const infoFileExports = await import(absoluteFilePath);
    const {
      metadata,
      executeOnServer,
      generateMetadata = 1 /* ON_BUILD */
    } = infoFileExports;
    if (!metadata) {
      throw `${builtInfoFile} does not export a function \`metadata\`. Info files must export a \`metadata\` function which resolves into a <head> element.`;
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
var isListening = false;
var isTimedOut = false;
var registerListener = async (props) => {
  if (isListening) return;
  isListening = true;
  let stream;
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
      stream = res;
      res.write("data: reload\n\n");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  server.listen(3001, () => {
    log(white("Emitting changes on localhost:3001"));
  });
  fs.watch(props.pagesDirectory, async (event, filename) => {
    if (isTimedOut) return;
    isTimedOut = true;
    process.stdout.write("\x1Bc");
    setTimeout(async () => {
      await compile({ ...props });
      if (stream) {
        stream.write(`data: reload

`);
      }
      isTimedOut = false;
    }, 100);
  });
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
  await buildPages(pages, environment, DIST_DIR, writeToHTML, watch);
  await buildClient(environment, DIST_DIR);
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
      watch: false
    });
  }
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
  exec(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --watch`);
  console.log("Built Docs.");
});
