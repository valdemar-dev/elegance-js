import fs, { Dirent } from "fs";
import path from "path";
import esbuild, { BuildOptions, Plugin, PluginBuild } from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./helpers/generateHTMLTemplate";
import { GenerateMetadata, } from "./types/Metadata";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";

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

const rootPath = process.cwd();
const DIST_DIR = path.join(rootPath, "./.elegance/dist");
const SERVER_DIR = path.join(rootPath, "./.elegance/server")

for (const file of fs.readdirSync(DIST_DIR)) {
  fs.unlinkSync(path.join(DIST_DIR, file));
}

for (const file of fs.readdirSync(SERVER_DIR)) {
  fs.unlinkSync(path.join(SERVER_DIR, file));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const SSRClientPath = path.resolve(packageDir, './src/client/client.ts');

const bindElementsPath = path.resolve(packageDir, './src/shared/bindServerElements.ts');

const getProjectFiles = (pagesDirectory: string,) => {
    const pageFiles = [];
    const infoFiles = [];

    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];

    for (const subdirectory of subdirectories) {
        const absoluteDirectoryPath = path.join(rootPath, pagesDirectory, subdirectory);

        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));

        const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
        const infoFileInSubdirectory  = getFile(subdirectoryFiles, "info");

        if (!pageFileInSubdirectory && !infoFileInSubdirectory) continue;
        else if (!infoFileInSubdirectory) 
            throw "Each page.js/ts file must have an accompanying info.js/ts file.";
        else if (!pageFileInSubdirectory)
            throw "Each info.js/ts file must have an accompanying page.js/ts file.";

        pageFiles.push(pageFileInSubdirectory);
        infoFiles.push(infoFileInSubdirectory);
    }

    return {
        pageFiles,
        infoFiles,
    }
};

const buildClient = async (
    environment: "production" | "development"
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

const buildInfoFiles = async (infoFiles: Array<Dirent>, environment: "production" | "development") => {
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

const processPageElements = (element: Child, objectAttributes: Array<ObjectAttribute<any>>, key: number): Child => {
    if (
	typeof element === "string" ||
	typeof element === "boolean" ||
	typeof element === "number" ||
	Array.isArray(element)
    ) return element;

    for (const [option, attributeValue] of Object.entries(element.options)) {
	if (typeof attributeValue !== "object") {
	    if (option.toLowerCase() === "innertext") {
		element.children = [attributeValue, ...element.children];
	    }

	    else if (option.toLowerCase() === "innerhtml") {
		element.children = [attributeValue];
	    }

	    continue;
	};

	if (!element.options.key) {
	    element.options.key = key
	}

	if (!attributeValue.type) {
	    throw `ObjectAttributeType is missing from object attribute. Got: ${JSON.stringify(attributeValue)}. For attribute: ${option}`;
	}

	switch (attributeValue.type) {
	    case ObjectAttributeType.STATE:
		if (option.toLowerCase() === "innertext") {
		    element.children = [attributeValue.value, ...element.children];
		    delete element.options[option];

		} else if (option.toLowerCase() === "innerhtml") {
		    element.children = [attributeValue.value];
		    delete element.options[option];
		} else {
		    element.options[option] = attributeValue.value;
		}

		break;

	    case ObjectAttributeType.OBSERVER:
		const firstValue = attributeValue.update(...attributeValue.initialValues);

		if (option.toLowerCase() === "innertext") {
		    element.children = [firstValue, ...element.children];
		    delete element.options[option];
		} else if (option.toLowerCase() === "innerhtml") {
		    element.children = [firstValue];
		    delete element.options[option];
		} else {
		    element.options[option] = firstValue;
		}
		break;
	}

	objectAttributes.push({ ...attributeValue, key: key, attributeName: option, });
    }

    for (let child of element.children) {
	const processedChild = processPageElements(child, objectAttributes, key+1)

	child = processedChild;	
    }

    return element;
};

const generateSuitablePageElements = async (
    pageLocation: string,
    pageElements: Child,
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
    const processedPageElements = processPageElements(pageElements, objectAttributes, 1);

    console.log(objectAttributes);

    fs.writeFileSync(
	path.join(DIST_DIR, pageLocation, "page.json"),
	JSON.stringify(processedPageElements),
	"utf-8",
    )

    return objectAttributes;
};

const generateClientPageData = async (
    pageLocation: string,
    state: Record<string, any>,
    objectAttributes: Array<ObjectAttribute<any>>,
) => {
    let clientPageJSText = `let url="${pageLocation === "" ? "/" : pageLocation}";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;`;

    if (state) {
	const formattedState: Record<string, any> = {};

	for (const [key, value] of Object.entries(state)) {
	    formattedState[value.id] = value.value;
	}

	clientPageJSText += `pd[url]={...pd[url],state:${JSON.stringify(formattedState)}};`;
    }

    const stateObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.STATE);
    if (stateObjectAttributes.length > 0) {
	clientPageJSText += `pd[url]={...pd[url],soa:${JSON.stringify(stateObjectAttributes)}};`
    }

    const observerObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.OBSERVER);
    if (observerObjectAttributes.length > 0) {
	let observerObjectAttributeString = "pd[url]={...pd[url],ooa:[";

	for (const observerObjectAttribute of observerObjectAttributes) {
	    const ooa = observerObjectAttribute as unknown as {
		key: string,
		ids: number[],
		attributeName: string,
		update: (...value: any) => any,
	    };

	    observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attributeName}",ids:[${ooa.ids}],update:${ooa.update.toString()}},`
	}

	observerObjectAttributeString += "]}";
	clientPageJSText += observerObjectAttributeString;
    }

    fs.writeFileSync(
	path.join(DIST_DIR, pageLocation, "page.js"),
	clientPageJSText,
	"utf-8",
    )
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
) => { 
    for (const page of pages) {
        if (page.generateMetadata !== GenerateMetadata.ON_BUILD) {
            continue;
        }

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

	const pagePath = path.join(DIST_DIR, page.pageLocation, "page.js")

	const { page: pageElements, state, } = await import(pagePath);

	const objectAttributes = await generateSuitablePageElements(page.pageLocation, pageElements);
	await generateClientPageData(page.pageLocation, state, objectAttributes);
    }
};

const getPageCompilationDirections = async (pageFiles: Array<Dirent>, pagesDirectory: string) => {
    const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
    const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];

    const compilationDirections = [];

    for (const builtInfoFile of builtInfoFiles) {
        const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;

        const pagePath = path.join(rootPath, pagesDirectory, builtInfoFile)
        const pageFile = pageFiles.find(page => page.parentPath === pagePath);

	// skipping empty directories
        if (!pageFile) continue;

        const infoFileExports = await import(absoluteFilePath);

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
            throw `${builtInfoFile} does not export a function \`metadata\`. Info files must export a \`metadata\` function which resolves into a <head> element.`;
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

export const compile = async ({
    pagesDirectory,
    buildOptions,
    environment
}: {
    environment: "production" | "development",
    pagesDirectory: string,
    buildOptions?: BuildOptions
}) => {
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

    await buildInfoFiles(infoFiles, environment);

    const pages = await getPageCompilationDirections(pageFiles, pagesDirectory);

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

    await buildPages(pages, environment);
    await buildClient(environment);

    const end = performance.now();

    log(bold(yellow(" -- Elegance.JS -- ")));
    log(white(`Finished build at ${new Date().toLocaleTimeString()}.`));
    log(green(bold((`Created ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));
    log("");

    log(white("  Pages:"));
    for (const page of pages) {
        log(white_100(`    - /${page.pageLocation}`));
    }
};

