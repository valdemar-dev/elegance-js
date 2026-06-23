#!/usr/bin/env node
import { spawn, ChildProcess } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const BUILD_PROD_ENTRY  = join(__dirname, "build", "prod.js");

const MODE = process.argv.includes("-prod") ? "prod" : "dev";

function spawnTs(entry, extraEnv = {}) {
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

function spawnBuild() {
    return spawnTs(BUILD_PROD_ENTRY);
}

function runBuild() {
    return new Promise((resolve, reject) => {
        const build = spawnBuild();

        build.once("exit", (code) => {
            if (code === 0 || code === null) resolve();
            else reject(new Error(`Build process exited with code ${code}`));
        });
    });
}

(async () => {
    await runBuild();
})();