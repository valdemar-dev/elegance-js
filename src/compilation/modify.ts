import { readFileSync } from "fs";
import {
    Project,
    SyntaxKind,
    Node,
    SourceFile,
} from "ts-morph";
import { fileURLToPath } from "url";
import { makeId } from "./compiler";

/**
 * notes:
 * we really should be using symbols to determine whether or not state() and loadHook() calls are *ours*
 * otherwise they're prone to shadowing, which might be rare, but can still happen.
 */

const processedFiles = new Map<string, string>();
const fileSourceFiles = new Map<string, SourceFile>();
const fileStateSymbolToId = new Map<string, Map<string, string>>();
const processedFunctionBodies = new Map<string, string>(); // NEW: cache for getProcessedFunctionBody results

const project = new Project({
    useInMemoryFileSystem: true,
});

export function transformSource(
    source: string,
    filePath = "input.ts",
    targetFunctionName?: string,
    targetLine?: number,
    targetChar?: number
): string {
    // Ensure SourceFile exists (cached forever)
    if (!fileSourceFiles.has(filePath)) {
        fileSourceFiles.set(filePath, project.createSourceFile(filePath, source));
    }
    const sharedFile = fileSourceFiles.get(filePath)!;

    // === NEW: stateSymbolToId is now cached per file (only built once) ===
    let stateSymbolToId: Map<string, string>;
    if (!fileStateSymbolToId.has(filePath)) {
        stateSymbolToId = new Map<string, string>();
        const declarations = sharedFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

        for (const decl of declarations) {
            const init = decl.getInitializer();
            if (!Node.isCallExpression(init)) continue;

            if (init.getExpression().getText() === "state") {
                const name = decl.getName();
                const pos = init.getStart();
                const { line, column } = sharedFile.getLineAndColumnAtPos(pos);
                const id = makeId(filePath, line, column);
                stateSymbolToId.set(name, id);
            }
        }
        fileStateSymbolToId.set(filePath, stateSymbolToId);
    } else {
        stateSymbolToId = fileStateSymbolToId.get(filePath)!;
    }

    if (targetFunctionName !== undefined && targetLine !== undefined && targetChar !== undefined) {
        // specific-call mode for getProcessedFunctionBody
        const callExpressions = sharedFile
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((c: any) => c.getExpression().getText() === targetFunctionName);

        let targetCall: any = undefined;
        for (const c of callExpressions) {
            const startPos = c.getStart();
            const { line } = sharedFile.getLineAndColumnAtPos(startPos);
            if (line === targetLine) {
                targetCall = c;
                break;
            }
        }

        if (!targetCall) {
            throw new Error(`Could not find call to ${targetFunctionName} at line ${targetLine} in ${filePath}`);
        }

        const arg = targetCall.getArguments()[0];
        const fn = arg?.asKind(SyntaxKind.ArrowFunction) || arg?.asKind(SyntaxKind.FunctionExpression);

        if (!fn) {
            throw new Error(`No arrow function or function expression argument found for ${targetFunctionName} call`);
        }

        const identifiers = fn.getDescendantsOfKind(SyntaxKind.Identifier);

        for (const node of identifiers) {
            const parent = node.getParent();
            if (Node.isPropertyAccessExpression(parent) && parent.getNameNode() === node) {
                continue;
            }

            const name = node.getText();
            const id = stateSymbolToId.get(name);

            if (id) {
                node.replaceWithText(`_state.get("${id}")`);
            }
        }

        return fn.getText();
    }

    // original full-file behavior (hardcoded loadHook for backward compatibility)
    const loadHooks = sharedFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((c: any) => c.getExpression().getText() === "loadHook");

    for (const hook of loadHooks) {
        const arg = hook.getArguments()[0];
        const fn = arg?.asKind(SyntaxKind.ArrowFunction) || arg?.asKind(SyntaxKind.FunctionExpression);

        if (!fn) continue;

        const identifiers = fn.getDescendantsOfKind(SyntaxKind.Identifier);

        for (const node of identifiers) {
            const parent = node.getParent();
            if (Node.isPropertyAccessExpression(parent) && parent.getNameNode() === node) {
                continue;
            }

            const name = node.getText();
            const id = stateSymbolToId.get(name);

            if (id) {
                node.replaceWithText(`_state["${id}"]`);
            }
        }
    }

    return sharedFile.getFullText();
}

export function getCallerFile() {
    // ... (unchanged – your existing stack parser)
    const err = new Error();
    const stackString = err.stack!;

    const lines = stackString.split('\n');
    const callSites: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed.startsWith('at ')) continue;

        let content = trimmed.slice(3).trim();
        let functionName: string | undefined;
        let locationPart = content;

        const openParenIndex = content.indexOf('(');
        if (openParenIndex > 0) {
            functionName = content.slice(0, openParenIndex).trim();
            locationPart = content.slice(openParenIndex).trim();
        }

        locationPart = locationPart.replace(/^\(/, '').replace(/\)$/, '');

        const lastColon = locationPart.lastIndexOf(':');
        if (lastColon === -1) continue;
        const colStr = locationPart.slice(lastColon + 1);
        const before = locationPart.slice(0, lastColon);
        const prevColon = before.lastIndexOf(':');
        if (prevColon === -1) continue;

        const lineStr = before.slice(prevColon + 1);
        let file = before.slice(0, prevColon);

        const lineNum = parseInt(lineStr, 10);
        const col = parseInt(colStr, 10);

        if (isNaN(lineNum) || isNaN(col)) continue;

        let fileName = file;
        if (file.startsWith('file://')) {
            fileName = fileURLToPath(file);
        }

        callSites.push({
            functionName,
            fileName,
            line: lineNum,
            char: col,
        });
    }

    const ourCallerParsed = callSites[2];
    const targetCallerParsed = callSites[3];

    if (!ourCallerParsed || !targetCallerParsed) {
        throw new Error(`Stack parsing failed (only got ${callSites.length} frames). Make sure --enable-source-maps is active and source maps are inline.`);
    }

    return {
        ourCaller: ourCallerParsed,
        targetCaller: {
            fileName: targetCallerParsed.fileName,
            line: targetCallerParsed.line,
            char: targetCallerParsed.char,
        },
    };
}

/**
 * Get a browser-ready processed version for a client-side function.
 * Now heavily cached for repeated calls (hundreds of times per file).
 */
export function getProcessedFunctionBody() {
    const { ourCaller, targetCaller } = getCallerFile();

    const targetFunctionName = ourCaller.functionName;
    const filePath = targetCaller.fileName;
    const targetLine = targetCaller.line;
    const targetChar = targetCaller.char;

    // === NEW: ultra-fast cache key for this exact call site ===
    const cacheKey = `${filePath}|${targetFunctionName ?? 'undefined'}|${targetLine}|${targetChar}`;

    if (processedFunctionBodies.has(cacheKey)) {
        return processedFunctionBodies.get(cacheKey)!;
    }

    // source is already cached (you had this before)
    let source: string;
    if (processedFiles.has(filePath)) {
        source = processedFiles.get(filePath)!;
    } else {
        source = readFileSync(filePath, "utf8");
        processedFiles.set(filePath, source);
    }

    const result = transformSource(source, filePath, targetFunctionName, targetLine, targetChar);

    processedFunctionBodies.set(cacheKey, result);
    return result;
}