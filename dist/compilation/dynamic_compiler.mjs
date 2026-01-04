import { initializeObjectAttributes, initializeState } from "../server/state";
import { resetLoadHooks } from "../server/loadHook";
import { fetchPageLayoutHTML, pageToHTML, shipModules, modulesToShip, PAGE_MAP } from "./compilation";
import path from "path";
async function buildDynamicPage(DIST_DIR, directory, pageInfo, req, res, middlewareData) {
  directory = directory === "/" ? "" : directory;
  const filePath = pageInfo.filePath;
  initializeState();
  initializeObjectAttributes();
  resetLoadHooks();
  globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
  let pageElements = async function(props) {
    return body();
  };
  let metadata = async function(props) {
    return html();
  };
  let modules = {};
  let pageIgnoresLayout = false;
  try {
    const {
      page,
      metadata: pageMetadata,
      shippedModules,
      ignoreLayout,
      requestHook
    } = await import("file://" + filePath);
    if (requestHook) {
      const hook = requestHook;
      const doContinue = await hook(req, res);
      if (!doContinue) {
        return false;
      }
    }
    if (shippedModules !== void 0) {
      modules = shippedModules;
    }
    if (ignoreLayout) {
      pageIgnoresLayout = true;
    }
    pageElements = page;
    metadata = pageMetadata;
  } catch (e) {
    throw new Error(`Error in Page: ${directory}/page.ts - ${e}`);
  }
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
    middlewareData
  };
  if (typeof pageElements === "function") {
    if (pageElements.constructor.name === "AsyncFunction") {
      pageElements = await pageElements(pageProps);
    } else {
      pageElements = pageElements(pageProps);
    }
  }
  const layout = await fetchPageLayoutHTML(path.dirname(filePath));
  const resultHTML = await pageToHTML(
    path.join(DIST_DIR, directory),
    pageElements,
    metadata,
    DIST_DIR,
    "page",
    false,
    modules,
    layout,
    directory
  );
  await shipModules();
  return { resultHTML };
}
function doesPageExist(pathname) {
  return PAGE_MAP.has(pathname);
}
function getPage(pathname) {
  return PAGE_MAP.get(pathname);
}
export {
  buildDynamicPage,
  doesPageExist,
  getPage
};
