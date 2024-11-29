import fs, { Dirent } from "fs";
import path from "path";
import esbuild from "esbuild";
import os, { platform } from "os";
import { fileURLToPath } from 'url';
import { GenerateTemplate  } from "./types/Metadata";

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

const containsFile = (dir: Array<Dirent>, fileName: string) => {
    const dirent = dir.find(dirent => path.parse(dirent.name).name === fileName);

    if (dirent) return dirent;
    return false;
}

const writeToTempDir = async (content: string, fileName: string) => {
    const tempDir = os.tmpdir();
    const tmpFilePath = path.join(tempDir, `${fileName}${(Math.random() * 4).toString(10)}.mjs`);

    await fs.promises.writeFile(tmpFilePath, content);

    return tmpFilePath;
}

const rootPath = process.cwd();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const clientPath = path.resolve(packageDir, './src/client.js');

const renderElement = (
    buildableElement: Child,
    pageScriptSrc: string
) => {
    if (typeof buildableElement !== "function") {
        return buildableElement;
    }

    const builtElement = buildableElement(); 

    let returnHTML = "";
    
    returnHTML += `<${builtElement.tag}`;

    if (Object.hasOwn(builtElement, "getOptions")) {
        const options = (builtElement as BuiltElement<string>).getOptions();

        for (const [key, value] of Object.entries(options)) {
            returnHTML += ` ${key}="${value}"`
        }
    }

    if (!builtElement.children) {
        returnHTML += "/>";
    } else {
        returnHTML += ">";

        // This is scuffed, but works.
        // Not necessarily proud of what i've done here.
        // When i make SSR a thing, ill re-write this.
        if (builtElement.tag === "head") {
            returnHTML += `<script type="module" elegance-script="true" src="${pageScriptSrc}" defer=true></script>`
            returnHTML += `<script type="module" elegance-script="true" src="client.js" defer=true></script>`

            returnHTML += `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
        }

        for (const child of builtElement.children) {
            returnHTML += renderElement(child, pageScriptSrc)
        }

        returnHTML += `</${builtElement.tag}>`
    }

    return returnHTML;
};

const generateHTMLTemplate = (metadata: () => BuildableElement<ElementTags>, pageSriptSrc: string) => {
    let returnHTML = "<!DOCTYPE html> <html>";

    returnHTML += renderElement (metadata(), pageSriptSrc);

    returnHTML += "<body></body></html>";

    return returnHTML
};

async function compile({ pageDirectory, minify, suppressConsole }: {
    pageDirectory: string,
    minify: boolean,
    suppressConsole: boolean,
}) {
    console.log("Starting build..")

    const startTime = performance.now();

    const subdirectories = [...getAllSubdirectories(pageDirectory), ""];

    const browserFilesToBuild = [];
    const serverFilesToBuild: Array<{ root: string, dir: string, name: string, }> = [];

    for (const subdirectory of subdirectories) {
        const fullPath = path.join(rootPath, pageDirectory, subdirectory)

        const allDirectoryFiles = fs.readdirSync(fullPath, { withFileTypes: true })
        const isValidFileType = (dirent: Dirent) => dirent.name.endsWith(".js") || dirent.name.endsWith(".ts");

        const directoryFiles = allDirectoryFiles.filter(dirent => {
            return dirent.isFile() && isValidFileType(dirent)
        });

        const pageFile = containsFile(directoryFiles, "page");

        const infoFile = containsFile(directoryFiles, "info");

        if (!pageFile && !infoFile) continue;

        else if (!infoFile) 
            throw "Each page.js/ts file must have an accompanying info.js/ts file.";

        else if (!pageFile)
            throw "Each info.js/ts file must have an accompanying page.js/ts file.";

        browserFilesToBuild.push(`${pageFile.parentPath}/${pageFile.name}`);

        serverFilesToBuild.push({ 
            root: `${infoFile.parentPath}/${infoFile.name}`,
            dir: subdirectory,
            name: infoFile.name,
        });
    }

    const builtBrowserFiles = await esbuild.context({
        entryPoints: browserFilesToBuild,
        bundle: true,
        minify: minify,
        platform: "browser",
        outdir: path.join(rootPath, "./.elegance/dist"),
        drop: suppressConsole ? ["console"] : undefined,
        format: "esm",
        loader: {
            ".js": "js",
            ".ts": "ts",
        }, 
    });

    await builtBrowserFiles.watch();

    const pageBuildFinishTime = performance.now();
    console.log(`All pages built. Took ${Math.round(pageBuildFinishTime - startTime)}ms.`); 

    const builtServerFiles = await esbuild.context({
        entryPoints: serverFilesToBuild.map(file => file.root),
        bundle: false,
        outdir: path.join(rootPath, "./.elegance/server"),
        drop: suppressConsole ? ["console"] : undefined,
        platform: "node", 
        format: 'esm',
    });

    const checkFileAvailability = (filePath: string) => {
        return new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (fs.existsSync(filePath)) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 10);
        });
    };

    await builtServerFiles.watch();

    for (let i = 0; i < serverFilesToBuild.length; i++) {
        const serverFileToBuild = serverFilesToBuild[i];

        const pathname = path.join(rootPath, "./.elegance/dist");

        const generatedFilePath = path.join(rootPath, "./.elegance/server", serverFileToBuild.dir, "info.js");

        await checkFileAvailability(generatedFilePath);

        const { metadata, generateTemplate = GenerateTemplate.BUILD } = await import(generatedFilePath);

        if (!metadata) {
            throw new Error(`At: ${serverFileToBuild.dir}. Page info files must export metadata.`);
        }

        if (typeof metadata !== "function") {
            throw new Error(`At: ${serverFileToBuild.dir}. The metadata export of an info file must be a function that resolves into an element.`);
        }

        if (generateTemplate !== GenerateTemplate.BUILD) continue;

        const pageScriptSrc = serverFileToBuild.dir + "/page.js";

        const htmlTemplate = generateHTMLTemplate(metadata, pageScriptSrc)

        await fs.promises.mkdir(path.join(pathname, serverFileToBuild.dir), { recursive: true })

        fs.writeFileSync(
            path.join(pathname, serverFileToBuild.dir, "index.html"),
            htmlTemplate,
        )
    }

    const templateBuildFinishTime = performance.now();

    console.log(`Generated HTML templates in ${Math.round(templateBuildFinishTime - pageBuildFinishTime)}ms.`);
    console.log(`Finished building in: ${Math.round(templateBuildFinishTime - startTime)}ms`);

    await esbuild.build({
        entryPoints: [clientPath],
        bundle: true,
        minify: minify,
        platform: "browser",
        outfile: path.join(rootPath, "./.elegance/dist", "client.js"),
        drop: suppressConsole ? ["console"] : undefined,
        format: "esm",
        loader: {
            ".js": "js",
            ".ts": "ts",
        }, 
    })

    const faviconPathname = path.join(pageDirectory, "favicon.ico");

    if (fs.existsSync(faviconPathname)) {
        fs.copyFileSync(faviconPathname, path.join(rootPath, ".elegance/dist/favicon.ico"));
    }

    return {
        browserFiles: builtBrowserFiles,
        serverFiles: builtServerFiles,
    }
}

export { compile, generateHTMLTemplate }

