import { spawn } from "child_process";
import { resolve } from "path";
import { formattedLog, LogLevel } from "./log.js";
import { createServer } from "http";
import { createRecursiveWatcher } from "../compilation/compiler.js";
let child;
let childPath;
const clients = new Set();
let server;
let serverIsActive = false;
let compilerOptions;
/**
 * Run the elegance runtime, and if hot-reloading is enabled, will start the hot-reload server.
 * @param file The runtime file to execute.
 */
function startEleganceRuntime(file) {
    formattedLog(LogLevel.INFO, "Starting Elegance..");
    childPath = resolve(file);
    server = createServer((req, res) => {
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
    child = spawn("node", ["--import", "ts-arc/register", childPath], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env }
    });
    child.on("exit", (code) => {
        if (code === 0)
            return;
        formattedLog(LogLevel.ERROR, "Waiting for file changes..");
        createRecursiveWatcher(compilerOptions.pagesDirectory, async (path) => {
            restartEleganceRuntime();
        });
    });
    child.on("message", (raw) => {
        const { message, content } = JSON.parse(raw);
        if (message === "restart-me") {
            formattedLog(LogLevel.INFO, "Rebuilding..");
            restartEleganceRuntime();
        }
        if (message === "set-compiler-options") {
            compilerOptions = JSON.parse(content);
            formattedLog(LogLevel.DEBUG, "Setting compiler options in parent..");
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
            if (!serverIsActive)
                return;
            serverIsActive = false;
            server.close();
        }
    });
}
export { startEleganceRuntime, };
