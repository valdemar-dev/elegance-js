import { Link } from "elegance-js";

const MarkdownLink = (...params: any) => Link(...params);

const Paragraph = (...params: any) => p(...params);
const HeadingOne = (...params: any) => h1(...params);
const HeadingTwo = (...params: any) => h2(...params);
const HeadingThree = (...params: any) => h3(...params);
const HeadingFour = (...params: any) => h4(...params);
const HeadingFive = (...params: any) => h5(...params);
const HeadingSix = (...params: any) => h6(...params);

const Br = br;

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function parseInline(text: string): (string | any)[] {
    const parts: (string | any)[] = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const plain = text.slice(lastIndex, match.index);
            if (plain) {
                parts.push(plain);
            }
        }

        const content = match[1].trim();
        const href = match[2].trim();
        parts.push(MarkdownLink({ href }, content));

        lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex);
        if (remaining) {
            parts.push(remaining);
        }
    }

    if (parts.length === 0 && text) {
        parts.push(text);
    }

    return parts;
}

function parseMarkdownToElements(markdown: string): any[] {
    const lines = markdown.split('\n');
    const elements: any[] = [];
    let currentParagraphLines: string[] = [];

    function flushParagraph() {
        if (currentParagraphLines.length === 0) return;

        const paragraphChildren: (string | any)[] = [];

        currentParagraphLines.forEach((line, index) => {
            const inlineParts = parseInline(line);
            paragraphChildren.push(...inlineParts);
            if (index < currentParagraphLines.length - 1) {
                paragraphChildren.push(Br());
            }
        });

        if (paragraphChildren.length > 0) {
            elements.push(Paragraph({}, ...paragraphChildren));
        }

        currentParagraphLines = [];
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();

        if (line.trim() === '') {
            flushParagraph();
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

    return elements;
}

export {
    parseMarkdownToElements,
}