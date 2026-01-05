/**
 * This file contains the functions used by compiler_process to compile pages.
 */
type CompilerOptions = {
    pagesDirectory: string;
};
declare function setCompilerOptions(newOptions: CompilerOptions): void;
export { setCompilerOptions, };
