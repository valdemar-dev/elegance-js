import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { RenderingMethod, GenerateMetadata } from './types/Metadata.esm.mjs';
import { generateHTMLTemplate } from './helpers/generateHTMLTemplate.esm.mjs';

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
const getFile = (dir, fileName) => {
    const dirent = dir.find(dirent => path.parse(dirent.name).name === fileName);
    if (dirent)
        return dirent;
    return false;
};
const rootPath = process.cwd();
const DIST_DIR = path.join(rootPath, "./.elegance/dist");
const SERVER_DIR = path.join(rootPath, "./.elegance/server");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, '..');
const clientPath = path.resolve(packageDir, './src/client.ts');
const bindElementsPath = path.resolve(packageDir, './src/bindElements.ts');
const getProjectFiles = (pagesDirectory) => {
    const pageFiles = [];
    const infoFiles = [];
    const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
    for (const subdirectory of subdirectories) {
        const absoluteDirectoryPath = path.join(rootPath, pagesDirectory, subdirectory);
        const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true, })
            .filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));
        const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
        const infoFileInSubdirectory = getFile(subdirectoryFiles, "info");
        if (!pageFileInSubdirectory && !infoFileInSubdirectory)
            continue;
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
    };
};
const buildClient = async (environment) => {
    await esbuild.build({
        bundle: true,
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        entryPoints: [clientPath],
        outfile: path.join(DIST_DIR, "/client.js"),
        format: "esm",
        platform: "node",
    });
};
const buildInfoFiles = async (infoFiles, environment) => {
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
const getPageCompilationDirections = async (pageFiles, pagesDirectory) => {
    const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
    const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];
    const compilationDirections = [];
    for (const builtInfoFile of builtInfoFiles) {
        const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;
        const pageFile = pageFiles.find(page => page.parentPath === path.join(rootPath, pagesDirectory, builtInfoFile));
        if (!pageFile) {
            throw `Page not found. Something is wrong.`;
        }
        const infoFileExports = await import(absoluteFilePath);
        const { renderingMethod = RenderingMethod.SERVER_SIDE_RENDERING, metadata, executeOnServer, generateMetadata = GenerateMetadata.ON_BUILD, } = infoFileExports;
        if (!metadata) {
            throw `${builtInfoFile} does not export a function \`metadata\`. Info files must export a \`metadata\` function which resolves into a <head> element.`;
        }
        if (typeof metadata !== "function") {
            throw `${builtInfoFile} The function \`metadata\` is not a function which resolves into a <head> element.`;
        }
        compilationDirections.push({
            renderingMethod,
            metadata,
            executeOnServer: executeOnServer ?? null,
            generateMetadata,
            pageFilepath: `${pageFile.parentPath}/${pageFile.name}`,
            pageLocation: builtInfoFile
        });
    }
    return compilationDirections;
};
const processSSRPages = async (SSRPages, environment) => {
    for (const page of SSRPages) {
        if (page.generateMetadata !== GenerateMetadata.ON_BUILD) {
            continue;
        }
        const template = generateHTMLTemplate({
            pageURL: page.pageLocation,
            head: page.metadata,
            addPageScriptTag: false,
        });
        fs.writeFileSync(path.join(DIST_DIR, page.pageLocation, "metadata.html"), template, "utf-8");
    }
};
const processSSGPages = async (SSGPages, environment) => {
};
const processCSRPages = async (CSRPages, environment) => {
    for (const page of CSRPages) {
        if (page.generateMetadata !== GenerateMetadata.ON_BUILD) {
            continue;
        }
        const template = generateHTMLTemplate({
            pageURL: page.pageLocation,
            head: page.metadata,
            addPageScriptTag: true,
        });
        fs.writeFileSync(path.join(DIST_DIR, page.pageLocation, "metadata.html"), template, "utf-8");
    }
};
const compile = async ({ pagesDirectory, buildOptions, environment }) => {
    const start = performance.now();
    console.log("Elegance.JS: Beginning build.");
    console.log("Using Environment: ", environment);
    const { pageFiles, infoFiles } = getProjectFiles(pagesDirectory);
    await buildInfoFiles(infoFiles, environment);
    const pageCompilationDirections = await getPageCompilationDirections(pageFiles, pagesDirectory);
    const CSRPages = pageCompilationDirections.filter(cd => cd.renderingMethod === RenderingMethod.CLIENT_SIDE_RENDERING);
    const SSRPages = pageCompilationDirections.filter(cd => cd.renderingMethod === RenderingMethod.SERVER_SIDE_RENDERING);
    const SSGPages = pageCompilationDirections.filter(cd => cd.renderingMethod === RenderingMethod.STATIC_GENERATION);
    await esbuild.build({
        entryPoints: [
            ...SSRPages.map(page => page.pageFilepath),
            ...CSRPages.map(page => page.pageFilepath),
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
    await processSSRPages(SSRPages);
    await processCSRPages(CSRPages);
    await processSSGPages();
    await buildClient(environment);
    const end = performance.now();
    console.log(`Elegance.JS: Finished building in ${Math.ceil(end - start)}ms.`);
    console.log(`COMPILED PAGES:`);
    console.log("  CSR:");
    for (const page of CSRPages) {
        console.log(`    - /${page.pageLocation}`);
    }
    console.log("  SSR:");
    for (const page of SSRPages) {
        console.log(`    - /${page.pageLocation}`);
    }
    console.log("  SSG:");
    for (const page of SSGPages) {
        console.log(`    - /${page.pageLocation}`);
    }
};
//async function compileOld({ pageDirectory, minify, suppressConsole }: {
//    pageDirectory: string,
//    minify: boolean,
//    suppressConsole: boolean,
//}) {
//    console.log("Starting build..")
//
//    const startTime = performance.now();
//
//    const builtBrowserFiles = await esbuild.context({
//        entryPoints: browserFilesToBuild,
//        bundle: true,
//        minify: minify,
//        platform: "browser",
//        outdir: path.join(rootPath, "./.elegance/dist"),
//        drop: suppressConsole ? ["console"] : undefined,
//        format: "esm",
//
//    });
//
//    await builtBrowserFiles.watch();
//
//    const pageBuildFinishTime = performance.now();
//    console.log(`All pages built. Took ${Math.round(pageBuildFinishTime - startTime)}ms.`); 
//
//    const builtServerFiles = await esbuild.context({
//        entryPoints: serverFilesToBuild.map(file => file.root),
//        bundle: false,
//        outdir: path.join(rootPath, "./.elegance/server"),
//        drop: suppressConsole ? ["console"] : undefined,
//        platform: "node", 
//        format: 'esm',
//    });
//
//    await builtServerFiles.watch();
//
//    const checkFileAvailability = (filePath: string) => {
//        return new Promise<void>((resolve, reject) => {
//            const checkInterval = setInterval(() => {
//                if (fs.existsSync(filePath)) {
//                    clearInterval(checkInterval);
//                    resolve();
//                }
//            }, 10);
//        });
//    };
//
//    for (let i = 0; i < serverFilesToBuild.length; i++) {
//        const serverFileToBuild = serverFilesToBuild[i];
//
//        const pathname = path.join(rootPath, "./.elegance/dist");
//
//        const generatedFilePath = path.join(rootPath, "./.elegance/server", serverFileToBuild.dir, "info.js");
//
//        await checkFileAvailability(generatedFilePath);
//
//        const { metadata, generateTemplate = GenerateMetadata.BUILD } = await import(generatedFilePath);
//        const { page } = await import(path.join(pathname, serverFileToBuild.dir, "/page.js"));
//
//        if (!metadata) {
//            throw new Error(`At: ${serverFileToBuild.dir}. Page info files must export metadata.`);
//        }
//
//        if (typeof metadata !== "function") {
//            throw new Error(`At: ${serverFileToBuild.dir}. The head export of an info file must be a function that resolves into an element.`);
//        }
//
//        if (generateTemplate !== GenerateMetadata.BUILD) continue;
//
//        const htmlTemplate = generateHTMLTemplate({ head: metadata, page: page, pageURL: serverFileToBuild.dir });
//
//        await fs.promises.mkdir(path.join(pathname, serverFileToBuild.dir), { recursive: true })
//
//        fs.writeFileSync(
//            path.join(pathname, serverFileToBuild.dir, "index.html"),
//            htmlTemplate,
//        )
//    }
//
//    const templateBuildFinishTime = performance.now();
//
//    console.log(`Generated HTML templates in ${Math.round(templateBuildFinishTime - pageBuildFinishTime)}ms.`);
//    console.log(`Finished building in: ${Math.round(templateBuildFinishTime - startTime)}ms`);
//
//    await esbuild.build({
//        entryPoints: [clientPath],
//        bundle: true,
//        minify: minify,
//        platform: "browser",
//        outfile: path.join(rootPath, "./.elegance/dist", "client.js"),
//        drop: suppressConsole ? ["console"] : undefined,
//        format: "esm",
//        loader: {
//            ".js": "js",
//            ".ts": "ts",
//        }, 
//    })
//
//    const faviconPathname = path.join(pageDirectory, "favicon.ico");
//
//    if (fs.existsSync(faviconPathname)) {
//        fs.copyFileSync(faviconPathname, path.join(rootPath, ".elegance/dist/favicon.ico"));
//    }
//
//    return {
//        browserFiles: builtBrowserFiles,
//        serverFiles: builtServerFiles,
//    }
//}

export { compile };
//# sourceMappingURL=build.esm.mjs.map
