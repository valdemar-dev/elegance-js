import { readFileSync } from "fs";
import {
    Project,
    SyntaxKind,
    Node,
    SourceFile
} from "ts-morph";
import crypto from "crypto";

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
 * @param source The raw source-code of the file.
 * @param filePath The in-memory filename (you probably don't need to touch this)
 * @returns The modified source-code.
 */
let sharedFile: SourceFile | undefined;

export function transformSource(source: string, filePath = "input.ts"): string {
    if (!sharedFile) {
        sharedFile = project.createSourceFile(filePath, source);
    } else {
        sharedFile.replaceWithText(source);
    }

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

    const result = sharedFile.getFullText();
    
    sharedFile.forgetDescendants();

    return result;
}