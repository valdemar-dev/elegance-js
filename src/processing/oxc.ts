import { parseSync } from "oxc-parser";
import { ALL_TAGS } from "./taglist";
import { createHash } from "node:crypto";
import { richError } from "../error";
import { join } from "node:path";
import { readFileSync, statSync } from "node:fs";
import { DIST_DIR } from "../constants";

const ALL_TAGS_SET = new Set<string>(ALL_TAGS as readonly string[]);

export function globMatch(pattern: string, path: string): boolean {
    const p = pattern.replace(/\\/g, "/");
    const t = path.replace(/\\/g, "/");
    let re = "";
    let i = 0;
    while (i < p.length) {
        const c = p[i]!;
        if (c === "*") {
            if (p[i + 1] === "*") {
                if (p[i + 2] === "/") {
                    re += "(?:.*/)?";
                    i += 3;
                } else {
                    re += ".*";
                    i += 2;
                }
                continue;
            }
            re += "[^/]*";
            i++;
            continue;
        }
        if (c === "?") {
            re += "[^/]";
            i++;
            continue;
        }
        if (c === "[") {
            const close = p.indexOf("]", i + 1);
            if (close !== -1) {
                re += p.slice(i, close + 1);
                i = close + 1;
                continue;
            }
        }
        re += /[.+^${}()|\\]/.test(c) ? "\\" + c : c;
        i++;
    }
    return new RegExp(`^${re}$`).test(t);
}

export interface SourcePathMarker {
    offset: number;
    path: string;
}

export function buildSourcePathMarkers(ast: any): SourcePathMarker[] {
    return ((ast.comments ?? []) as any[])
        .filter((c) => c.type === "Line" && /^[\w./@-][^\s]*\.[a-z]+$/i.test((c.value as string).trim()))
        .map((c) => ({ offset: c.start as number, path: (c.value as string).trim() }))
        .sort((a, b) => a.offset - b.offset);
}

export function resolveSourcePath(
    markers: SourcePathMarker[],
    fallback: string,
    offset: number,
): string {
    let result = fallback;
    for (const marker of markers) {
        if (marker.offset <= offset) result = marker.path;
        else break;
    }
    return result;
}

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

function collectModuleDeclaredNames(ast: any): Set<string> {
    const names = new Set<string>();
    const add = (pattern: any): void => collectPatternNames(pattern, (n) => names.add(n));
    const walk = (node: any): void => {
        if (!node || typeof node !== "object" || typeof node.type !== "string") return;
        switch (node.type) {
            case "VariableDeclarator":
                add(node.id);
                walk(node.init);
                return;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "ArrowFunctionExpression":
            case "ClassDeclaration":
            case "ClassExpression":
                if (node.id) names.add(node.id.name);
                for (const p of node.params ?? []) {
                    add(p);
                    walk(p);
                }
                walk(node.body);
                return;
            case "CatchClause":
                if (node.param) {
                    add(node.param);
                    walk(node.param);
                }
                walk(node.body);
                return;
            default:
                forEachChild(node, walk);
        }
    };
    walk(ast.program);
    return names;
}

function collectExtractableFns(source: string, ast: any): Map<string, { source: string; node: any }> {
    const map = new Map<string, { source: string; node: any }>();

    const visit = (node: any): void => {
        if (!node || typeof node !== "object" || typeof node.type !== "string") return;

        if (node.type === "FunctionDeclaration" && node.id) {
            if (!map.has(node.id.name)) {
                map.set(node.id.name, { source: source.slice(node.start, node.end), node });
            }
        } else if (
            node.type === "VariableDeclarator" &&
            node.id?.type === "Identifier" &&
            node.init &&
            (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")
        ) {
            if (!map.has(node.id.name)) {
                const initSource = source.slice(node.init.start, node.init.end);
                map.set(node.id.name, {
                    source: `const ${node.id.name} = ${initSource};`,
                    node: node.init,
                });
            }
        }

        forEachChild(node, visit);
    };

    visit(ast.program);
    return map;
}

function collectFreeIdentifiers(fnNode: any): Set<string> {
    const declared = new Set<string>();
    const referenced = new Set<string>();

    const declarePattern = (pattern: any): void => {
        collectPatternNames(pattern, (n) => {
            declared.add(n);
            referenced.add(n);
        });
    };

    const walk = (node: any): void => {
        if (!node || typeof node !== "object" || typeof node.type !== "string") return;

        switch (node.type) {
            case "Identifier":
                referenced.add(node.name);
                return;
            case "StaticMemberExpression":
                walk(node.object);
                return;
            case "MemberExpression":
                walk(node.object);
                if (node.computed) walk(node.property);
                return;
            case "Property": {
                if (node.computed) walk(node.key);
                else if (node.shorthand && node.key?.type === "Identifier") referenced.add(node.key.name);
                walk(node.value);
                return;
            }
            case "VariableDeclarator":
                declarePattern(node.id);
                walk(node.init);
                return;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "ArrowFunctionExpression": {
                if (node.id) {
                    declared.add(node.id.name);
                    referenced.add(node.id.name);
                }
                for (const p of node.params ?? []) {
                    declarePattern(p);
                    walk(p);
                }
                walk(node.body);
                return;
            }
            case "ClassDeclaration":
            case "ClassExpression":
                if (node.id) {
                    declared.add(node.id.name);
                    referenced.add(node.id.name);
                }
                break;
            case "CatchClause":
                if (node.param) declarePattern(node.param);
                walk(node.body);
                return;
            default:
                break;
        }

        forEachChild(node, walk);
    };

    if (fnNode.type === "FunctionDeclaration" || fnNode.type === "FunctionExpression" || fnNode.type === "ArrowFunctionExpression") {
        for (const p of fnNode.params ?? []) {
            declarePattern(p);
            walk(p);
        }
        walk(fnNode.body);
    } else {
        walk(fnNode);
    }

    const free = new Set<string>();
    for (const name of referenced) {
        if (!declared.has(name)) free.add(name);
    }
    return free;
}

function findComponentCid(call: any): string | null {
    const obj = call.arguments?.[0];
    if (!obj || obj.type !== "ObjectExpression") return null;
    for (const prop of obj.properties) {
        if (
            prop.type === "Property" &&
            prop.key?.type === "Identifier" &&
            prop.key.name === "__id" &&
            prop.value?.type === "Literal" &&
            typeof prop.value.value === "string"
        ) {
            return prop.value.value;
        }
    }
    return null;
}

/** cid -> local binding name for component() declarations in a module. */
function extractComponentBindings(source: string, ast: any): Map<string, string> {
    void source;
    const map = new Map<string, string>();

    for (const node of ast.program.body) {
        const stmt = node.type === "ExportNamedDeclaration" ? node.declaration : node;
        if (stmt?.type !== "VariableDeclaration") continue;

        for (const decl of stmt.declarations) {
            const call = decl.init;
            if (
                !call ||
                call.type !== "CallExpression" ||
                call.callee?.type !== "Identifier" ||
                call.callee.name !== "component"
            ) continue;

            const cid = findComponentCid(call);
            if (!cid) continue;
            collectPatternNames(decl.id, (name) => {
                if (!map.has(cid)) map.set(cid, name);
            });
        }
    }

    return map;
}

interface ChunkComponentInfo {
    /** cid -> exported name for components defined in (or re-exported by) this chunk. */
    cidToExport: Map<string, string>;
    /** Every component cid present in this chunk (exports or side-effect registrations). */
    allCids: Set<string>;
    /** Direct imports of other chunks: absolute paths. */
    chunkDeps: string[];
}

const chunkComponentInfoCache = new Map<string, { mtimeMs: number; info: ChunkComponentInfo | null }>();

function loadChunkComponentInfo(chunkPath: string): ChunkComponentInfo | null {
    let stat: { mtimeMs: number };
    try {
        stat = statSync(chunkPath);
    } catch {
        return null;
    }

    const cached = chunkComponentInfoCache.get(chunkPath);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.info;

    let info: ChunkComponentInfo | null = null;
    try {
        const source = readFileSync(chunkPath, "utf-8");
        const ast: any = parseSync(chunkPath, source, { sourceType: "module" });
        const localToCid = new Map<string, string>();

        for (const node of (ast.program.body as any[])) {
            const stmt: any = node.type === "ExportNamedDeclaration" ? node.declaration : node;

            if (stmt?.type !== "VariableDeclaration") continue;

            for (const decl of stmt.declarations) {
                const call = decl.init;
                
                if (
                    !call ||
                    call.type !== "CallExpression" ||
                    call.callee?.type !== "Identifier" ||
                    call.callee.name !== "component"
                ) continue;
                
                const cid = findComponentCid(call);
                if (!cid) continue;

                collectPatternNames(decl.id, (name) => {
                    if (!localToCid.has(name)) localToCid.set(name, cid);
                });
            }
        }

        const cidToExport = new Map<string, string>();
        const reExports: Array<{ local: string; exported: string; source: string }> = [];

        // esbuild emits alias bindings (`var Link_default = Link;`) when a
        // component's local name differs from its export name
        const aliases = new Map<string, string>();
        let aliasChanged = true;

        while (aliasChanged) {
            aliasChanged = false;

            for (const node of (ast.program.body as any[])) {
                const stmt: any = node.type === "ExportNamedDeclaration" && !node.source ? node.declaration : node;

                if (stmt?.type !== "VariableDeclaration") continue;

                for (const decl of stmt.declarations) {
                    if (
                        decl.id?.type === "Identifier" &&
                        decl.init?.type === "Identifier"
                    ) {
                        const target = aliases.get(decl.init.name) ?? decl.init.name;

                        if (aliases.get(decl.id.name) !== target) {
                            aliases.set(decl.id.name, target);
                            aliasChanged = true;
                        }
                    }
                }
            }
        }

        const resolveAlias = (name: string): string => aliases.get(name) ?? name;

        for (const node of (ast.program.body as any[])) {
            if (node.type === "ExportNamedDeclaration") {
                if (node.source) {
                    for (const spec of node.specifiers ?? []) {
                        reExports.push({
                            local: (spec.local as any)?.name ?? (spec.local as any)?.value,
                            exported: (spec.exported as any)?.name ?? (spec.exported as any)?.value,
                            source: node.source.value,
                        });
                    }
                } else {
                    for (const spec of node.specifiers ?? []) {
                        const cid = localToCid.get(resolveAlias((spec.local as any).name));

                        if (cid && !cidToExport.has(cid)) {
                            cidToExport.set(cid, (spec.exported as any)?.name ?? (spec.local as any).name);
                        }
                    }
                }
            } else if (node.type === "ExportDefaultDeclaration") {
                if (node.declaration?.type === "Identifier") {
                    const cid = localToCid.get(resolveAlias((node.declaration as any).name));

                    if (cid && !cidToExport.has(cid)) cidToExport.set(cid, "default");
                } else if ((node.declaration as any)?.type === "VariableDeclaration") {
                    for (const decl of (node.declaration as any).declarations) {
                        const call = decl.init;

                        if (
                            call?.type === "CallExpression" &&
                            call.callee?.name === "component"
                        ) {
                            const cid = findComponentCid(call);

                            if (cid && !cidToExport.has(cid)) {
                                cidToExport.set(cid, "default");
                            }
                        }
                    }
                }
            }
        }

        const chunkDeps: string[] = [];
        const allCids = new Set<string>(localToCid.values());
        const dir = chunkPath.replace(/\\/g, "/").slice(0, chunkPath.replace(/\\/g, "/").lastIndexOf("/"));

        const resolveChunkDep = (rel: string): string => {
            if (rel.startsWith("/chunks/")) {
                return join(DIST_DIR ?? "", rel.slice(1));
            }
         
            return join(dir, rel);
        };

        for (const re of reExports) {
            const dep = loadChunkComponentInfo(resolveChunkDep(re.source));
         
            if (!dep) continue;
         
            for (const [cid, exported] of dep.cidToExport) {
                if (exported === re.local && !cidToExport.has(cid)) {
                    cidToExport.set(cid, re.exported);
                }
            }
         
            for (const cid of dep.allCids) {
                allCids.add(cid);
            }
        }

        for (const node of (ast.program.body as any[])) {
            if (node.type === "ImportDeclaration" &&
                (node.source.value.startsWith("./chunk-") || node.source.value.startsWith("/chunks/"))
            ) {
                chunkDeps.push(resolveChunkDep(node.source.value));
            }
        }

        info = { cidToExport, allCids, chunkDeps };
    } catch {
        info = null;
    }

    chunkComponentInfoCache.set(chunkPath, { mtimeMs: stat.mtimeMs, info });

    return info;
}

interface PageChunkImport {
    /** Import source as written in preClientCode, e.g. "/chunks/chunk-ABC.js". */
    source: string;
    /** imported name -> local binding name. */
    specifiers: Map<string, string>;
}

type ResolvedRegionComponent =
    | { kind: "call"; name: string; chunkSource?: string }
    | { kind: "blob"; chunkSource?: string }
    | { kind: "missing" };

function createRegionResolver(
    inlineBindings: Map<string, string>,
    pageChunkImports: PageChunkImport[],
    layoutCacheKeys: string[],
): (cid: string, usedChunkSources: Set<string>) => ResolvedRegionComponent {
    const layoutPathSet = new Set(
        layoutCacheKeys.map((key) => join(DIST_DIR ?? "", "chunks", `${key}.client.mjs`)),
    );

    const layoutCids = new Set<string>();
    const layoutLoaded = new Set<string>();

    const loadLayoutCids = (): void => {
        for (const path of layoutPathSet) {
            if (layoutLoaded.has(path)) continue;

            layoutLoaded.add(path);

            const info = loadChunkComponentInfo(path);
            if (!info) continue;

            // layout bundles register their components by side effect (the
            // bundle itself is always loaded), so every cid in them counts.
            for (const cid of info.allCids) {
                layoutCids.add(cid);
            }
        }
    };

    const chunkPathOf = (source: string): string | null => {
        if (!source.startsWith("/chunks/") || !DIST_DIR) return null;

        return join(DIST_DIR, source.slice(1));
    };

    return (cid, usedChunkSources): ResolvedRegionComponent => {
        const inline = inlineBindings.get(cid);
        if (inline) return { kind: "call", name: inline };

        for (const pageImport of pageChunkImports) {
            const path = chunkPathOf(pageImport.source);
            if (!path) continue;

            const info = loadChunkComponentInfo(path);
            if (!info || !info.cidToExport.has(cid)) continue;

            const exported = info.cidToExport.get(cid)!;

            const local = pageImport.specifiers.get(exported);
            if (local) return { kind: "call", name: local };

            usedChunkSources.add(pageImport.source);

            return { kind: "blob", chunkSource: pageImport.source };
        }

        for (const pageImport of pageChunkImports) {
            const path = chunkPathOf(pageImport.source);
            if (!path) continue;

            const info = loadChunkComponentInfo(path);
            if (!info) continue;

            const visited = new Set<string>();

            const walk = (chunk: ChunkComponentInfo): boolean => {
                if (chunk.allCids.has(cid)) return true;

                for (const depPath of chunk.chunkDeps) {
                    if (visited.has(depPath)) continue;

                    visited.add(depPath);
                    const dep = loadChunkComponentInfo(depPath);

                    if (dep && walk(dep)) {
                        return true;
                    }
                }

                return false;
            };

            if (walk(info)) {
                usedChunkSources.add(pageImport.source);

                return { 
                    kind: "blob", 
                    chunkSource: pageImport.source 
                };
            }
        }

        loadLayoutCids();

        if (layoutCids.has(cid)) return { 
            kind: "blob" 
        };

        return { kind: "missing" };
    };
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
        if (src[i] === "\n") { 
            line++; col = 1; 
        } else { 
            col++; 
        }
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
            for (const spec of node.specifiers ?? []) {
                into.add(spec.local.name);
            }
    
            break;
        case "VariableDeclaration":
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (n) => into.add(n));
            }

            break;
        case "FunctionDeclaration":
        case "ClassDeclaration":
            if (node.id?.name) {
                into.add(node.id.name);
            }
            
            break;
        case "ExportNamedDeclaration":
            if (node.declaration) {
                extractDeclaredNames(node.declaration, into);
            } else {
                for (const spec of node.specifiers ?? []) {
                    into.add(spec.local.name);
                }
            }
            break;
        case "ExportDefaultDeclaration":
            if (node.declaration?.id?.name) {
                into.add(node.declaration.id.name);
            }

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
    let lo = 0, hi = sortedCalls.length - 1;

    while (lo <= hi) {
        const mid = (lo + hi) >> 1;

        if (sortedCalls[mid].start < nodeStart) {
            lo = mid + 1;
        } else hi = mid - 1;
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
        } else if (name === "_getAtom") {
            atomCalls.push(node);

            return; // don't go into arguments
        } else if (name === "onPageLoad") {
            onPageLoadCalls.push(node);

            return; // don't go into arguments
        }
    }

    forEachChild(node, (child) => findSpecialCalls(child, componentCalls, atomCalls, onPageLoadCalls));
}

function applyReachabilityDCECore(
    source: string,
    ast: any,
    filePath: string,
    bannedGlobs?: string[],
    opts?: { keepAllChunks?: boolean; keepChunkSources?: Set<string> },
): string {
    const body: any[] = ast.program.body;

    const bindingMap = new Map<string, any>();

    for (const node of body) {
        if (node.type === "ImportDeclaration") {
            for (const spec of node.specifiers ?? []) {
                bindingMap.set(spec.local.name, node);
            }
        } else if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (name) => bindingMap.set(name, node));
            }
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
                    if (!componentCallToVar.has(call)) {
                        componentCallToVar.set(call, name);
                    }
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

                for (const [n, offset] of seedRefs) {
                    addReachable(n, seedLabel, offset);
                }
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
        
            for (const [n, offset] of seedRefs) {
                addReachable(n, "<onPageLoad()>", offset);
            }
        }
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

                if (bindingMap.has(ref)) {
                    queue.push(ref);
                }
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

    // file-level !no-bundle-file guard + banned globs
    if (bannedGlobs?.length || ast.comments?.some((c: any) => c.type === "Line" && (c.value as string).trim() === "!no-bundle-file")) {
        const markers = buildSourcePathMarkers(ast);
        const bannedDirs = new Set<string>();

        for (const comment of ast.comments ?? []) {
            if (comment.type === "Line" && (comment.value as string).trim() === "!no-bundle-file") {
                bannedDirs.add(resolveSourcePath(markers, filePath, comment.start as number));
            }
        }

        const fileViolations: { name: string; chain: string }[] = [];

        for (const name of reachable) {
            const decl = bindingMap.get(name);
            if (!decl) continue;

            const src = resolveSourcePath(markers, filePath, decl.start as number);

            if (bannedDirs.has(src)) {
                fileViolations.push({ name, chain: formatReachabilityChain(source, filePath, name, reachableFrom) });
            } else if (bannedGlobs?.some(g => globMatch(g, src))) {
                fileViolations.push({ name, chain: formatReachabilityChain(source, filePath, name, reachableFrom) });
            }
        }

        if (fileViolations.length > 0) {
            const list = fileViolations
                .map(({ name, chain }) => `  • ${name}\n${chain}`)
                .join("\n\n");

            throw richError({
                title: "Server Only File",
                cause: `\\The following files are server-only but were reached by the client bundle:\n\n${list}`,
                hint: `\\Remove the reference or mark the file with //!no-bundle-file.`,
                doShowStack: false,
            });
        }
    }

    const forcedImports = new Set<any>();

    // !allow-bundling enforcement for named imports, and !force-bundling for side-effect imports
    {
        const programComments = ast.comments ?? [];
        const allowedImports = new Set<any>();

        for (const comment of programComments) {
            if (comment.type !== "Line") continue;
            
            const trimmed = (comment.value as string).trim();
            
            if (trimmed === "!allow-bundling") {
                const afterComment = comment.end as number;
                const annotatedNode = body.find((n: any) => n.start >= afterComment);
            
                if (annotatedNode && annotatedNode.type === "ImportDeclaration") {
                    allowedImports.add(annotatedNode);
                }
            } else if (trimmed === "!force-bundling") {
                const afterComment = comment.end as number;
                const annotatedNode = body.find((n: any) => n.start >= afterComment);
            
                if (annotatedNode && annotatedNode.type === "ImportDeclaration") {
                    forcedImports.add(annotatedNode);
                }
            }
        }

        const violations: Array<{ importNode: any; exampleSpec?: string }> = [];

        for (const node of body) {
            if (node.type !== "ImportDeclaration") continue;

            const specs = node.specifiers ?? [];
            if (specs.length === 0) continue;

            const hasReachable = specs.some((s: any) => reachable.has(s.local.name));
            if (!hasReachable) continue;

            if (node.source.value.startsWith("/chunks/")) continue;

            if (!allowedImports.has(node)) {
                const reachableSpec = specs.find((s: any) => reachable.has(s.local.name));

                violations.push({ importNode: node, exampleSpec: reachableSpec.local.name });
            }
        }

        if (violations.length > 0) {
            const list = violations
                .map(({ importNode, exampleSpec }) => {
                    let chain = "";
                    if (exampleSpec) {
                        chain = formatReachabilityChain(source, filePath, exampleSpec, reachableFrom);
                    } else {
                        const { line, col } = offsetToLineCol(source, importNode.start);
                        const sourceLine = getSourceLine(source, importNode.start);
                        const pipe = "    |   ";
                        const caretLine = `${pipe}${" ".repeat(col - 1)}^`;

                        chain =
                            `    at import "${importNode.source.value}" (side-effect import) (${filePath}:${line}:${col})\n` +
                            `${pipe}${sourceLine}\n` +
                            `${caretLine}`;
                    }
                    return `  • Import from "${importNode.source.value}"\n${chain}`;
                }).join("\n\n");

            throw richError({
                title: "Missing allow‑bundling directive",
                cause: `\\The following imports are reachable and will be bundled, ` +
                    `but they are not marked with //!allow-bundling:\n\n${list}\n\n` +
                    `Every import that survives into the client bundle must be explicitly allowed.`,
                hint: `\\Add a line comment //!allow-bundling immediately above each import statement.`,
                doShowStack: false,
            });
        }
    }

    const removalEdits: Edit[] = [];

    function trailingEnd(end: number): number {
        return end < source.length && source[end] === "\n" ? end + 1 : end;
    }

    function keepChunkImport(node: any): boolean {
        const src = node.source.value;

        if (!src.startsWith("/chunks/")) return false;
        if (opts?.keepAllChunks) return true;

        return opts?.keepChunkSources?.has(src) === true;
    }

    for (const node of body) {
        if (node.type === "ImportDeclaration") {
            const specs: any[] = node.specifiers ?? [];

            if (specs.length === 0) {
                if (!forcedImports.has(node) && !keepChunkImport(node)) {
                    removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
                }

                continue;
            }

            const reachableSpecs = specs.filter((s) => reachable.has(s.local.name));

            if (reachableSpecs.length === specs.length) {
                continue;
            }

            if (reachableSpecs.length === 0) {
                if (!keepChunkImport(node)) {
                    removalEdits.push({ start: node.start, end: trailingEnd(node.end), replacement: "" });
                }
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

                    for (const d of decl.declarations) { 
                        collectPatternNames(d.id, (n) => names.push(n));
                    }
                    
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

    const sourcePathMarkers = buildSourcePathMarkers(ast);

    function sourcePathAt(nodeStart: number): string {
        return resolveSourcePath(sourcePathMarkers, filePath, nodeStart);
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
                    const key = prop.key?.type === "Identifier" ? 
                        prop.key.name : prop.key?.type === "Literal" ? 
                            String(prop.key.value) : "";

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

export function transformChunk(source: string, filePath: string, bannedGlobs?: string[]): string {
    const ast = parseSync(filePath, source, { sourceType: "module" });
    const { sharedEdits, clientOnlyEdits } = collectTransformEdits(source, ast, filePath);

    if (bannedGlobs?.length || ast.comments?.some((c: any) => c.type === "Line" && (c.value as string).trim() === "!no-bundle-file")) {
        const markers = buildSourcePathMarkers(ast);
        const bannedDirs = new Set<string>();
        
        for (const comment of ast.comments ?? []) {
            if (comment.type === "Line" && (comment.value as string).trim() === "!no-bundle-file") {
                bannedDirs.add(resolveSourcePath(markers, filePath, comment.start as number));
            }
        }
        
        for (const marker of markers) {
            if (bannedDirs.has(marker.path)) {
                throw richError({
                    title: "Server Only File",
                    cause: `\\The file "${marker.path}" is marked server-only (//!no-bundle-file) but was included in a client chunk.`,
                    doShowStack: false,
                });
            }
            if (bannedGlobs?.some(g => globMatch(g, marker.path))) {
                throw richError({
                    title: "Server Only File",
                    cause: `\\The file "${marker.path}" is marked server-only but was included in a client chunk.`,
                    doShowStack: false,
                });
            }
        }
    }

    return applyEdits(source, [...sharedEdits, ...clientOnlyEdits]);
}

export function serializePropValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    if (typeof value === "boolean") return String(value);
    if (typeof value === "number") return isFinite(value) ? String(value) : "undefined";
    if (typeof value === "string") return JSON.stringify(value).replace(/</g, "\\u003c");
    
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
            return `_getAtom(${JSON.stringify(obj.id).replace(/</g, "\\u003c")}, ${serializePropValue(obj.value)})`;
        }
    
        const entries = Object.entries(value as Record<string, unknown>).map(
            ([k, v]) => `${JSON.stringify(k).replace(/</g, "\\u003c")}: ${serializePropValue(v)}`,
        );
    
        return `{ ${entries.join(", ")} }`;
    }
    
    return "undefined";
}

interface RegionEmitContext {
    resolveCid: (cid: string, usedChunkSources: Set<string>) => ResolvedRegionComponent;
    topLevelNames: Set<string>;
    extractableFns: Map<string, { source: string; node: any }>;
    usedExtractions: Set<string>;
    usedChunkSources: Set<string>;
    fnLocations: Map<string, number>;
    locateOffset: (offset: number) => { line: number; col: number; sourceLine: string };
    path: string[];
    filePath: string;
}

function formatFnTrace(ctx: RegionEmitContext, fn: Function): string {
    const at = ctx.path.length > 0 ? ctx.path.join(" → ") : "region data";
    const offset = ctx.fnLocations.get(normalizeFnText(fn.toString()));

    if (offset === undefined) {
        return `    at ${at}\n` + fn.toString().split("\n").map((l) => `    |   ${l}`).join("\n");
    }

    const { line, col, sourceLine } = ctx.locateOffset(offset);

    return `    at ${at} (${ctx.filePath}:${line}:${col})\n` +
        `    |   ${sourceLine}\n` +
        `    |   ${" ".repeat(col - 1)}^`;
}

function normalizeFnText(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/^[A-Za-z_$][\w$]*\s*\(/, "(")
        .trim();
}

function serializeRegionValue(value: unknown, ctx: RegionEmitContext, label = "value"): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    if (typeof value === "boolean") return String(value);
    if (typeof value === "number") return isFinite(value) ? String(value) : "undefined";
    if (typeof value === "string") return JSON.stringify(value).replace(/</g, "\\u003c");

    if (typeof value === "function") {
        const name = (value as Function).name;
        const resolvable =
            !!name && (ctx.topLevelNames.has(name) || ctx.extractableFns.has(name));

        if (!resolvable) {
            const where = ctx.path.length > 0 ? ctx.path.join(" → ") : "region data";

            console.warn(
                `[elegance] Unshippable function prop dropped (serialized as undefined):\n` +
                `${formatFnTrace(ctx, value)}\n` +
                `If ${where} needs this handler, define it in client-reachable code ` +
                `(top level of the page module, or inside the component's view).`,
            );

            return "undefined";
        }

        if (!ctx.topLevelNames.has(name)) {
            ctx.usedExtractions.add(name);
        }

        return name;
    }

    if (Array.isArray(value)) {
        return `[${(value as unknown[]).map((v, i) => serializeRegionValue(v, ctx, `${label}[${i}]`)).join(", ")}]`;
    }

    if (typeof value === "object") {
        const obj = value as any;

        if (typeof obj.id === "string" && "value" in obj) {
            return `_getAtom(${JSON.stringify(obj.id).replace(/</g, "\\u003c")}, ${serializePropValue(obj.value)})`;
        }

        if (obj.__type === "live" && typeof obj.__componentId === "string") {
            // nested live descriptor (slot pattern) here we re-emit as a component
            // call so its definition/registration machinery is referenced
            // by real code instead of serialized closures.
            const resolved = ctx.resolveCid(obj.__componentId, ctx.usedChunkSources);
            if (resolved.kind === "missing") {
                throw richError({
                    title: "Unhydratable Component",
                    cause: `\\The component (cid "${obj.__componentId}") rendered as ${label} ` +
                        `has no client-side definition in the page bundle, its chunks, or its layouts:\n\n` +
                        `    at ${ctx.path.join(" → ") || "region data"}\n\n` +
                        `Without it the client cannot hydrate this slot.`,
                    hint: `Ensure the component is imported into the page (or mark its module as bundleable) so its client code is shipped.`,
                    doShowStack: false,
                });
            }
            
            ctx.path.push(`${resolved.kind === "call" ? resolved.name : obj.__componentId}()`);
            
            try {
                if (resolved.kind === "call") {
                    return emitComponentCall(resolved.name, obj, ctx);
                }
            
                return `{ __type: "live", __componentId: ${JSON.stringify(obj.__componentId).replace(/</g, "\\u003c")}, props: ${serializePropsRecord(obj.props, ctx)}, children: ${serializeRegionValue(obj.children ?? [], ctx, `${label}.children`)} }`;
            } finally {
                ctx.path.pop();
            }
        }

        const entries = Object.entries(value as Record<string, unknown>).map(
            ([k, v]) => `${JSON.stringify(k).replace(/</g, "\\u003c")}: ${serializeRegionValue(v, ctx, `${label}.${k}`)}`,
        );

        return `{ ${entries.join(", ")} }`;
    }

    return "undefined";
}

function emitComponentCall(
    name: string,
    desc: { props?: Record<string, unknown>; children?: Array<unknown> },
    ctx: RegionEmitContext,
): string {
    ctx.path.push(`${name}()`);
    
    try {
        const props = serializePropsRecord(desc.props, ctx);
        const children = desc.children ?? [];
    
        const args = children.length > 0
            ? `, ${children.map((c, i) => serializeRegionValue(c, ctx, `children[${i}]`)).join(", ")}`
            : "";
    
        return `${name}(${props}${args})`;
    } finally {
        ctx.path.pop();
    }
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

function serializePropsRecord(props: Record<string, unknown> | undefined, ctx?: RegionEmitContext): string {
    if (!props || Object.keys(props).length === 0) return "{}";
    
    const entries = Object.entries(props)
        .map(([k, v]) => `${JSON.stringify(k).replace(/</g, "\\u003c")}: ${ctx ? serializeRegionValue(v, ctx, `props.${k}`) : serializePropValue(v)}`);
    
        return `{ ${entries.join(", ")} }`;
}

function generateRegionsExpression(
    regions: Array<any[]>,
    ctx: RegionEmitContext,
): { declarations: string; expression: string } {
    const keyToVar = new Map<string, string>();
    const keyToCode = new Map<string, string>();

    let varCounter = 0;

    const regionParts = regions.map((descs, regionIdx) => {
        const parts: string[] = [];

        for (const desc of descs) {
            const cid = desc.__componentId as string;
            const resolved = ctx.resolveCid(cid, ctx.usedChunkSources);

            if (resolved.kind === "missing") {
                const renderFn = desc.__definition?.render;

                const where = ctx.path.join(" → ") || `regions[${regionIdx}]`;

                const trace = typeof renderFn === "function"
                    ? `    at ${where}\n` +
                        renderFn.toString().split("\n").map((l: string) => `    |   ${l}`).join("\n")
                    : `    at ${where}`;

                throw richError({
                    title: "Unhydratable Component",
                    cause: `\\The component (cid "${cid}") rendered at ${where} ` +
                        `has no client-side definition in the page bundle, its chunks, or its layouts:\n\n${trace}\n\n` +
                        `Without it the client cannot hydrate this region.`,
                    hint: `Ensure the component is imported into the page (or mark its module as bundleable) so its client code is shipped.`,
                    doShowStack: false,
                });
            }

            if (resolved.kind === "call") {
                parts.push(emitComponentCall(resolved.name, desc, ctx));

                continue;
            }

            // layout-owned (or transitively-chunked) component: data blob.
            ctx.path.push(`component(${cid})`);

            let propsCode: string;
            let childrenCode: string;

            try {
                propsCode = serializePropsRecord(desc.props as Record<string, unknown> | undefined, ctx);
                childrenCode = serializeRegionValue(desc.children ?? [], ctx, "children");
            } finally {
                ctx.path.pop();
            }

            const props = desc.props as Record<string, unknown> | undefined;
            const key = propsComparisonKey(props) + "\x00" + childrenCode;

            if (!keyToVar.has(key)) {
                const varName = `_p${varCounter++}`;

                keyToVar.set(key, varName);
                keyToCode.set(key, `{ __cid: ${JSON.stringify(cid).replace(/</g, "\\u003c")}, props: ${propsCode}, children: ${childrenCode} }`);
            }

            parts.push(keyToVar.get(key)!);
        }

        return `[${parts.join(", ")}]`;
    });

    const declarations = [...keyToVar.entries()]
        .map(([key, varName]) => `    const ${varName} = ${keyToCode.get(key)};`)
        .join("\n");

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
    return { handlerSets };
}

function generateHandlersExpression(
    elementHandlers: ExtractedHandlerSet[],
): { declarations: string; expression: string } {
    if (!elementHandlers || elementHandlers.length === 0) {
        return { declarations: "", expression: "[]" };
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

    return { declarations, expression: `[${parts.join(", ")}]` };
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
    bannedGlobs?: string[],
): string {
    let ast: any;
    try {
        ast = parseSync(filePath, preClientCode, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse layout module", e);
        return preClientCode;
    }

    const replaced = applyServerActionCallReplacements(preClientCode, ast);

    let bundleSource = preClientCode;
    let bundleAst    = ast;
    if (replaced !== preClientCode) {
        try {
            bundleAst = parseSync(filePath, replaced, { sourceType: "module" });
            bundleSource = replaced;
        } catch (e) {
            console.error("Failed to parse replaced layout module", e);
            return preClientCode;
        }
    }

    const { handlerSets } = extractElementHandlersFromAst(bundleSource, bundleAst);
    const { declarations: handlerDecls, expression: handlersExpr } =
        generateHandlersExpression(handlerSets);

    let defaultStart = -1;
    let defaultEnd   = -1;
    for (const node of bundleAst.program.body as any[]) {
        if (node.type === "ExportDefaultDeclaration") {
            defaultStart = node.start as number;
            defaultEnd   = node.end   as number;
        }
    }

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

    return applyReachabilityDCECore(finalSource, dceAst, filePath, bannedGlobs, { keepAllChunks: true });
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
    layoutImports:   string;
    layoutCalls:     string;
    mergedRegions:   string;
    mergedHandlers:  string;
    inlineBindings:  Map<string, string>;
    pageChunkImports: PageChunkImport[];
    topLevelNames:   Set<string>;
    moduleDeclaredNames: Set<string>;
    extractableFns:  Map<string, { source: string; node: any }>;
    /** Normalized fn text -> offset in the client text heref for error traces. */
    fnLocations:     Map<string, number>;
    /** Precomputed (line, col, sourceLine) for every offset in fnLocations. */
    fnLocate:        (offset: number) => { line: number; col: number; sourceLine: string };
    filePath:        string;
}

const syntheticBundleStaticCache = new Map<string, SyntheticBundleStaticParts>();
const SYNTHETIC_BUNDLE_CACHE_MAX = 256;

const syntheticBundleDceCache = new Map<string, string>();
const SYNTHETIC_BUNDLE_DCE_MAX = 256;

function getDceCacheKey(finalSource: string): string {
    let h1 = 0x811c9dc5, h2 = 0x01000193;

    for (let i = 0; i < finalSource.length; i++) {
        const c = finalSource.charCodeAt(i);
        
        h1 = (h1 ^ c) * 0x01000193 >>> 0;
        h2 = (h2 + c) * 0x85ebca6b >>> 0;
    }
    
    return h1.toString(36) + ":" + h2.toString(36);
}

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

    const replaced = applyServerActionCallReplacements(preClientCode, ast);

    let bundleSource = preClientCode;
    let bundleAst    = ast;
    
    if (replaced !== preClientCode) {
        try {
            bundleAst = parseSync(filePath, replaced, { sourceType: "module" });
            bundleSource = replaced;
        } catch (e) {
            console.error("Failed to parse replaced module", e);
    
            return null;
        }
    }

    const { handlerSets } = extractElementHandlersFromAst(bundleSource, bundleAst);
    const { declarations: handlerDecls, expression: handlersExpr } = generateHandlersExpression(handlerSets);

    let defaultStart = -1;
    let defaultEnd   = -1;

    for (const node of bundleAst.program.body as any[]) {
        if (node.type === "ExportDefaultDeclaration") {
            defaultStart = node.start as number;
            defaultEnd   = node.end   as number;
        }
    }

    const withoutDefault =
        defaultStart >= 0
            ? replaced.slice(0, defaultStart) + replaced.slice(defaultEnd)
            : replaced;

    const layoutImports = layoutCacheKeys
        .map((lk, i) => `//!allow-bundling\nimport { default as __l${i} } from "/chunks/${lk}.client.mjs";`)
        .join("\n");

    const layoutCalls = layoutCacheKeys
        .map((_, i) => `    const _l${i} = __l${i}();`)
        .join("\n");

    const regionsSpread  = layoutCacheKeys.map((_, i) => `..._l${i}.regions`).join(", ");
    const handlersSpread = layoutCacheKeys.map((_, i) => `..._l${i}.handlers`).join(", ");

    const mergedRegions  = regionsSpread  ? `[${regionsSpread},  ...regions]`  : `regions`;
    const mergedHandlers = handlersSpread ? `[${handlersSpread}, ...handlers]` : `handlers`;

    const inlineBindings = extractComponentBindings(bundleSource, bundleAst);

    const pageChunkImports: PageChunkImport[] = [];

    for (const node of bundleAst.program.body) {
        if (node.type !== "ImportDeclaration") continue;
        if (!node.source.value.startsWith("/chunks/")) continue;

        const specifiers = new Map<string, string>();

        for (const spec of node.specifiers ?? []) {
            const imported = spec.imported?.name ?? spec.imported?.value ?? spec.local.name;

            specifiers.set(imported, spec.local.name);
        }

        pageChunkImports.push({ source: node.source.value, specifiers });
    }

    const topLevelNames = new Set<string>();

    for (const node of bundleAst.program.body) {
        if (node.type === "ImportDeclaration") {
            for (const spec of node.specifiers ?? []) topLevelNames.add(spec.local.name);
        } else if (node.type === "VariableDeclaration") {
            for (const decl of node.declarations) {
                collectPatternNames(decl.id, (name) => topLevelNames.add(name));
            }
        } else if (node.type === "FunctionDeclaration" && node.id) {
            topLevelNames.add(node.id.name);
        } else if (node.type === "ClassDeclaration" && node.id) {
            topLevelNames.add(node.id.name);
        }
    }

    const extractableFns = collectExtractableFns(bundleSource, bundleAst);
    const moduleDeclaredNames = collectModuleDeclaredNames(bundleAst);
    const fnLocations = new Map<string, number>();

    const visitFnNodes = (node: any): void => {
        if (!node || typeof node !== "object" || typeof node.type !== "string") return;

        if (
            node.type === "FunctionDeclaration" ||
            node.type === "FunctionExpression" ||
            node.type === "ArrowFunctionExpression"
        ) {
            const text = normalizeFnText(bundleSource.slice(node.start, node.end));

            if (!fnLocations.has(text)) fnLocations.set(text, node.start);
        }

        forEachChild(node, visitFnNodes);
    };

    visitFnNodes(bundleAst.program);

    const fnLocate = (offset: number) => {
        const line = offsetToLineCol(bundleSource, offset);

        return { line: line.line, col: line.col, sourceLine: getSourceLine(bundleSource, offset) };
    };

    return {
        withoutDefault,
        handlerDecls,
        handlersExpr,
        layoutImports,
        layoutCalls,
        mergedRegions,
        mergedHandlers,
        inlineBindings,
        pageChunkImports,
        topLevelNames,
        moduleDeclaredNames,
        extractableFns,
        fnLocations,
        fnLocate,
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
    bannedGlobs?: string[],
): string {
    const staticParts = getOrComputeStaticParts(preClientCode, filePath, layoutCacheKeys);

    if (staticParts === null) return preClientCode;

    const {
        withoutDefault,
        handlerDecls,
        handlersExpr,
        layoutImports,
        layoutCalls,
        mergedRegions,
        mergedHandlers,
        inlineBindings,
        pageChunkImports,
        topLevelNames,
        moduleDeclaredNames,
        extractableFns,
        fnLocations,
        fnLocate,
    } = staticParts;

    const usedChunkSources = new Set<string>();
    const usedExtractions = new Set<string>();

    const emitCtx: RegionEmitContext = {
        resolveCid: createRegionResolver(inlineBindings, pageChunkImports, layoutCacheKeys),
        topLevelNames,
        extractableFns,
        usedExtractions,
        usedChunkSources,
        fnLocations,
        locateOffset: fnLocate,
        path: [],
        filePath,
    };

    const { declarations: propsDecls, expression: regionsExpr } =
        generateRegionsExpression(regions, emitCtx);

    const splicedNames = new Set<string>();
    const splicedDecls: string[] = [];
    const spliceQueue: string[] = [...usedExtractions];

    while (spliceQueue.length > 0) {
        const name = spliceQueue.pop()!;
        if (splicedNames.has(name)) continue;
        splicedNames.add(name);

        const fn = extractableFns.get(name)!;
        splicedDecls.push(fn.source.endsWith(";") ? fn.source : fn.source + ";");

        for (const free of collectFreeIdentifiers(fn.node)) {
            if (topLevelNames.has(free) || splicedNames.has(free)) continue;
            if (extractableFns.has(free)) {
                spliceQueue.push(free);
                continue;
            }
            if (!moduleDeclaredNames.has(free)) continue;
            const { line, col, sourceLine } = fnLocate(fn.node.start);
            throw richError({
                title: "Unshippable Function Closure",
                cause: `\\The function "${name}" (referenced by region data) closes over "${free}", ` +
                    `which only exists in server-only scope:\n\n` +
                    `    at ${filePath}:${line}:${col}\n` +
                    `    |   ${sourceLine}\n` +
                    `    |   ${" ".repeat(col - 1)}^\n\n` +
                    `Shipping it would reference a value the client bundle does not have.`,
                hint: `\\Move the value to the top level of a client-reachable module, pass it as data instead of a closure, ` +
                    `or compute it inside a component.`,
                doShowStack: false,
            });
        }
    }

    const extractedDecls = splicedDecls.length > 0 ? splicedDecls.join("\n") + "\n" : "";

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
    const finalSource   = importSection + withoutDefault + extractedDecls + syntheticFn;

    const dceKey = getDceCacheKey(finalSource + "\x00" + [...usedChunkSources].sort().join("\x01"));
    const cached = syntheticBundleDceCache.get(dceKey);
    if (cached !== undefined) return cached;

    let dceAst: any;
    try {
        dceAst = parseSync(filePath, finalSource, { sourceType: "module" });
    } catch (e) {
        console.error("Failed to parse modified bundle", e);
        return finalSource;
    }

    const result = applyReachabilityDCECore(finalSource, dceAst, filePath, bannedGlobs, {
        keepChunkSources: usedChunkSources,
    });

    if (syntheticBundleDceCache.size >= SYNTHETIC_BUNDLE_DCE_MAX) {
        syntheticBundleDceCache.delete(syntheticBundleDceCache.keys().next().value!);
    }

    syntheticBundleDceCache.set(dceKey, result);

    return result;
}