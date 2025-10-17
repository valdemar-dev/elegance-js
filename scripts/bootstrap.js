#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { execSync } from "node:child_process";

execSync("npm install tailwindcss @tailwindcss/cli");

const dirs = ["pages", "public"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const pageTsPath = path.join("pages", "page.ts");
const indexCssPath = path.join("pages", "index.css");
const envDtsPath = "env.d.ts";
const tsconfigPath = "tsconfig.json";

const pageTsContent = `
import { observe, loadHook, eventListener, state } from "elegance-js";

/*
    This is state.
    It uses a simple observer model in the browser (see the observer function)
    
    You can update it's value using state.value, and when you want the observers
    of said state to refresh, call state.signal().
    
    You can update the state to whatever value you want it to be,
    before the page is finished building.
    
    Once the page is built, all state values are shipped to the browser as-is.
*/
const counter = state(0);

/*
    The server keeps track of every call to the loadHook() function,
    does some preprocessing, and ships the loadhook to the browser.
    The browser, after the page loads, runs the content of the function (the second paramater)
    passed into the loadHook call.
    
    Loadhook takes in as it's first parameter, a dependency list of state()'s that
    the loadHook can then reference in the browser.
    
    For newbies, note that the content of loadHook is *browser code*, and thus
    cannot be trusted!
*/
loadHook(
    [counter],
    (_, counter) => {
        const interval = setInterval(() => {
            counter.value++;
            counter.signal();
        }, 1000);
        
        return () => clearInterval(interval);
    },
)

/*
    State can also be an array!
    In which case, the reactiveMap() method is added onto the state.
    This allows you to run client-side code, which dynamically changes
    the page's HTML content based on the state of the array in the browser.
*/
const ReactiveMap = () => {
    const arrayState = state([
        "John","Mary","William","Kimberly",
    ]);
    
    return arrayState.reactiveMap((item, index) => {
        index += 1;
        
        return div({
        },
            index + ". ", item,
        )
    })
};

/*
    This is the actual content of the page.
    
    It does not *have* to be an async function.
    Page can be any value, as long as it resolves into a Child (a built element, eg. string, a return value of an element creation call, etc)
*/
export const page: Page = async () => {
    const pageName = state("Elegance.JS");
    
    /*
        The below is an element creation function.
        The syntax is roughly similar to how HTML works.
        
        A call like: h1("Hello World!")
        
        Would generate the HTML: <h1>Hello World!</h1>
        
        The first parameter to an element may be another element (child), or an options object.
        
        Options objects are used to set things like classNames, style, ids. etc.
        
        For example this call: h1({ 
            id: "my-id", 
        },
            "Hello World!"
        )
        
        Turns into this HTML: <h1 id="my-id">Hello World!</h1>
    */
    return body ({
        class: "text-white flex min-h-screen items-start sm:justify-center p-4 bg-black flex-col gap-4 max-w-[500px] w-full mx-auto",
    },
        h1 ({
            class: "text-4xl font-inter font-semibold bg-clip-text text-transparent bg-gradient-to-tl from-[#EEB844] to-[#FF4FED] oveflow-clip",
        },
            `Welcome to ${pageName.value}!`,
        ),
        
        ReactiveMap(),
        
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
                /*
                    Normally, element attributes can only be a string, number or boolean.
                    
                    However, exceptions are made for *object attributes*.
                    These are special values that usually perform client-side actions.
                    
                    Take the below for example.
                    The eventListener() takes in a dependency array, and a callback function.
                    
                    It then returns an ObjectAttribute of type EVENT_LISTENER.
                    
                    The elegance-compiler, when it sees this, packs up the callback function and state references,
                    and ships it to the page.
                    
                    The page, when it loads, then binds the eventListener callback to the corresponding event (in this case, "onclick").
                    
                    ObjectAttributes do not show up in HTML!
                */
                onClick: eventListener(
                    [counter],
                    (_, counter) => {
                        counter.value++;
                        
                        counter.signal();
                    },
                ),
                
                /*
                    This is another ObjectAttribute, just like eventListener
                    It takes in an array of state it should watch,
                    and when that state calls its state.signal() method,
                    
                    The observer calls it's callback function with the new values,
                    and whatever is returned, is the new value of the property.
                    
                    So in this instance, whenever counter.signal() is called
                    this observer displays Counter: VALUE, and makes it the
                    innerText of this button.
                */
                innerText: observe([counter], (counter) => \`Counter: \${counter}\`),
            },
                div ({
                    class: "blur-[50px] absolute group-hover:bg-zinc-200 inset-0 bg-transparent duration-200 pointer-events-none -z-10",
                    "aria-hidden": "true",
                }),
            ),
        )
    );
}
 
/*
    This is the metadata of the page.
    Aka the <head> element which gets served alongside the page content.
    
    It *must* be a function that resolves into a head() result.
    
    In it, you should do things like link your stylesheets,
    set page titles, all that goodness.
*/   
export const metadata = () => head ({},
    link ({
        rel: "stylesheet",
        href: "/index.css",
    }),
    
    title ({},
        "Elegance.JS Demo"
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
  paths: {
    "@/": ["./"],
  }
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
