import fs, { FSWatcher } from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import child_process from "node:child_process";
import http, { IncomingMessage, ServerResponse } from "http";
import { startServer } from "./server/server";

import { log, setQuiet } from "./log";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '..');

const builderPath = path.resolve(packageDir, './dist/page_compiler.mjs');

const yellow = (text: string) => {
    return `\u001b[38;2;238;184;68m${text}`;
};

const bold = (text: string) => {
    return `\u001b[1m${text}`;
};
const white = (text: string) => {
    return `\u001b[38;2;255;247;229m${text}`;
};

const green = (text: string) => {
    return `\u001b[38;2;65;224;108m${text}`;
};

const finishLog = (...text: string[]) => {
    log.info(text.map((text) => `${text}\u001b[0m`).join(""))
};

export let PAGE_MAP = new Map();
export let LAYOUT_MAP = new Map();

type CompilationOptions = {
    postCompile?: () => any,
    preCompile?: () => any,
    environment: "production" | "development",
    pagesDirectory: string,
    outputDirectory: string,
    /** Suppress native elegance logs. */
    quiet?: boolean,
    publicDirectory?: {
        path: string,
    },
    server?: {
        runServer: boolean,
        root?: string,
        port?: number,
        host?: string,
    },
    hotReload?: {
        port: number,
        hostname: string,
        /** Directories to watch for hot-reloading other than just the pagesDirectory. */
        extraWatchDirectories?: string[],
    }
}

let options: CompilationOptions = process.env.OPTIONS as any;

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

let child: child_process.ChildProcess | undefined = undefined;
let isBuilding = false;

const runBuild = (filepath: string, DIST_DIR: string) => {
    const optionsString = JSON.stringify(options);
    
    if (isBuilding) {
        return;
    }
    
    if (child !== undefined) {
        child.removeAllListeners();
        child.kill('SIGKILL');
    }
        
    child = child_process.spawn("node", [filepath], { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env, 
            DIST_DIR: DIST_DIR, 
            OPTIONS: optionsString, 
            PACKAGE_PATH: packageDir,
            DO_BUILD: "true",
        }
    });

    // set, so that the "builder functions" in page_compiler, when called by server.ts, have valid values.
    process.env.OPTIONS = optionsString
    process.env.DIST_DIR = DIST_DIR

    child.on("error", () => {
        log.error("Failed to start child process.");
    });
    
    child.on("exit", () => {
        isBuilding = false;
        
        log.info("Builder process complete");
    });
    
    child.on("message", (message: any) => {        
        const { data } = message;
        
        if (data === "hard-reload") {
            httpStream?.write(`data: hard-reload\n\n`);
        } else if (data === "soft-reload") {
            httpStream?.write(`data: reload\n\n`);
        } else if (data === "compile-finish") {
            isBuilding = false;
            
            if (options.postCompile) {
                finishLog(
                    white("Calling post-compile hook..")
                )
                
                options.postCompile();
            }
        } else if (data === "set-pages-and-layouts") {
            const { pageMap, layoutMap } = JSON.parse(message.content);

            PAGE_MAP = new Map(pageMap);
            LAYOUT_MAP = new Map(layoutMap);
        }
    });
};

const build = (DIST_DIR: string) => {
    runBuild(builderPath, DIST_DIR);
};

let isTimedOut = false;
const currentWatchers: FSWatcher[] = [];
let httpStream: ServerResponse<IncomingMessage> | null;

const registerListener = async () => {
    const server = http.createServer((req, res) => {
        if (req.url === '/events') {
            finishLog(white("Client listening for changes.."));
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                "Connection": "keep-alive",
                "Transfer-Encoding": "chunked",
                "X-Accel-Buffering": "no",
                "Content-Encoding": "none",
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Methods":  "*",
                "Access-Control-Allow-Headers": "*",
            });

            httpStream = res;

            httpStream.write(`data: ping\n\n`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    server.listen(options.hotReload!.port, () => {
        finishLog(bold(green('Hot-Reload server online!')));
    });
};


export const compile = async (props: CompilationOptions) => {
    // makes it so we don't have to pass this stupid variable around everywhere
    options = props;
    
    setQuiet(options.quiet ?? false);

    const watch = options.hotReload !== undefined;
    
    const BUILD_FLAG = path.join(options.outputDirectory, "ELEGANCE_BUILD_FLAG");

    if (!fs.existsSync(options.outputDirectory)) {
        fs.mkdirSync(options.outputDirectory, { recursive: true, });
        
        fs.writeFileSync(
            path.join(BUILD_FLAG),
            "This file just marks this directory as one containing an Elegance Build.",
            "utf-8",
        );
    } else {
        if (!fs.existsSync(BUILD_FLAG)) {
            throw `The output directory already exists, but is not an Elegance Build directory.`;
        }
    }

    const DIST_DIR = path.join(props.outputDirectory, "dist");

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true, });
    }

    if (options.server != undefined && options.server.runServer == true) {
        startServer({
            root: options.server.root ?? DIST_DIR,
            environment: options.environment,
            port: options.server.port ?? 3000,
            host: options.server.host ?? "localhost",
            DIST_DIR,
            pagesDirectory: options.pagesDirectory,
        })
    }
        
    if (watch) {
        await registerListener()
    
        for (const watcher of currentWatchers) {
            watcher.close();
        }
    
        let extra = [];
        if (options.hotReload?.extraWatchDirectories) {
            const dirs = options.hotReload?.extraWatchDirectories ?? [];
            
            if (dirs.length !== 0) {
                for (const dir of dirs) {
                    const subdirs = getAllSubdirectories(dir)
                        .map(f => path.join(dir, f));
                        
                    extra.push(...subdirs);
                }
            }
        }
        
        const pagesSubDirs = getAllSubdirectories(options.pagesDirectory)
            .map(f => path.join(options.pagesDirectory, f))
        
        const subdirectories = [...pagesSubDirs, options.pagesDirectory, ...extra];
        
        finishLog(yellow("Hot-Reload Watching Subdirectories: "), ...subdirectories.join(", "))
        
        const watcherFn = async () => {
            if (isTimedOut) return;
            isTimedOut = true;
    
            // clears term
            process.stdout.write('\x1Bc');
    
            setTimeout(async () => {
                build(DIST_DIR)
                isTimedOut = false;
            }, 100);
        };
    
        for (const directory of subdirectories) {
            const watcher = fs.watch(
                directory,
                {},
                watcherFn,
            );
    
            currentWatchers.push(watcher);
        }
    }
        
    build(DIST_DIR);

};
