import { compilerStore } from "../compilation/compiler";
class Effect {
    constructor(callback, dependencies, id) {
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
        this.id = id;
    }
    serialize() {
        let result = "{";
        result += `callback:${this.callback.toString()},`;
        result += `dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}],`;
        result += `id:"${this.id}",`;
        result += "}";
        return result;
    }
}
/**
 * Creates a browser-side callback that is called upon navigation to a given page.
 * It may return a cleanup function which will be called when the Effect goes out of scope.
 * If it is declared within a layout, is it pathname scoped, and it's cleanupFunction will be called when the layout is no longer active.
 * Eg. Navigation from /recipes/cake to /recipes will call the cleanup of /recipes/cake's page, and it's layout, but not /recipes, since it's pathname is in the new pathname we're navigating to.
 *
 * **IMPORTANT**: The callback is *browser-code*, and thus does not have any context of your page.ts or layout.ts file.
 * The callback function is sent *literally* to the browser, as-is.
 *
 * @param callback The browser-side contextless code the Effect will run.
 * @param dependencies A dependency of state that will be passed into this Effect
 */
function effect(callback, dependencies) {
    const store = compilerStore.getStore();
    if (!store)
        throw new Error("Illegal invocation of effect(). Ensure that the effect() function is only called inside components, and never at the top-level of a page or layout.");
    const id = store.generateId();
    const effect = new Effect(callback, dependencies, id);
    store.addClientToken(effect);
}
export { effect, Effect };
