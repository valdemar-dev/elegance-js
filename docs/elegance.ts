import { execSync } from "child_process";
import { serveProject, compileEntireProject, setCompilerOptions, } from "elegance-js";
import path from "path";

async function runtime() {
    const pagesDirectory = path.resolve("./pages");
    const publicDirectory = path.resolve("./public");
    const outputDirectory = path.resolve(".elegance");

    setCompilerOptions({
        pagesDirectory: pagesDirectory,
        publicDirectory: publicDirectory,
        outputDirectory: outputDirectory,
        environment: "development",

        doHotReload: true,
    });

    const { allLayouts, allPages, allStatusCodePages, compiledStaticLayouts, compiledStaticPages, } = await compileEntireProject();

    execSync(`npx @tailwindcss/cli -i ${path.join(pagesDirectory, "input.css")} -o ${path.join(outputDirectory, "DIST", "index.css")}`);

    await serveProject({
        port: 3000,
        hostname: "192.168.100.53",
        
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