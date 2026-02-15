import { relative } from "path";
function invalidPageError(compilerOptions, modulePath, reason) {
    const relativePath = relative(compilerOptions.pagesDirectory, modulePath);
    return new Error(`The page at path: "${relativePath}" is invalid.\n${reason}`);
}
export { invalidPageError, };
