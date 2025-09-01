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
import { createEventListener, createState } from "elegance-js/server/createState";
import { createLoadHook } from "elegance-js/server/loadHook";
import { observe } from "elegance-js/server/observe";

const counter = createState(0);

createLoadHook({
    deps: [counter],
    fn: (_, counter) => {
        const interval = setInterval(() => {
            counter.value++;
            counter.signal();
        }, 1000);
        
        return () => clearInterval(interval);
    },
})

export const page = body ({
    class: "text-white flex min-h-screen items-start sm:justify-center p-4 bg-black flex-col gap-4 max-w-[500px] w-full mx-auto",
},
    h1 ({
        class: "text-4xl font-inter font-semibold bg-clip-text text-transparent bg-gradient-to-tl from-[#EEB844] to-[#FF4FED] oveflow-clip",
    },
        "Welcome to Elegance.JS!",
    ),
    
    p ({
    }, 
        "Edit page.ts to get started.",
    ),
    
    div({
        class: "flex items-start gap-4 mt-2",
    },
        a ({
            class: "px-4 py-2 rounded-md bg-red-400 text-black font-semibold relative group hover:scale-[1.05] duration-200",
            href: "https://elegance.js.org/",
            target: "_blank",
        },
            "Documentation",
            
            div ({
                class: "blur-[50px] absolute group-hover:bg-red-400 inset-0 bg-transparent duration-200 pointer-events-none -z-10",
                "aria-hidden": "true",
            }),
        ),
            
        button ({
            class: "hover:cursor-pointer px-4 py-2 rounded-md bg-zinc-200 text-black font-semibold relative group hover:scale-[1.05] duration-200",
            onClick: createEventListener({
                dependencies: [counter],
                eventListener: (_, counter) => {
                    counter.value++;
                    
                    counter.signal();
                },
            }),
            
            innerText: observe([counter], (counter) => \`Counter: ${counter}\`),
        },
            div ({
                class: "blur-[50px] absolute group-hover:bg-zinc-200 inset-0 bg-transparent duration-200 pointer-events-none -z-10",
                "aria-hidden": "true",
            }),
        ),
    )
);

export const metadata = () => head ({},
    link ({
        rel: "stylesheet",
        href: "/index.css",
    }),
    
    title ({},
        "Elegance.JS"
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
fs.writeFileSync(indexCssPath, indexCssContent, "utf8");
fs.writeFileSync(envDtsPath, envDtsContent, "utf8");
fs.writeFileSync(tsconfigPath, tsconfigContent, "utf8");

console.log("Bootstrapped new project!");
console.log("Run this project with: npx dev")
