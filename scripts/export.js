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
        exec("npx @tailwindcss/cli -i ./pages/index.css -o .elegance/dist/index.css --minify=true")
    },
})