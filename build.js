import { build } from "esbuild";



const start = performance.now();

build ({
    entryPoints: ["./src/**/*.ts"],
    outdir: "./dist",
    format: "esm",
    platform: "node",
    bundle: false, 
    tsconfig: "./tsconfig.json",
    drop: process.env.ENVIRONMENT === "production" ? ["console", "debugger"] : undefined,
}).then(() => {
    console.log(`Compiled in ${performance.now() - start}ms.`);
})
