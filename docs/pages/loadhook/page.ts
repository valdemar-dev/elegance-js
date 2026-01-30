import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";
import { parseMarkdownToElements } from "../../utils/markdown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function page() {
    const content = readFileSync(path.join(__dirname, "./content.md"));

    const elems = parseMarkdownToElements(content.toString());

    console.log(elems);

    return div(...elems);
}

export function metadata() {
    return [];
}