import { build } from "esbuild";



const start = performance.now();

build ({
    entryPoints: ["./src/**/*.ts"],
    outdir: "./dist",
    format: "esm",
    platform: "node",
    bundle: true, 
    outExtension: {
        ".js": ".mjs",
    },
    external: ["esbuild"],
    drop: process.env.ENVIRONMENT === "production" ? ["console", "debugger"] : undefined, 
}).then(() => {
    console.log(`Compiled in ${performance.now() - start}ms.`);
})
