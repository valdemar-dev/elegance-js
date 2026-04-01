import { execSync } from "child_process";
import { serveProject, compileEntireProject, setCompilerOptions, LogLevel, } from "elegance-js";
import path from "path";

async function runtime() {
    const pagesDirectory = path.resolve("./pages");
    const publicDirectory = path.resolve("./public");
    const outputDirectory = path.resolve(".elegance");

    setCompilerOptions({
        pagesDirectory: pagesDirectory,
        publicDirectory: publicDirectory,
        outputDirectory: outputDirectory,
        environment: "production",

        doHotReload: false,

        logLevel: LogLevel.INFO,
    });

    await compileEntireProject();

    execSync(`npx @tailwindcss/cli -i ${path.join(pagesDirectory, "input.css")} -o ${path.join(outputDirectory, "DIST", "index.css")} --minify`);
}

runtime();