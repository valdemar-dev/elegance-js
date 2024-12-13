import fs, { Dirent } from "fs";
import path from "path";
import esbuild, { BuildOptions, Plugin, PluginBuild } from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./helpers/generateHTMLTemplate";
import { GenerateMetadata, RenderingMethod } from "./types/Metadata";

import { allElements } from "./shared/serverElements";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const CSRClientPath = path.resolve(packageDir, './src/client/client_csr.ts');
const SSGClientPath = path.resolve(packageDir, './src/client/client_ssg.ts');
const SSRClientPath = path.resolve(packageDir, './src/client/client_ssr.ts');

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

const esbuildPluginReplaceElementCalls = (
    functionNames: string[],
    environment: "production" | "development",
) => ({
    name: 'rename-function-calls',
    setup(build: PluginBuild) {
        build.onLoad({ filter: /\.(js|mjs|ts)$/ }, (args) => {
            let code = fs.readFileSync(args.path, 'utf8');

            environment === "development" && console.log(`BUILDING: ${args.path}`);

            for (const functionName of functionNames) {
                const regex = new RegExp(`(?<!\\.)\\b(${functionName})\\s*\\(`, 'g');
                code = code.replaceAll(regex, `_e.${functionName}(`);
            };

            return {
                contents: code,
                loader: args.suffix in ["js", "mjs"] ? "js" : "ts",
            };
        });
  },
});

const buildClient = async (
    environment: "production" | "development"
) => {
    await esbuild.build({
        bundle: true,
        minify: environment === "production",
        drop: environment === "production" ? ["console", "debugger"] : undefined,
        keepNames: true,
        entryPoints: [CSRClientPath, SSRClientPath, SSGClientPath],
        outdir: DIST_DIR,
        format: "esm",
        platform: "node", 
        plugins: [esbuildPluginReplaceElementCalls(Object.keys(allElements), environment)]
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

const getPageCompilationDirections = async (pageFiles: Array<Dirent>, pagesDirectory: string) => {
    const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
    const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];

    const compilationDirections = [];

    for (const builtInfoFile of builtInfoFiles) {
        const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;

        const pagePath = path.join(rootPath, pagesDirectory, builtInfoFile)
        const pageFile = pageFiles.find(page => page.parentPath === pagePath);

        if (!pageFile) {
            // page file wont exist in this case:
            // /app 
            // /app/subpage/othersubpage/page.ts
            // /app/subpage/othersubpage/info.ts
            //
            // subpage directory will exist, and therefore will get found,
            // but wont contain any files, therefore we should ignore it.
            continue;
        }

        const infoFileExports = await import(absoluteFilePath);

        const {
            renderingMethod = RenderingMethod.SERVER_SIDE_RENDERING,
            metadata,
            executeOnServer,
            generateMetadata = GenerateMetadata.ON_BUILD,
        }: {
            renderingMethod: RenderingMethod,
            metadata: () => BuildableElement<"head">,
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

const processSSRPages = async (
    SSRPages: Array<{
        renderingMethod: RenderingMethod,
        metadata: () => BuildableElement<"head">,
        executeOnServer: ExecuteOnServer | null,
        generateMetadata: GenerateMetadata,
        pageLocation: string,
        pageFilepath: string, 
    }>,
    environment: "production" | "development",
) => { 
    for (const page of SSRPages) {
        if (page.generateMetadata !== GenerateMetadata.ON_BUILD) {
            continue;
        }

        const template = generateHTMLTemplate({
            pageURL: page.pageLocation,
            head: page.metadata,
            addPageScriptTag: false,
            renderingMethod: page.renderingMethod
        });

        fs.writeFileSync(
            path.join(DIST_DIR, page.pageLocation, "metadata.html"),
            template,
            "utf-8",
        );
    }
};

const processSSGPages = async (
    SSGPages: Array<{
        renderingMethod: RenderingMethod,
        metadata: () => BuildableElement<"head">,
        executeOnServer: ExecuteOnServer | null,
        generateMetadata: GenerateMetadata,
        pageLocation: string,
        pageFilepath: string, 
    }>,
    environment: "production" | "development",
) => { 
};

const processCSRPages = async (
    CSRPages: Array<{
        renderingMethod: RenderingMethod,
        metadata: () => BuildableElement<"head">,
        executeOnServer: ExecuteOnServer | null,
        generateMetadata: GenerateMetadata,
        pageLocation: string,
        pageFilepath: string, 
    }>,
    environment: "production" | "development",
) => {
    for (const page of CSRPages) {
        if (page.generateMetadata !== GenerateMetadata.ON_BUILD) {
            continue;
        }

        const template = generateHTMLTemplate({
            pageURL: page.pageLocation,
            head: page.metadata,
            addPageScriptTag: true,
            renderingMethod: page.renderingMethod
        });

        fs.writeFileSync(
            path.join(DIST_DIR, page.pageLocation, "metadata.html"),
            template,
            "utf-8",
        );
    }
};

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

export const compile = async ({
    pagesDirectory,
    buildOptions,
    environment
}: {
    environment: "production" | "development",
    pagesDirectory: string,
    buildOptions: BuildOptions
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

    const pageCompilationDirections = await getPageCompilationDirections(pageFiles, pagesDirectory);

    const CSRPages = pageCompilationDirections.filter(cd => 
        cd.renderingMethod === RenderingMethod.CLIENT_SIDE_RENDERING);

    const SSRPages = pageCompilationDirections.filter(cd => 
        cd.renderingMethod === RenderingMethod.SERVER_SIDE_RENDERING);

    const SSGPages = pageCompilationDirections.filter(cd => 
        cd.renderingMethod === RenderingMethod.STATIC_GENERATION);

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
        plugins: [esbuildPluginReplaceElementCalls(Object.keys(allElements), environment)],
    });

    await processSSRPages(SSRPages, environment);
    await processCSRPages(CSRPages, environment);
    await processSSGPages(SSGPages, environment);
    await buildClient(environment);

    const end = performance.now();

    log(bold(yellow(" -- Elegance.JS -- ")));
    log(white(`Finished build at ${new Date().toLocaleTimeString()}.`));
    log(green(bold((`Created ${pageFiles.length} pages in ${Math.ceil(end-start)}ms!`))));
    log("");

    log(white("  CSR:"));
    for (const page of CSRPages) {
        log(white_100(`    - /${page.pageLocation}`));
    }

    log(white("  SSR:"));
    for (const page of SSRPages) {
        log(white_100(`    - /${page.pageLocation}`));
    }

    log(white("  SSG:"));
    for (const page of SSGPages) {
        log(white_100(`    - /${page.pageLocation}`));
    }
};

