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
  if (typeof element !== "function") {
    throw "Cannot render non-functional elements.";
  }
  const builtElement = element();
  let returnHTML = "";
  returnHTML += `<${builtElement.tag}`;
  if (Object.hasOwn(builtElement, "getOptions")) {
    const options = builtElement.getOptions();
    for (const [key, value] of Object.entries(options)) {
      returnHTML += ` ${key}="${value}"`;
    }
  }
  if (!builtElement.children) {
    returnHTML += "/>";
    return returnHTML;
  }
  returnHTML += ">";
  for (const child of builtElement.children) {
    returnHTML += renderElement(child);
  }
  returnHTML += `</${builtElement.tag}>`;
  return returnHTML;
};
var generateHTMLTemplate = ({
  pageURL,
  head,
  renderingMethod,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  switch (renderingMethod) {
    case 1 /* SERVER_SIDE_RENDERING */:
      HTMLTemplate += `<script src="/client_ssr.js" defer="true"></script>`;
      break;
    case 2 /* STATIC_GENERATION */:
      HTMLTemplate += `<script src="/client_ssg.js" defer="true"></script>`;
      break;
    case 3 /* CLIENT_SIDE_RENDERING */:
      HTMLTemplate += `<script src="/client_csr.js" defer="true"></script>`;
      break;
  }
  if (addPageScriptTag) {
    HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page.js" defer="true"></script>`;
  }
  const builtHead = head()();
  for (const child of builtHead.children) {
    HTMLTemplate += renderElement(child);
  }
  if (serverData) {
    HTMLTemplate += serverData;
  }
  return HTMLTemplate;
};

// src/shared/serverElements.ts
var createElementOptions = (obj) => {
  return function() {
    const reevaluatedObj = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "function") {
        if (key.startsWith("on")) {
          reevaluatedObj[key] = value;
        } else {
          reevaluatedObj[key] = value();
        }
      } else {
        reevaluatedObj[key] = value;
      }
    }
    return reevaluatedObj;
  };
};
var createBuildableElement = (tag) => {
  return (options, ...children) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children
    });
  };
};
var createOptionlessBuildableElement = (tag) => {
  return (...children) => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children
    });
  };
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children: []
    });
  };
};
var optionlessElementTags = [
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
  "wbr"
];
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
  "title",
  "tr",
  "ul",
  "video",
  "span"
];
var elements = {};
var optionlessElements = {};
var childrenlessElements = {};
for (const element of elementTags) {
  elements[element] = createBuildableElement(element);
}
for (const element of optionlessElementTags) {
  optionlessElements[element] = createOptionlessBuildableElement(element);
}
for (const element of childrenlessElementTags) {
  childrenlessElements[element] = createChildrenlessBuildableElement(element);
}
var allElements = {
  ...elements,
  ...optionlessElements,
  ...childrenlessElements
};

// src/build.ts
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
var rootPath = process.cwd();
var DIST_DIR = path.join(rootPath, "./.elegance/dist");
var SERVER_DIR = path.join(rootPath, "./.elegance/server");
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var CSRClientPath = path.resolve(packageDir, "./src/client/client_csr.ts");
var SSGClientPath = path.resolve(packageDir, "./src/client/client_ssg.ts");
var SSRClientPath = path.resolve(packageDir, "./src/client/client_ssr.ts");
var bindElementsPath = path.resolve(packageDir, "./src/shared/bindServerElements.ts");
var getProjectFiles = (pagesDirectory) => {
  const pageFiles = [];
  const infoFiles = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(rootPath, pagesDirectory, subdirectory);
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
var esbuildPluginReplaceElementCalls = (functionNames, environment) => ({
  name: "rename-function-calls",
  setup(build) {
    build.onLoad({ filter: /\.(js|mjs|ts)$/ }, (args) => {
      let code = fs.readFileSync(args.path, "utf8");
      environment === "development" && console.log(`BUILDING: ${args.path}`);
      for (const functionName of functionNames) {
        const regex = new RegExp(`(?<!\\.)\\b(${functionName})\\s*\\(`, "g");
        code = code.replaceAll(regex, `_e.${functionName}(`);
      }
      ;
      return {
        contents: code,
        loader: args.suffix in ["js", "mjs"] ? "js" : "ts"
      };
    });
  }
});
var buildClient = async (environment) => {
  await esbuild.build({
    bundle: true,
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: true,
    entryPoints: [CSRClientPath, SSRClientPath, SSGClientPath],
    outdir: DIST_DIR,
    format: "esm",
    platform: "node",
    plugins: [esbuildPluginReplaceElementCalls(Object.keys(allElements), environment)]
  });
};
var buildInfoFiles = async (infoFiles, environment) => {
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
var getPageCompilationDirections = async (pageFiles, pagesDirectory) => {
  const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
  const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];
  const compilationDirections = [];
  for (const builtInfoFile of builtInfoFiles) {
    const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;
    const pagePath = path.join(rootPath, pagesDirectory, builtInfoFile);
    const pageFile = pageFiles.find((page) => page.parentPath === pagePath);
    if (!pageFile) {
      continue;
    }
    const infoFileExports = await import(absoluteFilePath);
    const {
      renderingMethod = 1 /* SERVER_SIDE_RENDERING */,
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
      renderingMethod,
      metadata,
      executeOnServer: executeOnServer ?? null,
      generateMetadata,
      pageFilepath: `${pageFile.parentPath}/${pageFile.name}`,
      pageLocation: builtInfoFile
    });
  }
  return compilationDirections;
};
var processSSRPages = async (SSRPages, environment) => {
  for (const page of SSRPages) {
    if (page.generateMetadata !== 1 /* ON_BUILD */) {
      continue;
    }
    const template = generateHTMLTemplate({
      pageURL: page.pageLocation,
      head: page.metadata,
      addPageScriptTag: false,
      renderingMethod: page.renderingMethod
    });
    fs.writeFileSync(
      path.join(DIST_DIR, page.pageLocation, "metadata.html"),
      template,
      "utf-8"
    );
  }
};
var processSSGPages = async (SSGPages, environment) => {
};
var processCSRPages = async (CSRPages, environment) => {
  for (const page of CSRPages) {
    if (page.generateMetadata !== 1 /* ON_BUILD */) {
      continue;
    }
    const template = generateHTMLTemplate({
      pageURL: page.pageLocation,
      head: page.metadata,
      addPageScriptTag: true,
      renderingMethod: page.renderingMethod
    });
    fs.writeFileSync(
      path.join(DIST_DIR, page.pageLocation, "metadata.html"),
      template,
      "utf-8"
    );
  }
};
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
var compile = async ({
  pagesDirectory,
  buildOptions,
  environment
}) => {
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
  await buildInfoFiles(infoFiles, environment);
  const pageCompilationDirections = await getPageCompilationDirections(pageFiles, pagesDirectory);
  const CSRPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === 3 /* CLIENT_SIDE_RENDERING */);
  const SSRPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === 1 /* SERVER_SIDE_RENDERING */);
  const SSGPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === 2 /* STATIC_GENERATION */);
  await esbuild.build({
    entryPoints: [
      ...SSRPages.map((page) => page.pageFilepath),
      ...CSRPages.map((page) => page.pageFilepath)
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
    platform: "node",
    plugins: [esbuildPluginReplaceElementCalls(Object.keys(allElements), environment)]
  });
  await processSSRPages(SSRPages, environment);
  await processCSRPages(CSRPages, environment);
  await processSSGPages(SSGPages, environment);
  await buildClient(environment);
  const end = performance.now();
  log(bold(yellow(" -- Elegance.JS -- ")));
  log(white(`Finished build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}.`));
  log(green(bold(`Created ${pageFiles.length} pages in ${Math.ceil(end - start)}ms!`)));
  log("");
  log(white("  CSR:"));
  for (const page of CSRPages) {
    log(white_100(`    - /${page.pageLocation}`));
  }
  log(white("  SSR:"));
  for (const page of SSRPages) {
    log(white_100(`    - /${page.pageLocation}`));
  }
  log(white("  SSG:"));
  for (const page of SSGPages) {
    log(white_100(`    - /${page.pageLocation}`));
  }
};
export {
  compile
};
