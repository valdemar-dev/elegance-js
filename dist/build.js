import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { GenerateMetadata, RenderingMethod } from "./types/Metadata";
import { generateHTMLTemplate } from "./helpers/generateHTMLTemplate";
const getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);
      directories.push(relativePath);
      directories = directories.concat(getAllSubdirectories(fullPath, baseDir));
    }
  }
  return directories;
};
const getFile = (dir, fileName) => {
  const dirent = dir.find((dirent2) => path.parse(dirent2.name).name === fileName);
  if (dirent) return dirent;
  return false;
};
const rootPath = process.cwd();
const DIST_DIR = path.join(rootPath, "./.elegance/dist");
const SERVER_DIR = path.join(rootPath, "./.elegance/server");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "..");
const CSRClientPath = path.resolve(packageDir, "./src/client/CSRClient.ts");
const SSGClientPath = path.resolve(packageDir, "./src/client/SSGClient.ts");
const SSRClientPath = path.resolve(packageDir, "./src/client/SSRClient.ts");
const bindElementsPath = path.resolve(packageDir, "./src/bindElements.ts");
const getProjectFiles = (pagesDirectory) => {
  const pageFiles = [];
  const infoFiles = [];
  const subdirectories = [...getAllSubdirectories(pagesDirectory), ""];
  for (const subdirectory of subdirectories) {
    const absoluteDirectoryPath = path.join(rootPath, pagesDirectory, subdirectory);
    const subdirectoryFiles = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true }).filter((f) => f.name.endsWith(".js") || f.name.endsWith(".ts"));
    const pageFileInSubdirectory = getFile(subdirectoryFiles, "page");
    const infoFileInSubdirectory = getFile(subdirectoryFiles, "info");
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
    infoFiles
  };
};
const buildClient = async (environment) => {
  await esbuild.build({
    bundle: true,
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    entryPoints: [CSRClientPath, SSRClientPath, SSGClientPath],
    outdir: DIST_DIR,
    format: "esm",
    platform: "node"
  });
};
const buildInfoFiles = async (infoFiles, environment) => {
  const mappedInfoFileNames = infoFiles.map((f) => `${f.parentPath}/${f.name}`);
  await esbuild.build({
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    entryPoints: mappedInfoFileNames,
    bundle: true,
    outdir: SERVER_DIR,
    loader: {
      ".js": "js",
      ".ts": "ts"
    },
    inject: [bindElementsPath],
    format: "esm",
    platform: "node"
  });
};
const getPageCompilationDirections = async (pageFiles, pagesDirectory) => {
  const builtInfoFilesDir = path.join(rootPath, "./.elegance/server");
  const builtInfoFiles = [...getAllSubdirectories(builtInfoFilesDir), ""];
  const compilationDirections = [];
  for (const builtInfoFile of builtInfoFiles) {
    const absoluteFilePath = `${path.join(builtInfoFilesDir, builtInfoFile, "/info.js")}`;
    const pagePath = path.join(rootPath, pagesDirectory, builtInfoFile);
    const pageFile = pageFiles.find((page) => page.parentPath === pagePath);
    if (!pageFile) {
      continue;
    }
    const infoFileExports = await import(absoluteFilePath);
    const {
      renderingMethod = RenderingMethod.SERVER_SIDE_RENDERING,
      metadata,
      executeOnServer,
      generateMetadata = GenerateMetadata.ON_BUILD
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
const processSSRPages = async (SSRPages, environment) => {
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
      "utf-8"
    );
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
      renderingMethod: page.renderingMethod
    });
    fs.writeFileSync(
      path.join(DIST_DIR, page.pageLocation, "metadata.html"),
      template,
      "utf-8"
    );
  }
};
const compile = async ({
  pagesDirectory,
  buildOptions,
  environment
}) => {
  const start = performance.now();
  console.log("Elegance.JS: Beginning build.");
  console.log("Using Environment: ", environment);
  const { pageFiles, infoFiles } = getProjectFiles(pagesDirectory);
  const pageCompilationDirections = await getPageCompilationDirections(pageFiles, pagesDirectory);
  const CSRPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === RenderingMethod.CLIENT_SIDE_RENDERING);
  const SSRPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === RenderingMethod.SERVER_SIDE_RENDERING);
  const SSGPages = pageCompilationDirections.filter((cd) => cd.renderingMethod === RenderingMethod.STATIC_GENERATION);
  await esbuild.build({
    entryPoints: [
      ...SSRPages.map((page) => page.pageFilepath),
      ...CSRPages.map((page) => page.pageFilepath)
    ],
    minify: environment === "production",
    drop: environment === "production" ? ["console", "debugger"] : void 0,
    bundle: true,
    outdir: DIST_DIR,
    loader: {
      ".js": "js",
      ".ts": "ts"
    },
    format: "esm",
    platform: "node"
  });
  await processSSRPages(SSRPages, environment);
  await processCSRPages(CSRPages, environment);
  await processSSGPages(SSGPages, environment);
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
export {
  compile
};
