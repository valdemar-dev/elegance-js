const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildClient, buildLayouts, buildPages, retrievePageAndLayoutMaps, setCompilationOptions, shipModules } from "./compilation";
let options = JSON.parse(process.env.OPTIONS || "{}");
const DIST_DIR = process.env.DIST_DIR;
const yellow = (text) => {
  return `\x1B[38;2;238;184;68m${text}`;
};
const black = (text) => {
  return `\x1B[38;2;0;0;0m${text}`;
};
const bgYellow = (text) => {
  return `\x1B[48;2;238;184;68m${text}`;
};
const bold = (text) => {
  return `\x1B[1m${text}`;
};
const underline = (text) => {
  return `\x1B[4m${text}`;
};
const white = (text) => {
  return `\x1B[38;2;255;247;229m${text}`;
};
const log = (...text) => {
  if (options.quiet) return;
  return console.log(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
const build = async () => {
  setCompilationOptions(options, DIST_DIR);
  try {
    {
      log(bold(yellow(" -- Elegance.JS -- ")));
      if (options.environment === "production") {
        log(
          " - ",
          bgYellow(bold(black(" NOTE "))),
          " : ",
          white("In production mode, no "),
          underline("console.log() "),
          white("statements will be shown on the client, and all code will be minified.")
        );
        log("");
      }
    }
    if (options.preCompile) {
      options.preCompile();
    }
    const start = performance.now();
    let shouldClientHardReload;
    {
      const { shouldClientHardReload: doReload } = await buildLayouts();
      if (doReload) shouldClientHardReload = true;
    }
    {
      const { shouldClientHardReload: doReload } = await buildPages(path.resolve(DIST_DIR));
      if (doReload) shouldClientHardReload = true;
    }
    await shipModules();
    const pagesBuilt = performance.now();
    await buildClient(DIST_DIR);
    const end = performance.now();
    {
      log(`Took ${Math.round(pagesBuilt - start)}ms to Build Pages.`);
      log(`Took ${Math.round(end - pagesBuilt)}ms to Build Client.`);
    }
    if (options.publicDirectory) {
      log("Recursively copying public directory.. this may take a while.");
      const src = path.relative(process.cwd(), options.publicDirectory.path);
      if (fs.existsSync(src) === false) {
        console.warn("WARNING: Public directory not found, an attempt will be made create it..");
        fs.mkdirSync(src, { recursive: true });
      }
      await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true });
    }
    {
      process.send?.({ event: "message", data: "compile-finish" });
      const { PAGE_MAP, LAYOUT_MAP } = retrievePageAndLayoutMaps();
      process.send?.({ event: "message", data: "set-pages-and-layouts", content: JSON.stringify({ pageMap: Array.from(PAGE_MAP), layoutMap: Array.from(LAYOUT_MAP) }) });
      if (shouldClientHardReload) {
        process.send({ event: "message", data: "hard-reload" });
      } else {
        process.send({ event: "message", data: "soft-reload" });
      }
    }
  } catch (e) {
    console.error("Build Failed! Received Error:");
    console.error(e);
    return false;
  }
  return true;
};
build();
