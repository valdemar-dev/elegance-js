/** This file is essentially script, that is spawned by compile(), which uses tools from ./compilation to build the project of the user. */
/** It's a separate process, so that we can avoid memory leaks due to us using cache-busting for importing the page files (you cannot un-import things in esm) */


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { buildClient, buildLayouts, buildPages, CompilationOptions, retrievePageAndLayoutMaps, setCompilationOptions, shipModules } from "./compilation";

let options: CompilationOptions = JSON.parse(process.env.OPTIONS || "{}" as string);

const DIST_DIR = process.env.DIST_DIR as string;

function yellow(text: string) {
    return `\u001b[38;2;238;184;68m${text}`;
};

function black(text: string) {
    return `\u001b[38;2;0;0;0m${text}`;
};

function bgYellow(text: string) {
    return `\u001b[48;2;238;184;68m${text}`;
};

function bold(text: string) {
    return `\u001b[1m${text}`;
};

function underline(text: string) {
    return `\u001b[4m${text}`;
};

function white(text: string) {
    return `\u001b[38;2;255;247;229m${text}`;
};

function log(...text: string[]) {
    if (options.quiet) return;
    
    return console.log(text.map((text) => `${text}\u001b[0m`).join(""));
};

async function build(): Promise<boolean> {
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
                    white("statements will be shown on the client, and all code will be minified."));
        
                log("");
            }
        }
        
        if (options.preCompile) {
            options.preCompile();
        }
        
        const start = performance.now();
        
        let shouldClientHardReload

        /**
         * Compile every non-dynamic layout, and gather a list of all dynamic and non-dynamic layouts.
         */
        {
            const { shouldClientHardReload: doReload } = await buildLayouts();
            if (doReload) shouldClientHardReload = true;
        }
        
        /**
         * Compile every non-dynamic page, and gather a list of all dynamic and non-dynamic pages.
         */
        {
            const { shouldClientHardReload: doReload } = await buildPages(path.resolve(DIST_DIR));
            if (doReload) shouldClientHardReload = true;
        }
        
        await shipModules();
        
        const pagesBuilt = performance.now();

        await buildClient(DIST_DIR);

        const end = performance.now();

        {
            log(`Took ${Math.round(pagesBuilt-start)}ms to Build Pages.`)
            log(`Took ${Math.round(end-pagesBuilt)}ms to Build Client.`)
        }

        if (options.publicDirectory) {
            log("Recursively copying public directory.. this may take a while.")
            const src = path.relative(process.cwd(), options.publicDirectory.path)
            
            if (fs.existsSync(src) === false) {
                console.warn("WARNING: Public directory not found, an attempt will be made create it..")
                fs.mkdirSync(src, { recursive: true, });
            }

            await fs.promises.cp(src, path.join(DIST_DIR), { recursive: true, });
        }


        
        // signal to the parent process that we're done compiling
        {
            process.send?.({ event: "message", data: "compile-finish", });

            /** 
             * The built-in Elegance server lives in the parent process, and thus has no knowledge of the pages and layouts that were found during compilation
             * Therefore, we tell the parent process what they are, so it can give them to the server.
             */
            const { PAGE_MAP, LAYOUT_MAP } = retrievePageAndLayoutMaps();
            process.send?.({ event: "message", data: "set-pages-and-layouts", content: JSON.stringify({ pageMap: Array.from(PAGE_MAP), layoutMap: Array.from(LAYOUT_MAP) }), })
            
            if (shouldClientHardReload) {
                process.send!({ event: "message", data: "hard-reload", })
            } else {
                process.send!({ event: "message", data: "soft-reload", })
            }
        }

    } catch(e) {
        console.error("Build Failed! Received Error:");
        console.error(e);
        
        return false
    }
    
    return true
}

build();