import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
import { LoadHook } from "../server/loadHook";
type CompilationOptions = {
    postCompile?: () => any;
    preCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    /** Suppress native elegance logs. */
    quiet?: boolean;
    publicDirectory?: {
        path: string;
    };
    server?: {
        runServer: boolean;
        root?: string;
        port?: number;
        host?: string;
    };
    hotReload?: {
        port: number;
        hostname: string;
        /** Directories to watch for hot-reloading other than just the pagesDirectory. */
        extraWatchDirectories?: string[];
    };
};
declare const PAGE_MAP: Map<string, PageInformation>;
declare const LAYOUT_MAP: Map<string, LayoutInformation>;
/** A list of modules that are yet to be built. */
declare let modulesToShip: Array<{
    path: string;
    globalName: string;
}>;
declare function setCompilationOptions(newOptions: CompilationOptions, distDir: string): void;
declare function getAllSubdirectories(dir: string, baseDir?: string): string[];
declare function buildClient(DIST_DIR: string): Promise<void>;
/**
 * Recursively iterate through the elements of a given page, and "process them".
 * This involves separating all non-serializable data into an object attributes array,
 * and mutating `element` into something that can be serialized into HTML.
 */
declare function processPageElements(element: Child, objectAttributes: Array<any>, recursionLevel: number, stack?: any[]): Child;
/**
 * Takes in a page, and turns it into HTML.
 * If doWrite is false, the page's HTML will be returned.
 */
declare function pageToHTML(pageLocation: string, pageElements: Child, metadata: () => BuiltElement<"html">, DIST_DIR: string, pageName: string, doWrite: boolean | undefined, requiredClientModules: ShippedModules | undefined, layout: BuiltLayout, pathname?: string): Promise<string | ({
    type: ObjectAttributeType;
    id: string | number;
    value: any;
    bind?: string;
} | {
    type: ObjectAttributeType;
    refs: {
        id: number;
        bind?: string;
    }[];
    initialValues: any[];
    update: (...value: any) => any;
} | {
    type: ObjectAttributeType;
})[]>;
/**
 * This uses string interpolation to generate the:
 * page_data.js file that the browser receives.
 *
 * It's *very* error-prone, so be careful if you edit this!
 */
declare function generateClientPageData(pageLocation: string, state: typeof globalThis.__SERVER_CURRENT_STATE__, objectAttributes: Array<ObjectAttribute<any>>, pageLoadHooks: Array<LoadHook>, DIST_DIR: string, pageName: string, globalVariableName?: string, write?: boolean): Promise<{
    sendHardReloadInstruction: boolean;
    result?: undefined;
} | {
    sendHardReloadInstruction: boolean;
    result: string;
}>;
declare function generateLayout(DIST_DIR: string, 
/** The absolute path of the layout.ts file. */
filePath: string, 
/** Path relative to pagesDirectory. */
directory: string, 
/** What to squish between the start and end HTML (aka the split point). */
childIndicator: Child, 
/** Whether or not to generate the layout if it is dynamic */
generateDynamic?: boolean): Promise<false | {
    pageContentHTML: string;
    metadataHTML: string;
}>;
type BuiltLayout = {
    pageContent: {
        startHTML: string;
        endHTML: string;
    };
    metadata: {
        startHTML: string;
        endHTML: string;
    };
    scriptTag: string;
};
declare function buildLayouts(): Promise<{
    shouldClientHardReload: boolean;
}>;
declare function buildLayout(filePath: string, directory: string, generateDynamic?: boolean): Promise<false | {
    pageContent: {
        startHTML: string;
        endHTML: string;
    };
    metadata: {
        startHTML: string;
        endHTML: string;
    };
    scriptTag: string;
}>;
/**
 * Iterate through the found layouts, and construct the necessary wrapper HTML for a given page.
 */
declare function fetchPageLayoutHTML(dirname: string): Promise<{
    pageContent: {
        startHTML: string;
        endHTML: string;
    };
    metadata: {
        startHTML: string;
        endHTML: string;
    };
    scriptTag: string;
}>;
declare function buildPages(DIST_DIR: string): Promise<{
    shouldClientHardReload: boolean;
}>;
declare function buildPage(DIST_DIR: string, directory: string, filePath: string, name: string): Promise<boolean>;
declare function shipModules(): Promise<void>;
/** Retrieve a list of the pages and layouts that were found during the original compilation process. */
declare function retrievePageAndLayoutMaps(): {
    LAYOUT_MAP: Map<string, LayoutInformation>;
    PAGE_MAP: Map<string, PageInformation>;
};
export { CompilationOptions, setCompilationOptions, getAllSubdirectories, retrievePageAndLayoutMaps, buildClient, processPageElements, pageToHTML, generateClientPageData, generateLayout, buildLayouts, buildLayout, fetchPageLayoutHTML, buildPages, buildPage, shipModules, PAGE_MAP, LAYOUT_MAP, modulesToShip, };
