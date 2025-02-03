import { fileURLToPath } from "url";
import { compile } from "./build";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES_DIR = path.join(__dirname, "../src/docs");
const OUTPUT_DIR = path.join(__dirname, "../docs");

compile({
    writeToHTML: true,
    pagesDirectory: PAGES_DIR,
    outputDirectory: OUTPUT_DIR,
    environment: "development",
}).then(() => {
    console.log("Built Docs.");
})
