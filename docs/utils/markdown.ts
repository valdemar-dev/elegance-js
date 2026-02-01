import { Link } from "elegance-js";

const MarkdownLink = (param1: any, ...params: any) => Link({
    className: "border-b-2 text-blue-500 dark:text-blue-400 hover:opacity-70 duration-200",
    ...param1
}, ...params);

const Bold = (param1: any, ...params: any) => strong({
    className: "font-bold",
    ...param1
}, ...params);

const Italic = (param1: any, ...params: any) => em({
    className: "italic",
    ...param1
}, ...params);

const Code = (param1: any, ...params: any) => code({
    className: "font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded duration-200",
    ...param1
}, ...params);

const CodeBlock = (param1: any, ...params: any) => {
    const baseClass = "bg-gray-100 dark:bg-gray-800 p-4 my-4 overflow-x-auto";
    const props = { ...param1 };

    props.className = baseClass + (props.className ? " " + props.className : "");

    if (props.lang) {
        props.className += ` language-${props.lang}`;
    }

    return pre(props, code({}, ...params));
};

const Paragraph = (param1: any, ...params: any) => p({
    className: "leading-7 pb-4",
    ...param1
}, ...params);

const HeadingOne = (param1: any, ...params: any) => h1({
    className: "mb-4 text-4xl font-semibold",
    ...param1
}, ...params);

const HeadingTwo = (param1: any, ...params: any) => h2({
    className: "mb-4 text-3xl font-semibold mt-12 pt-12 duration-200 border-t-[1px] border-[#00000033] dark:border-[#ffffff33]",
    ...param1
}, ...params);

const HeadingThree = (param1: any, ...params: any) => h3({
    className: "mb-4 text-2xl font-semibold",
    ...param1
}, ...params);

const HeadingFour = (param1: any, ...params: any) => h4({
    className: "mb-4 text-xl font-semibold",
    ...param1
}, ...params);

const HeadingFive = (param1: any, ...params: any) => h5({
    className: "mb-4 text-lg font-semibold",
    ...param1
}, ...params);

const HeadingSix = (param1: any, ...params: any) => h6({
    className: "mb-4 text-base font-semibold",
    ...param1
}, ...params);

const Br = br;

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

function findClosing(text: string, start: number, marker: string): number {
    let j = start;
    const markerLen = marker.length;

    while (j < text.length) {
        if (text.substring(j, j + markerLen) === marker) {
            if (j > 0 && text[j - 1] === "\\") {
                j += markerLen;
                continue;
            }

            return j;
        }

        j++;
    }
    return -1;
}

function parseInline(text: string): (string | any)[] {
    const parts: (string | any)[] = [];
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (char === "\\") {
            if (i + 1 < text.length) {
                parts.push(text[i + 1]);
                i += 2;

                continue;
            }

            parts.push("\\");
            i++;

            continue;
        }
        
        if (text.substring(i, i + 2) === "**") {
            const end = findClosing(text, i + 2, "**");

            if (end !== -1) {
                const content = text.substring(i + 2, end);
                const children = parseInline(content);

                parts.push(Bold({}, ...children));
                i = end + 2;

                continue;
            }
        }

        if (text.substring(i, i + 2) === "__") {
            const end = findClosing(text, i + 2, "__");

            if (end !== -1) {
                const content = text.substring(i + 2, end);
                const children = parseInline(content);
                parts.push(Bold({}, ...children));

                i = end + 2;

                continue;
            }
        }

        if (char === "*") {
            const end = findClosing(text, i + 1, "*");

            if (end !== -1) {
                const content = text.substring(i + 1, end);
                const children = parseInline(content);

                parts.push(Italic({}, ...children));

                i = end + 1;

                continue;
            }
        }

        if (char === "_") {
            const end = findClosing(text, i + 1, "_");

            if (end !== -1) {
                const content = text.substring(i + 1, end);
                const children = parseInline(content);

                parts.push(Italic({}, ...children));

                i = end + 1;

                continue;
            }
        }

        if (char === "`") {
            let ticks = 1;
            let j = i + 1;

            while (j < text.length && text[j] === "`") {
                ticks++;
                j++;
            }

            let end = j;
            const closing = "`".repeat(ticks);

            while (end < text.length) {
                end = text.indexOf(closing, end);
                
                if (end === -1) {
                    break;
                }

                if (end > 0 && text[end - 1] === "\\") {
                    end += ticks;

                    continue;
                }

                break;
            }

            if (end !== -1) {
                const content = text.substring(j, end);

                parts.push(Code({}, content));

                i = end + ticks;

                continue;
            }

            parts.push("`".repeat(ticks));

            i = j;

            continue;
        }

        if (char === "[") {
            const closeBracket = findClosing(text, i + 1, "]");

            if (closeBracket === -1) {
                parts.push("[");

                i++;

                continue;
            }
            
            if (closeBracket + 1 >= text.length || text[closeBracket + 1] !== "(") {
                parts.push("[");

                i++;

                continue;
            }

            const closeParen = findClosing(text, closeBracket + 2, ")");

            if (closeParen === -1) {
                parts.push("[");
                i++;
                
                continue;
            }

            const contentText = text.substring(i + 1, closeBracket);
            const href = text.substring(closeBracket + 2, closeParen).trim();
            const children = parseInline(contentText);

            parts.push(MarkdownLink({ href }, ...children));
            i = closeParen + 1;

            continue;
        }

        parts.push(char);

        i++;
    }

    const merged: (string | any)[] = [];

    let currentStr = "";
    
    for (const part of parts) {
        if (typeof part === "string") {
            currentStr += part;

            continue;
        }

        if (currentStr) {
            merged.push(currentStr);
            currentStr = "";
        }

        merged.push(part);
    }

    if (currentStr) {
        merged.push(currentStr);
    }

    return merged;
}

function parseMarkdownToElements(markdown: string): any[] {
    const lines = markdown.split("\n");
    const elements: any[] = [];
    
    let currentParagraphLines: string[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let fenceLength = 0;
    let language = "";

    function flushParagraph() {
        if (currentParagraphLines.length === 0) {
            return;
        }

        const paragraphChildren: (string | any)[] = [];

        currentParagraphLines.forEach((line, index) => {
            const inlineParts = parseInline(line);

            paragraphChildren.push(...inlineParts);

            if (index < currentParagraphLines.length - 1) {
                paragraphChildren.push(Br({}));
            }
        });

        if (paragraphChildren.length > 0) {
            elements.push(Paragraph({}, ...paragraphChildren));
        }

        currentParagraphLines = [];
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();

        if (inCodeBlock) {
            if (line.startsWith("`".repeat(fenceLength))) {
                const codeContent = codeLines.join("\n");

                elements.push(CodeBlock({ lang: language }, codeContent));
                
                codeLines = [];
                inCodeBlock = false;
                fenceLength = 0;
                language = "";

                continue;
            }

            codeLines.push(lines[i]);

            continue;
        }

        if (line.trim() === "") {
            flushParagraph();
            continue;
        }

        const fenceMatch = line.match(/^(`{3,})(.*)$/);

        if (fenceMatch) {
            flushParagraph();

            fenceLength = fenceMatch[1].length;
            language = fenceMatch[2].trim();
            inCodeBlock = true;

            continue;
        }
        
        const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

        if (headingMatch) {
            flushParagraph();
            const level = headingMatch[1].length;
            const rawText = headingMatch[2].trim();
            const id = slugify(rawText);
            const headingChildren = parseInline(rawText);
            let headingFn: any;
            switch (level) {
                case 1:
                    headingFn = HeadingOne;
                    break;
                case 2:
                    headingFn = HeadingTwo;
                    break;
                case 3:
                    headingFn = HeadingThree;
                    break;
                case 4:
                    headingFn = HeadingFour;
                    break;
                case 5:
                    headingFn = HeadingFive;
                    break;
                case 6:
                    headingFn = HeadingSix;
                    break;
                default:
                    headingFn = HeadingTwo;
            }
            elements.push(headingFn({ id }, ...headingChildren));
            continue;
        }
        currentParagraphLines.push(line);
    }

    flushParagraph();

    if (inCodeBlock && codeLines.length > 0) {
        const codeContent = codeLines.join("\n");
        elements.push(CodeBlock({ lang: language }, codeContent));
    }

    return elements;
}

export {
    parseMarkdownToElements
};
