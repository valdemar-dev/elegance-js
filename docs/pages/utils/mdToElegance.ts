import { eventListener, state } from "elegance-js";
import { toastContent } from "@/pages/layout";
const headingStyles = "pb-2 mt-12";

const headingMap: Record<string, (children: any[]) => any> = {
    '#': (children) => h1({ class: headingStyles + " text-4xl", }, children),
    '##': (children) => h2({ class: headingStyles + " text-3xl", }, children),
    '###': (children) => h3({ class: headingStyles + " text-2xl", }, children),
    '####': (children) => h4({ class: headingStyles + " text-xl", }, children),
    '#####': (children) => h5({ class: headingStyles + " text-lg", }, children),
    '######': (children) => h6({ class: headingStyles + " text-base", }, children)
};

const codeElement = (children: any[]) => {
    const codeContent = state(children as unknown as string);
    
    return div({
        class: "bg-darken dark:bg-lighten p-2 rounded-sm w-max hover:cursor-pointer hover:opacity-80 duration-100 select-none my-2",
        onClick: eventListener(
            [codeContent, toastContent],
            async (_, codeContent, toastContent) => { 
                await navigator.clipboard.writeText(`${codeContent.value}`); 
                
                toastContent.value = "Copied to Clipboard";
                toastContent.signal();
            },
        ),
    }, 
        code({ 
            class: "font-plex-mono", 
        }, 
            children,
        ),
    );
}

const applyFormatter = (
    parts: Child[],
    regex: RegExp,
    creator: (children: any[]) => any,
    recurse = false
): Child[] => {
    const newParts: Child[] = [];
    for (let part of parts) {
        if (typeof part !== 'string') {
            newParts.push(part);
            continue;
        }
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        const re = new RegExp(regex.source, 'g');
        while ((match = re.exec(part)) !== null) {
            const content = match[1];
            if (match.index > lastIndex) {
                newParts.push(part.slice(lastIndex, match.index));
            }
            const parsedContent = recurse ? parseInline(content) : [content];
            newParts.push(creator(parsedContent));
            lastIndex = re.lastIndex;
        }
        if (lastIndex < part.length) {
            newParts.push(part.slice(lastIndex));
        }
    }
    return newParts;
};

const applyLinkFormatter = (parts: Child[]): Child[] => {
    const newParts: Child[] = [];
    for (let part of parts) {
        if (typeof part !== 'string') {
            newParts.push(part);
            continue;
        }
        let lastIndex = 0;
        const re = /\[([^\]]*)\]\(([^\)]*)\)/g;
        let match: RegExpExecArray | null;
        while ((match = re.exec(part)) !== null) {
            if (match.index > lastIndex) {
                newParts.push(part.slice(lastIndex, match.index));
            }
            const text = match[1];
            const url = match[2];
            const parsedText = parseInline(text);
            newParts.push(a({ href: url }, ...parsedText));
            lastIndex = re.lastIndex;
        }
        if (lastIndex < part.length) {
            newParts.push(part.slice(lastIndex));
        }
    }
    return newParts;
};

const parseInline = (text: string): Child[] => {
    let parts: Child[] = [text];
    parts = applyFormatter(parts, /`(.*?)`/, (children) => codeElement(children));
    parts = applyLinkFormatter(parts);
    parts = applyFormatter(parts, /\*\*(.*?)\*\*/, (children) => strong({}, children), true);
    parts = applyFormatter(parts, /\*(.*?)\*/, (children) => em({}, children), true);
    return parts;
};

export const mdToElegance = (mdContent: string): any[] => {
    const lines = mdContent.split('\n');
    const output: any[] = [];
    let currentParaLines: string[] = [];

    for (let line of lines) {        
        const trimmed = line.trim();
        
        if (!trimmed) {
            if (currentParaLines.length > 0) {
                const paraChildren: Child[] = [];
                for (let i = 0; i < currentParaLines.length; i++) {
                    let paraLine = currentParaLines[i];
                    const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
                    const brCount = Math.floor(trailingSpaces / 2);

                    let content = paraLine.replace(/ {2,}$/, '').trimEnd();
                    paraChildren.push(...parseInline(content));
                    
                    for (let j = 0; j < brCount; j++) {
                        paraChildren.push(br({}));
                    }
                }
                output.push(p({}, ...paraChildren));
                currentParaLines = [];
            }
            continue;
        }

        let isHeading = false;
        for (let level = 1; level <= 6; level++) {
            const token = '#'.repeat(level);
            if (trimmed.startsWith(token + ' ')) {
                if (currentParaLines.length > 0) {
                    const paraChildren: Child[] = [];
                    for (let i = 0; i < currentParaLines.length; i++) {
                        let paraLine = currentParaLines[i];
                        const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
                        const brCount = Math.floor(trailingSpaces / 2);
    
                        let content = paraLine.replace(/ {2,}$/, '').trimEnd();
                        paraChildren.push(...parseInline(content));
                        
                        for (let j = 0; j < brCount; j++) {
                            paraChildren.push(br({}));
                        }
                    }
                    output.push(p({}, ...paraChildren));
                    currentParaLines = [];
                }
                const content = trimmed.slice(token.length + 1);
                const children = parseInline(content);
                const headingFunc = headingMap[token];
                output.push(headingFunc(children));
                isHeading = true;
                break;
            }
        }

        if (!isHeading) {
            currentParaLines.push(line);
        }
    }

    if (currentParaLines.length > 0) {
        const paraChildren: Child[] = [];
        for (let i = 0; i < currentParaLines.length; i++) {
            let paraLine = currentParaLines[i];
            const trailingSpaces = paraLine.length - paraLine.trimEnd().length;
            const brCount = Math.floor(trailingSpaces / 2);
    
            let content = paraLine.replace(/ {2,}$/, '').trimEnd();
            paraChildren.push(...parseInline(content));
            
            for (let j = 0; j < brCount; j++) {
                paraChildren.push(br({}));
            }
       }
        output.push(p({}, ...paraChildren));
    }

    return output;
};