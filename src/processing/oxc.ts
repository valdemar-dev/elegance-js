import { parseSync } from "oxc-parser";
import { ALL_TAGS } from "./taglist";
import { createHash } from "node:crypto";
import { isBuiltin } from "node:module";
import { richError } from "../error";

const ALL_TAGS_SET = new Set<string>(ALL_TAGS as readonly string[]);

export interface Edit {
    start: number;
    end: number;
    replacement: string;
}

const CHILD_KEYS: Record<string, string[]> = {
    Program:                     ["body"],
    ExpressionStatement:         ["expression"],
    BlockStatement:              ["body"],
    ReturnStatement:             ["argument"],
    IfStatement:                 ["test", "consequent", "alternate"],
    WhileStatement:              ["test", "body"],
    ForStatement:                ["init", "test", "update", "body"],
    ForInStatement:              ["left", "right", "body"],
    ForOfStatement:              ["left", "right", "body"],
    SwitchStatement:             ["discriminant", "cases"],
    SwitchCase:                  ["test", "consequent"],
    TryStatement:                ["block", "handler", "finalizer"],
    CatchClause:                 ["param", "body"],
    ThrowStatement:              ["argument"],
    LabeledStatement:            ["body"],
    VariableDeclaration:         ["declarations"],
    VariableDeclarator:          ["id", "init"],
    FunctionDeclaration:         ["id", "params", "body"],
    FunctionExpression:          ["id", "params", "body"],
    ArrowFunctionExpression:     ["params", "body"],
    ClassDeclaration:            ["id", "superClass", "body"],
    ClassExpression:             ["id", "superClass", "body"],
    ClassBody:                   ["body"],
    MethodDefinition:            ["key", "value"],
    PropertyDefinition:          ["key", "value"],
    StaticBlock:                 ["body"],
    CallExpression:              ["callee", "arguments"],
    NewExpression:               ["callee", "arguments"],
    MemberExpression:            ["object", "property"],
    StaticMemberExpression:      ["object", "property"],
    ComputedMemberExpression:    ["object", "property"],
    TaggedTemplateExpression:    ["tag", "quasi"],
    TemplateLiteral:             ["quasis", "expressions"],
    AssignmentExpression:        ["left", "right"],
    AssignmentPattern:           ["left", "right"],
    BinaryExpression:            ["left", "right"],
    LogicalExpression:           ["left", "right"],
    ConditionalExpression:       ["test", "consequent", "alternate"],
    SequenceExpression:          ["expressions"],
    UnaryExpression:             ["argument"],
    UpdateExpression:            ["argument"],
    SpreadElement:               ["argument"],
    RestElement:                 ["argument"],
    YieldExpression:             ["argument"],
    AwaitExpression:             ["argument"],
    ObjectExpression:            ["properties"],
    Property:                    ["key", "value"],
    ArrayExpression:             ["elements"],
    ArrayPattern:                ["elements"],
    ObjectPattern:               ["properties"],
    ImportDeclaration:           ["specifiers"],
    ImportSpecifier:             ["imported", "local"],
    ImportDefaultSpecifier:      ["local"],
    ImportNamespaceSpecifier:    ["local"],
    ExportNamedDeclaration:      ["declaration", "specifiers"],
    ExportDefaultDeclaration:    ["declaration"],
    ExportAllDeclaration:        ["exported"],
    ExportSpecifier:             ["local", "exported"],
    ChainExpression:             ["expression"],
    ParenthesizedExpression:     ["expression"],
    TSAsExpression:              ["expression"],
    TSSatisfiesExpression:       ["expression"],
    TSNonNullExpression:         ["expression"],
    TSTypeAssertion:             ["expression"],
    TSInstantiationExpression:   ["expression"],
};

function generateAtomId(filePath: string, index: number): string {
    const normalized = filePath.replace(/\\/g, "/");
    const str = `${normalized}::atom${index}`;
    return createHash("sha256").update(str).digest("base64url").slice(0, 7);
}

function collectPatternNames(pattern: any, cb: (name: string) => void): void {
    if (!pattern) return;
    switch (pattern.type) {
        case "Identifier":
            cb(pattern.name);
            break;
        case "ObjectPattern":
            for (const prop of pattern.properties) {
                collectPatternNames(
                    prop.type === "RestElement" ? prop.argument : prop.value,
                    cb,
                );
            }
            break;
        case "ArrayPattern":
            for (const el of pattern.elements) {
                if (el) collectPatternNames(el, cb);
            }
            break;
        case "AssignmentPattern":
            collectPatternNames(pattern.left, cb);
            break;
        case "RestElement":
            collectPatternNames(pattern.argument, cb);
            break;
    }
}

export function forEachChild(node: any, cb: (child: any) => void): void {
    const keys = CHILD_KEYS[node.type];
    if (!keys) return;
    for (const key of keys) {
        const val = node[key];
        if (!val) continue;
        if (Array.isArray(val)) {
            for (const item of val) {
                if (item && typeof item === "object" && typeof item.type === "string") cb(item);
            }
        } else if (typeof val === "object" && typeof val.type === "string") {
            cb(val);
        }
    }
}

function collectAllIdentifiers(node: any, into: Set<string>): void {
    if (!node || typeof node !== "object") return;
    if (node.type === "Identifier") {
        into.add(node.name);
        return;
    }
    if (
        (node.type === "MemberExpression" ||
         node.type === "StaticMemberExpression") &&
        !node.computed
    ) {
        collectAllIdentifiers(node.object, into);
        return;
    }
    forEachChild(node, (child) => collectAllIdentifiers(child, into));
}

function collectIdentifiersWithOffsets(node: any, into: Map<string, number>): void {
    if (!node || typeof node !== "object") return;
    if (node.type === "Identifier") {
        if (!into.has(node.name)) {
            into.set(node.name, node.start as number);
        }
        return;
    }
    if (
        (node.type === "MemberExpression" ||
         node.type === "StaticMemberExpression") &&
        !node.computed
    ) {
        collectIdentifiersWithOffsets(node.object, into);
        return;
    }
    forEachChild(node, (child) => collectIdentifiersWithOffsets(child, into));
}

function offsetToLineCol(src: string, offset: number): { line: number; col: number } {
    let line = 1, col = 1;
    const end = Math.min(offset, src.length);
    for (let i = 0; i < end; i++) {
        if (src[i] === "\n") { line++; col = 1; }
        else { col++; }
    }
    return { line, col };
}

function getSourceLine(src: string, offset: number): string {
    const lineStart = src.lastIndexOf("\n", offset - 1) + 1;
    const lineEnd = src.indexOf("\n", offset);
    return src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
}

function formatChainHop(
    src: string,
    filePath: string,
    _name: string,
    entry: { from: string; offset: number },
): string {
    const { line, col } = offsetToLineCol(src, entry.offset);
    const sourceLine = getSourceLine(src, entry.offset);
    const pipe = "    |   ";
    const caretLine = `${pipe}${" ".repeat(col - 1)}^`;
    return (
        `    at ${entry.from} (${filePath}:${line}:${col})\n` +
        `${pipe}${sourceLine}\n` +
        `${caretLine}`
    );
}

function formatReachabilityChain(
    src: string,
    filePath: string,
    name: string,
    reachableFrom: Map<string, { from: string; offset: number }>,
): string {
    const hops: Array<{ name: string; entry: { from: string; offset: number } }> = [];
    let cur = name;
    const visited = new Set<string>();
    while (reachableFrom.has(cur) && !visited.has(cur)) {
        visited.add(cur);
        const entry = reachableFrom.get(cur)!;
        hops.unshift({ name: cur, entry });
        cur = entry.from;
    }
    return hops.map(({ name: n, entry }) => formatChainHop(src, filePath, n, entry)).join("\n");
}

export function applyEdits(source: string, edits: Edit[]): string {
    if (edits.length === 0) return source;

    const sorted = [...edits].sort((a, b) => a.start - b.start);

    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].end > sorted[i + 1].start) {
            throw new Error(
                `Overlapping edits: [${sorted[i].start},${sorted[i].end}) ` +
                    `overlaps [${sorted[i + 1].start},${sorted[i + 1].end})`,
            );
        }
    }

    const parts: string[] = [];
    let cursor = 0;
    for (const e of sorted) {
        if (cursor < e.start) parts.push(source.slice(cursor, e.start));
        if (e.replacement) parts.push(e.replacement);
        cursor = e.end;
    }
    if (cursor < source.length) parts.push(source.slice(cursor));
    return parts.join("");
}

function reconstructImport(node: any, reachableSpecs: any[]): string {
    const src = node.source.value;
    const defaultSpec = reachableSpecs.find((s: any) => s.type === "ImportDefaultSpecifier");
    const nsSpec = reachableSpecs.find((s: any) => s.type === "ImportNamespaceSpecifier");
    const namedSpecs = reachableSpecs.filter((s: any) => s.type === "ImportSpecifier");

    const parts: string[] = [];

    if (defaultSpec) parts.push(defaultSpec.local.name);
    if (nsSpec) parts.push(`* as ${nsSpec.local.name}`);

    if (namedSpecs.length > 0) {
        const named = namedSpecs.map((s: any) => {
            const imp: string = s.imported.name ?? s.imported.value;

            return imp !== s.local.name ? `${imp} as ${s.local.name}` : s.local.name;
        });

        parts.push(`{ ${named.join(", ")} }`);
    }

    return `import ${parts.join(", ")} from "${src}";`;
}

function extractDeclaredNames(node: any, into: Set<string>): void {
    switch (node.type) {
        case "ImportDeclaration":
            for (const spec of node.specifiers ?? []) into.add(spec.local.name);
            break;
        case "VariableDeclaration":
            for (const decl of node.declarations) collectPatternNames(decl.id, (n) => into.add(n));
            break;
        case "FunctionDeclaration":
        case "ClassDeclaration":
            if (node.id?.name) into.add(node.id.name);
            break;
        case "ExportNamedDeclaration":
            if (node.declaration) {
                extractDeclaredNames(node.declaration, into);
            } else {
                for (const spec of node.specifiers ?? []) into.add(spec.local.name);
            }
            break;
        case "ExportDefaultDeclaration":
            if (node.declaration?.id?.name) into.add(node.declaration.id.name);
            break;
    }
}

function findContainingBodyNode(body: any[], callStart: number, callEnd: number): any | null {
    let lo = 0, hi = body.length - 1, best = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (body[mid].start <= callStart) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    if (best === -1) return null;
    const node = body[best];
    return node.end >= callEnd ? node : null;
}

function nodeContainsAnyCall(sortedCalls: any[], nodeStart: number, nodeEnd: number): boolean {
    // Find the first call whose start ≥ nodeStart.
    let lo = 0, hi = sortedCalls.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (sortedCalls[mid].start < nodeStart) lo = mid + 1;
        else hi = mid - 1;
    }
    return lo < sortedCalls.length &&
        sortedCalls[lo].start >= nodeStart &&
        sortedCalls[lo].end <= nodeEnd;
}

function findSpecialCalls(
    node: any,
    componentCalls: any[],
    atomCalls: any[],
    onPageLoadCalls: any[],
): void {
    if (!node || typeof node !== "object") return;

    if (node.type === "CallExpression" && node.callee?.type === "Identifier") {
        const name: string = node.callee.name;
        if (
            name === "component" &&
            node.arguments?.length === 1 &&
            node.arguments[0]?.type === "ObjectExpression"
        ) {
            componentCalls.push(node);
            // Keep recursing — components can be nested inside other component props.
        } else if (name === "_getAtom") {
            atomCalls.push(node);
            return; // don't descend into _getAtom arguments
        } else if (name === "onPageLoad") {
            onPageLoadCalls.push(node);
            return; // don't descend into onPageLoad arguments
        }
    }

    forEachChild(node, (child) => findSpecialCalls(child, componentCalls, atomCalls, onPageLoadCalls));
}

function applyReachabilityDCECore(
    source: string,
    ast: any,
    filePath: string,
    extraSeeds?: Set<string>,
): string {
    const body: any[] = ast.program.body;

    const bindingMap = new Map<string, any>();

    for (const node of body) {
        if (node.type === "ImportDeclaration") {
            for (const spec of node.specifiers ?? []) bindingMap.set(spec.local.name, node);
        } else if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations)
                collectPatternNames(decl.id, (name) => bindingMap.set(name, node));
        } else if (node.type === "FunctionDeclaration" && node.id) {
            bindingMap.set(node.id.name, node);
        } else if (node.type === "ClassDeclaration" && node.id) {
            bindingMap.set(node.id.name, node);
        } else if (
            node.type === "ExportDefaultDeclaration" &&
            node.declaration?.type === "FunctionDeclaration" &&
            node.declaration.id
        ) {
            bindingMap.set(node.declaration.id.name, node.declaration);
        }
    }

    const CLIENT_ENTRY_PROPS = new Set(["view", "onMount", "onUnmount", "onNavigate", "atoms"]);

    const reachable = new Set<string>();
    const reachableFrom = new Map<string, { from: string; offset: number }>();

    function addReachable(name: string, from: string, offset: number): void {
        if (!reachable.has(name)) {
            reachable.add(name);
            reachableFrom.set(name, { from, offset });
        }
    }

    const componentCalls: any[] = [];
    const atomCalls: any[] = [];
    const onPageLoadCalls: any[] = [];

    for (const node of body) {
        findSpecialCalls(node, componentCalls, atomCalls, onPageLoadCalls);
    }

    const componentCallToVar = new Map<any, string>();

    for (const call of componentCalls) {
        const node = findContainingBodyNode(body, call.start as number, call.end as number);
        if (node?.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (name) => {
                    if (!componentCallToVar.has(call)) componentCallToVar.set(call, name);
                });
            }
        }
    }

    for (const call of componentCalls) {
        const obj = call.arguments[0];
        const componentVar = componentCallToVar.get(call) ?? "unknown";
        for (const prop of obj.properties) {
            if (
                prop.type === "Property" &&
                prop.key?.type === "Identifier" &&
                CLIENT_ENTRY_PROPS.has(prop.key.name)
            ) {
                const seedRefs = new Map<string, number>();
                collectIdentifiersWithOffsets(prop.value, seedRefs);
                const seedLabel = `${componentVar} component():${prop.key.name}`;
                for (const [n, offset] of seedRefs) addReachable(n, seedLabel, offset);
            }
        }
    }

    for (const call of componentCalls) {
        const node = findContainingBodyNode(body, call.start as number, call.end as number);
        if (node?.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (name) =>
                    addReachable(name, "<component() declaration>", call.start as number),
                );
            }
        }
    }

    for (const node of body) {
        if (
            node.type === "ExportDefaultDeclaration" &&
            node.declaration?.type === "FunctionDeclaration" &&
            node.declaration.id?.name
        ) {
            addReachable(
                node.declaration.id.name,
                "<export default>",
                node.declaration.id.start as number,
            );
        }
    }

    for (const call of atomCalls) {
        const node = findContainingBodyNode(body, call.start as number, call.end as number);
        if (node?.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (name) =>
                    addReachable(name, "<_getAtom() declaration>", call.start as number),
                );
            }
        }
    }

    for (const call of onPageLoadCalls) {
        for (const arg of call.arguments ?? []) {
            const seedRefs = new Map<string, number>();
            collectIdentifiersWithOffsets(arg, seedRefs);
            for (const [n, offset] of seedRefs) addReachable(n, "<onPageLoad()>", offset);
        }
    }

    if (extraSeeds) {
        for (const name of extraSeeds) addReachable(name, "<elementHandler>", 0);
    }

    const processed = new Set<string>();
    const queue: string[] = [...reachable].filter((n) => bindingMap.has(n));

    while (queue.length > 0) {
        const name = queue.pop()!;
        if (processed.has(name)) continue;
        processed.add(name);

        const decl = bindingMap.get(name);
        if (!decl) continue;

        const refs = new Map<string, number>();
        collectIdentifiersWithOffsets(decl, refs);

        for (const [ref, offset] of refs) {
            if (!reachable.has(ref)) {
                addReachable(ref, name, offset);
                if (bindingMap.has(ref)) queue.push(ref);
            }
        }
    }

    // !no-bundle guard: throw if any server-only declaration was reached.
    {
        const programComments = ast.comments ?? [];
        const noBundleViolations: { name: string; chain: string }[] = [];

        for (const comment of programComments) {
            if (comment.type !== "Line") continue;
            if ((comment.value as string).trim() !== "!no-bundle") continue;

            const afterComment = comment.end as number;
            const annotatedNode = body.find((n: any) => n.start >= afterComment);
            if (!annotatedNode) continue;

            const annotatedNames = new Set<string>();
            extractDeclaredNames(annotatedNode, annotatedNames);

            for (const name of annotatedNames) {
                if (reachable.has(name)) {
                    noBundleViolations.push({
                        name,
                        chain: formatReachabilityChain(source, filePath, name, reachableFrom),
                    });
                }
            }
        }

        if (noBundleViolations.length > 0) {
            const list = noBundleViolations
                .map(({ name, chain }) => `  • ${name}\n${chain}`)
                .join("\n\n");

            throw richError({
                title: "Server Only Error",
                cause: `\\The following declarations are marked server-only ` +
                    `but were reached by the client bundle:` +
                    `${list}\n\n` +
                    `The inclusion of server-only variables in client-side code is almost always unintentional.`,

                hint: `\\If these are references you did not intend to mark server-only, you can remove the //!no-bundle flag above their declarations.\n` +
                    `If that is not the case, remove the reference that cause their inclusion.`,
                doShowStack: false,
            })
        }
    }

    const removalEdits: Edit[] = [];

    function trailingEnd(end: number): number {
        return end < source.length && source[end] === "\n" ? end + 1 : end;
    }

    for (const node of body) {
        if (node.type === "ImportDeclaration") {
            const specs: any[] = node.specifiers ?? [];
            const reachableSpecs = specs.filter((s) => reachable.has(s.local.name));

            if (reachableSpecs.length === specs.length) {
                if (specs.length === 0 && isBuiltin(node.source.value as string)) {
                    removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
                }
                continue;
            }

            if (reachableSpecs.length === 0) {
                removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
            } else {
                removalEdits.push({
                    start: node.start,
                    end: node.end,
                    replacement: reconstructImport(node, reachableSpecs),
                });
            }
        } else if (node.type === "VariableDeclaration") {
            const names: string[] = [];
            
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (n) => names.push(n));
            }

            if (names.length > 0 && names.every((n) => !reachable.has(n))) {
                removalEdits.push({ 
                    start: node.start, 
                    end: trailingEnd(node.end), 
                    replacement: "",
                });
            }
        } else if (
            (node.type === "FunctionDeclaration" && node.id && !reachable.has(node.id.name)) ||
            (node.type === "ClassDeclaration" && node.id && !reachable.has(node.id.name))
        ) {
            removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
        } else if (node.type === "ExpressionStatement") {
            const containsComponentCall = nodeContainsAnyCall(componentCalls, node.start, node.end);
            const containsOnPageLoadCall = nodeContainsAnyCall(onPageLoadCalls, node.start, node.end);

            if (!containsComponentCall && !containsOnPageLoadCall) {
                removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
            }
        } else if (node.type === "ExportNamedDeclaration") {
            if (node.declaration) {
                const decl = node.declaration;
                if (decl.type === "VariableDeclaration") {
                    const names: string[] = [];
                    for (const d of decl.declarations)
                        collectPatternNames(d.id, (n) => names.push(n));
                    if (names.length > 0 && names.every((n) => !reachable.has(n))) {
                        removalEdits.push({
                            start: node.start,
                            end: trailingEnd(node.end),
                            replacement: "",
                        });
                    }
                } else if (
                    (decl.type === "FunctionDeclaration" || decl.type === "ClassDeclaration") &&
                    decl.id &&
                    !reachable.has(decl.id.name)
                ) {
                    removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
                }
            } else {
                const specs: any[] = node.specifiers ?? [];
                if (specs.length > 0 && specs.every((s: any) => !reachable.has(s.local.name))) {
                    removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
                }
            }
        } else if (node.type === "ExportDefaultDeclaration") {
            const decl = node.declaration;
            const id: string | undefined = decl?.id?.name;
            if (!id || !reachable.has(id)) {
                removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
            }
        }
    }

    return applyEdits(source, removalEdits);
}

function collectTransformEdits(
    source: string,
    ast: any,
    filePath: string,
): { sharedEdits: Edit[]; serverOnlyEdits: Edit[]; clientOnlyEdits: Edit[] } {
    const sharedEdits:     Edit[] = [];
    const serverOnlyEdits: Edit[] = [];
    const clientOnlyEdits: Edit[] = [];

    // Build a sorted list of (offset to sourcePath) from bundler-emitted path comments,
    // e.g. "// pages/actions/lib.ts" injected before each module in a bundle.
    // This keeps ids hashed against the *declaring* module path rather than the
    // bundle/chunk file path, so server and client pipelines always agree.
    const sourcePathMarkers: Array<{ offset: number; path: string }> =
        ((ast.comments ?? []) as any[])
            .filter((c) => c.type === "Line" && /^[\w./@-][^\s]*\.[a-z]+$/i.test((c.value as string).trim()))
            .map((c) => ({ offset: c.start as number, path: (c.value as string).trim() }))
            .sort((a, b) => a.offset - b.offset);

    function sourcePathAt(nodeStart: number): string {
        let result = filePath;
        for (const marker of sourcePathMarkers) {
            if (marker.offset <= nodeStart) result = marker.path;
            else break;
        }
        return result;
    }

    const callIndexByPath = new Map<string, number>();
    function nextCallIndex(path: string): number {
        const i = callIndexByPath.get(path) ?? 0;
        callIndexByPath.set(path, i + 1);
        return i;
    }

    let eidCounter = 0;

    function visitNode(node: any, componentDepth: number): void {
        if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === "atom" &&
            node.arguments.length >= 1
        ) {
            const sourcePath = sourcePathAt(node.start as number);
            const atomId   = generateAtomId(sourcePath, nextCallIndex(sourcePath));
            const argStart = node.arguments[0].start;
            serverOnlyEdits.push({ start: argStart, end: argStart, replacement: `"${atomId}", ` });
            clientOnlyEdits.push({ start: node.start, end: node.end, replacement: `_getAtom("${atomId}")` });
        }

        if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === "component" &&
            node.arguments.length === 1 &&
            node.arguments[0].type === "ObjectExpression"
        ) {
            const sourcePath = sourcePathAt(node.start as number);
            const id       = generateAtomId(sourcePath, nextCallIndex(sourcePath));
            const obj      = node.arguments[0];
            const insertAt = obj.start + 1;
            sharedEdits.push({ start: insertAt, end: insertAt, replacement: ` __id: "${id}",` });

            for (const prop of obj.properties) {
                if (
                    prop.type === "Property" &&
                    prop.key?.type === "Identifier" &&
                    prop.key.name === "init"
                ) {
                    let end = prop.end as number;
                    let i   = end;

                    while (
                        i < source.length &&
                        (source[i] === "," || source[i] === " " || source[i] === "\t" || source[i] === "\n")
                    ) {
                        if (source[i] === ",") { end = i + 1; break; }
                        i++;
                    }

                    clientOnlyEdits.push({ start: prop.start, end, replacement: "" });
                }
            }

            forEachChild(node, (child) => visitNode(child, componentDepth + 1));
            return;
        }

        if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === "serverAction" &&
            node.arguments.length === 1 &&
            node.arguments[0].type === "ObjectExpression"
        ) {
            const sourcePath = sourcePathAt(node.start as number);
            const id       = generateAtomId(sourcePath, nextCallIndex(sourcePath));
            const obj      = node.arguments[0];
            const insertAt = obj.start + 1;
            sharedEdits.push({ start: insertAt, end: insertAt, replacement: ` id: "${id}",` });
            return;
        }

        if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            ALL_TAGS_SET.has(node.callee.name) &&
            !["atom", "view", "component"].includes(node.callee.name)
        ) {
            sharedEdits.push({
                start:       node.callee.start,
                end:         node.callee.end,
                replacement: `__tags.${node.callee.name}`,
            });

            if (
                componentDepth === 0 &&
                node.arguments.length >= 1 &&
                node.arguments[0].type === "ObjectExpression"
            ) {
                const optionsObj = node.arguments[0];
                const hasHandler = optionsObj.properties.some((prop: any) => {
                    const key =
                        prop.key?.type === "Identifier" ? prop.key.name :
                        prop.key?.type === "Literal"    ? String(prop.key.value) : "";
                    return key.startsWith("on");
                });
                if (hasHandler) {
                    const eid = eidCounter++;
                    sharedEdits.push({
                        start:       optionsObj.start + 1,
                        end:         optionsObj.start + 1,
                        replacement: ` __eid: ${eid},`,
                    });
                }
            }
        }

        forEachChild(node, (child) => visitNode(child, componentDepth));
    }

    visitNode(ast.program, 0);

    return { sharedEdits, serverOnlyEdits, clientOnlyEdits };
}

export function transformBundle(
    source: string,
    filePath: string,
): { serverCode: string; preClientCode: string } {
    const ast = parseSync(filePath, source, { sourceType: "module" });
    const { sharedEdits, serverOnlyEdits, clientOnlyEdits } = collectTransformEdits(source, ast, filePath);

    const serverCode    = applyEdits(source, [...sharedEdits, ...serverOnlyEdits]);
    const preClientCode = applyEdits(source, [...sharedEdits, ...clientOnlyEdits]);

    return { serverCode, preClientCode };
}

export function transformChunk(source: string, filePath: string): string {
    const ast = parseSync(filePath, source, { sourceType: "module" });
    const { sharedEdits, clientOnlyEdits } = collectTransformEdits(source, ast, filePath);

    return applyEdits(source, [...sharedEdits, ...clientOnlyEdits]);
}

export function serializePropValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    if (typeof value === "boolean") return String(value);
    if (typeof value === "number") return isFinite(value) ? String(value) : "undefined";
    if (typeof value === "string") return JSON.stringify(value);
    
    if (typeof value === "function") {
        const name = (value as Function).name;
        return name ? name : "undefined";
    }
    if (Array.isArray(value)) {
        return `[${(value as unknown[]).map(serializePropValue).join(", ")}]`;
    }
    if (typeof value === "object") {
        const obj = value as any;
        if (typeof obj.id === "string" && "value" in obj) {
            return `_getAtom(${JSON.stringify(obj.id)}, ${serializePropValue(obj.value)})`;
        }
        const entries = Object.entries(value as Record<string, unknown>).map(
            ([k, v]) => `${JSON.stringify(k)}: ${serializePropValue(v)}`,
        );
        return `{ ${entries.join(", ")} }`;
    }
    return "undefined";
}

function propsComparisonKey(props: Record<string, unknown> | undefined): string {
    if (!props || Object.keys(props).length === 0) return "";
    return Object.entries(props)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => {
            if (typeof v === "function") return `${k}=fn:${(v as Function).name ?? ""}`;
            return `${k}=${JSON.stringify(v)}`;
        })
        .join(",");
}

function serializePropsRecord(props: Record<string, unknown> | undefined): string {
    if (!props || Object.keys(props).length === 0) return "{}";
    const entries = Object.entries(props)
        .map(([k, v]) => `${JSON.stringify(k)}: ${serializePropValue(v)}`);
    return `{ ${entries.join(", ")} }`;
}

function generateRegionsExpression(
    regions: Array<any[]>,
): { declarations: string; expression: string } {
    const keyToVar = new Map<string, string>();
    const keyToCode = new Map<string, string>();
    let varCounter = 0;

    const regionKeys: string[][] = regions.map((descs) =>
        descs.map((desc) => {
            const props = desc.props as Record<string, unknown> | undefined;
            const key = propsComparisonKey(props);
            if (!keyToVar.has(key)) {
                keyToVar.set(key, `_p${varCounter++}`);
                keyToCode.set(key, serializePropsRecord(props));
            }
            return key;
        }),
    );

    const declarations = [...keyToVar.entries()]
        .map(([key, varName]) => `    const ${varName} = ${keyToCode.get(key)};`)
        .join("\n");

    type RLEEntry = { cid: string; propsKey: string; count: number };

    const regionParts = regions.map((descs, ri) => {
        const keys = regionKeys[ri];
        const rle: RLEEntry[] = [];

        for (let i = 0; i < descs.length; i++) {
            const cid = descs[i].__componentId as string;
            const propsKey = keys[i]; // cached

            const last = rle[rle.length - 1];
            if (last && last.cid === cid && last.propsKey === propsKey) {
                last.count++;
            } else {
                rle.push({ cid, propsKey, count: 1 });
            }
        }

        const parts = rle.map(({ cid, propsKey, count }) =>
            `{ __cid: ${JSON.stringify(cid)}, props: ${keyToVar.get(propsKey)}, count: ${count} }`,
        );
        return `[${parts.join(", ")}]`;
    });

    return { declarations, expression: `[${regionParts.join(", ")}]` };
}

/**
 * Extracted handler record derived purely from pre-client source text.
 * All identifiers are already the correct (possibly minified) client-side names.
 */
interface ExtractedHandlerSet {
    eid: number;
    handlers: Array<{ event: string; fnSource: string }>;
}

interface ExtractedHandlers {
    handlerSets: ExtractedHandlerSet[];
    /** All identifiers referenced inside handler functions — used as DCE seeds. */
    seeds: Set<string>;
}

/**
 * Walk the pre-client AST and extract, in traversal order, all `__tags.TAG({on*: fn})`
 * calls that occur outside any component() definition which then mirrors the exact logic in
 * page-builder.ts's renderElement / insideComponentDepth guard.
 *
 * The traversal order matches server render order, so eid assignment is identical.
 * Because we work from the pre-client source, all identifiers are already the correct
 */
function extractElementHandlersFromAst(
    preClientCode: string,
    ast: any,
): ExtractedHandlers {
    const handlerSets: ExtractedHandlerSet[] = [];
    const seeds = new Set<string>();

    let eidCounter = 0;

    function src(node: any): string {
        return preClientCode.slice(node.start as number, node.end as number);
    }

    function walkNode(node: any, insideComponentDepth: number): void {
        if (!node || typeof node !== "object" || typeof node.type !== "string") return;

        if (
            node.type === "CallExpression" &&
            node.callee?.type === "Identifier" &&
            node.callee.name === "component" &&
            node.arguments?.length === 1 &&
            node.arguments[0]?.type === "ObjectExpression"
        ) {
            walkNode(node.arguments[0], insideComponentDepth + 1);
            return;
        }

        if (
            node.type === "CallExpression" &&
            (node.callee?.type === "StaticMemberExpression" ||
             node.callee?.type === "MemberExpression") &&
            node.callee.object?.type === "Identifier" &&
            node.callee.object.name === "__tags" &&
            node.arguments?.length >= 1 &&
            node.arguments[0]?.type === "ObjectExpression"
        ) {
            if (insideComponentDepth === 0) {
                const optionsObj = node.arguments[0];
                const onProps: Array<{ event: string; fnSource: string }> = [];

                for (const prop of optionsObj.properties ?? []) {
                    if (
                        prop.type !== "Property" &&
                        prop.type !== "ObjectProperty"
                    ) continue;

                    const keyName: string =
                        prop.key?.type === "Identifier" ? prop.key.name :
                        prop.key?.type === "StringLiteral" ? prop.key.value :
                        prop.key?.type === "Literal" ? String(prop.key.value) :
                        "";

                    if (!keyName.startsWith("on")) continue;

                    const val = prop.value ?? prop;
                    if (
                        val.type !== "ArrowFunctionExpression" &&
                        val.type !== "FunctionExpression" &&
                        val.type !== "Identifier"
                    ) continue;

                    // Collect all identifiers from the handler node as DCE seeds.
                    // These are already correct client-side (possibly minified) names.
                    collectAllIdentifiers(val, seeds);

                    onProps.push({
                        event: keyName.slice(2).toLowerCase(),
                        fnSource: src(val),
                    });
                }

                if (onProps.length > 0) {
                    handlerSets.push({ eid: eidCounter++, handlers: onProps });
                }
            }

            for (let i = 1; i < node.arguments.length; i++) {
                walkNode(node.arguments[i], insideComponentDepth);
            }

            for (const prop of (node.arguments[0]?.properties ?? [])) {
                const keyName: string =
                    prop.key?.type === "Identifier" ? prop.key.name :
                    prop.key?.type === "StringLiteral" ? prop.key.value :
                    prop.key?.type === "Literal" ? String(prop.key.value) :
                    "";
                if (!keyName.startsWith("on")) {
                    walkNode(prop.value ?? prop, insideComponentDepth);
                }
            }
            return;
        }

        forEachChild(node, (child) => walkNode(child, insideComponentDepth));
    }

    walkNode(ast.program, 0);
    return { handlerSets, seeds };
}

function generateHandlersExpression(
    elementHandlers: ExtractedHandlerSet[],
    seeds: Set<string>,
): { declarations: string; expression: string; seeds: Set<string> } {
    if (!elementHandlers || elementHandlers.length === 0) {
        return { declarations: "", expression: "[]", seeds: new Set() };
    }

    function handlerSetKey(handlers: ExtractedHandlerSet["handlers"]): string {
        return handlers.map(({ event, fnSource }) => `${event}:\x00${fnSource}`).join("\x01");
    }

    function serializeHandlerSet(handlers: ExtractedHandlerSet["handlers"]): string {
        const entries = handlers.map(({ event, fnSource }) =>
            `{ event: ${JSON.stringify(event)}, fn: ${fnSource} }`
        );
        return `[${entries.join(", ")}]`;
    }

    const keyToVar = new Map<string, string>();
    const keyToCode = new Map<string, string>();
    let hCounter = 0;

    for (const { handlers } of elementHandlers) {
        const key = handlerSetKey(handlers);
        if (!keyToVar.has(key)) {
            keyToVar.set(key, `_h${hCounter++}`);
            keyToCode.set(key, serializeHandlerSet(handlers));
        }
    }

    const declarations = [...keyToVar.entries()]
        .map(([key, varName]) => `    const ${varName} = ${keyToCode.get(key)};`)
        .join("\n");

    const parts = elementHandlers.map(({ eid, handlers }) => {
        const varName = keyToVar.get(handlerSetKey(handlers))!;
        return `{ eid: ${eid}, h: ${varName} }`;
    });

    return { declarations, expression: `[${parts.join(", ")}]`, seeds };
}

function applyServerActionCallReplacements(source: string, ast: any): string {
    const varToId = new Map<string, string>();

    for (const node of ast.program.body as any[]) {
        if (node.type !== "VariableDeclaration") continue;

        for (const decl of node.declarations) {
            const init = decl.init;
            if (
                init?.type !== "CallExpression" ||
                init.callee?.type !== "Identifier" ||
                init.callee.name !== "serverAction" ||
                init.arguments?.length !== 1 ||
                init.arguments[0]?.type !== "ObjectExpression"
            ) continue;
            for (const prop of init.arguments[0].properties as any[]) {
                if (
                    prop.type === "Property" &&
                    prop.key?.type === "Identifier" &&
                    prop.key.name === "id" &&
                    prop.value?.type === "Literal" &&
                    typeof prop.value.value === "string"
                ) {
                    collectPatternNames(decl.id, (name) => {
                        if (!varToId.has(name)) varToId.set(name, prop.value.value as string);
                    });
                    break;
                }
            }
        }
    }

    if (varToId.size === 0) return source;

    const edits: Edit[] = [];
    function visit(node: any): void {
        if (
            node.type === "CallExpression" &&
            node.callee?.type === "Identifier" &&
            varToId.has(node.callee.name)
        ) {
            const id = varToId.get(node.callee.name)!;
            const args: any[] = node.arguments ?? [];
            const argsStr =
                args.length > 0
                    ? ", " + source.slice(args[0].start as number, args[args.length - 1].end as number)
                    : "";
            edits.push({
                start: node.start as number,
                end: node.end as number,
                replacement: `_action("${id}"${argsStr})`,
            });
            return;
        }
        forEachChild(node, visit);
    }
    visit(ast.program);

    return applyEdits(source, edits);
}
export function generateLayoutBundle(
    preClientCode: string,
    filePath: string,
): string {
    let ast: any;
    try {
        ast = parseSync(filePath, preClientCode, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse layout module", e);
        return preClientCode;
    }

    const { handlerSets, seeds } = extractElementHandlersFromAst(preClientCode, ast);
    const { declarations: handlerDecls, expression: handlersExpr, seeds: handlerSeeds } =
        generateHandlersExpression(handlerSets, seeds);

    let defaultStart = -1;
    let defaultEnd   = -1;
    for (const node of ast.program.body as any[]) {
        if (node.type === "ExportDefaultDeclaration") {
            defaultStart = node.start as number;
            defaultEnd   = node.end   as number;
        }
    }

    const replaced = applyServerActionCallReplacements(preClientCode, ast);

    const withoutDefault =
        defaultStart >= 0
            ? replaced.slice(0, defaultStart) + replaced.slice(defaultEnd)
            : replaced;

    const syntheticFn = `
export default function __constructor() {
${handlerDecls}
    const regions  = [];
    const handlers = ${handlersExpr};
    return { regions, handlers };
}
`;

    const finalSource = withoutDefault + syntheticFn;

    let dceAst: any;
    try {
        dceAst = parseSync(filePath, finalSource, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse modified layout bundle", e);
        return finalSource;
    }

    return applyReachabilityDCECore(finalSource, dceAst, filePath, handlerSeeds);
}

/**
 * The parts of a synthetic bundle that depend only on `preClientCode` and
 * `layoutCacheKeys`. both of which are fixed between builds. Caching these
 * eliminates the first `parseSync` call and all downstream pure work on every
 * warm request, leaving only `generateRegionsExpression(regions)` (which varies
 * per request) and the second `parseSync` + DCE pass (which must see the final
 * assembled source) as the per-request work.
 */
interface SyntheticBundleStaticParts {
    withoutDefault:  string;
    handlerDecls:    string;
    handlersExpr:    string;
    handlerSeeds:    Set<string>;
    layoutImports:   string;
    layoutCalls:     string;
    mergedRegions:   string;
    mergedHandlers:  string;
    filePath:        string;
}

const syntheticBundleStaticCache = new Map<string, SyntheticBundleStaticParts>();
const SYNTHETIC_BUNDLE_CACHE_MAX = 256;

function syntheticBundleCacheKey(preClientCode: string, layoutCacheKeys: string[]): string {
    return preClientCode + "\x00" + layoutCacheKeys.join(",");
}

function computeSyntheticBundleStaticParts(
    preClientCode:   string,
    filePath:        string,
    layoutCacheKeys: string[],
): SyntheticBundleStaticParts | null {
    let ast: any;
    try {
        ast = parseSync(filePath, preClientCode, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse a module", e);
        return null;
    }

    const { handlerSets, seeds } = extractElementHandlersFromAst(preClientCode, ast);
    const { declarations: handlerDecls, expression: handlersExpr, seeds: handlerSeeds } =
        generateHandlersExpression(handlerSets, seeds);

    let defaultStart = -1;
    let defaultEnd   = -1;
    for (const node of ast.program.body as any[]) {
        if (node.type === "ExportDefaultDeclaration") {
            defaultStart = node.start as number;
            defaultEnd   = node.end   as number;
        }
    }

    const replaced = applyServerActionCallReplacements(preClientCode, ast);

    const withoutDefault =
        defaultStart >= 0
            ? replaced.slice(0, defaultStart) + replaced.slice(defaultEnd)
            : replaced;

    const layoutImports = layoutCacheKeys
        .map((lk, i) => `import { default as __l${i} } from "/chunks/${lk}.client.mjs";`)
        .join("\n");

    const layoutCalls = layoutCacheKeys
        .map((_, i) => `    const _l${i} = __l${i}();`)
        .join("\n");

    const regionsSpread  = layoutCacheKeys.map((_, i) => `..._l${i}.regions`).join(", ");
    const handlersSpread = layoutCacheKeys.map((_, i) => `..._l${i}.handlers`).join(", ");

    const mergedRegions  = regionsSpread  ? `[${regionsSpread},  ...regions]`  : `regions`;
    const mergedHandlers = handlersSpread ? `[${handlersSpread}, ...handlers]` : `handlers`;

    return {
        withoutDefault,
        handlerDecls,
        handlersExpr,
        handlerSeeds,
        layoutImports,
        layoutCalls,
        mergedRegions,
        mergedHandlers,
        filePath,
    };
}

function getOrComputeStaticParts(
    preClientCode:   string,
    filePath:        string,
    layoutCacheKeys: string[],
): SyntheticBundleStaticParts | null {
    const key = syntheticBundleCacheKey(preClientCode, layoutCacheKeys);

    const cached = syntheticBundleStaticCache.get(key);
    if (cached !== undefined) {
        if (cached.filePath === filePath) return cached;
    }

    const parts = computeSyntheticBundleStaticParts(preClientCode, filePath, layoutCacheKeys);
    if (parts === null) return null;

    if (syntheticBundleStaticCache.size >= SYNTHETIC_BUNDLE_CACHE_MAX) {
        syntheticBundleStaticCache.delete(syntheticBundleStaticCache.keys().next().value!);
    }
    syntheticBundleStaticCache.set(key, parts);

    return parts;
}

export function invalidateSyntheticBundleCache(
    preClientCode:   string,
    layoutCacheKeys: string[],
): void {
    syntheticBundleStaticCache.delete(syntheticBundleCacheKey(preClientCode, layoutCacheKeys));
}

export function generateSyntheticBundle(
    preClientCode: string,
    filePath: string,
    regions: Array<any[]>,
    layoutCacheKeys: string[],
): string {
    const { declarations: propsDecls, expression: regionsExpr } =
        generateRegionsExpression(regions);

    const staticParts = getOrComputeStaticParts(preClientCode, filePath, layoutCacheKeys);

    if (staticParts === null) return preClientCode;

    const {
        withoutDefault,
        handlerDecls,
        handlersExpr,
        handlerSeeds,
        layoutImports,
        layoutCalls,
        mergedRegions,
        mergedHandlers,
    } = staticParts;

    const syntheticFn = `
export default function __constructor() {
${propsDecls}
${handlerDecls}
${layoutCalls}
    const regions  = ${regionsExpr};
    const handlers = ${handlersExpr};
    return { regions: ${mergedRegions}, handlers: ${mergedHandlers} };
}
`;

    const importSection = layoutImports ? layoutImports + "\n" : "";
    const finalSource   = importSection + withoutDefault + syntheticFn;

    let dceAst: any;
    try {
        dceAst = parseSync(filePath, finalSource, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse modified bundle", e);
        return finalSource;
    }

    return applyReachabilityDCECore(finalSource, dceAst, filePath, handlerSeeds);
}