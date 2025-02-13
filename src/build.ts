import fs, { Dirent, FSWatcher } from "fs";
import path from "path";
import esbuild, { BuildOptions, Plugin, PluginBuild } from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";
import { GenerateMetadata, } from "./types/Metadata";
import http, { IncomingMessage, ServerResponse } from "http";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, initializeState } from "./server/createState";
import { getPageLoadHooks, initializePageLoadHooks } from "./server/addPageLoadHooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const SSRClientPath = path.resolve(packageDir, './src/client/client.ts');

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
) => {
    await esbuild.build({
        bundle: true,
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        keepNames: true,
        entryPoints: [SSRClientPath],
        outdir: DIST_DIR,
        format: "iife",
        platform: "node", 
    });
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

let elementKey = 1;
const processPageElements = (element: Child, objectAttributes: Array<ObjectAttribute<any>>): Child => {
    if (
        typeof element === "boolean" ||
        typeof element === "number" ||
        Array.isArray(element)
    ) return element;

    if (typeof element === "string") {
        return escapeHtml(element);
    }

    for (const [option, attributeValue] of Object.entries(element.options)) {
        if (typeof attributeValue !== "object") {
            if (option.toLowerCase() === "innertext") {
                delete element.options[option];
                element.children = [attributeValue, ...element.children];
            }

            else if (option.toLowerCase() === "innerhtml") {
                delete element.options[option];
                element.children = [attributeValue];
            }

            continue;
        };

        let key = element.options.key;
        if (!element.options.key) {
            key = elementKey++;
            element.options.key = key;
        }

        if (!attributeValue.type) {
            throw `ObjectAttributeType is missing from object attribute. Got: ${JSON.stringify(attributeValue)}. For attribute: ${option}`;
        }

        const lowerCaseOption = option.toLowerCase();
        
        switch (attributeValue.type) {
            case ObjectAttributeType.STATE:
                if (typeof attributeValue.value === "function") {
                    if (!lowerCaseOption.startsWith("on")) { 
                        throw `ObjectAttribute.STATE type object attributes may not have their value be a function, unless their attribute is an event handler.`
                    }

                    delete element.options[option];

                    break;
                }

                if (lowerCaseOption === "innertext") {
                    element.children = [attributeValue.value, ...element.children];
                    delete element.options[option];
                } else if (lowerCaseOption === "innerhtml") {
                    element.children = [attributeValue.value];
                    delete element.options[option];
                } else {
                    delete element.options[option];
                    element.options[lowerCaseOption] = attributeValue.value;
                }

                break;

            case ObjectAttributeType.OBSERVER:
                const firstValue = attributeValue.update(...attributeValue.initialValues);

                if (lowerCaseOption === "innertext") {
                    element.children = [firstValue, ...element.children];
                    delete element.options[option];
                } else if (lowerCaseOption === "innerhtml") {
                    element.children = [firstValue];
                    delete element.options[option];
                } else {
                    delete element.options[option];
                    element.options[lowerCaseOption] = firstValue;
                }

                break;
        }

        objectAttributes.push({ ...attributeValue, key: key, attribute: lowerCaseOption, });
    }

    for (let child of element.children) {
        const processedChild = processPageElements(child, objectAttributes)

        child = processedChild;	
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

    // reset key so it doesnt go till infinity
    elementKey = 1;

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

const generateClientPageData = async (
    pageLocation: string,
    state: Record<string, any>,
    objectAttributes: Array<ObjectAttribute<any>>,
    pageLoadHooks: Array<(...params: any) => any>,
    DIST_DIR: string,
    watch: boolean,
) => {
    let clientPageJSText = `let url="${pageLocation === "" ? "/" : `/${pageLocation}`}";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;
    clientPageJSText += `pd[url]={`;

    if (watch) {
        clientPageJSText += "w:true,";
    }

    if (state) {
        let formattedStateString = "";

        // sorting state cause uh
        // the client ooa's rely on state being sorted by ID. - val feb 9 2025
        const sortedState = Object.entries(state).sort(([,av], [,bv]) => av.id - bv.id)

        for (const [key, subject] of sortedState) {
            if (typeof subject.value === "string") {
                formattedStateString += `${key}:{id:${subject.id},value:"${subject.value}"},`;
            } else {
                formattedStateString += `${key}:{id:${subject.id},value:${subject.value}},`;
            }
        }
     
        clientPageJSText += `state:{${formattedStateString}},`;
    }

    const stateObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.STATE);

    if (stateObjectAttributes.length > 0) {
        clientPageJSText += `soa:${JSON.stringify(stateObjectAttributes)},`
    }

    const observerObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.OBSERVER);
    if (observerObjectAttributes.length > 0) {
        let observerObjectAttributeString = "ooa:[";

        for (const observerObjectAttribute of observerObjectAttributes) {
            const ooa = observerObjectAttribute as unknown as {
                key: string,
                ids: number[],
                attribute: string,
                update: (...value: any) => any,
            };

            observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",ids:[${ooa.ids}],update:${ooa.update.toString()}},`
        }

        observerObjectAttributeString += "],";
        clientPageJSText += observerObjectAttributeString;
    }

    if (pageLoadHooks.length > 0) {
        clientPageJSText += "plh:[";

        for (const pageLoadHook of pageLoadHooks) {
            clientPageJSText += `${pageLoadHook.toString()},`;
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
    environment: "production" | "development",
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

        const pagePath = path.join(DIST_DIR, page.pageLocation, "page.js")

        // reset server-state if it existed 
        initializeState();
        initializePageLoadHooks();

        const { page: pageElements, } = await import(pagePath + `?${Date.now()}`);

        const state = getState();
        const pageLoadHooks = getPageLoadHooks();

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
            watch
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
        const absoluteFilePath = `${path.join(SERVER_DIR, builtInfoFile, "/info.js")}`;

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

        server.listen(3001, () => {
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
    watch = true,
}: {
    writeToHTML?: boolean,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    watch?: boolean,
}) => {
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

    await buildInfoFiles(infoFiles, environment, SERVER_DIR);

    const pages = await getPageCompilationDirections(pageFiles, pagesDirectory, SERVER_DIR);

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

    const {
        shouldClientHardReload
    } = await buildPages(pages, environment, DIST_DIR, writeToHTML, watch);
    await buildClient(environment, DIST_DIR);

    const end = performance.now();

    log(bold(yellow(" -- Elegance.JS -- ")));
    log(white(`Finished build at ${new Date().toLocaleTimeString()}.`));
    log(green(bold((`Created ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));
    log("");

    log(white("  Pages:"));
    for (const page of pages) {
        log(white_100(`    - /${page.pageLocation}`));
    }

    if (watch) {
        await registerListener({
            writeToHTML,
            pagesDirectory,
            outputDirectory,
            environment,
            watch,
        })
    }

    return {
        shouldClientHardReload
    }
};

