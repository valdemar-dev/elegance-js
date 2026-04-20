import { readFileSync } from "fs";
import { Project, SyntaxKind, Node, } from "ts-morph";
import { fileURLToPath } from "url";
import { makeId } from "./compiler";
/**
 * notes:
 * we really should be using symbols to determine whether or not state() and loadHook() calls are *ours*
 * otherwise they're prone to shadowing, which might be rare, but can still happen.
 */
const processedFiles = new Map();
const fileSourceFiles = new Map();
const fileStateSymbolToId = new Map();
const fileCallSiteCache = new Map(); // NEW: precomputed call sites
const processedFunctionBodies = new Map(); // per exact call-site result
const project = new Project({
    useInMemoryFileSystem: true,
});
export function transformSource(source, filePath = "input.ts", targetFunctionName, targetLine, targetChar) {
    // Ensure SourceFile (cached forever)
    if (!fileSourceFiles.has(filePath)) {
        fileSourceFiles.set(filePath, project.createSourceFile(filePath, source));
    }
    const sharedFile = fileSourceFiles.get(filePath);
    // === ONE-TIME PER FILE: state symbols + call-site cache ===
    if (!fileStateSymbolToId.has(filePath)) {
        const stateSymbolToId = new Map();
        const declarations = sharedFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
        for (const decl of declarations) {
            const init = decl.getInitializer();
            if (!Node.isCallExpression(init))
                continue;
            if (init.getExpression().getText() === "state") {
                const name = decl.getName();
                const pos = init.getStart();
                const { line, column } = sharedFile.getLineAndColumnAtPos(pos);
                const id = makeId(filePath, line, column);
                stateSymbolToId.set(name, id);
            }
        }
        fileStateSymbolToId.set(filePath, stateSymbolToId);
    }
    if (!fileCallSiteCache.has(filePath)) {
        const callSiteMap = new Map();
        const allCalls = sharedFile.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const c of allCalls) {
            const name = c.getExpression().getText(); // exact same logic as before
            const startPos = c.getStart();
            const { line } = sharedFile.getLineAndColumnAtPos(startPos);
            const cacheKey = `${name}|${line}`;
            callSiteMap.set(cacheKey, c);
        }
        fileCallSiteCache.set(filePath, callSiteMap);
    }
    const stateSymbolToId = fileStateSymbolToId.get(filePath);
    // ====================== SPECIFIC CALL MODE ======================
    if (targetFunctionName !== undefined && targetLine !== undefined && targetChar !== undefined) {
        const callSiteMap = fileCallSiteCache.get(filePath);
        const cacheKey = `${targetFunctionName}|${targetLine}`;
        const targetCall = callSiteMap.get(cacheKey);
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
    // ====================== LEGACY FULL-FILE MODE ======================
    const loadHooks = sharedFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((c) => c.getExpression().getText() === "loadHook");
    for (const hook of loadHooks) {
        const arg = hook.getArguments()[0];
        const fn = arg?.asKind(SyntaxKind.ArrowFunction) || arg?.asKind(SyntaxKind.FunctionExpression);
        if (!fn)
            continue;
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
// getCallerFile() remains 100% unchanged (your original implementation)
export function getCallerFile() {
    const err = new Error();
    const stackString = err.stack;
    const lines = stackString.split('\n');
    const callSites = [];
    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed.startsWith('at '))
            continue;
        let content = trimmed.slice(3).trim();
        let functionName;
        let locationPart = content;
        const openParenIndex = content.indexOf('(');
        if (openParenIndex > 0) {
            functionName = content.slice(0, openParenIndex).trim();
            locationPart = content.slice(openParenIndex).trim();
        }
        locationPart = locationPart.replace(/^\(/, '').replace(/\)$/, '');
        const lastColon = locationPart.lastIndexOf(':');
        if (lastColon === -1)
            continue;
        const colStr = locationPart.slice(lastColon + 1);
        const before = locationPart.slice(0, lastColon);
        const prevColon = before.lastIndexOf(':');
        if (prevColon === -1)
            continue;
        const lineStr = before.slice(prevColon + 1);
        let file = before.slice(0, prevColon);
        const lineNum = parseInt(lineStr, 10);
        const col = parseInt(colStr, 10);
        if (isNaN(lineNum) || isNaN(col))
            continue;
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
 * Now blazing fast after the first call per file.
 */
export function getProcessedFunctionBody() {
    const { ourCaller, targetCaller } = getCallerFile();
    const targetFunctionName = ourCaller.functionName;
    const filePath = targetCaller.fileName;
    const targetLine = targetCaller.line;
    const targetChar = targetCaller.char;
    // Ultra-fast cache key (includes char for extra safety even though matching uses line)
    const cacheKey = `${filePath}|${targetFunctionName ?? 'undefined'}|${targetLine}|${targetChar}`;
    if (processedFunctionBodies.has(cacheKey)) {
        return processedFunctionBodies.get(cacheKey);
    }
    let source;
    if (processedFiles.has(filePath)) {
        source = processedFiles.get(filePath);
    }
    else {
        source = readFileSync(filePath, "utf8");
        processedFiles.set(filePath, source);
    }
    const result = transformSource(source, filePath, targetFunctionName, targetLine, targetChar);
    processedFunctionBodies.set(cacheKey, result);
    return result;
}
