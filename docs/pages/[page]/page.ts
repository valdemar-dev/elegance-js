import { fileURLToPath } from "url";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { parseMarkdownToElements } from "../../utils/markdown";
import { raw } from "elegance-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function page({ params }: { params: { page: string } }) {
    const page = params.page;

    const desiredFile = encodeURI(page);
    const filePath = path.join(__dirname, "..", "content", `./${desiredFile}.md`)

    if (!existsSync(filePath)) return div("not found");

    const content = readFileSync(filePath).toString();

    const elems = parseMarkdownToElements(content);

    return div({
        className: "max-w-700px m-4 lg:mt-12",
    },
        ...elems
    );
}

export function metadata({ params }: { params: { page: string }}) {
    const page = params.page;

    const desiredFile = encodeURI(page);
    const filePath = path.join(__dirname, "..", "content", `./${desiredFile}.html`)

    if (!existsSync(filePath)) return [
        title("Elegance.JS"),
    ];
    
    const content = readFileSync(filePath).toString();

    return [raw(content)];
}

export const isDynamic = true;