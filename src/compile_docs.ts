import { fileURLToPath } from "url";
import { compile } from "./build";
import { exec } from "child_process";

import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES_DIR = path.join(__dirname, "../src/docs");
const OUTPUT_DIR = path.join(__dirname, "../docs");

compile({
    writeToHTML: true,
    pagesDirectory: PAGES_DIR,
    outputDirectory: OUTPUT_DIR,
    environment: "production",
    watchServerPort: 3001,
}).then(() => {
    exec (`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/index.css --minify --watch`)

    console.log("Built Docs.");
})
