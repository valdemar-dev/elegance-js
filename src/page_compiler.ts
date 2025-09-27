import fs, { Dirent, FSWatcher } from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";
import child_process from "node:child_process";
import http, { IncomingMessage, ServerResponse } from "http";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, getObjectAttributes, initializeState, initializeObjectAttributes } from "./server/createState";
import { getLoadHooks, LoadHook, resetLoadHooks } from "./server/loadHook";
import { resetLayouts } from "./server/layout";
import { startServer } from "./server/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname);

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

const bgBlack = (text: string) => {
    return `\u001b[48;2;0;0;0m${text}`;
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

const white_100 = (text: string) => {
    return `\u001b[38;2;255;239;204m${text}`;
};

const green = (text: string) => {
    return `\u001b[38;2;65;224;108m${text}`;
};

const red = (text: string) => {
    return `\u001b[38;2;255;100;103m${text}`
};

const log = (...text: string[]) => {
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
        method: "symlink" | "recursive-copy",
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
    }
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

const getFile = (dir: Array<Dirent>, fileName: string) => {
    const dirent = dir.find(dirent => path.parse(dirent.name).name === fileName);

    if (dirent) return dirent;
    return false;
}

const getProjectFiles = (pagesDirectory: string,) => {
    const pageFiles = [];
    const apiFiles = [];

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    for (const subdirectory of subdirectories) {
    
        const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);

        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));
            
        for (const file of subdirectoryFiles) {
            if (file.name === "route.ts") {
                apiFiles.push(file);
                
                continue
            } else if (file.name === "page.ts") {
                pageFiles.push(file);
                
                continue
            }
            
            const name = file.name.slice(0, file.name.length - 3)
            const numberName = parseInt(name)
            
            if (isNaN(numberName) === false) {
                if (numberName >= 400 && numberName <= 599) {
                    pageFiles.push(file);
                    
                    continue
                }
            }
            
        }
    }

    return {
        pageFiles,
        apiFiles,
    };
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

const escapeHtml = (str: string): string => {
    const replaced = str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/\r?\n|\r/g, "");

    return replaced;
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

export const processPageElements = (
    element: Child,
    objectAttributes: Array<any>,
    parent: Child,
): Child => {
    if (
        typeof element === "boolean" ||
        typeof element === "number" ||
        Array.isArray(element)
    ) return element;

    if (typeof element === "string") {
        return (element);
    }

    const processElementOptionsAsChildAndReturn = () => {
        const children = element.children as Child[];
        
        (element.children as Child[]) = [
            (element.options as Child),
            ...children
        ];
        
        element.options = {};
        
        for (let i = 0; i < children.length+1; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes, element)
            
            element.children![i] = processedChild;
        }
        
        return {
            ...element,
            options: {},
        }
    };

    if (typeof element.options !== "object") {
        return processElementOptionsAsChildAndReturn();
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
        return processElementOptionsAsChildAndReturn();
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
            
            const processedChild = processPageElements(child, objectAttributes, element)
    
            element.children![i] = processedChild;
        }
    }

    return element;
};

const generateSuitablePageElements = async (
    pageLocation: string,
    pageElements: Child,
    metadata: () => BuiltElement<"head">,
    DIST_DIR: string,
    pageName: string,
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
    const processedPageElements = processPageElements(pageElements, objectAttributes, []);
    
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

    fs.writeFileSync(
        htmlLocation,
        resultHTML,
        {
            encoding: "utf-8",
            flag: "w",
        }
    );

    return objectAttributes;
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
            .filter(f => f.name.endsWith(".js"))
        
        for (const file of files) {
            const filePath = path.join(file.parentPath, file.name);
            
            const name = file.name.slice(0, file.name.length - 3);
            
            // hack to get around caching
            const tempPath = file.parentPath + "/" + Date.now().toString() + ".mjs";
            
            await fs.promises.copyFile(filePath, tempPath);
            
            const bytes = fs.readFileSync(tempPath);
            
            const isPage = bytes.toString().startsWith("//__ELEGANCE_JS_PAGE_MARKER__")
            
            if (isPage == false) {
                fs.rmSync(tempPath, { force: true, });
                
                continue;
            }
            
            fs.rmSync(filePath, { force: true, });

            initializeState();
            initializeObjectAttributes();
            resetLoadHooks();
            
            let pageElements;
            let metadata;
            
            try {
                const {
                    page,
                    metadata: pageMetadata,
                } = await import("file://" + tempPath);
                
                pageElements = page;
                metadata = pageMetadata;
            } catch(e) {
                fs.rmSync(tempPath, { force: true, });
                
                throw new Error(`Error in Page: ${directory === "" ? "/" : directory}${file.name} - ${e}`);
            }
            
            fs.rmSync(tempPath, { force: true, });
            
            if (
                !metadata ||
                metadata && typeof metadata !== "function"
            ) {
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
                file.parentPath,
                pageElements || (body()),
                metadata ?? (() => head()),
                DIST_DIR,
                name,
            )
    
            const {
                sendHardReloadInstruction,
            } = await generateClientPageData(
                file.parentPath,
                state || {},
                [...objectAttributes, ...foundObjectAttributes],
                pageLoadHooks || [],
                DIST_DIR,
                name,
            );
    
            if (sendHardReloadInstruction === true) shouldClientHardReload = true;
        }
    }

    return {
        shouldClientHardReload,
    };
};

const build = async (): Promise<boolean> => {
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
    
    const { pageFiles, apiFiles } = getProjectFiles(options.pagesDirectory);
    
    // perform cleanup from prev build
    {
        const existingCompiledPages = [...getAllSubdirectories(DIST_DIR), ""];
    
        // removes old pages that no longer-exist.
        // more efficient thank nuking directory
        for (const page of existingCompiledPages) {
            const pageFile = pageFiles.find(dir => path.relative(options.pagesDirectory, dir?.parentPath ?? "") === page);
            const apiFile = apiFiles.find(dir => path.relative(options.pagesDirectory, dir?.parentPath ?? "") === page);
    
            if (!pageFile && !apiFile) {
                const dir = path.join(DIST_DIR, page);
                
                if (fs.existsSync(dir) === false) {
                    continue;
                }
                
                fs.rmdirSync(dir, { recursive: true, })
                
                console.log("Deleted old page directory:", dir);
            }
        }
    }

    const start = performance.now();

    // Transpile pages from stinky TS into based MJS.
    {
        await esbuild.build({
            entryPoints: [
                ...pageFiles.map(page => path.join(page.parentPath, page.name)),
            ],
            minify: options.environment === "production",
            drop: options.environment === "production" ? ["console", "debugger"] : undefined,
            bundle: true,
            outdir: DIST_DIR,
            loader: {
                ".js": "js",
                ".ts": "ts",
            }, 
            format: "esm",
            platform: "node",
            keepNames: false,
            banner: {
                js: "//__ELEGANCE_JS_PAGE_MARKER__",
            },
            define: {
                "DEV": options.environment === "development" ? "true" : "false",
                "PROD": options.environment === "development" ? "false" : "true",
            },
            external: ["fs"],
        });
        
        await esbuild.build({
            entryPoints: [
                ...apiFiles.map(route => path.join(route.parentPath, route.name)),
            ],
            minify: options.environment === "production",
            drop: options.environment === "production" ? ["console", "debugger"] : undefined,
            bundle: false,
            outbase: path.join(options.pagesDirectory, "/api"),
            outdir: path.join(DIST_DIR, "/api"),
            loader: {
                ".js": "js",
                ".ts": "ts",
            }, 
            format: "esm",
            platform: "node",
            keepNames: false,
            define: {
                "DEV": options.environment === "development" ? "true" : "false",
                "PROD": options.environment === "development" ? "false" : "true",
            },
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
        console.log("Recursively copying public directory.. this may take a while.")

        const src = path.relative(process.cwd(), options.publicDirectory.path)

        await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true, });
    }

    {
        log(`${Math.round(pagesTranspiled-start)}ms to Transpile Pages`)
        log(`${Math.round(pagesBuilt-pagesTranspiled)}ms to Build Pages`)
        log(`${Math.round(end-pagesBuilt)}ms to Build Client`)
        
        log(green(bold((`Compiled ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));
        
        for (const pageFile of pageFiles) {
            console.log(
                "- /" + path.relative(options.pagesDirectory, pageFile.parentPath), "(Page)"
            )
        }
        
        for (const apiFile of apiFiles) {
            "- /" + path.relative(options.pagesDirectory, apiFile.parentPath), "(API Route)"
        }
    }

    if (options.postCompile) {
        log(
            white("Calling post-compile hook..")
        )
        
        options.postCompile();
    }

    if (shouldClientHardReload) {
        console.log("Sending hard reload..");
        process.send!({ event: "hard-reload", data: "", })
    } else {
        console.log("Sending soft reload..");
        process.send!({ event: "soft-reload", data: "", })
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
