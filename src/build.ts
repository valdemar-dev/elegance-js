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
    const infoFiles = [];

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    for (const subdirectory of subdirectories) {
        const absoluteDirectoryPath = path.join(pagesDirectory, subdirectory);

        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));

        const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
        const infoFileInSubdirectory  = getFile(subdirectoryFiles, "info");

        if (!pageFileInSubdirectory && !infoFileInSubdirectory) continue;
        else if (!infoFileInSubdirectory) {
            const name = (pageFileInSubdirectory as Dirent).name 
            throw `/${subdirectory}/${name} is missing it's accompanying info.js/ts file.`;
        } else if (!pageFileInSubdirectory) {
            const name = (infoFileInSubdirectory as Dirent).name 
            throw `/${subdirectory}/${name} is missing it's accompanying page.js/ts file.`;
        }

        pageFiles.push(pageFileInSubdirectory);
        infoFiles.push(infoFileInSubdirectory);
    }

    return {
        pageFiles,
        infoFiles,
    }
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

const buildInfoFiles = async (infoFiles: Array<Dirent>, environment: "production" | "development", SERVER_DIR: string) => {
    const mappedInfoFileNames = infoFiles.map(f => `${f.parentPath}/${f.name}`);

    await esbuild.build({
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        entryPoints: mappedInfoFileNames,
        bundle: true,
        outdir: SERVER_DIR,
        loader: {
            ".js": "js",
            ".ts": "ts",
        }, 
        inject: [bindElementsPath],
        format: "esm",
        platform: "node",
    });
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
        throw `ObjectAttributeType is missing from object attribute.`;
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

const processPageElements = (element: Child, objectAttributes: Array<any>): Child => {
    if (
        typeof element === "boolean" ||
        typeof element === "number" ||
        Array.isArray(element)
    ) return element;

    if (typeof element === "string") {
        return escapeHtml(element);
    }

    const processElementOptionsAsChildAndReturn = () => {
        const children = element.children as Child[];

        (element.children as Child[]) = [
            (element.options as Child),
            ...children
        ];

        for (let child of children) {
            const processedChild = processPageElements(child, objectAttributes)

            child = processedChild;	
        }

        return element;
    };

    if (typeof element.options !== "object") {
        return processElementOptionsAsChildAndReturn();
    }

    // This is so we can check if uh
    // the first param of a element creation call is a child
    // instead of options.
    // It's a syntag sugar thing, but causes headaches.
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
        for (let child of element.children) {
            const processedChild = processPageElements(child, objectAttributes)

            child = processedChild;	
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
            path.join(DIST_DIR, pageLocation, "page.json"),
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
        pageURL: pageLocation,
        head: metadata,
        addPageScriptTag: true,
    });

    const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;

    const htmlLocation = path.join(DIST_DIR, pageLocation, "index.html");

    fs.writeFileSync(
        htmlLocation,
        resultHTML,
        {
            encoding: "utf-8",
            flag: "w",
        }
    );

    const infoLocation = path.join(DIST_DIR, pageLocation, "info.js");

    if (fs.existsSync(infoLocation)) {
        fs.unlinkSync(infoLocation)
    }

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
    let clientPageJSText = `let url="${pageLocation === "" ? "/" : `/${pageLocation}`}";`;

    clientPageJSText += `if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`
    clientPageJSText += `pd[url]={`;

    if (state) {
        const nonBoundState = state.filter(subj => (subj.bind === undefined));        

        clientPageJSText += `state:[`

        for (const subject of nonBoundState) {
            if (typeof subject.value === "string") {
                clientPageJSText += `{id:${subject.id},value:"${subject.value}"},`;
            } else {
                clientPageJSText += `{id:${subject.id},value:${subject.value}},`;
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
                        clientPageJSText += `{id:${subject.id},value:"${subject.value}"},`;
                    } else {
                        clientPageJSText += `{id:${subject.id},value:${subject.value}},`;
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

    const pageDataPath = path.join(DIST_DIR, pageLocation, "page_data.js");

    let sendHardReloadInstruction = false;

    const transformedResult = await esbuild.transform(clientPageJSText, { minify: true, })

    // makes pages hard-reload when import things are changed - val feb 10 2025
    if (fs.existsSync(pageDataPath)) {
        const existingPageData = fs.readFileSync(pageDataPath, "utf-8")

        if (existingPageData.toString() !== transformedResult.code) {
            sendHardReloadInstruction = true;
        }
    }

    fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8",)

    return { sendHardReloadInstruction, }
};

const buildPages = async (
    pages: Array<{
        metadata: () => BuiltElement<"head">,
        executeOnServer: ExecuteOnServer | null,
        generateMetadata: GenerateMetadata,
        pageLocation: string,
        pageFilepath: string, 
    }>,
    DIST_DIR: string,
    writeToHTML: boolean,
    watch: boolean
) => { 
    let shouldClientHardReload = false;

    for (const page of pages) {
        if (!writeToHTML) {
            if (page.generateMetadata === GenerateMetadata.ON_BUILD) {
                const template = generateHTMLTemplate({
                    pageURL: page.pageLocation,
                    head: page.metadata,
                    addPageScriptTag: true,
                });

                fs.writeFileSync(
                    path.join(DIST_DIR, page.pageLocation, "metadata.html"),
                    template,
                    "utf-8",
                );
            }
        }

        const pagePath = path.resolve(path.join(DIST_DIR, page.pageLocation, "page.js"))

        initializeState();
        resetLoadHooks();
        resetLayouts();

        const { page: pageElements, } = await import(pagePath + `?${Date.now()}`);

        const state = getState();
        const pageLoadHooks = getLoadHooks();

        if (!pageElements) {
            throw `/${page.pageLocation}/page.js must export a const page, which is of type BuiltElement<"body">.`
        }

        const objectAttributes = await generateSuitablePageElements(
            page.pageLocation,
            pageElements,
            page.metadata,
            DIST_DIR,
            writeToHTML
        );

        const {
            sendHardReloadInstruction,
        } = await generateClientPageData(
            page.pageLocation,
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

const getPageCompilationDirections = async (pageFiles: Array<Dirent>, pagesDirectory: string, SERVER_DIR: string) => {
    const builtInfoFiles = [...getAllSubdirectories(SERVER_DIR), ""];

    const compilationDirections = [];

    for (const builtInfoFile of builtInfoFiles) {
        const absoluteFilePath = `${path.resolve(process.cwd(), path.join(SERVER_DIR, builtInfoFile, "/info.js"))}`;

        const pagePath = path.join(pagesDirectory, builtInfoFile)
        const pageFile = pageFiles.find(page => page.parentPath === pagePath);

        // skipping empty directories
        if (!pageFile) continue;

        // hacky, skips cache
        const infoFileExports = await import(absoluteFilePath + `?${Date.now()}`);

        const {
            metadata,
            executeOnServer,
            generateMetadata = GenerateMetadata.ON_BUILD,
        }: {
            metadata: () => BuiltElement<"head">,
            executeOnServer?: ExecuteOnServer,
            generateMetadata?: GenerateMetadata,
        } = infoFileExports;

        if (!metadata) {
            throw `File ${builtInfoFile}/info.js does not export a function \`metadata\`. Info files must export a \`metadata\` function which resolves into a <head> element.`;
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

let doesHTTPWatchServerExist = false;
let isTimedOut = false;
let httpStream: ServerResponse<IncomingMessage> | null;

const currentWatchers: FSWatcher[] = [];

const rebuild = async (props: any) => {
    try {
        const {
            shouldClientHardReload,
        } = await compile({ ...props, });

        if (shouldClientHardReload) {
            console.log("Sending hard reload..");
            httpStream?.write(`data: hard-reload\n\n`)
        } else {
            console.log("Sending soft reload..");
            httpStream?.write(`data: reload\n\n`)
        }
    } catch(e) {
        log(red(bold(`Build Failed at ${new Date().toLocaleTimeString()}`)))
        console.error(e);
    }

    isTimedOut = false;
};

const registerListener = async (props: any) => {
    if (!doesHTTPWatchServerExist) {
        doesHTTPWatchServerExist = true;

        const server = http.createServer((req, res) => {
            if (req.url === '/events') {
                log(white("Client listening for changes.."));

                res.writeHead(200, {
                    "X-Accel-Buffering": "no",
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    "Content-Encoding": "none",
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Methods":  "*",
                    "Access-Control-Allow-Headers": "*",
                });

                httpStream = res;
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });

        server.listen(props.watchServerPort, () => {
            log(bold(green('Hot-Reload server online!')));
        });
    } 
    
    for (const watcher of currentWatchers) {
        watcher.close();
    }

    const subdirectories = [...getAllSubdirectories(props.pagesDirectory), ""];

    for (const directory of subdirectories) {
        const fullPath = path.join(props.pagesDirectory, directory)

        const watcher = fs.watch(
            fullPath, 
            async () => {
                if (isTimedOut) return;
                isTimedOut = true;

                // clears term
                process.stdout.write('\x1Bc');

                setTimeout(async () => {
                    await rebuild(props)
                }, 100);
            },
        );

        currentWatchers.push(watcher);
    }
};

export const compile = async ({
    writeToHTML = false,
    pagesDirectory,
    outputDirectory,
    environment,
    watchServerPort = 3001,
    postCompile,
    publicDirectory,
}: {
    writeToHTML?: boolean,
    watchServerPort?: number
    postCompile?: () => any,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    publicDirectory?: string,
}) => {
    const watch = environment === "development";

    const BUILD_FLAG = path.join(outputDirectory, "ELEGANE_BUILD_FLAG");

    if (fs.existsSync(outputDirectory)) {
        if (!fs.existsSync(BUILD_FLAG)) {
            throw `The output directory already exists, but is not an Elegance Build directory.`;
        }

        fs.rmSync(outputDirectory, { recursive: true, })
    }

    fs.mkdirSync(outputDirectory);

    fs.writeFileSync(
        path.join(BUILD_FLAG),
        "This file just marks this directory as one containing an Elegance Build.",
        "utf-8",
    ); 

    const DIST_DIR = writeToHTML ? outputDirectory : path.join(outputDirectory, "dist");
    const SERVER_DIR = writeToHTML ? outputDirectory : path.join(outputDirectory, "server")

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
    }

    if (!fs.existsSync(SERVER_DIR)) {
        fs.mkdirSync(SERVER_DIR);
    }

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

    const start = performance.now();

    const { pageFiles, infoFiles } = getProjectFiles(pagesDirectory);

    const projectFilesGathered = performance.now();

    await buildInfoFiles(infoFiles, environment, SERVER_DIR);

    const infoFilesBuilt = performance.now();

    const pages = await getPageCompilationDirections(pageFiles, pagesDirectory, SERVER_DIR);

    const compilationDirectionsGathered = performance.now();

    await esbuild.build({
        entryPoints: [
            ...pages.map(page => page.pageFilepath),
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
    } = await buildPages(pages, DIST_DIR, writeToHTML, watch);

    const pagesBuilt = performance.now();

    await buildClient(environment, DIST_DIR, watch, watchServerPort);

    if (publicDirectory) {
        fs.symlinkSync(publicDirectory, path.join(DIST_DIR, "public"), "dir");
    }

    const end = performance.now();

    console.log(`${Math.round(projectFilesGathered-start)}ms to Gather Project Files`)
    console.log(`${Math.round(infoFilesBuilt-projectFilesGathered)}ms to Build info Files`)
    console.log(`${Math.round(compilationDirectionsGathered-infoFilesBuilt)}ms to Gather Compilation Directions`)
    console.log(`${Math.round(pagesTranspiled-compilationDirectionsGathered)} to Transpile Pages`)
    console.log(`${Math.round(pagesBuilt-pagesTranspiled)}ms to Build Pages`)
    console.log(`${Math.round(end-pagesBuilt)}ms to Build Client`)

    log(green(bold((`Created ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));

    if (watch) {
        await registerListener({
            writeToHTML,
            pagesDirectory,
            outputDirectory,
            environment,
            watch,
            watchServerPort,
            postCompile,
            publicDirectory,
        })
    }

    if (postCompile) {
        await postCompile();
    }

    return {
        shouldClientHardReload
    }
};
