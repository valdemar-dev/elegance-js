import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import type { ClientSubject } from "./runtime";

enum LoadHookKind {
    LAYOUT_LOADHOOK,
    PAGE_LOADHOOK,
};

type LoadHookCleanupFunction = (() => void);

type LoadHookCallback<D extends readonly ServerSubject<unknown>[]> =
    (...dependencies: { [K in keyof D]: ClientSubject<D[K]["value"]> }) => LoadHookCleanupFunction | void | Promise<void>;

class LoadHook<const T extends readonly ServerSubject<unknown>[]> {
    pathname?: string;
    kind: LoadHookKind;
    callback: LoadHookCallback<T>;
    dependencies: string[];
    id: string;

    constructor(callback: LoadHookCallback<T>, dependencies: [...T], kind: LoadHookKind, id: string, pathname?: string) {
        this.pathname = pathname;
        this.callback = callback;
        this.kind = kind;
        this.dependencies = dependencies.map(d => d.id); 
        this.id = id;
    }

    serialize(): string {
        let result = "{";
        result += `callback:${this.callback.toString()},`;
        result += `dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}],`;

        result += `id:"${this.id}",`;

        result += `kind:${this.kind}`;

        if (this.kind === LoadHookKind.LAYOUT_LOADHOOK && this.pathname) {
            result += `,pathname:"${this.pathname}"`;
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
function loadHook<const T extends readonly ServerSubject<unknown>[]>(
    callback: LoadHookCallback<T>,
    dependencies?: [...T]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of loadHook(). Ensure that the loadHook() function is only called inside components, and never at the top-level of a page or layout.");

    const isLayoutLoadHook = store.compilationContext.kind === "layout";
    
    const loadHookKind = isLayoutLoadHook === true ? LoadHookKind.LAYOUT_LOADHOOK : LoadHookKind.PAGE_LOADHOOK
    const pathname = loadHookKind === LoadHookKind.LAYOUT_LOADHOOK ? store.compilationContext.pathname : undefined;

    const id = store.generateId();

    // horrible.
    const loadHook = new LoadHook<T>(callback, dependencies || [] as any, loadHookKind, id, pathname);

    store.addClientToken(loadHook);
}

export {
    loadHook,
    LoadHook
};

export type {
    LoadHookCallback,
    LoadHookCleanupFunction,
    LoadHookKind,
};
