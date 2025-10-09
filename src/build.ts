import fs, { FSWatcher } from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import child_process from "node:child_process";
import http, { IncomingMessage, ServerResponse } from "http";

import { log, setQuiet } from "./log";
import { startServer } from "./server/server";

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

const runBuild = (filepath: string, DIST_DIR: string) => {
    const code = fs.readFileSync(filepath).toString();
    const optionsString = JSON.stringify(options);
        
    const child = child_process.spawn("node", ["-e", code], { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env, DIST_DIR: DIST_DIR, OPTIONS: optionsString, PACKAGE_PATH: packageDir, }
    });
        
    child.on("error", () => {
        console.error("Failed to start child process.");
    });
    
    child.on("message", (message) => {        
        const { data } = message as any;
        
        if (data === "hard-reload") {
            httpStream?.write(`data: hard-reload\n\n`);
        } else if (data === "soft-reload") {
            httpStream?.write(`data: reload\n\n`);
        } else if (data === "compile-finish") {
            if (options.postCompile) {
                finishLog(
                    white("Calling post-compile hook..")
                )
                
                options.postCompile();
            }
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

            // makes weird buffering thing go away lol
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
    
    if (props.server != undefined && props.server.runServer == true) {
        startServer({
            root: props.server.root ?? DIST_DIR,
            environment: props.environment,
            port: props.server.port ?? 3000,
            host: props.server.host ?? "localhost",
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
