import { execSync } from "child_process";
import { serveProject, compileEntireProject, setCompilerOptions, LogLevel, } from "elegance-js";
import path from "path";

async function runtime() {
    const pagesDirectory = path.resolve("./test_pages");
    const publicDirectory = path.resolve("./public");
    const outputDirectory = path.resolve(".elegance");

    setCompilerOptions({
        pagesDirectory: pagesDirectory,
        publicDirectory: publicDirectory,
        outputDirectory: outputDirectory,
        environment: "development",

        doHotReload: true,

        logLevel: LogLevel.INFO,
    });

    const { allLayouts, allPages, allStatusCodePages, compiledStaticLayouts, compiledStaticPages, } = await compileEntireProject();

    execSync(`npx @tailwindcss/cli -i ${path.join(pagesDirectory, "input.css")} -o ${path.join(outputDirectory, "DIST", "index.css")}`);

    const { port } = await serveProject({
        port: 3000,
        hostname: "0.0.0.0",
        
        allowDynamic: true,
        allowStatusCodePages: true, 
        serveAPI: true,
        
        allLayouts,
        allStatusCodePages,
        allPages,

        builtStaticPages: compiledStaticPages,
        builtStaticLayouts: compiledStaticLayouts,
    });
}

runtime();