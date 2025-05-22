import fs, { Dirent, FSWatcher } from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";
import { GenerateMetadata, } from "./types/Metadata";
import http, { IncomingMessage, ServerResponse } from "http";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, initializeState } from "./server/createState";
import { getLoadHooks, LoadHook, resetLoadHooks } from "./server/loadHook";
import { resetLayouts } from "./server/layout";
import { camelToKebabCase } from "./helpers/camelToKebab";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const clientPath = path.resolve(packageDir, './src/client/client.ts');
const watcherPath = path.resolve(packageDir, './src/client/watcher.ts');

const bindElementsPath = path.resolve(packageDir, './src/shared/bindServerElements.ts');

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

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    for (const subdirectory of subdirectories) {
        const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);

        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));

        const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");

        if (!pageFileInSubdirectory) continue;

        pageFiles.push(pageFileInSubdirectory);
    }

    return pageFiles;
};

const buildClient = async (
    environment: "production" | "development",
    DIST_DIR: string,
    isInWatchMode: boolean,
    watchServerPort: number
) => {
    let clientString = fs.readFileSync(clientPath, "utf-8");

    if (isInWatchMode) {
        clientString += `const watchServerPort = ${watchServerPort}`;
        clientString += fs.readFileSync(watcherPath, "utf-8");
    }

    const transformedClient = await esbuild.transform(clientString, {
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        keepNames: true,
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
    if (!key) {
        key = elementKey++;
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

const processPageElements = (
    element: Child,
    objectAttributes: Array<any>,
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
            
            const processedChild = processPageElements(child, objectAttributes)
            
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

            delete options[optionName];
            options[camelToKebabCase(optionName)] = optionValue;
            
            continue;
        };

        processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
    }

    if (element.children) {    
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes)
    
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
    writeToHTML: boolean,
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
    const processedPageElements = processPageElements(pageElements, objectAttributes);
    
    elementKey = 0;

    if (!writeToHTML) {
        fs.writeFileSync(
            path.join(pageLocation, "page.json"),
            JSON.stringify(processedPageElements),
            "utf-8",
        )

        return objectAttributes;
    }

    const renderedPage = await serverSideRenderPage(
        processedPageElements as Page,
        pageLocation,
    );

    const template = generateHTMLTemplate({
        pageURL: path.relative(DIST_DIR, pageLocation),
        head: metadata,
        addPageScriptTag: true,
    });

    const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;

    const htmlLocation = path.join(pageLocation, "index.html");

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
) => {
    const pageDiff = path.relative(DIST_DIR, pageLocation);

    let clientPageJSText = `let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;

    clientPageJSText += `if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`
    clientPageJSText += `pd[url]={`;

    if (state) {
        const nonBoundState = state.filter(subj => (subj.bind === undefined));        

        clientPageJSText += `state:[`

        for (const subject of nonBoundState) {
            if (typeof subject.value === "string") {
                clientPageJSText += `{id:${subject.id},value:"${JSON.stringify(subject.value)}"},`;
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
                        clientPageJSText += `{id:${subject.id},value:"${JSON.stringify(subject.value)}"},`;
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
    clientPageJSText += `}`;

    const pageDataPath = path.join(pageLocation, "page_data.js");

    let sendHardReloadInstruction = false;

    const transformedResult = await esbuild.transform(clientPageJSText, { minify: true, })

    fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8",)

    return { sendHardReloadInstruction, }
};

const buildPages = async (
    DIST_DIR: string,
    writeToHTML: boolean,
) => { 
    resetLayouts();

    const subdirectories = [...getAllSubdirectories(DIST_DIR), ""];

    let shouldClientHardReload = false;

    for (const directory of subdirectories) {
        const pagePath = path.resolve(path.join(DIST_DIR, directory))

        initializeState();
        resetLoadHooks();

        const {
            page: pageElements,
            generateMetadata,
            metadata,
        } = await import(pagePath + "/page.js" + `?${Date.now()}`);

        if (
            !metadata ||
            metadata && typeof metadata !== "function"
        ) {
            throw `${pagePath} is not exporting a metadata function.`;
        }

        if (!pageElements) {
            throw `${pagePath} must export a const page, which is of type BuiltElement<"body">.`
        }

        const state = getState();
        const pageLoadHooks = getLoadHooks();
        
        let objectAttributes = [];
        
        try {
            objectAttributes = await generateSuitablePageElements(
                pagePath,
                pageElements,
                metadata,
                DIST_DIR,
                writeToHTML,
            )
        } catch(error) {
            console.error(
                "Failed to generate suitable page elements.",
                pagePath + "/page.js",
                error,
            )
            
            return {
                shouldClientHardReload: false,
            }
        }

        const {
            sendHardReloadInstruction,
        } = await generateClientPageData(
            pagePath,
            state || {},
            objectAttributes,
            pageLoadHooks || [],
            DIST_DIR,
        );

        if (sendHardReloadInstruction === true) shouldClientHardReload = true;
    }

    return {
        shouldClientHardReload,
    };
};

let isTimedOut = false;
let httpStream: ServerResponse<IncomingMessage> | null;

const currentWatchers: FSWatcher[] = [];

const registerListener = async (props: any) => {
    const server = http.createServer((req, res) => {
        if (req.url === '/events') {
            log(white("Client listening for changes.."));
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                "Connection": "keep-alive",
                "Transfer-Encoding": "chunked",
                "X-Accel-Buffering": "no",
                "Content-Encoding": "none",
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Methods":  "*",
                "Access-Control-Allow-Headers": "*",
            });

            httpStream = res;

            // makes weird buffering thing go away lol
            httpStream.write(`data: ping\n\n`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    server.listen(props.watchServerPort, () => {
        log(bold(green('Hot-Reload server online!')));
    });
};

const build = async ({
    writeToHTML = false,
    pagesDirectory,
    outputDirectory,
    environment,
    watchServerPort = 3001,
    postCompile,
    preCompile,
    publicDirectory,
    DIST_DIR,
}: {
    writeToHTML?: boolean,
    watchServerPort?: number
    postCompile?: () => any,
    preCompile?: () => any,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    publicDirectory?: {
        path: string,
        method: "symlink" | "recursive-copy",
    },
    DIST_DIR: string,
}) => {
    const watch = environment === "development";

    log(bold(yellow(" -- Elegance.JS -- ")));
    log(white(`Beginning build at ${new Date().toLocaleTimeString()}..`));

    log("");

    if (environment === "production") {
        log(
            " - ",
            bgYellow(bold(black(" NOTE "))),
            " : ", 
            white("In production mode, no "), 
            underline("console.log() "),
            white("statements will be shown on the client, and all code will be minified."));

        log("");
    }

    if (preCompile) {
        preCompile();
    }

    const pageFiles = getProjectFiles(pagesDirectory);
    const existingCompiledPages = [...getAllSubdirectories(DIST_DIR), ""];

    // removes old pages that no longer-exist.
    // more efficient thank nuking directory
    for (const page of existingCompiledPages) {
        const pageFile = pageFiles.find(dir => path.relative(pagesDirectory, dir.parentPath) === page);

        if (!pageFile) {
            fs.rmdirSync(path.join(DIST_DIR, page), { recursive: true, })
        }
    }

    const start = performance.now();

    await esbuild.build({
        entryPoints: [
            ...pageFiles.map(page => path.join(page.parentPath, page.name)),
        ],
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        bundle: true,
        outdir: DIST_DIR,
        loader: {
            ".js": "js",
            ".ts": "ts",
        }, 
        format: "esm",
        platform: "node",
    });

    const pagesTranspiled = performance.now();

    const {
        shouldClientHardReload
    } = await buildPages(DIST_DIR, writeToHTML);

    const pagesBuilt = performance.now();

    await buildClient(environment, DIST_DIR, watch, watchServerPort);

    const end = performance.now();

    if (publicDirectory) {
        if (environment === "development") {
            console.log("Creating a symlink for the public directory.")

            if (!fs.existsSync(path.join(DIST_DIR, "public"))) {
                fs.symlinkSync(publicDirectory.path, path.join(DIST_DIR, "public"), "dir");
            } 
        } else if (environment === "production") {
            console.log("Recursively copying public directory.. this may take a while.")

            const src = path.relative(process.cwd(),  publicDirectory.path)

            if (fs.existsSync(path.join(DIST_DIR, "public"))) {
                fs.rmSync(path.join(DIST_DIR, "public"), { recursive: true, })
            }

            await fs.promises.cp(src, path.join(DIST_DIR, "public"), { recursive: true, });
        }
    }

    console.log(`${Math.round(pagesTranspiled-start)}ms to Transpile Pages`)
    console.log(`${Math.round(pagesBuilt-pagesTranspiled)}ms to Build Pages`)
    console.log(`${Math.round(end-pagesBuilt)}ms to Build Client`)

    log(green(bold((`Compiled ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));

    if (postCompile) {
        await postCompile();
    }

    if (!watch) return;

    for (const watcher of currentWatchers) {
        watcher.close();
    }

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    const watcherFn = async () => {
        if (isTimedOut) return;
        isTimedOut = true;

        // clears term
        process.stdout.write('\x1Bc');

        setTimeout(async () => {
            await build({
                writeToHTML,
                pagesDirectory,
                outputDirectory,
                environment,
                watchServerPort,
                postCompile,
                preCompile,
                publicDirectory,
                DIST_DIR,
            })

            isTimedOut = false;
        }, 100);
    };

    for (const directory of subdirectories) {
        const fullPath = path.join(pagesDirectory, directory)

        const watcher = fs.watch(
            fullPath,
            {},
            watcherFn,
        );

        currentWatchers.push(watcher);
    }

    if (shouldClientHardReload) {
        console.log("Sending hard reload..");
        httpStream?.write(`data: hard-reload\n\n`)
    } else {
        console.log("Sending soft reload..");
        httpStream?.write(`data: reload\n\n`)
    }
};

export const compile = async (props: {
    writeToHTML?: boolean,
    watchServerPort?: number
    postCompile?: () => any,
    preCompile?: () => any,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    publicDirectory?: {
        path: string,
        method: "symlink" | "recursive-copy",
    },
}) => {
    const watch = props.environment === "development";

    const BUILD_FLAG = path.join(props.outputDirectory, "ELEGANE_BUILD_FLAG");

    if (!fs.existsSync(props.outputDirectory)) {
        fs.mkdirSync(props.outputDirectory);
    }

    if (!fs.existsSync(BUILD_FLAG)) {
        throw `The output directory already exists, but is not an Elegance Build directory.`;
    }

    fs.writeFileSync(
        path.join(BUILD_FLAG),
        "This file just marks this directory as one containing an Elegance Build.",
        "utf-8",
    ); 

    const DIST_DIR = props.writeToHTML ? props.outputDirectory : path.join(props.outputDirectory, "dist");

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
    }

    if (watch) {
        await registerListener(props)
    }

    await build({ ...props, DIST_DIR, });
};
