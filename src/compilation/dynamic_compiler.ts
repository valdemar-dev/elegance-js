import { IncomingMessage, ServerResponse } from "http";
import { initializeObjectAttributes, initializeState } from "../server/state";
import { resetLoadHooks } from "../server/loadHook";
import { fetchPageLayoutHTML, pageToHTML, shipModules, modulesToShip } from "./compilation";
import path from "path";

/**
 * This is the dynamic compiler, aka the one used by the built-in Elegance server in order to build dynamic pages
 */
let LAYOUT_MAP = new Map();
let PAGE_MAP = new Map();

/** Populate layout and page map for the server, so it knows what pages exist within the project. */
function populateServerMaps(pageMap: Map<any, any>, layoutMap: Map<any, any>) {
    LAYOUT_MAP = layoutMap;
    PAGE_MAP = pageMap;
}

/** Render a page that has been deemed dynamic. */
async function buildDynamicPage(
    DIST_DIR: string,
    directory: string,
    pageInfo: PageInformation,
    req: IncomingMessage, 
    res: ServerResponse,
    middlewareData: MiddlewareData,
) {
    directory = directory === "/" ? "" : directory;
    
    const filePath = pageInfo.filePath;
    
    initializeState();
    initializeObjectAttributes();
    resetLoadHooks();
    
    globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
    
    let pageElements: any = async function (props: PageProps) { return body(); };
    let metadata: any = async function (props: PageProps) { return html(); };
    let modules: ShippedModules = {};
    let pageIgnoresLayout: boolean = false;
    
    try {
        const {
            page,
            metadata: pageMetadata,
            shippedModules,
            ignoreLayout,
            requestHook,
        } = await import("file://" + filePath);
        
        if (requestHook) {
            const hook = requestHook as RequestHook;
            
            const doContinue = await hook(req, res);
            
            if (!doContinue) {
                return false;
            }
        }
        
        if (shippedModules !== undefined) {
            modules = shippedModules;
        }
        
        if (ignoreLayout) {
            pageIgnoresLayout = true;
        }
        
        pageElements = page;
        metadata = pageMetadata;
    } catch(e) {
        throw new Error(`Error in Page: ${directory}/page.ts - ${e}`);
    }
    
    if (modules !== undefined) {
        for (const [globalName, path] of Object.entries(modules)) {
            modulesToShip.push({ globalName, path, })
        }
    }
    
    if (
        !metadata ||
        metadata && typeof metadata !== "function"
    ) {
        console.warn(`WARNING: ${filePath} does not export a metadata function.`);
    }

    if (!pageElements) {
        console.warn(`WARNING: ${filePath} should export a const page, which is of type () => BuiltElement<"body">.`);
    }
    
    const pageProps: PageProps = {
        pageName: directory,
        middlewareData: middlewareData,
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
        directory,
    ) as any
    
    await shipModules()

    return { resultHTML, }
}

/** Check if a given pathname was found during the original compilation process. */
function doesPageExist(pathname: string): boolean {
    return PAGE_MAP.has(pathname);
}

/** Retrieve a given pathname from the page map. */
function getPage(pathname: string) {
    return PAGE_MAP.get(pathname);
}

export {
    populateServerMaps,
    doesPageExist,
    getPage,
    buildDynamicPage,
}