#!/usr/bin/env node

import { compile } from "elegance-js/build"
import { exec, execSync } from "node:child_process";

compile({
    environment: "development",
    outputDirectory: ".elegance",
    pagesDirectory: "./pages",
    publicDirectory: {
        method:"recursive-copy",
        path: "./public",
    },
    hotReload: {
        port: 3001,
        hostname: "localhost",
    },
    server: {
        runServer: true,
        port: 3000,
    },
    postCompile: () => {
        exec("npx @tailwindcss/cli -i ./pages/index.css -o .elegance/dist/index.css --watch")
    },
})