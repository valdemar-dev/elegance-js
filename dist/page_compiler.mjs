// src/page_compiler.ts
import fs from "fs";
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
  if (typeof page === "function") {
    throw `Unbuilt page provided to ssr page.`;
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

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};
var initializeObjectAttributes = () => globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__ = [];
var getObjectAttributes = () => {
  return globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__;
};

// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

// src/server/layout.ts
var resetLayouts = () => globalThis.__SERVER_CURRENT_LAYOUTS__ = /* @__PURE__ */ new Map();
if (!globalThis.__SERVER_CURRENT_LAYOUT_ID__) globalThis.__SERVER_CURRENT_LAYOUT_ID__ = 1;
var layoutId = globalThis.__SERVER_CURRENT_LAYOUT_ID__;

// src/page_compiler.ts
var packageDir = process.env.PACKAGE_PATH;
if (packageDir === void 0) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  packageDir = path.resolve(__dirname, "..");
}
var clientPath = path.resolve(packageDir, "./dist/client/client.mjs");
var watcherPath = path.resolve(packageDir, "./dist/client/watcher.mjs");
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
  if (options.quiet) return;
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
var options = JSON.parse(process.env.OPTIONS);
var DIST_DIR = process.env.DIST_DIR;
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
var getProjectFiles = (pagesDirectory) => {
  const files = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);
    const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".ts"));
    for (const file of subdirectoryFiles) {
      files.push(file);
    }
  }
  return files;
};
var buildClient = async (DIST_DIR2) => {
  let clientString = "window.__name = (func) => func; ";
  clientString += fs.readFileSync(clientPath, "utf-8");
  if (options.hotReload !== void 0) {
    clientString += `const watchServerPort = ${options.hotReload.port}`;
    clientString += fs.readFileSync(watcherPath, "utf-8");
  }
  const transformedClient = await esbuild.transform(clientString, {
    minify: options.environment === "production",
    drop: options.environment === "production" ? ["console", "debugger"] : void 0,
    keepNames: false,
    format: "iife",
    platform: "node",
    loader: "ts"
  });
  fs.writeFileSync(
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
var generateSuitablePageElements = async (pageLocation, pageElements, metadata, DIST_DIR2, pageName, doWrite = true) => {
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
    pageURL: path.relative(DIST_DIR2, pageLocation),
    head: metadata,
    addPageScriptTag: true,
    name: pageName
  });
  const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;
  const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
  if (doWrite) {
    fs.writeFileSync(
      htmlLocation,
      resultHTML,
      {
        encoding: "utf-8",
        flag: "w"
      }
    );
    return objectAttributes;
  } else {
    return {
      objectAttributes,
      resultHTML
    };
  }
};
var generateClientPageData = async (pageLocation, state, objectAttributes, pageLoadHooks, DIST_DIR2, pageName) => {
  const pageDiff = path.relative(DIST_DIR2, pageLocation);
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
  const transformedResult = await esbuild.transform(clientPageJSText, { minify: options.environment === "production" }).catch((error) => {
    console.error("Failed to transform client page js!", error);
  });
  if (!transformedResult) return { sendHardReloadInstruction };
  fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8");
  return { sendHardReloadInstruction };
};
var buildPages = async (DIST_DIR2) => {
  resetLayouts();
  const subdirectories = [...getAllSubdirectories(DIST_DIR2), ""];
  let shouldClientHardReload = false;
  for (const directory of subdirectories) {
    const abs = path.resolve(path.join(DIST_DIR2, directory));
    const files = fs.readdirSync(abs, { withFileTypes: true }).filter((f) => f.name.endsWith(".mjs"));
    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const name = file.name.slice(0, file.name.length - 4);
      const isPage = file.name.includes("page");
      if (isPage == false) {
        continue;
      }
      const hardReloadForPage = await buildPage(DIST_DIR2, directory, filePath, name);
      if (hardReloadForPage) {
        shouldClientHardReload = true;
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
  try {
    const {
      page,
      metadata: pageMetadata,
      isDynamicPage
    } = await import("file://" + filePath);
    pageElements = page;
    metadata = pageMetadata;
    if (isDynamicPage === true) {
      await esbuild.build({
        entryPoints: [filePath],
        outfile: filePath,
        // necessary because we're mutilating the original
        allowOverwrite: true,
        bundle: true,
        format: "cjs",
        // Important
        plugins: [
          {
            name: "wrap-cjs",
            setup(build2) {
              build2.onEnd(async () => {
                const fs2 = await import("fs/promises");
                const code = await fs2.readFile(build2.initialOptions.outfile, "utf8");
                const wrapped = `export function construct() {
    const exports = {};
    const module = { exports };
    (function(exports, module) {
        ${code.split("\n").map((l) => "    " + l).join("\n")}
    })(exports, module);
    
    return module.exports;
}
`;
                await fs2.writeFile(build2.initialOptions.outfile, wrapped);
              });
            }
          }
        ]
      });
      return false;
    }
    fs.rmSync(filePath, { force: true });
  } catch (e) {
    throw new Error(`Error in Page: ${directory === "" ? "/" : directory}${name}.mjs - ${e}`);
  }
  if (!metadata || metadata && typeof metadata !== "function") {
    console.warn(`WARNING: ${filePath} does not export a metadata function. This is *highly* recommended.`);
  }
  if (!pageElements) {
    console.warn(`WARNING: ${filePath} should export a const page, which is of type BuiltElement<"body">.`);
  }
  if (typeof pageElements === "function") {
    pageElements = pageElements();
  }
  const state = getState();
  const pageLoadHooks = getLoadHooks();
  const objectAttributes = getObjectAttributes();
  const foundObjectAttributes = await generateSuitablePageElements(
    path.dirname(filePath),
    pageElements || body(),
    metadata ?? (() => head()),
    DIST_DIR2,
    name
  );
  const {
    sendHardReloadInstruction
  } = await generateClientPageData(
    path.dirname(filePath),
    state || {},
    [...objectAttributes, ...foundObjectAttributes],
    pageLoadHooks || [],
    DIST_DIR2,
    name
  );
  return sendHardReloadInstruction === true;
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
    const projectFiles = getProjectFiles(options.pagesDirectory);
    const start = performance.now();
    const recursionFlag = Symbol("external-node-modules-recursion");
    {
      const externalPackagesPlugin = {
        name: "external-packages",
        setup(build2) {
          build2.onResolve({ filter: /^[^./]/ }, async (args) => {
            if (args.pluginData?.[recursionFlag]) {
              return;
            }
            const result = await build2.resolve(args.path, {
              resolveDir: args.resolveDir,
              kind: args.kind,
              importer: args.importer,
              pluginData: { [recursionFlag]: true }
            });
            if (result.errors.length > 0 || result.external || !result.path) {
              return { path: args.path, external: true };
            }
            const nodeModulesIndex = result.path.indexOf("node_modules");
            if (nodeModulesIndex === -1) {
              return result;
            }
            const isNested = result.path.includes("node_modules", nodeModulesIndex + 14);
            if (isNested) {
              return { path: args.path, external: true };
            }
            return { path: args.path, external: true };
          });
        }
      };
      await esbuild.build({
        entryPoints: projectFiles.map((f) => path.join(f.parentPath, f.name)),
        bundle: true,
        outdir: DIST_DIR,
        outExtension: { ".js": ".mjs" },
        plugins: [externalPackagesPlugin],
        loader: {
          ".ts": "ts"
        },
        format: "esm",
        platform: "node",
        keepNames: false,
        define: {
          "DEV": options.environment === "development" ? "true" : "false",
          "PROD": options.environment === "development" ? "false" : "true"
        }
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
      log("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), options.publicDirectory.path);
      if (fs.existsSync(src) === false) {
        console.warn("WARNING: Public directory not found, an attempt will be made create it..");
        fs.mkdirSync(src, { recursive: true });
      }
      await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true });
    }
    {
      log(`${Math.round(pagesTranspiled - start)}ms to Transpile Fales`);
      log(`${Math.round(pagesBuilt - pagesTranspiled)}ms to Build Pages`);
      log(`${Math.round(end - pagesBuilt)}ms to Build Client`);
      log(green(bold(`Compiled ${projectFiles.length} files in ${Math.ceil(end - start)}ms!`)));
    }
    process.send({ event: "message", data: "set-layouts", layouts: JSON.stringify(Array.from(__SERVER_CURRENT_LAYOUTS__)), currentLayouTId: __SERVER_CURRENT_LAYOUT_ID__ });
    process.send({ event: "message", data: "compile-finish" });
    if (shouldClientHardReload) {
      log("Sending hard reload..");
      process.send({ event: "message", data: "hard-reload" });
    } else {
      log("Sending soft reload..");
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
  processPageElements
};
