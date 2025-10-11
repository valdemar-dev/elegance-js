import fs, { Dirent } from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, getObjectAttributes, initializeState, initializeObjectAttributes } from "./server/createState";
import { getLoadHooks, LoadHook, resetLoadHooks } from "./server/loadHook";
import { resetLayouts } from "./server/layout";

let packageDir = process.env.PACKAGE_PATH;
if (packageDir === undefined) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    packageDir = path.resolve(__dirname, '..');
}

const clientPath = path.resolve(packageDir, './dist/client/client.mjs');
const watcherPath = path.resolve(packageDir, './dist/client/watcher.mjs');

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

const green = (text: string) => {
    return `\u001b[38;2;65;224;108m${text}`;
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
const DIST_DIR = process.env.DIST_DIR as string;

const getAllSubdirectories = (dir: string, baseDir = dir) => {
    let directories: Array<string> = [];

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            const fullPath = path.join(dir, item.name);
            // Get the relative path from the base directory
            const relativePath = path.relative(baseDir, fullPath);
            directories.push(relativePath);
            directories = directories.concat(getAllSubdirectories(fullPath, baseDir));
        }
    }

    return directories;
};

const getProjectFiles = (pagesDirectory: string,) => {
    const files = [];
    
    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    for (const subdirectory of subdirectories) {
    
        const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);

        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".ts"));
            
        for (const file of subdirectoryFiles) {
            files.push(file);
        }
    }
    
    return files;
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
                
                // why cant naming be consistent.
                // this was made to make life easier, eg. dataTest, ariaLabel, into data-test, aria-label. BUt html BAD and they use incosistent casing.
                // means this breaks stuff.
                /*
                delete options[optionName];
                options[camelToKebabCase(optionName)] = optionValue;
                */
                
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

const generateSuitablePageElements = async (
    pageLocation: string,
    pageElements: Child,
    metadata: () => BuiltElement<"head">,
    DIST_DIR: string,
    pageName: string,
    doWrite: boolean = true,
) => {
    if (
        typeof pageElements === "string" ||
        typeof pageElements === "boolean" ||
        typeof pageElements === "number" ||
        Array.isArray(pageElements)
    ) {	
        return [];
    }

    const objectAttributes: Array<ObjectAttribute<any>> = [];

    const stack: any[] = [];
    const processedPageElements = processPageElements(pageElements, objectAttributes, 0, stack);
    
    elementKey = 0;

    const renderedPage = await serverSideRenderPage(
        processedPageElements as Page,
        pageLocation,
    );

    const template = generateHTMLTemplate({
        pageURL: path.relative(DIST_DIR, pageLocation),
        head: metadata,
        addPageScriptTag: true,
        name: pageName,
    });

    const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;

    const htmlLocation = path.join(pageLocation, (pageName === "page" ? "index" : pageName) + ".html");
    
    if (doWrite) {
        fs.writeFileSync(
            htmlLocation,
            resultHTML,
            {
                encoding: "utf-8",
                flag: "w",
            }
        );
    
        return objectAttributes;
    } else {
        return {
            objectAttributes,
            resultHTML,
        }
    }

};

// TODO: REWRITE THIS SHITTY FUNCTION
const generateClientPageData = async (
    pageLocation: string,
    state: typeof globalThis.__SERVER_CURRENT_STATE__,
    objectAttributes: Array<ObjectAttribute<any>>,
    pageLoadHooks: Array<LoadHook>,
    DIST_DIR: string,
    pageName: string,
) => {
    const pageDiff = path.relative(DIST_DIR, pageLocation);

    let clientPageJSText = `let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
    
    // add in data
    {
        clientPageJSText += `export const data = {`;
    
        if (state) {
            const nonBoundState = state.filter(subj => (subj.bind === undefined));        
    
            clientPageJSText += `state:[`
    
            for (const subject of nonBoundState) {
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
    
            const formattedBoundState: Record<string, any> = {};
    
            const stateBinds = state.map(subj => subj.bind).filter(bind => bind !== undefined);
    
            for (const bind of stateBinds) {
                formattedBoundState[bind] = [];
            };
    
            const boundState = state.filter(subj => (subj.bind !== undefined))
            for (const subject of boundState) {
                const bindingState = formattedBoundState[subject.bind!];
    
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
                        bind: string | undefined,
                    }[],
                    attribute: string,
                    update: (...value: any) => any,
                };
    
                observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",update:${ooa.update.toString()},`;
                observerObjectAttributeString += `refs:[`;
    
                for (const ref of ooa.refs) {
                    observerObjectAttributeString += `{id:${ref.id}`;
                    if (ref.bind !== undefined) observerObjectAttributeString += `,bind:${ref.bind}`;
    
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
                const key = loadHook.bind
    
                clientPageJSText += `{fn:${loadHook.fn},bind:"${key || ""}"},`;
            }
    
            clientPageJSText += "],";
        }
    
        // close fully, NEVER REMOVE!!
        clientPageJSText += `};`;
    }
    
    clientPageJSText += "if(!globalThis.pd) { globalThis.pd = {}; globalThis.pd[url] = data}";

    const pageDataPath = path.join(pageLocation, `${pageName}_data.js`);

    let sendHardReloadInstruction = false;

    const transformedResult = await esbuild.transform(clientPageJSText, { minify: options.environment === "production", }).catch((error) => {
        console.error("Failed to transform client page js!", error)
    })
    
    if (!transformedResult) return { sendHardReloadInstruction }

    fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8",)

    return { sendHardReloadInstruction, }
};


const buildPages = async (
    DIST_DIR: string,
) => { 
    resetLayouts();

    const subdirectories = [...getAllSubdirectories(DIST_DIR), ""];

    let shouldClientHardReload = false;

    for (const directory of subdirectories) {
        const abs = path.resolve(path.join(DIST_DIR, directory))
        
        const files = fs.readdirSync(abs, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".mjs"))
        
        for (const file of files) {
            const filePath = path.join(file.parentPath, file.name);
            
            const name = file.name.slice(0, file.name.length - 4);
            
            const isPage = file.name.includes("page");
            
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
    
    let pageElements;
    let metadata;
    
    try {
        const {
            page,
            metadata: pageMetadata,
            isDynamicPage,
        } = await import("file://" + filePath);
        
        pageElements = page;
        metadata = pageMetadata;
        
        // wrap dynamic page
        // this requires a bit of an explanation cause it's kind of weird.
        // dynamic pages are built on each request.
        // as such, we want to "re-call" a module multiple times, which is not normally possible (at least in node).
        // we also don't want to use cache-busting methods, since this incurs a memory leak.
        // we *also* don't want to bother doing *another* child process to build *one* page.
        // instead, a cheaper and faster option is this.
        // we re-build the dynamic page, and wrap a *function* around it.
        // this function, when called, will *execute* the page (re-evaluating things like top-level variables and such)
        // then, the function will return module.exports, and the page will be none the wiser.
        // these are then used to compile the page later on per-request.
        if (isDynamicPage === true) {
            const parsed = path.parse(filePath);
            
            await esbuild.build({
                entryPoints: [filePath],
                outfile: path.join(parsed.dir, parsed.name + ".cjs"),
                // necessary because we're mutilating the original
                allowOverwrite: true,
                // dont bundle because the origina build handles moduleresolution
                bundle: false,
                format: "cjs", // Important
                plugins: [
                    {
                    name: "wrap-cjs",
                    setup(build: any) {
                        build.onEnd(async () => {
                        const fs = await import("fs/promises");
                        const code = await fs.readFile(build.initialOptions.outfile, "utf8");
                
                        const wrapped = `\
export function construct() {
    const exports = {};
    const module = { exports };
    (function(exports, module) {
        ${code
        .split("\n")
        .map((l) => "    " + l)
        .join("\n")}
    })(exports, module);
    
    return module.exports;
}
`;
                        await fs.writeFile(build.initialOptions.outfile, wrapped);
                        });
                    },
                    },
                ],
            });
            return false;
        }
        
        fs.rmSync(filePath, { force: true, })
    } catch(e) {
        throw new Error(`Error in Page: ${directory === "" ? "/" : directory}${name}.mjs - ${e}`);
    }
    
    if (
        !metadata ||
        metadata && typeof metadata !== "function"
    ) {
        console.warn(`WARNING: ${filePath} does not export a metadata function. This is *highly* recommended.`);
    }

    if (!pageElements) {
        console.warn(`WARNING: ${filePath} should export a const page, which is of type () => BuiltElement<"body">.`);
    }
    
    if (typeof pageElements === "function") {
        if (pageElements.constructor.name === "AsyncFunctino") {
            pageElements = await pageElements();
        } else {
            pageElements = pageElements();
        }
    }

    const state = getState();
    const pageLoadHooks = getLoadHooks();
    const objectAttributes = getObjectAttributes();
    
    const foundObjectAttributes = await generateSuitablePageElements(
        path.dirname(filePath),
        pageElements || (body()),
        metadata ?? (() => head()),
        DIST_DIR,
        name,
    )

    const {
        sendHardReloadInstruction,
    } = await generateClientPageData(
        path.dirname(filePath),
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
        log(white(`Beginning build at ${new Date().toLocaleTimeString()}..`));
    
        log("");
    
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
        log(
            white("Calling pre-compile hook..")
        )
        
        options.preCompile();
    }
    
    const projectFiles = getProjectFiles(options.pagesDirectory);

    const start = performance.now();
    
    const recursionFlag = Symbol("external-node-modules-recursion");
    
    {
        const externalPackagesPlugin: esbuild.Plugin = {
            name: 'external-packages',
            setup(build: esbuild.PluginBuild) {
                build.onResolve({ filter: /^[^./]/ }, async (args) => {
                    if (args.pluginData?.[recursionFlag]) {
                        return;
                    }
                
                    const result = await build.resolve(args.path, {
                        resolveDir: args.resolveDir,
                        kind: args.kind,
                        importer: args.importer,
                        pluginData: { [recursionFlag]: true },
                    });
                
                    if (result.errors.length > 0 || result.external || !result.path) {
                        return { path: args.path, external: true, };
                    }
                
                    const nodeModulesIndex = result.path.indexOf('node_modules');
                    if (nodeModulesIndex === -1) {
                        return result;
                    }
                
                    const isNested = result.path.includes('node_modules', nodeModulesIndex + 14);
                    if (isNested) {
                        return { path: args.path, external: true, };
                    }
                    
                    return { path: args.path, external: true };
                });
            }
        };      
        
        await esbuild.build({
            entryPoints: projectFiles.map(f => path.join(f.parentPath, f.name)),
            bundle: true,
            outdir: DIST_DIR,
            outExtension: { ".js": ".mjs", },
            plugins: [externalPackagesPlugin],
            loader: {
                ".ts": "ts",
            },
            format: "esm",
            platform: "node",
            keepNames: false,
            define: {
                "DEV": options.environment === "development" ? "true" : "false",
                "PROD": options.environment === "development" ? "false" : "true",
            },
        })
    }
   
    const pagesTranspiled = performance.now();
    
    const {
        shouldClientHardReload
    } = await buildPages(DIST_DIR);
    
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
        log(`${Math.round(pagesTranspiled-start)}ms to Transpile Fales`)
        log(`${Math.round(pagesBuilt-pagesTranspiled)}ms to Build Pages`)
        log(`${Math.round(end-pagesBuilt)}ms to Build Client`)
        
        log(green(bold((`Compiled ${projectFiles.length} files in ${Math.ceil(end-start)}ms!`))));
    }
    
    process.send!({ event: "message", data: "set-layouts", layouts: JSON.stringify(Array.from(__SERVER_CURRENT_LAYOUTS__)), currentLayouTId: __SERVER_CURRENT_LAYOUT_ID__ });
    process.send!({ event: "message", data: "compile-finish", });
    
    if (shouldClientHardReload) {
        log("Sending hard reload..");
        process.send!({ event: "message", data: "hard-reload", })
    } else {
        log("Sending soft reload..");
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
