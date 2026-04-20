import { ChildProcess, spawn } from "child_process"
import { resolve } from "path"
import { formattedLog, LogLevel } from "./log";
import { createServer, ServerResponse, IncomingMessage, Server } from "http";
import { CompilerOptions, createRecursiveWatcher } from "../compilation/compiler";

let child: ChildProcess;
let childPath: string;
const clients: Set<ServerResponse> = new Set();

let server: Server;
let serverIsActive: boolean = false;

let compilerOptions: CompilerOptions;

let isWatching = false;

/**
 * Run the elegance runtime, and if hot-reloading is enabled, will start the hot-reload server.
 * @param file The runtime file to execute.
 */
function startEleganceRuntime(file: string) {
    formattedLog(LogLevel.INFO, "Starting Elegance..");

    childPath = resolve(file);

    server = createServer((req: IncomingMessage, res: ServerResponse) => {
        formattedLog(LogLevel.DEBUG, "Received hot-reload listener.");
        
        if (req.url === "/elegance-hot-reload") {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            });

            res.write(":ok\n\n");

            clients.add(res);

            req.on("close", () => {
                clients.delete(res);
            });

            return;
        }

        res.writeHead(404);
        res.end();
    });

    restartEleganceRuntime();
}

function restartEleganceRuntime() {
    if (child && child.killed === false) {
        child.kill();
    }
 
    child = spawn("node", ["--import", "ts-arc/register", "--enable-source-maps", childPath], { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env }
    });

    child.on("exit", (code) => {
        if (code === 0) return;

        if (isWatching) return;
        isWatching = true;

        formattedLog(LogLevel.ERROR, "Waiting for file changes..");

        const { watchers } = createRecursiveWatcher(compilerOptions.pagesDirectory, async (path: string) => {
            restartEleganceRuntime();
        })
    })

    child.on("message", (raw: string) => {
        const { message, content } = JSON.parse(raw);
        
        if (message === "restart-me") {
            formattedLog(LogLevel.INFO, "Rebuilding..");
            
            restartEleganceRuntime();
        }

        if (message === "set-compiler-options") {
            compilerOptions = JSON.parse(content);

            formattedLog(LogLevel.DEBUG, "Setting compiler options in parent..")

            return;
        }

        if (message === "hot-reload-finish") {
            if (!serverIsActive) {
                serverIsActive = true;

                server.listen(4000, () => {
                    formattedLog(LogLevel.DEBUG, "Hot-reload server listening on port 4000");
                });
            }

            for (const client of clients) {
                client.write("data: hot-reload\n\n");
            }
        }

        if (message === "disable-hot-reload") {
            if (!serverIsActive) return;
            serverIsActive = false;
            
            server.close();
        }
    });
}

export { startEleganceRuntime, }