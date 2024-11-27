import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import os from 'os';
import { fileURLToPath } from 'url';

const getAllSubdirectories = (dir, baseDir = dir) => {
    let directories = [];
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
const rootPath = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, '..');
const clientPath = path.resolve(packageDir, './src/client.js');
const renderElement = (buildableElement, pageScriptSrc) => {
    if (typeof buildableElement !== "function") {
        return buildableElement;
    }
    const builtElement = buildableElement();
    console.log(builtElement);
    let returnHTML = "";
    returnHTML += `<${builtElement.tag}`;
    if (Object.hasOwn(builtElement, "getOptions")) {
        const options = builtElement.getOptions();
        for (const [key, value] of Object.entries(options)) {
            returnHTML += ` ${key}="${value}"`;
        }
    }
    if (!builtElement.children) {
        returnHTML += "/>";
    }
    else {
        returnHTML += ">";
        // This is scuffed, but works.
        // Not necessarily proud of what i've done here.
        // When i make SSR a thing, ill re-write this.
        if (builtElement.tag === "head") {
            returnHTML += `<script type="module" elegance-script="true" src="${pageScriptSrc}" defer=true></script>`;
            returnHTML += `<script type="module" elegance-script="true" src="client.js" defer=true></script>`;
            returnHTML += `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
        }
        for (const child of builtElement.children) {
            returnHTML += renderElement(child, pageScriptSrc);
        }
        returnHTML += `</${builtElement.tag}>`;
    }
    return returnHTML;
};
const generateHTMLTemplate = (metadata, pageSriptSrc) => {
    let returnHTML = "<!DOCTYPE html> <html>";
    returnHTML += renderElement(metadata(), pageSriptSrc);
    returnHTML += "<body></body></html>";
    return returnHTML;
};
async function compile({ pageDirectory, minify, suppressConsole }) {
    console.log("Starting build..");
    const startTime = performance.now();
    const subdirectories = [...getAllSubdirectories(pageDirectory), ""];
    const filesToBundle = [];
    const infoFilesToBuild = [];
    for (const subdirectory of subdirectories) {
        const fullPath = path.join(rootPath, pageDirectory, subdirectory);
        const allDirectoryFiles = fs.readdirSync(fullPath, { withFileTypes: true });
        const isValidFileType = (dirent) => dirent.name.endsWith(".js") || dirent.name.endsWith(".ts");
        const directoryFiles = allDirectoryFiles.filter(dirent => {
            return dirent.isFile() && isValidFileType(dirent);
        });
        function containsFile(dir, fileName) {
            const dirent = dir.find(dirent => path.parse(dirent.name).name === fileName);
            if (dirent)
                return dirent;
            return false;
        }
        const pageFile = containsFile(directoryFiles, "page");
        const infoFile = containsFile(directoryFiles, "info");
        if (!pageFile && !infoFile)
            continue;
        else if (!infoFile)
            throw new Error("Each page.js/ts file must have an accompanying info.js/ts file.");
        else if (!pageFile)
            throw new Error("Each info.js/ts file must have an accompanying page.js/ts file.");
        filesToBundle.push(`${pageFile.parentPath}/${pageFile.name}`);
        infoFilesToBuild.push({
            root: `${infoFile.parentPath}/${infoFile.name}`,
            dir: subdirectory,
            name: infoFile.name,
        });
    }
    const context = await esbuild.context({
        entryPoints: filesToBundle,
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
    const pageBuildFinishTime = performance.now();
    console.log(`All pages built. Took ${Math.round(pageBuildFinishTime - startTime)}ms.`);
    // watches for changes in any page.js file and auto re-builds it.
    context.watch();
    const builtInfoFiles = infoFilesToBuild.map(async (file) => {
        const result = await esbuild.build({
            entryPoints: [file.root],
            bundle: true,
            write: false,
            platform: 'browser',
            format: 'esm',
        });
        return {
            name: file.name,
            dir: file.dir,
            resultText: result.outputFiles[0].text
        };
    });
    const writeToTempDir = async (content, fileName) => {
        const tempDir = os.tmpdir();
        const tmpFilePath = path.join(tempDir, `${fileName}${(Math.random() * 4).toString(10)}.mjs`);
        await fs.promises.writeFile(tmpFilePath, content);
        return tmpFilePath;
    };
    for (const builtInfoFilePromise of builtInfoFiles) {
        const builtInfoFile = await builtInfoFilePromise;
        const tmpFilePath = await writeToTempDir(builtInfoFile.resultText, builtInfoFile.name);
        const { metadata } = await import(`file://${tmpFilePath}`);
        if (!metadata) {
            throw new Error(`At: ${builtInfoFile.dir}. Page info files must export metadata.`);
        }
        if (typeof metadata !== "function") {
            throw new Error(`At: ${builtInfoFile.dir}. The metadata export of an info file must be a function that resolves into an element.`);
        }
        const pageScriptSrc = builtInfoFile.dir + "/page.js";
        const htmlTemplate = generateHTMLTemplate(metadata, pageScriptSrc);
        const pathname = path.join(rootPath, "./.elegance/dist");
        fs.promises.mkdir(path.join(pathname, builtInfoFile.dir), { recursive: true });
        fs.writeFileSync(path.join(pathname, builtInfoFile.dir, "index.html"), htmlTemplate);
        await fs.promises.unlink(tmpFilePath);
    }
    const templateBuildFinishTime = performance.now();
    console.log(`Generated HTML templates in ${templateBuildFinishTime - pageBuildFinishTime}ms.`);
    console.log(`Finished building in: ${templateBuildFinishTime - startTime}ms`);
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
    });
}

export { compile };
//# sourceMappingURL=build.esm.mjs.map
