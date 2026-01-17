/**
 * Modify this to run whatever basic usage of Elegance you want to test.
 * It's not actual testing, it's more like sanity-testing.
 */
import { compileEntireProject, setCompilerOptions, } from "../src/compilation/compiler";
import { serveProject, } from "../src/server/server";

(async () => {
    setCompilerOptions({
        pagesDirectory: "./test_pages",
        publicDirectory: "./public",
        outputDirectory: ".elegance",
        environment: "development",
        extendedGlobals: [],
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
})();
