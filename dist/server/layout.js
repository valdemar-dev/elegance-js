import { relative } from "node:path";
function invalidLayoutError(compilerOptions, modulePath, reason) {
    const relativePath = relative(compilerOptions.pagesDirectory, modulePath);
    return new Error(`The layout at path: "${relativePath}" is invalid.\n${reason}`);
}
export { invalidLayoutError, };
