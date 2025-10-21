const headingMap: Record<string, (children: any[]) => any> = {
    '#': (children) => h1({}, children),
    '##': (children) => h2({}, children),
    '###': (children) => h3({}, children),
    '####': (children) => h4({}, children),
    '#####': (children) => h5({}, children),
    '######': (children) => h6({}, children)
};

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

const parseInline = (text: string): Child[] => {
    let parts: Child[] = [text];
    parts = applyFormatter(parts, /`(.*?)`/, (children) => code({}, children));
    parts = applyFormatter(parts, /\*\*(.*?)\*\*/, (children) => strong({}, children), true);
    parts = applyFormatter(parts, /\*(.*?)\*/, (children) => em({}, children), true);
    return parts;
};

export const mdToElegance = (mdContent: string): any[] => {
    const lines = mdContent.split('\n');
    const output: any[] = [];
    let currentPara: string[] = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) {
            if (currentPara.length) {
                const content = currentPara.join(' ');
                const children = parseInline(content);
                output.push(p({}, ...children));
                currentPara = [];
            }
            continue;
        }

        let isHeading = false;
        for (let level = 1; level <= 6; level++) {
            const token = '#'.repeat(level);
            if (line.startsWith(token + ' ')) {
                if (currentPara.length) {
                    const paraContent = currentPara.join(' ');
                    const paraChildren = parseInline(paraContent);
                    output.push(p({}, ...paraChildren));
                    currentPara = [];
                }
                const content = line.slice(token.length + 1);
                const children = parseInline(content);
                const headingFunc = headingMap[token];
                output.push(headingFunc(children));
                isHeading = true;
                break;
            }
        }

        if (!isHeading) {
            currentPara.push(line);
        }
    }

    if (currentPara.length) {
        const content = currentPara.join(' ');
        const children = parseInline(content);
        output.push(p({}, ...children));
    }

    return output;
};
