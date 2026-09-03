import { parseSync } from "oxc-parser";
import { type Edit, applyEdits, forEachChild } from "./oxc";

function getTagName(nameNode: any, src: string): string {
    if (nameNode.type === "JSXIdentifier") return nameNode.name;
    if (nameNode.type === "JSXNamespacedName") return `${nameNode.namespace.name}_${nameNode.name.name}`;
    return src.slice(nameNode.start, nameNode.end);
}

function processJSXText(raw: string): string | null {
    const trimmed = raw.split("\n").map(l => l.trim()).filter(Boolean).join(" ");
    return trimmed || null;
}

function convertJSXNode(node: any, src: string): string {
    if (node.type === "JSXFragment") {
        const kids = convertJSXChildren(node.children, src);
        if (kids.length === 0) return "null";
        if (kids.length === 1) return kids[0]!;
        return `[${kids.join(", ")}]`;
    }
    return convertJSXElement(node, src);
}

function convertExpr(node: any, src: string): string {
    if (node.type === "JSXElement" || node.type === "JSXFragment") return convertJSXNode(node, src);

    const edits: Edit[] = [];
    function collect(n: any): void {
        if (n.type === "JSXElement" || n.type === "JSXFragment") {
            edits.push({ start: n.start, end: n.end, replacement: convertJSXNode(n, src) });
            return;
        }
        forEachChild(n, collect);
    }
    collect(node);

    if (edits.length === 0) return src.slice(node.start, node.end);

    let out = "", cursor = node.start;
    for (const e of edits.sort((a, b) => a.start - b.start)) {
        out += src.slice(cursor, e.start) + e.replacement;
        cursor = e.end;
    }
    return out + src.slice(cursor, node.end);
}

function convertJSXElement(node: any, src: string): string {
    const opening = node.openingElement;
    const tagName = getTagName(opening.name, src);
    const isComponent = /^[A-Z]/.test(tagName) || tagName.includes(".");
    const args: string[] = [];

    if (opening.attributes.length > 0) {
        const parts: string[] = [];
        for (const attr of opening.attributes) {
            if (attr.type === "JSXSpreadAttribute") {
                parts.push(`...${convertExpr(attr.argument, src)}`);
                continue;
            }
            const rawName: string = src.slice(attr.name.start, attr.name.end);
            const key = /[-:]/.test(rawName) ? `"${rawName}"` : rawName;

            if (attr.value === null) {
                parts.push(`${key}: true`);
            } else if (attr.value.type === "StringLiteral" || attr.value.type === "Literal") {
                parts.push(`${key}: ${src.slice(attr.value.start, attr.value.end)}`);
            } else if (attr.value.type === "JSXExpressionContainer") {
                const expr = attr.value.expression;
                if (expr.type !== "JSXEmptyExpression") parts.push(`${key}: ${convertExpr(expr, src)}`);
            } else if (attr.value.type === "JSXElement" || attr.value.type === "JSXFragment") {
                parts.push(`${key}: ${convertJSXNode(attr.value, src)}`);
            }
        }
        if (parts.length > 0) args.push(`{ ${parts.join(", ")} }`);
    }

    if (!opening.selfClosing) {
        const kids = convertJSXChildren(node.children, src);
        if (kids.length > 0) {
            if (isComponent && args.length === 0) args.push("{}");
            args.push(`[${kids.join(", ")}]`);
        }
    }

    return `${tagName}(${args.join(", ")})`;
}

function convertJSXChildren(children: any[], src: string): string[] {
    const result: string[] = [];
    for (const child of children) {
        switch (child.type) {
            case "JSXText": {
                const text = processJSXText(child.value);
                if (text !== null) result.push(JSON.stringify(text));
                break;
            }
            case "JSXExpressionContainer": {
                const expr = child.expression;
                if (expr.type !== "JSXEmptyExpression") result.push(convertExpr(expr, src));
                break;
            }
            case "JSXSpreadChild":
                result.push(`...(${convertExpr(child.expression, src)})`);
                break;
            case "JSXElement":
                result.push(convertJSXElement(child, src));
                break;
            case "JSXFragment": {
                const kids = convertJSXChildren(child.children, src);
                if (kids.length === 0) break;
                if (kids.length === 1) { result.push(kids[0]!); break; }
                result.push(`[${kids.join(", ")}]`);
                break;
            }
        }
    }
    return result;
}

export function transformJSX(source: string, filePath: string): string {
    if (!source.includes("<")) return source;

    let ast: any;
    try {
        ast = parseSync(filePath, source, { sourceType: "module" });
    } catch {
        return source;
    }

    const edits: Edit[] = [];
    function collect(node: any): void {
        if (node.type === "JSXElement" || node.type === "JSXFragment") {
            edits.push({ start: node.start, end: node.end, replacement: convertJSXNode(node, source) });
            return;
        }
        forEachChild(node, collect);
    }
    collect(ast.program);

    return edits.length === 0 ? source : applyEdits(source, edits);
}