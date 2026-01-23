import { ChildProcess, spawn } from "child_process"
import { resolve } from "path"
import { formattedLog, LogLevel } from "./log";
import { createServer, ServerResponse, IncomingMessage, Server } from "http";

let child: ChildProcess;
let childPath: string;
const clients: Set<ServerResponse> = new Set();

let server: Server;
let serverIsActive: boolean = false;
function startEleganceRuntime(file: string) {
    childPath = resolve(file);

    formattedLog(LogLevel.INFO, "Starting Elegance..");

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
 
    child = spawn("node", ["--import", "ts-arc/register", childPath], { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env }
    });

    child.on("message", (content: string) => {
        if (content === "restart-me") {
            formattedLog(LogLevel.INFO, "Rebuilding..");
            
            restartEleganceRuntime();
        }

        if (content === "hot-reload-finish") {
            for (const client of clients) {
                client.write("data: hot-reload\n\n");
            }
        }

        if (content === "enable-hot-reload") {
            if (serverIsActive) return;
            serverIsActive = true;

            server.listen(4000, () => {
                formattedLog(LogLevel.INFO, "Hot-reload server listening on port 4000");
            });
        }

        if (content === "disable-hot-reload") {
            if (!serverIsActive) return;
            serverIsActive = false;
            
            server.close();
        }
    });
}

export { startEleganceRuntime }