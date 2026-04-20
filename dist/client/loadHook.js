import { compilerStore } from "../compilation/compiler";
import { getProcessedFunctionBody } from "../compilation/modify";
var LoadHookKind;
(function (LoadHookKind) {
    LoadHookKind[LoadHookKind["LAYOUT_LOADHOOK"] = 0] = "LAYOUT_LOADHOOK";
    LoadHookKind[LoadHookKind["PAGE_LOADHOOK"] = 1] = "PAGE_LOADHOOK";
})(LoadHookKind || (LoadHookKind = {}));
;
class LoadHook {
    constructor(processedCallback, kind, id, pathname) {
        this.pathname = pathname;
        this.processedCallback = processedCallback;
        this.kind = kind;
        this.id = id;
    }
    serialize() {
        let result = "{";
        result += `c:(_s) => {(${this.processedCallback})()},`;
        result += `i:"${this.id}",`;
        result += `k:${this.kind}`;
        if (this.kind === LoadHookKind.LAYOUT_LOADHOOK && this.pathname) {
            result += `,p:"${this.pathname}"`;
        }
        result += "}";
        return result;
    }
}
/**
 * Creates a browser-side callback that is called upon navigation to a given page.
 * It may return a cleanup function which will be called when the loadHook goes out of scope.
 * If it is declared within a layout, is it pathname scoped, and it's cleanupFunction will be called when the layout is no longer active.
 * Eg. Navigation from /recipes/cake to /recipes will call the cleanup of /recipes/cake's page, and it's layout, but not /recipes, since it's pathname is in the new pathname we're navigating to.
 *
 * **IMPORTANT**: The callback is *browser-code*, and thus does not have any context of your page.ts or layout.ts file.
 * The callback function is sent *literally* to the browser, as-is.
 *
 * @param callback The browser-side contextless code the loadHook will run.
 * @param dependencies A dependency of state that will be passed into this loadHook
 */
function loadHook(callback, dependencies) {
    const store = compilerStore.getStore();
    if (!store)
        throw new Error("Illegal invocation of loadHook(). Ensure that the loadHook() function is only called inside components, and never at the top-level of a page or layout.");
    const processed = getProcessedFunctionBody();
    const isLayoutLoadHook = store.compilationContext.kind === "layout";
    const loadHookKind = isLayoutLoadHook === true ? LoadHookKind.LAYOUT_LOADHOOK : LoadHookKind.PAGE_LOADHOOK;
    const pathname = loadHookKind === LoadHookKind.LAYOUT_LOADHOOK ? store.compilationContext.pathname : undefined;
    const id = store.generateId();
    // horrible.
    const loadHook = new LoadHook(processed, loadHookKind, id, pathname);
    store.addClientToken(loadHook);
}
export { loadHook, LoadHook };
