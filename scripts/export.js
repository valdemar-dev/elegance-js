#!/usr/bin/env node

import { compile } from "elegance-js/build"
import { exec, execSync } from "node:child_process";

compile({
    environment: "production",
    outputDirectory: ".elegance",
    pagesDirectory: "./pages",
    publicDirectory: {
        method: "recursive-copy",
        path: "./public",
    },
    server: {
        runServer: false,
    },
    postCompile: () => {
        exec("npx @tailwindcss/cli -i \"./index.css\" -o \"../.elegance/dist/index.css\" --cwd \"./pages\" --minify=true")
    },
})