import { readFileSync } from "fs";
import {
    Project,
    SyntaxKind,
    Node,
    SourceFile
} from "ts-morph";
import crypto from "crypto";
import { fileURLToPath } from "url";

function makeId(filePath: string, name: string, pos: number) {
    const id = crypto
            .createHash('sha256')
            .update(filePath + ':' + name + pos.toString())
            .digest('base64url')
            .slice(0, 11); // 66 bits of entropy


    return `${id}`;
}

const project = new Project({
    useInMemoryFileSystem: true
})

/**
 * notes:
 * we really should be using symbols to determine whether or not state() and loadHook() calls are *ours*
 * otherwise they're prone to shadowing, which might be rare, but can still happen.
 */

let sharedFile: SourceFile | undefined;

const processedFiles = new Map<string, string>();
const fileSourceFiles = new Map<string, SourceFile>();

/**
 * Take all references to state() calls within client-side functions (loadHook, observer), and turn them into appropriate references.
 * 
 * It will generate an id for the state, a sha256 hash of filePath:name+pos, as base64url.
 * 
 * For example, `counter.value++` might turn into `_state["Gj331A_YJI"].value++`
 * 
 * This function is necessary to remove the dependency array within client-side functions.
 * 
 * It's currently in a very experimental state, and thus is slow!!! And not good!
 * 
 * When `targetFunctionName`, `targetLine`, and `targetChar` are provided, it switches to "specific call" mode:
 * it finds *only* the matching call to that function name at the exact source location (line + column),
 * processes *only* the function argument passed to it, and returns the processed function text.
 * 
 * Otherwise it falls back to the original full-file behavior (for backward compatibility).
 * 
 * The SourceFile for each filePath is cached and kept alive indefinitely so subsequent calls
 * to the same file are much faster (no re-parsing).
 * 
 * @param source The raw source-code of the file.
 * @param filePath The in-memory filename (you probably don't need to touch this)
 * @returns The modified source-code (full file) or the processed function text (in specific mode).
 */
export function transformSource(
    source: string, 
    filePath = "input.ts",
    targetFunctionName?: string,
    targetLine?: number,
    targetChar?: number
): string {
    if (!fileSourceFiles.has(filePath)) {
        fileSourceFiles.set(filePath, project.createSourceFile(filePath, source));
    }
    // subsequent calls reuse the exact same SourceFile instance (kept alive, no re-parse)

    const sharedFile = fileSourceFiles.get(filePath)!;

    const stateSymbolToId = new Map<string, string>();
    const declarations = sharedFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

    for (const decl of declarations) {
        const init = decl.getInitializer();
        if (!Node.isCallExpression(init)) continue;

        if (init.getExpression().getText() === "state") {
            const name = decl.getName();
            const id = makeId(filePath, name, decl.getStart());
            stateSymbolToId.set(name, id);
        }
    }

    if (targetFunctionName !== undefined && targetLine !== undefined && targetChar !== undefined) {
        // specific-call mode for getProcessedFunctionBody
        const callExpressions = sharedFile.getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((c: any) => c.getExpression().getText() === targetFunctionName);

        let targetCall: any = undefined;
        for (const c of callExpressions) {
            const startPos = c.getStart();
            const { line, column } = sharedFile.getLineAndColumnAtPos(startPos);
            if (line === targetLine && column === targetChar - 1) {
                targetCall = c;
                break;
            }
        }

        if (!targetCall) {
            throw new Error(`Could not find call to ${targetFunctionName} at line ${targetLine}, column ${targetChar} in ${filePath}`);
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
                node.replaceWithText(`_state["${id}"]`);
            }
        }

        return fn.getText();
    }

    // original full-file behavior (hardcoded loadHook for backward compatibility)
    const loadHooks = sharedFile.getDescendantsOfKind(SyntaxKind.CallExpression)
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

export function _getCallerFile() {
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

        const nameMatch = content.match(/^([^(]+?)\s+(.*)$/);
        if (nameMatch) {
            functionName = nameMatch[1].trim();
            locationPart = nameMatch[2].trim();
        }

        locationPart = locationPart.replace(/^\(/, '').replace(/\)$/, '');

        const parts = locationPart.split(':');
        if (parts.length < 3) continue;

        const col = parseInt(parts.pop()!, 10);
        const lineNum = parseInt(parts.pop()!, 10);
        const file = parts.join(':');

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
        ourCaller: {
            getFunctionName: () => ourCallerParsed.functionName,
        },
        targetCaller: {
            fileName: targetCallerParsed.fileName,
            line: targetCallerParsed.line,
            char: targetCallerParsed.char,
        },
    }
}

/**
 * Get a browser-ready processed version for a client-side function.
 * This finds the caller of the function that called getProcessedFunctionBody(),
 * get's the callers position, uses typescript to logically parse the function body,
 * then converts all references to state calls to be "nicer" and browser ready,
 * and then returns a .toString()'ed version of the function body.
 * 
 * NOTE: This operation is very slow for the first call to any file,
 * but afterwards the file is cached, and subsequent requests *should* be faster,
 * however typescript is of course very slow.
 */
export function getProcessedFunctionBody() {
    const { ourCaller, targetCaller, } = _getCallerFile();

    console.log(targetCaller);

    // find out what function calls body we're searching for.
    const targetFunctionName = ourCaller.getFunctionName()!;
    
    const filePath = targetCaller.fileName.startsWith("file://") ? fileURLToPath(targetCaller.fileName!) : targetCaller.fileName;

    let source: string;
    if (processedFiles.has(filePath)) {
        source = processedFiles.get(filePath)!;
    } else {
        source = readFileSync(filePath, "utf8");
        processedFiles.set(filePath, source);
    }

    const result = transformSource(source, filePath, targetFunctionName, targetCaller.line, targetCaller.char);

    return result;
}