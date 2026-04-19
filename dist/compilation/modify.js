import { Project, SyntaxKind, Node } from "ts-morph";
import crypto from "crypto";
function makeId(filePath, name, pos) {
    const id = crypto
        .createHash('sha256')
        .update(filePath + ':' + name + pos.toString())
        .digest('base64url')
        .slice(0, 11); // 66 bits of entropy
    return `${id}`;
}
const project = new Project({
    useInMemoryFileSystem: true
});
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
export function transformSource(source, filePath = "input.ts") {
    const file = project.createSourceFile(filePath, source, { overwrite: true });
    const checker = project.getTypeChecker();
    //@ts-ignore
    const stateSymbolToId = new Map();
    for (const decl of file.getVariableDeclarations()) {
        const init = decl.getInitializer();
        if (!Node.isCallExpression(init))
            continue;
        const expr = init.getExpression();
        if (Node.isIdentifier(expr) && expr.getText() === "state") {
            const symbol = decl.getSymbol();
            if (!symbol)
                continue;
            const id = makeId(filePath, decl.getName(), decl.getStart());
            stateSymbolToId.set(symbol, id);
        }
    }
    const callExpressions = file.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of callExpressions) {
        const expression = call.getExpression();
        if (!Node.isIdentifier(expression) || expression.getText() !== "loadHook")
            continue;
        const args = call.getArguments();
        const arg = args;
        if (!arg || !Node.isFunctionLikeDeclaration(arg))
            continue;
        const identifiers = arg.getDescendantsOfKind(SyntaxKind.Identifier);
        for (const idNode of identifiers) {
            const parent = idNode.getParent();
            if (Node.isPropertyAccessExpression(parent) && parent.getNameNode() === idNode) {
                continue;
            }
            const symbol = checker.getSymbolAtLocation(idNode);
            if (!symbol)
                continue;
            const stateId = stateSymbolToId.get(symbol);
            if (stateId) {
                idNode.replaceWithText(`_state["${stateId}"]`);
            }
        }
    }
    const output = file.getFullText();
    file.forget();
    return output;
}
