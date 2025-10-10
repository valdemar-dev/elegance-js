#!/usr/bin/env node

import { compile } from "elegance-js/build"
import { exec, execSync } from "node:child_process";

let child = undefined;

compile({
    environment: "production",
    outputDirectory: ".elegance",
    pagesDirectory: "./pages",
    publicDirectory: {
        method: "recursive-copy",
        path: "./public",
    },
    server: {
        runServer: true,
        port: 3000,
    },
    postCompile: () => {
        if (child !== undefined) {
            child.kill('SIGKILL');
        }
        
        const childProcess = execSync("npx @tailwindcss/cli -i \"./index.css\" -o \"../.elegance/dist/index.css\" --cwd \"./pages\" --minify=true")
        
        child = childProcess;
    },
})
