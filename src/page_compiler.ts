import fs, { Dirent } from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 
    Ignore this error, this program was made *for* elegance, but I was too lazy to add typescript types (since I made it into a cli, with api support later)
    This function below just registers a node module loader, which let's us transpile TypeScript into JS on-the-fly.
    
    I am aware tsx exists, however I felt that something smaller and simpler was more suited for Elegance.
*/
//@ts-ignore
import { registerLoader, setArcTsConfig } from "ts-arc";
setArcTsConfig(__dirname);
registerLoader();
    
import esbuild from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, getObjectAttributes, initializeState, initializeObjectAttributes } from "./server/createState";
import { getLoadHooks, LoadHook, resetLoadHooks } from "./server/loadHook";
import { resetLayouts } from "./server/layout";
import { renderRecursively } from "./server/render";

let packageDir = process.env.PACKAGE_PATH;
if (packageDir === undefined) {
    
    packageDir = path.resolve(__dirname, '..');
}

const clientPath = path.resolve(packageDir, './dist/client/client.mjs');
const watcherPath = path.resolve(packageDir, './dist/client/watcher.mjs');

const shippedModules = new Map<string, true>();

let modulesToShip: Array<{ path: string, globalName: string, }> = [];

const yellow = (text: string) => {
    return `\u001b[38;2;238;184;68m${text}`;
};

const black = (text: string) => {
    return `\u001b[38;2;0;0;0m${text}`;
};

const bgYellow = (text: string) => {
    return `\u001b[48;2;238;184;68m${text}`;
};

const bold = (text: string) => {
    return `\u001b[1m${text}`;
};

const underline = (text: string) => {
    return `\u001b[4m${text}`;
};

const white = (text: string) => {
    return `\u001b[38;2;255;247;229m${text}`;
};

const log = (...text: string[]) => {
    if (options.quiet) return;
    
    return console.log(text.map((text) => `${text}\u001b[0m`).join(""));
};

type CompilationOptions = {
    postCompile?: () => any,
    preCompile?: () => any,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    publicDirectory?: {
        path: string,
    },
    server?: {
        runServer: boolean,
        root?: string,
        port?: number,
        host?: string,
    },
    hotReload?: {
        port: number,
        hostname: string,
    },
    quiet: boolean;
}

let options: CompilationOptions = JSON.parse(process.env.OPTIONS as string);

/** Contains publicly accessible files. */
const DIST_DIR = process.env.DIST_DIR as string;


/*
    brain stuff, thinking:
    none of this is real..
    
    put a pin in this.
    
    
    the general idea behind this is that during compilation, 
    we gather a big map of every page we build.
    
    then, when a page is requested, we can look up the pathname of that page,
    and every layout that goes along with it.
    
    if isDynamic: true, when we compile per request.
    if isDynamic: false, we just serve index.html
    
    theres a question here:
    can a static page have a dynamic layout?
    can layouts ever decide their dynamicness?
    is a layout for a dynamic page compiled per-request.
    
    it should probably be like this:
    1. dynamic page & layout: ok
    2. static page & dynamic layout: not okay? (doesnt seem to be possible.)
    3. dynamic page & static layout: ok
    4. static page & static layout: ok
    
    dynamic pages:
        i suppose for dynamic pages,
        we could keep the page_compiler alive,
        and a reference to the page in javascript.
        
        then, we just call page() and metadata().
        
        there just needs to be some form of strictness on our end,
        so the user doesnt declare loadhooks and state *outside* of the page().
        
        or, dynamic pages wrap their stuff in a *build()* function.
        
    1. dynamic page & layout:
        on a request, the user calls buildPage,
        we have a clear "builtLayouts" map, and thus every layout is built.
        
        though, as a note, both would have to have clear "esm-cache" semantics.
        meaning, they would not be allowed to declare state outside of layout(), page() and metadata().
        
        other than that, i see no issues.
        
    2. static page & dynamic layout
        on a request, the server fetches what layouts would be included in this pathname.
        we should probably keep this information *cached* within PAGE_MAP.
        
        it would then go through the normal process of fetchPageLayoutHTML().
        
        however, if it finds a *dynamic* layout, it would attempt to build it.
            the primary issue with this is, i dont know how to *send* the javascript.
            
            we could hold it in memory, and maybe write it to a file?
            but if we write it to a file, we'd have severe race condition issues.
            
            multiple requests would overwrite the same file many times.
            
            if we made a unique file per-request, that would eat lots of disk space.
                you *could* store in a map, the page_data, etc.
                then, write into the head: /page_data.js?id=SOME_UUID
                this is *secure* i think.
                the only issue i'd have is potential memory leaks.
                
                it'd have to be like a 30 second cache or something.
                which seems unnecessarily complex.
                
                
            the best method for this is *probably:
                inline page_data.js as a script tag in the HTML.
                
                it'll increase parsing times, (maybe substantially)
                unless we put a ondomcontentload hook (???)
                
        for now we shall forbid it. put a pin in this.
    
    3. dynamic page and static layout:
        i see no issue with this.
        you fetch the page, get the information.
        
        look up in the layout map, if it's static, just include it,
        the browser can fetch the data.
        
    4. static & static:
        this is the default generation method,
        and as such, has no issues.
*/
{
    type PageInformation = {
        isDynamic: boolean;
    };
    
    type LayoutInformation = {
        isDynamic: boolean;
    }
    
    type Pathname = string;
    
    const PAGE_MAP = new Map<Pathname, PageInformation>();
    const LAYOUT_MAP = new Map<Pathname, LayoutInformation>();
}

const getAllSubdirectories = (dir: string, baseDir = dir) => {
    let directories: Array<string> = [];

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

const buildClient = async (
    DIST_DIR: string,
) => {
    let clientString = "window.__name = (func) => func; "
    clientString += fs.readFileSync(clientPath, "utf-8");

    if (options.hotReload !== undefined) {
        clientString += `const watchServerPort = ${options.hotReload.port}`;
        clientString += fs.readFileSync(watcherPath, "utf-8");
    }

    const transformedClient = await esbuild.transform(clientString, {
        minify: options.environment === "production",
        drop: options.environment === "production" ? ["console", "debugger"] : undefined,
        keepNames: false,
        format: "iife",
        platform: "node", 
        loader: "ts",
    });
    
    fs.writeFileSync(
        path.join(DIST_DIR, "/client.js"),
        transformedClient.code,
    );
};

let elementKey = 0;

const processOptionAsObjectAttribute = (
    element: AnyBuiltElement,
    optionName: string,
    optionValue: ObjectAttribute<any>,
    objectAttributes: Array<any>,
) => {
    const lcOptionName = optionName.toLowerCase();

    const options = element.options as ElementOptions;

    let key = options.key;
    if (key == undefined) {
        key = elementKey += 1
        options.key = key;
    }

    if (!optionValue.type) {
        throw `ObjectAttributeType is missing from object attribute. ${element.tag}: ${optionName}/${optionValue}`;
    }

    // TODO: jank lol - val 2025-02-17
    let optionFinal = lcOptionName;
    
    switch (optionValue.type) {
        case ObjectAttributeType.STATE:
            const SOA = optionValue as ObjectAttribute<ObjectAttributeType.STATE>;

            if (typeof SOA.value === "function") {
                delete options[optionName];
                break;
            }

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [SOA.value];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = SOA.value;
            }

            break;

        case ObjectAttributeType.OBSERVER:
            const OOA = optionValue as ObjectAttribute<ObjectAttributeType.OBSERVER>;

            const firstValue = OOA.update(...OOA.initialValues);

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [firstValue];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = firstValue;
            }

            optionFinal = optionName;

            break;

        case ObjectAttributeType.REFERENCE:
            options["ref"] = (optionValue as any).value;

            break;
    }

    objectAttributes.push({ ...optionValue, key: key, attribute: optionFinal, });
};

function buildTrace(stack: any[], indent = 4): string {
    try {
        if (!stack || stack.length === 0) return '[]';

        let traceObj = (stack[stack.length - 1] && typeof stack[stack.length - 1] === 'object') 
            ? JSON.parse(JSON.stringify(stack[stack.length - 1])) 
            : { value: stack[stack.length - 1] };

        traceObj._error = "This is the element where the error occurred";

        for (let i = stack.length - 2; i >= 0; i--) {
            const parent = stack[i];
            const child = stack[i + 1];

            if (!parent || typeof parent !== 'object') {
                traceObj = { value: parent, _errorChild: traceObj };
                continue;
            }

            let parentClone: any;
            try {
                parentClone = JSON.parse(JSON.stringify(parent));
            } catch {
                parentClone = { value: parent };
            }

            let index = -1;
            if (Array.isArray(parentClone.children)) {
                index = parentClone.children.findIndex((c: any) => c === child);
            }

            if (index !== -1 && parentClone.children) {
                parentClone.children = parentClone.children.slice(0, index + 1);
                parentClone.children[index] = traceObj;
            } else {
                parentClone._errorChild = traceObj;
            }

            traceObj = parentClone;
        }

        return JSON.stringify(traceObj, null, indent).replace(/^/gm, " ".repeat(indent));
    } catch {
        return "Could not build stack-trace.";
    }
}


export const processPageElements = (
    element: Child,
    objectAttributes: Array<any>,
    recursionLevel: number,
    stack: any[] = [],
): Child => {
    stack.push(element);
    
    try {
        if (
            typeof element === "boolean" ||
            typeof element === "number" ||
            Array.isArray(element)
        ) {
            stack.pop();
            return element;
        }
    
        if (typeof element === "string") {
            stack.pop();
            return (element);
        }
    
        const processElementOptionsAsChildAndReturn = () => {
            try {
                const children = element.children as Child[];
                
                (element.children as Child[]) = [
                    (element.options as Child),
                    ...children
                ];
                
                element.options = {};
                
                for (let i = 0; i < children.length+1; i++) {
                    const child = element.children![i];
                    
                    const processedChild = processPageElements(child, objectAttributes, recursionLevel + 1, stack)
                    
                    element.children![i] = processedChild;
                }
                
                return {
                    ...element,
                    options: {},
                }
            } catch(e) {
                const errorString = `Could not process element options as a child. ${e}.`;
                
                throw new Error(errorString);
            }
        };
    
        if (typeof element.options !== "object") {
            const result = processElementOptionsAsChildAndReturn();
            stack.pop();
            return result;
        }
        
        const {
            tag: elementTag,
            options: elementOptions,
            children: elementChildren
        } = (element.options as AnyBuiltElement);
    
        if (
            elementTag &&
            elementOptions &&
            elementChildren
        ) {
            const result = processElementOptionsAsChildAndReturn();
            stack.pop();
            return result;
        }
    
        const options = element.options as ElementOptions;
    
        for (const [optionName, optionValue] of Object.entries(options)) {
            const lcOptionName = optionName.toLowerCase();
    
            if (typeof optionValue !== "object") {
                if (lcOptionName === "innertext") {
                    delete options[optionName];
    
                    if (element.children === null) {
                        throw `Cannot use innerText or innerHTML on childrenless elements.`;
                    }
                    element.children = [optionValue, ...(element.children as Child[])];
    
                    continue;
                }
    
                else if (lcOptionName === "innerhtml") {
                    if (element.children === null) {
                        throw `Cannot use innerText or innerHTML on childrenless elements.`;
                    }
    
                    delete options[optionName];
                    element.children = [optionValue];
    
                    continue;
                }
                
                continue;
            };
    
            processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
        }
    
        if (element.children) {    
            for (let i = 0; i < element.children.length; i++) {
                const child = element.children![i];
                
                const processedChild = processPageElements(child, objectAttributes, recursionLevel + 1, stack)
        
                element.children![i] = processedChild;
            }
        }
    
        stack.pop();
        
        return element;
    
    } catch(e) {
        const trace = buildTrace(stack);
        if (recursionLevel === 0) {
            throw new Error(`${e}\n\nTrace:\n${trace}`);
        } else {
            throw e;
        }
    }
};

const pageToHTML = async (
    pageLocation: string,
    pageElements: Child,
    metadata: () => BuiltElement<"html">,
    DIST_DIR: string,
    pageName: string,
    doWrite: boolean = true,
    requiredClientModules: ShippedModules = {},
    
    layout: BuiltLayout,
) => {
    if (
        typeof pageElements === "string" ||
        typeof pageElements === "boolean" ||
        typeof pageElements === "number" ||
        Array.isArray(pageElements)
    ) {	
        throw new Error(`The root element of a page / layout must be a built element, not just a Child. Received: ${typeof pageElements}.`);
    }

    const objectAttributes: Array<ObjectAttribute<any>> = [];

    const stack: any[] = [];
    const processedPageElements = processPageElements(pageElements, objectAttributes, 0, stack);
    
    const renderedPage = await serverSideRenderPage(
        processedPageElements as Page,
        pageLocation,
    );

    const { internals, builtMetadata } = await generateHTMLTemplate({
        pageURL: path.relative(DIST_DIR, pageLocation),
        head: metadata,
        addPageScriptTag: true,
        name: pageName,
        requiredClientModules,
        environment: options.environment,
    });

    const headHTML = `<!DOCTYPE html>${layout.metadata.startHTML}${layout.scriptTag}${internals}${builtMetadata}${layout.metadata.endHTML}`;
    const bodyHTML = `${layout.pageContent.startHTML}${renderedPage.bodyHTML}${layout.pageContent.endHTML}`;
    const resultHTML = `${headHTML}${bodyHTML}`;

    const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
    
    if (doWrite) {
        const dirname = path.dirname(htmlLocation);
        
        if (fs.existsSync(dirname) === false) {
            fs.mkdirSync(dirname, { recursive: true, });
        }
        
        fs.writeFileSync(
            htmlLocation,
            resultHTML,
            {
                encoding: "utf-8",
                flag: "w",
            },
        );
    
        return objectAttributes;
    } else {
        return {
            objectAttributes,
            resultHTML,
        }
    }

};

/**
    This uses string interpolation to generate the:
    page_data.js file that the browser receives.
    
    It's *very* error-prone, so be careful if you edit this!
*/
const generateClientPageData = async (
    pageLocation: string,
    state: typeof globalThis.__SERVER_CURRENT_STATE__,
    objectAttributes: Array<ObjectAttribute<any>>,
    pageLoadHooks: Array<LoadHook>,
    DIST_DIR: string,
    pageName: string,
    globalVariableName: string = "pd",
) => {
    const pageDiff = path.relative(DIST_DIR, pageLocation);

    let clientPageJSText = `${globalThis.__SERVER_PAGE_DATA_BANNER__}let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
    
    // add in data
    {
        clientPageJSText += `export const data = {`;
    
        if (state) {
            clientPageJSText += `state:[`
    
            for (const subject of state) {
                if (typeof subject.value === "string") {
                    const stringified = JSON.stringify(subject.value)
                    
                    clientPageJSText += `{id:${subject.id},value:${stringified}},`;
                } else if (typeof subject.value === "function") {
                    clientPageJSText += `{id:${subject.id},value:${subject.value.toString()}},`;
                } else {
                    clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
                }
            }
    
            clientPageJSText += `],`;
        }
    
        const stateObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.STATE);
    
        if (stateObjectAttributes.length > 0) {
            const processed = [...stateObjectAttributes].map((soa: any) => {
                delete soa.type
                return soa;
            });
    
            clientPageJSText += `soa:${JSON.stringify(processed)},`
        }
    
        const observerObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.OBSERVER);
        if (observerObjectAttributes.length > 0) {
            let observerObjectAttributeString = "ooa:[";
    
            for (const observerObjectAttribute of observerObjectAttributes) {
                const ooa = observerObjectAttribute as unknown as {
                    key: string,
                    refs: {
                        id: number,
                    }[],
                    attribute: string,
                    update: (...value: any) => any,
                };
    
                observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",update:${ooa.update.toString()},`;
                observerObjectAttributeString += `refs:[`;
    
                for (const ref of ooa.refs) {
                    observerObjectAttributeString += `{id:${ref.id}},`;
                }
    
                observerObjectAttributeString += "]},";
            }
    
            observerObjectAttributeString += "],";
            clientPageJSText += observerObjectAttributeString;
        }
    
        if (pageLoadHooks.length > 0) {
            clientPageJSText += "lh:[";
    
            for (const loadHook of pageLoadHooks) {
                clientPageJSText += `{fn:${loadHook.fn}},`;
            }
    
            clientPageJSText += "],";
        }
    
        // close fully, NEVER REMOVE!!
        clientPageJSText += `};`;
    }
    
    clientPageJSText += `if(!globalThis.${globalVariableName}) { globalThis.${globalVariableName} = {}; }; globalThis.${globalVariableName}[url] = data;`;

    const pageDataPath = path.join(pageLocation, `${pageName}_data.js`);

    let sendHardReloadInstruction = false;

    const transformedResult = await esbuild.transform(clientPageJSText, { minify: options.environment === "production", }).catch((error) => {
        console.error("Failed to transform client page js!", error)
    })
    
    if (!transformedResult) return { sendHardReloadInstruction }
    
    // check if previous data exists
    // if so, and it is different
    // then the page must hard-reload.
    if (fs.existsSync(pageDataPath)) {
        const content = fs.readFileSync(pageDataPath).toString()
        
        if (content !== transformedResult.code) {
            sendHardReloadInstruction = true;
        }
    }

    fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8",)

    return { sendHardReloadInstruction, }
};

const generateLayout = async (
    DIST_DIR: string,
    filePath: string,
    directory: string,
    childIndicator: Child,
) => {
    initializeState();
    initializeObjectAttributes();
    resetLoadHooks();
    globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
    
    let layoutElements;
    let metadataElements;
    let modules: Array<string> = [];
    
    try {
        const {
            layout,
            metadata,
            isDynamic,
            shippedModules,
        } = await import("file://" + filePath);
        
        if (shippedModules !== undefined) {
            modules = shippedModules;
        }
        
        layoutElements = layout;
        metadataElements = metadata;
        
        if (isDynamic === true) {
            throw new Error("not yet supported.");
        }
    } catch(e) {
        throw new Error(`Error in Page: ${directory === "" ? "/" : directory}layout.mjs - ${e}`);
    }

    // layout content
    {    
        if (!layoutElements) {
            throw new Error(`WARNING: ${filePath} should export a const layout, which is of type Layout: (child: Child) => AnyBuiltElement.`);
        }
        
        if (typeof layoutElements === "function") {
            if (layoutElements.constructor.name === "AsyncFunction") {
                layoutElements = await layoutElements(childIndicator);
            } else {
                layoutElements = layoutElements(childIndicator);
            }
        }
    }
    
    // metadata content
    {    
        if (!metadataElements) {
            throw new Error(`WARNING: ${filePath} should export a const metadata, which is of type LayoutMetadata: (child: Child) => AnyBuiltElement.`);
        }
        
        if (typeof metadataElements === "function") {
            if (metadataElements.constructor.name === "AsyncFunction") {
                metadataElements = await metadataElements(childIndicator);
            } else {
                metadataElements = metadataElements(childIndicator);
            }
        }
    }


    const state = getState();
    const pageLoadHooks = getLoadHooks();
    const objectAttributes = getObjectAttributes();
    
    if (
        typeof layoutElements === "string" ||
        typeof layoutElements === "boolean" ||
        typeof layoutElements === "number" ||
        Array.isArray(layoutElements)
    ) {	
        throw new Error(`The root element of a page / layout must be a built element, not just a Child. Received: ${typeof layoutElements}.`);
    }

    const foundObjectAttributes: any[] = [];

    const stack: any[] = [];
    const processedPageElements = processPageElements(layoutElements, foundObjectAttributes, 0, stack);
    
    const renderedPage = await serverSideRenderPage(
        processedPageElements as Page,
    );
    
    const metadataHTML = metadataElements ? renderRecursively(metadataElements) : "";

    await generateClientPageData(
        path.dirname(path.join(DIST_DIR, "dist", directory)),
        state || {},
        [...objectAttributes, ...foundObjectAttributes as any[]],
        pageLoadHooks || [],
        DIST_DIR,
        "layout",
        "ld",
    );

    return { pageContentHTML: renderedPage.bodyHTML, metadataHTML }
};

type BuiltLayout = {
    pageContent: {
        startHTML: string,
        endHTML: string,
    },
    
    metadata: {
        startHTML: string,
        endHTML: string,
    },
    
    scriptTag: string,
};

/*
    layouts are *lazy loaded*,
    but require that their data be stored per-build;
    so that we can ensure that navigating between
    two pages that have the same layout,
    maintains things like element keys, state ids, etc.
    
    and thus, we keep a *cache*
    of previously built layouts (within this build).
*/
const builtLayouts = new Map<string, BuiltLayout>();

const buildLayouts = async () => {
    const pagesDirectory = path.resolve(options.pagesDirectory);

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
    
    let shouldClientHardReload: boolean = false;
    
    for (const directory of subdirectories) {
        const abs = path.resolve(path.join(pagesDirectory, directory))
        
        const files = fs.readdirSync(abs, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".ts"))
        
        for (const file of files) {
            const filePath = path.join(file.parentPath, file.name);
            
            const name = file.name.slice(0, file.name.length - 3);
            
            const isLayout = name === "layout";
            
            if (isLayout == false) {                
                continue;
            }            
            
            try {
                const builtLayout = await buildLayout(filePath, directory);
                
                builtLayouts.set(filePath, builtLayout)
            } catch(e) {
                console.error(e);
                
                continue;
            }
        }
    }
    
    return { shouldClientHardReload };
}

const buildLayout = async (filePath: string, directory: string) => {
    /*
        this is used by the layout to determine where it ends
        in the layout, this is the "child" parameter.
        
        we split the built HTML of the layout at this point,
        and squish child layouts and the page in-between.
        
        the client then uses this for client-side navigation
    */
    const id = globalThis.__SERVER_CURRENT_STATE_ID__ += 1;
    const childIndicator = `<template layout-id="${id}"></template>`;
    
    const { pageContentHTML, metadataHTML } = await generateLayout(
        DIST_DIR,
        filePath,
        directory,
        childIndicator,
    );
    
    const splitAround = (str: string, sub: string) => {
        const i = str.indexOf(sub);
        if (i === -1) throw new Error("substring does not exist in parent string");
        
        return {
            startHTML: str.substring(0, i),
            endHTML: str.substring(i + sub.length)
        };
    }
    
    const splitAt = (str: string, sub: string) => {
        const i = str.indexOf(sub) + sub.length;
        if (i === -1) throw new Error("substring does not exist in parent string");
        
        return {
            startHTML: str.substring(0, i),
            endHTML: str.substring(i)
        };
    }
    
    const pageURL = directory;
    
    return {
        pageContent: splitAt(pageContentHTML, childIndicator),
        metadata: splitAround(metadataHTML, childIndicator),
        scriptTag: `<script data-layout="true" type="module" src="${pageURL}${pageURL === "/" ? "" : "/"}layout_data.js" defer="true"></script>`
    } satisfies BuiltLayout;
};

const fetchPageLayoutHTML = async (
    dirname: string
) => {
    const relative = path.relative(options.pagesDirectory, dirname);
    
    let split = relative.split(path.sep).filter(Boolean);
    split.push("/");
    split.reverse();
    
    let layouts: BuiltLayout[] = [];
    
    for (const dir of split) {
        const filePath = path.resolve(path.join(options.pagesDirectory, dir, "layout.ts"));
        
        if (builtLayouts.has(filePath)) {
            layouts.push(builtLayouts.get(filePath)!);
        }
    }
    
    const pageContent = {
        startHTML: "",
        endHTML: "",
    };
    
    const metadata = {
        startHTML: "",
        endHTML: "",
    };
    
    let scriptTags = "";
    
    for (const layout of layouts) {
        pageContent.startHTML += layout.pageContent.startHTML
        metadata.startHTML += layout.metadata.startHTML
        
        scriptTags += layout.scriptTag;
        
        pageContent.endHTML += layout.pageContent.endHTML
        metadata.endHTML += layout.metadata.endHTML
    }
    
    return { pageContent, metadata, scriptTag: scriptTags, };
};

const buildPages = async (
    DIST_DIR: string,
) => {
    resetLayouts();
    
    const pagesDirectory = path.resolve(options.pagesDirectory);

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    let shouldClientHardReload = false;

    for (const directory of subdirectories) {
        const abs = path.resolve(path.join(pagesDirectory, directory))
        
        const files = fs.readdirSync(abs, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".ts"))
        
        for (const file of files) {
            const filePath = path.join(file.parentPath, file.name);
            
            const name = file.name.slice(0, file.name.length - 3);
            
            const isPage = name === "page";
            
            if (isPage == false) {                
                continue;
            }            
            
            try {
                const hardReloadForPage = await buildPage(DIST_DIR, directory, filePath, name);
                
                if (hardReloadForPage) {
                    shouldClientHardReload = true;
                }

            } catch(e) {
                console.error(e);
                
                continue;
            }
        }
    }

    return {
        shouldClientHardReload,
    };
};

const buildPage = async (
    DIST_DIR: string,
    directory: string,
    filePath: string,
    name: string,
) => {
    initializeState();
    initializeObjectAttributes();
    resetLoadHooks();
    
    globalThis.__SERVER_PAGE_DATA_BANNER__ = "";
    
    let pageElements;
    let metadata;
    let modules: ShippedModules = {};
    let pageIgnoresLayout: boolean = false;
    
    try {
        const {
            page,
            metadata: pageMetadata,
            isDynamicPage,
            shippedModules,
            ignoreLayout,
        } = await import("file://" + filePath);
        
        if (shippedModules !== undefined) {
            modules = shippedModules;
        }
        
        if (ignoreLayout) {
            pageIgnoresLayout = true;
        }
        
        pageElements = page;
        metadata = pageMetadata;
        
        if (isDynamicPage === true) {
            return false;
        }
    } catch(e) {
        throw new Error(`Error in Page: ${directory}/${name}.ts - ${e}`);
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
    };
    
    // construct layout path    
    // /me/blog/post/page.ts
    // checks for /post/layout.ts, then /blog/layout.ts, then /me/layout.ts
    if (typeof pageElements === "function") {
        if (pageElements.constructor.name === "AsyncFunction") {
            pageElements = await pageElements(pageProps);
        } else {
            pageElements = pageElements(pageProps);
        }
    }

    const state = getState();
    const pageLoadHooks = getLoadHooks();
    const objectAttributes = getObjectAttributes();
    
    const layout = await fetchPageLayoutHTML(path.dirname(filePath));
    
    const foundObjectAttributes = await pageToHTML(
        path.join(DIST_DIR, directory),
        pageElements || (body()),
        metadata ?? (() => head()),
        DIST_DIR,
        name,
        true,
        modules,
        layout,
    )

    const {
        sendHardReloadInstruction,
    } = await generateClientPageData(
        path.join(DIST_DIR, directory),
        state || {},
        [...objectAttributes, ...foundObjectAttributes as any[]],
        pageLoadHooks || [],
        DIST_DIR,
        name,
    );

    return sendHardReloadInstruction === true;
};

const build = async (): Promise<boolean> => {
    if (options.quiet === true) {
        console.log = function() {};
        console.error = function() {};
        console.warn = function() {};
    }
    
    try {
    // log spam
    { 
        log(bold(yellow(" -- Elegance.JS -- ")));
    
        if (options.environment === "production") {
            log(
                " - ",
                bgYellow(bold(black(" NOTE "))),
                " : ", 
                white("In production mode, no "), 
                underline("console.log() "),
                white("statements will be shown on the client, and all code will be minified."));
    
            log("");
        }
    }
    
    if (options.preCompile) {
        options.preCompile();
    }
    
    const start = performance.now();
    
    let shouldClientHardReload

    {
        const { shouldClientHardReload: doReload } = await buildLayouts();
        
        if (doReload) shouldClientHardReload = true;
    }
    
    {
        const { shouldClientHardReload: doReload } = await buildPages(path.resolve(DIST_DIR));
        
        if (doReload) shouldClientHardReload = true;
    }
    
    {       
        for (const plugin of modulesToShip) {
            // dont build the same plugin multiple times. (very inefficient!)
            {
                if (shippedModules.has(plugin.globalName)) continue;
                shippedModules.set(plugin.globalName, true);
            }
            
            esbuild.build({
                entryPoints: [plugin.path],
                bundle: true,
                outfile: path.join(DIST_DIR, "shipped", plugin.globalName + ".js"),
                format: "iife",
                platform: "browser",
                globalName: plugin.globalName,
                minify: true,
                treeShaking: true,
            })
        }
    }
    
    const pagesBuilt = performance.now();

    await buildClient(DIST_DIR);

    const end = performance.now();

    if (options.publicDirectory) {
        log("Recursively copying public directory.. this may take a while.")
        const src = path.relative(process.cwd(), options.publicDirectory.path)
        
        if (fs.existsSync(src) === false) {
            console.warn("WARNING: Public directory not found, an attempt will be made create it..")
            fs.mkdirSync(src, { recursive: true, });
        }

        await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true, });
    }

    {
        log(`Took ${Math.round(pagesBuilt-start)}ms to Build Pages.`)
        log(`Took ${Math.round(end-pagesBuilt)}ms to Build Client.`)
    }
    
    process.send!({ event: "message", data: "set-layouts", layouts: JSON.stringify(Array.from(__SERVER_CURRENT_LAYOUTS__)), currentLayouTId: __SERVER_CURRENT_LAYOUT_ID__ });
    process.send!({ event: "message", data: "compile-finish", });
    
    if (shouldClientHardReload) {
        process.send!({ event: "message", data: "hard-reload", })
    } else {
        process.send!({ event: "message", data: "soft-reload", })
    }
    
    } catch(e) {
        console.error("Build Failed! Received Error:");
        console.error(e);
        
        return false
    }
    
    return true
};

(async () => {    
    await build();
})()
