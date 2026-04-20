import { readFileSync } from "fs";
import * as ts from "typescript";
import { fileURLToPath } from "url";
import { makeId } from "./compiler";

const fileTsSourceFiles = new Map<string, ts.SourceFile>();
const fileStateSymbolToId = new Map<string, Map<string, string>>();
const fileProcessedBodies = new Map<string, Map<string, string>>();

const processedFiles = new Map<string, string>();

function createReplacementVisitor(
    stateSymbolToId: Map<string, string>,
    context: ts.TransformationContext
) {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
        if (ts.isIdentifier(node)) {
            const parent = node.parent;
            if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
                return node;
            }

            const id = stateSymbolToId.get(node.text);
            if (id) {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("_s"),
                        ts.factory.createIdentifier("get")
                    ),
                    undefined,
                    [ts.factory.createStringLiteral(id)]
                );
            }
        }
        return ts.visitEachChild(node, visit, context);
    };
    return visit;
}

function getStateIdFromExpr(
    expr: ts.Node | undefined,
    stateSymbolToId: Map<string, string>,
    functionReturnStateId: Map<string, string | undefined>
): string | undefined {
    if (!expr) return undefined;

    if (ts.isIdentifier(expr)) return stateSymbolToId.get(expr.text);
    if (ts.isCallExpression(expr)) {
        const callee = expr.expression;
        if (ts.isIdentifier(callee)) return functionReturnStateId.get(callee.text);
        return undefined;
    }
    if (ts.isConditionalExpression(expr)) {
        return getStateIdFromExpr(expr.whenTrue, stateSymbolToId, functionReturnStateId)
            ?? getStateIdFromExpr(expr.whenFalse, stateSymbolToId, functionReturnStateId);
    }
    if (ts.isParenthesizedExpression(expr)) {
        return getStateIdFromExpr(expr.expression, stateSymbolToId, functionReturnStateId);
    }
    if (ts.isNonNullExpression(expr)) {
        return getStateIdFromExpr(expr.expression, stateSymbolToId, functionReturnStateId);
    }
    if (ts.isTypeAssertionExpression(expr) || (ts.isAsExpression && ts.isAsExpression(expr))) {
        return getStateIdFromExpr(expr.expression, stateSymbolToId, functionReturnStateId);
    }
    if (ts.isBinaryExpression(expr)) {
        const op = expr.operatorToken.kind;
        if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
            return getStateIdFromExpr(expr.left, stateSymbolToId, functionReturnStateId)
                ?? getStateIdFromExpr(expr.right, stateSymbolToId, functionReturnStateId);
        }
    }
    return undefined;
}

function getReturnStateId(
    fnNode: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction,
    stateSymbolToId: Map<string, string>,
    functionReturnStateId: Map<string, string | undefined>,
    sourceFile: ts.SourceFile
): string | undefined {
    let foundId: string | undefined = undefined;
    const visit = (node: ts.Node): void => {
        if (foundId !== undefined) return;
        if (ts.isReturnStatement(node)) {
            const expr = node.expression;
            if (expr) foundId = getStateIdFromExpr(expr, stateSymbolToId, functionReturnStateId);
        }
        ts.forEachChild(node, visit);
    };
    if (fnNode.body) {
        if (ts.isBlock(fnNode.body)) visit(fnNode.body);
        else foundId = getStateIdFromExpr(fnNode.body, stateSymbolToId, functionReturnStateId);
    }
    return foundId;
}

export function transformSource(
    source: string,
    filePath = "input.ts",
    targetFunctionName?: string,
    targetLine?: number,
    targetChar?: number
): string {
    let justCreated = false;

    if (!fileTsSourceFiles.has(filePath)) {
        const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
        fileTsSourceFiles.set(filePath, sourceFile);
        justCreated = true;
    }

    const sourceFile = fileTsSourceFiles.get(filePath)!;

    if (justCreated) {
        const stateSymbolToId = new Map<string, string>();
        const functionReturnStateId = new Map<string, string | undefined>();

        let iterations = 0;
        const MAX_ITER = 50;

        const doOnePass = (): boolean => {
            let changed = false;
            const visit = (node: ts.Node): void => {
                if (ts.isVariableDeclaration(node)) {
                    const init = node.initializer;
                    const nameNode = node.name;
                    if (ts.isIdentifier(nameNode)) {
                        const name = nameNode.text;
                        let sourceId: string | undefined;

                        if (init) {
                            if (ts.isCallExpression(init)) {
                                const callee = init.expression;
                                if (ts.isIdentifier(callee)) {
                                    if (callee.text === "state") {
                                        const pos = init.getStart(sourceFile);
                                        const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
                                        sourceId = makeId(filePath, line + 1, character + 1);
                                    } else {
                                        sourceId = functionReturnStateId.get(callee.text);
                                    }
                                }
                            } else if (ts.isIdentifier(init)) {
                                sourceId = stateSymbolToId.get(init.text);
                            } else {
                                sourceId = getStateIdFromExpr(init, stateSymbolToId, functionReturnStateId);
                            }
                        }

                        if (sourceId !== undefined && stateSymbolToId.get(name) !== sourceId) {
                            stateSymbolToId.set(name, sourceId);
                            changed = true;
                        }
                    }
                } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                    const left = node.left;
                    const right = node.right;
                    if (ts.isIdentifier(left)) {
                        let sourceId: string | undefined;
                        if (ts.isIdentifier(right)) sourceId = stateSymbolToId.get(right.text);
                        else if (ts.isCallExpression(right)) {
                            const callee = right.expression;
                            if (ts.isIdentifier(callee)) sourceId = functionReturnStateId.get(callee.text);
                        } else {
                            sourceId = getStateIdFromExpr(right, stateSymbolToId, functionReturnStateId);
                        }
                        if (sourceId !== undefined && stateSymbolToId.get(left.text) !== sourceId) {
                            stateSymbolToId.set(left.text, sourceId);
                            changed = true;
                        }
                    }
                } else if (
                    ts.isFunctionDeclaration(node) ||
                    ts.isFunctionExpression(node) ||
                    ts.isArrowFunction(node)
                ) {
                    let funcName: string | undefined;
                    if (ts.isFunctionDeclaration(node) && node.name) funcName = node.name.text;
                    else if (ts.isFunctionExpression(node) && node.name) funcName = node.name.text;

                    if (funcName) {
                        const returnId = getReturnStateId(node, stateSymbolToId, functionReturnStateId, sourceFile);
                        if (returnId !== undefined && functionReturnStateId.get(funcName) !== returnId) {
                            functionReturnStateId.set(funcName, returnId);
                            changed = true;
                        }
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sourceFile);
            return changed;
        };

        let changed = true;
        while (changed && iterations < MAX_ITER) {
            changed = doOnePass();
            iterations++;
        }
        if (iterations >= MAX_ITER) {
            console.warn(`[elegance-js] Warning: state analysis did not stabilize after ${MAX_ITER} iterations in ${filePath}`);
        }

        fileStateSymbolToId.set(filePath, stateSymbolToId);

        // ==================== SINGLE FULL-FILE TRANSFORM (shared visitor) ====================
        const processedBodies = new Map<string, string>();
        fileProcessedBodies.set(filePath, processedBodies);

        const mainTransformer = (ctx: ts.TransformationContext) => {
            const replacementVisit = createReplacementVisitor(stateSymbolToId, ctx);

            const visit: ts.Visitor = (node: ts.Node): ts.Node => {
                if (ts.isCallExpression(node)) {
                    const expr = node.expression;
                    if (ts.isIdentifier(expr) && expr.text === "loadHook") {
                        const arg = node.arguments[0];
                        if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                            const startPos = node.getStart(sourceFile);
                            const { line } = sourceFile.getLineAndCharacterOfPosition(startPos);
                            const key = `loadHook:${line + 1}`;

                            const processedFn = ts.visitNode(arg, replacementVisit) as ts.ArrowFunction | ts.FunctionExpression;

                            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
                            const processedText = printer.printNode(ts.EmitHint.Unspecified, processedFn, sourceFile);
                            processedBodies.set(key, processedText);

                            return ts.factory.updateCallExpression(
                                node,
                                expr,
                                node.typeArguments,
                                [processedFn, ...node.arguments.slice(1)]
                            );
                        }
                    }
                }
                return ts.visitEachChild(node, visit, ctx);
            };

            return (node: ts.Node) => ts.visitNode(node, visit);
        };

        ts.transform(sourceFile, [mainTransformer as any]);
    }

    if (targetFunctionName !== undefined && targetLine !== undefined) {
        const key = `${targetFunctionName}:${targetLine}`;
        const bodies = fileProcessedBodies.get(filePath);
        if (bodies?.has(key)) return bodies.get(key)!;

        throw new Error(`Could not find call to ${targetFunctionName} at line ${targetLine} in ${filePath}`);
    }

    // backwards compatibility
    return source;
}

export function getCallerFile() {
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

        callSites.push({ functionName, fileName, line: lineNum, char: col });
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

export function getProcessedFunctionBody() {
    const { ourCaller, targetCaller } = getCallerFile();
    const targetFunctionName = ourCaller.functionName;
    const filePath = targetCaller.fileName;

    let source: string;
    if (processedFiles.has(filePath)) {
        source = processedFiles.get(filePath)!;
    } else {
        source = readFileSync(filePath, "utf8");
        processedFiles.set(filePath, source);
    }

    return transformSource(source, filePath, targetFunctionName, targetCaller.line, targetCaller.char);
}