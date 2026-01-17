import { compileEntireProject, setCompilerOptions, } from "../src/compilation/compiler";
import { serveProject, } from "../src/server/server";

async function runtime() {
    setCompilerOptions({
        pagesDirectory: "./test_pages",
        publicDirectory: "./public",
        outputDirectory: ".elegance",
        environment: "development",

        doHotReload: true,
    });

    const { allLayouts, allPages, allStatusCodePages, compiledStaticLayouts, compiledStaticPages, } = await compileEntireProject();

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

    console.log(port)
}

runtime();