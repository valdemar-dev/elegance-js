#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { execSync } from "node:child_process";

execSync("npm install tailwindcss");

const dirs = ["pages", "public"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const pageTsPath = path.join("pages", "page.ts");
const indexCssPath = path.join("pages", "index.css");
const envDtsPath = "env.d.ts";
const tsconfigPath = "tsconfig.json";

const pageTsContent = `
export const page = body({
    class: "bg-black text-white flex items-center justify-center",
},
    h1({
        class: "text-4xl",
    },
        "Welcome to Elegance.JS!",
    ),
);

export const metadata = () => head({},
    link({
        rel: "stylesheet",
        href: "/index.css",
    }),
    
    title({},
        "Hello World!"
    ),
)
`;

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
  },
  include: ["pages/**/*", "env.d.ts"],
  exclude: ["node_modules"],
}, null, 2);

fs.writeFileSync(pageTsPath, pageTsContent, "utf8");
fs.writeFileSync(indexCssPath, "", "utf8");
fs.writeFileSync(envDtsPath, envDtsContent, "utf8");
fs.writeFileSync(tsconfigPath, tsconfigContent, "utf8");

console.log("Bootstrapped new project! Open ./pages/page.ts to get started.");
