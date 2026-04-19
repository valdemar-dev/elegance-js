import { readFileSync } from "fs";
import {
    Project,
    SyntaxKind,
    Node
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
export function transformSource(source: string, filePath = "input.ts") {
    const file = project.createSourceFile(filePath, source, { overwrite: true })
    const checker = project.getTypeChecker()

    const stateSymbolToId = new Map<string, string>()

    for (const decl of file.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
        const init = decl.getInitializer()
        if (!Node.isCallExpression(init)) continue

        const expr = init.getExpression().getText()
        if (expr !== "state") continue

        const symbol = checker.getSymbolAtLocation(decl.getNameNode())
        if (!symbol) continue

        const key = checker.getFullyQualifiedName(symbol)

        const id = makeId(
            filePath,
            decl.getName(),
            decl.getStart()
        )

        stateSymbolToId.set(key, id)
    }

    const loadHooks = file.getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(c => c.getExpression().getText() === "loadHook")

    for (const hook of loadHooks) {
        const arg = hook.getArguments()[0]

        const fn =
            arg?.asKind(SyntaxKind.ArrowFunction) ||
            arg?.asKind(SyntaxKind.FunctionExpression)

        if (!fn) continue;

        fn.forEachDescendant(node => {
            if (!Node.isIdentifier(node)) return;

            const parent = node.getParent();

            if (Node.isPropertyAccessExpression(parent)) {
                if (parent.getNameNode() === node) return;
            }

            const symbol = checker.getSymbolAtLocation(node);
            if (!symbol) return;

            const key = checker.getFullyQualifiedName(symbol);
            const id = stateSymbolToId.get(key);

            if (!id) return;

            node.replaceWithText(`_state["${id}"]`);
        })
    }

    return file.getFullText()
}