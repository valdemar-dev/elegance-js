import { ChildProcess, spawn } from "child_process"
import { join, resolve } from "path"
import { formattedLog, LogLevel } from "./log";

let child: ChildProcess;
let childPath: string;
function startEleganceRuntime(file: string) {
    childPath = resolve(file);

    formattedLog(LogLevel.INFO, "Starting Elegance..");

    restartEleganceRuntime();
}

function restartEleganceRuntime() {
    if (child && child.killed === false) {
        child.kill();
    }
 
    child = spawn("node", ["--import","ts-arc/register", childPath], { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env, }
    });

    child.on("message", (content: string) => {
        if (content === "restart-me") {
            formattedLog(LogLevel.INFO, "hot-reloading..");
            restartEleganceRuntime()
        }
    })
}


export { startEleganceRuntime }