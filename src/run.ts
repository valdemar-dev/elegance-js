#!/usr/bin/env node
import { createServer, ServerResponse } from "node:http";
import { spawn, ChildProcess } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { watch } from "node:fs";
import { logger } from "./logger";
import { loadPaths } from "./constants";

await loadPaths();

import { PAGES_DIR } from "./constants";
import { getConfig } from "./config";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const BUILD_DEV_ENTRY   = join(__dirname, "build", "dev.js");
const BUILD_PROD_ENTRY  = join(__dirname, "build", "prod.js");
const SERVER_DEV_ENTRY  = join(__dirname, "server", "dev.js");
const SERVER_PROD_ENTRY = join(__dirname, "server", "prod.js");

const MODE = process.argv.includes("-prod") ? "prod" : "dev";
const IS_DEV = MODE === "dev";

let serverProcess:    ChildProcess | null = null;
let rebuildTimeout:   ReturnType<typeof setTimeout> | null = null;
let cycling           = false;
let firstBuildDone    = false;

// SSE clients for hot reload (served on port 4000)
const sseClients = new Set<ServerResponse>();

function sendReloadToClients() {
    for (const client of sseClients) {
        client.write("data: reload\n\n");
    }
}

function startHotReloadServer() {
    const hotReloadPort = 4000;

    const sseServer = createServer((req, res) => {
        if (req.url !== "/__reload") {
            res.writeHead(404);
            res.end();
            
            return;
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
        });

        res.write("data: connected\n\n");

        sseClients.add(res);

        req.on("close", () => sseClients.delete(res));
        return;
    });

    sseServer.listen(hotReloadPort, "0.0.0.0");
}

function spawnTs(entry: string, extraEnv: Record<string, string> = {}): ChildProcess {
    return spawn("node", ["--import", "ts-arc/register", entry], {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
        env: {
            ...process.env,
            ELEGANCE_DEV_MODE: MODE,
            ARGS: JSON.stringify(process.argv.slice(2)),
            ...extraEnv,
        },
    });
}

function spawnBuild(): ChildProcess {
    if (IS_DEV) {
        return spawnTs(BUILD_DEV_ENTRY, {
            ELEGANCE_BUILD_MODE: firstBuildDone ? "incremental" : "full",
        });
    }
    return spawnTs(BUILD_PROD_ENTRY);
}

function spawnServer(): ChildProcess {
    return spawnTs(IS_DEV ? SERVER_DEV_ENTRY : SERVER_PROD_ENTRY);
}

function runBuild(): Promise<void> {
    return new Promise((resolve, reject) => {
        const build = spawnBuild();

        build.once("exit", (code) => {
            if (code === 0 || code === null) resolve();
            else reject(new Error(`Build process exited with code ${code}`));
        });
    });
}

async function startServer(): Promise<void> {
    logger.info("Starting Server..");

    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill("SIGTERM");
        await new Promise<void>(resolve => serverProcess!.once("exit", resolve));
        serverProcess = null;
    }

    serverProcess = spawnServer();

    serverProcess.on("exit", () => {
        serverProcess = null;
    });

    return new Promise((resolve) => {
        const cleanup = () => {
            serverProcess?.off("message", onMessage);
            serverProcess?.off("exit",    onExit);
        };

        const onMessage = (msg: any) => {
            if (msg?.type === "ready") {
                cleanup();
                resolve();
            }
        };

        const onExit = () => {
            cleanup();
            resolve();
        };

        serverProcess?.on("message", onMessage);
        serverProcess?.once("exit",  onExit);
    });
}

async function cycle(): Promise<void> {
    const config = await getConfig();

    if (config.console.suppressEleganceLogs === false && config.console.clearConsoleOnRebuilds === true) {
        process.stdout.write('\x1bc');
    }

    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill("SIGTERM");
        await new Promise<void>(resolve => serverProcess!.once("exit", resolve));
        serverProcess = null;
    }

    try {
        await runBuild();
        await startServer();

    } catch {
    }
    
    sendReloadToClients();
}

async function scheduleRebuild(): Promise<void> {
    if (rebuildTimeout) clearTimeout(rebuildTimeout);

    rebuildTimeout = setTimeout(async () => {
        if (cycling) return;
        cycling = true;

        logger.info("Rebuilding..");

        try {
            await cycle();
            firstBuildDone = true;
        } catch (err: any) {
        } finally {
            cycling = false;
        }
    }, 300);
}

(async () => {
    if (IS_DEV) {
        startHotReloadServer();
        watch(PAGES_DIR, { recursive: true }, (_, filename) => {
            if (filename) scheduleRebuild();
        });
    }

    await cycle();
    firstBuildDone = true;
})();