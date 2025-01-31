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
var rootPath = process.cwd();
var DIST_DIR = path.join(rootPath, "./.elegance/dist");
var SERVER_DIR = path.join(rootPath, "./.elegance/server");
for (const file of fs.readdirSync(DIST_DIR)) {
  fs.unlinkSync(path.join(DIST_DIR, file));
}
for (const file of fs.readdirSync(SERVER_DIR)) {
  fs.unlinkSync(path.join(SERVER_DIR, file));
}
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var SSRClientPath = path.resolve(packageDir, "./src/client/client.ts");
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
var buildClient = async (environment) => {
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
      throw `ObjectAttributeType type is missing from object attribute. Got: ${JSON.stringify(attributeValue)}. For attribute: ${option}`;
    }
    switch (attributeValue.type) {
      case 1 /* STATE */:
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
        const firstValue = attributeValue.update(attributeValue.initialValue);
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
    objectAttributes.push({ ...attributeValue, key, attributeName: option });
  }
  for (let child of element.children) {
    const processedChild = processPageElements(child, objectAttributes, key + 1);
    child = processedChild;
  }
  return element;
};
var generateSuitablePageElements = async (pageLocation, pageElements) => {
  if (typeof pageElements === "string" || typeof pageElements === "boolean" || typeof pageElements === "number" || Array.isArray(pageElements)) {
    return [];
  }
  const objectAttributes = [];
  const processedPageElements = processPageElements(pageElements, objectAttributes, 1);
  console.log(objectAttributes);
  fs.writeFileSync(
    path.join(DIST_DIR, pageLocation, "page.json"),
    JSON.stringify(processedPageElements),
    "utf-8"
  );
  return objectAttributes;
};
var generateClientPageData = async (pageLocation, state, objectAttributes) => {
  let clientPageJSText = `let url="${pageLocation === "" ? "/" : pageLocation}";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
  if (state) {
    const formattedState = {};
    for (const [key, value] of Object.entries(state)) {
      formattedState[value.id] = value.value;
    }
    clientPageJSText += `pd[url]={...pd[url],state:${JSON.stringify(formattedState)}};`;
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
      observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attributeName}",id:${ooa.id},update:${ooa.update.toString()}},`;
    }
    observerObjectAttributeString += "]}";
    clientPageJSText += observerObjectAttributeString;
  }
  fs.writeFileSync(
    path.join(DIST_DIR, pageLocation, "page.js"),
    clientPageJSText,
    "utf-8"
  );
};
var buildPages = async (pages, environment) => {
  for (const page of pages) {
    if (page.generateMetadata !== 1 /* ON_BUILD */) {
      continue;
    }
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
    const pagePath = path.join(DIST_DIR, page.pageLocation, "page.js");
    const { page: pageElements, state } = await import(pagePath);
    const objectAttributes = await generateSuitablePageElements(page.pageLocation, pageElements);
    await generateClientPageData(page.pageLocation, state, objectAttributes);
  }
};
var getPageCompilationDirections = async (pageFiles, pagesDirectory) => {
  const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
  const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];
  const compilationDirections = [];
  for (const builtInfoFile of builtInfoFiles) {
    const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;
    const pagePath = path.join(rootPath, pagesDirectory, builtInfoFile);
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
  const pages = await getPageCompilationDirections(pageFiles, pagesDirectory);
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
  await buildPages(pages, environment);
  await buildClient(environment);
  const end = performance.now();
  log(bold(yellow(" -- Elegance.JS -- ")));
  log(white(`Finished build at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}.`));
  log(green(bold(`Created ${pageFiles.length} pages in ${Math.ceil(end - start)}ms!`)));
  log("");
  log(white("  Pages:"));
  for (const page of pages) {
    log(white_100(`    - /${page.pageLocation}`));
  }
};
export {
  compile
};
