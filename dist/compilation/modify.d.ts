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
export declare function transformSource(source: string, filePath?: string, targetFunctionName?: string, targetLine?: number, targetChar?: number): string;
export declare function _getCallerFile(): {
    ourCaller: {
        getFunctionName: () => any;
    };
    targetCaller: {
        fileName: any;
        line: number;
        char: any;
    };
};
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
export declare function getProcessedFunctionBody(): string;
