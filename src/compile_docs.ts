import { fileURLToPath } from "url";
import { compile } from "./build";
import { execSync } from "child_process";

import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES_DIR = path.join(__dirname, "../src/docs");
const PUBLIC_DIR = path.join(__dirname, "../src/docs/public");
const OUTPUT_DIR = path.join(__dirname, "../docs");

let environmentArg = process.argv.find((arg) => arg.startsWith("--environment"));
if (!environmentArg) environmentArg = "--environment='production'"

const environment = environmentArg.split("=")[1];

console.log(`Environment: ${environment}`);

compile({
    writeToHTML: true,
    pagesDirectory: PAGES_DIR,
    outputDirectory: OUTPUT_DIR,
    environment: environment as "production" | "development",
    watchServerPort: 3001,
    publicDirectory: PUBLIC_DIR,
    postCompile: async () => {
        execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --minify`)
    },
});
