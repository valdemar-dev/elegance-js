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
export declare function transformSource(source: string, filePath?: string): string;
