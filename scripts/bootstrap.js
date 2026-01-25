#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

execSync("npm install tailwindcss @tailwindcss/cli");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ["pages", "public", path.join("pages", "api"), path.join("pages", "api", "middleware")];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const pageTsPath = path.join("pages", "page.ts");
const layoutTsPath = path.join("pages", "layout.ts");
const middlewareTsPath = path.join("pages", "api", "middleware", "middleware.ts");
const routeTsPath = path.join("pages", "api", "route.ts");

const indexTsPath = path.join("index.ts");
const eleganceTsPath = path.join("elegance.ts");

const bootstrapFilesDir = path.join(__dirname, "bootstrap_files");

const pageTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "page.txt"));
const layoutTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "layout.txt"));
const middlewareTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "middleware.txt"));
const routeTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "route.txt"));
const indexTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "index.txt"));
const eleganceTsContent = fs.readFileSync(path.join(bootstrapFilesDir, "elegance.txt"));

const indexCssPath = path.join("pages", "input.css");
const envDtsPath = "env.d.ts";
const tsconfigPath = "tsconfig.json";

const envDtsContent = `/// <reference types="elegance-js/global" />`;

const tsconfigContent = JSON.stringify({
  compilerOptions: {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "bundler",
    strict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    paths: {
        "@/": ["./"],
    }

  },
  include: ["pages/**/*", "env.d.ts"],
  exclude: ["node_modules"],
}, null, 4);

const indexCssContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

* {
    line-height: normal;
}

@import "tailwindcss";

@theme {
    --font-inter: "Inter", sans-serif;
}
`;

fs.writeFileSync(pageTsPath, pageTsContent, "utf8");
fs.writeFileSync(layoutTsPath, layoutTsContent, "utf8");
fs.writeFileSync(routeTsPath, routeTsContent, "utf8");
fs.writeFileSync(middlewareTsPath, middlewareTsContent, "utf8");
fs.writeFileSync(indexCssPath, indexCssContent, "utf8");
fs.writeFileSync(envDtsPath, envDtsContent, "utf8");
fs.writeFileSync(tsconfigPath, tsconfigContent, "utf8");

if (process.argv[2] === "--manual") {
    console.log("--manual: Creating manual defaults..");

    fs.writeFileSync(eleganceTsPath, eleganceTsContent, "utf8");
    fs.writeFileSync(indexTsPath, indexTsContent, "utf8");

    console.log("Run this project with: npx ts-arc index.ts");
} else {
    console.log("Run this project with: npx run");
}

console.log("Bootstrapped new project!");
