import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type ToClientTuple<T extends readonly ServerSubject<any>[]> = {
    [K in keyof T]: T[K] extends ServerSubject<infer V> ? ClientSubject<V> : never;
};

enum LoadHookKind {
    LAYOUT_LOADHOOK,
    PAGE_LOADHOOK,
};

type LoadHookCleanupFunction = (() => void);

type LoadHookCallback<T extends readonly ServerSubject<any>[]> =
    (...dependencies: ToClientTuple<T>) => LoadHookCleanupFunction | void;

class LoadHook<T extends readonly ServerSubject<any>[]> {
    pathname?: string;
    kind: LoadHookKind;
    callback: LoadHookCallback<T>;
    dependencies: string[];

    constructor(callback: LoadHookCallback<T>, dependencies: [...T], kind: LoadHookKind, pathname?: string) {
        this.pathname = pathname;
        this.callback = callback;
        this.kind = kind;
        this.dependencies = dependencies.map(d => d.id);
    }

    serialize(): string {
        let result = "{";
        result += `callback:${this.callback.toString()},`;
        result += `dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}],`;

        result += `kind:${this.kind}`;

        if (this.kind === LoadHookKind.LAYOUT_LOADHOOK && this.pathname) {
            result += `,pathname:\"${this.pathname}\"`;
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
 * @param callback The browser-side contextless code the loadHook will run.
 * @param dependencies A dependency of state that will be passed into this loadHook
 */
function loadHook<T extends readonly ServerSubject<any>[]>(
    callback: LoadHookCallback<T>,
    dependencies: [...T]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of loadHook(). Ensure that the loadHook() function is only called inside components, and never at the top-level of a page or layout.");

    const isLayoutLoadHook = store.compilationContext.kind === "layout";
    
    const loadHookKind = isLayoutLoadHook === true ? LoadHookKind.LAYOUT_LOADHOOK : LoadHookKind.PAGE_LOADHOOK
    const pathname = loadHookKind === LoadHookKind.LAYOUT_LOADHOOK ? store.compilationContext.pathname : undefined;

    const listener = new LoadHook<T>(callback, dependencies, loadHookKind, pathname);

    store.addLoadHook(listener);
}

export {
    loadHook,
    LoadHook
};

export type {
    LoadHookCallback,
    ToClientTuple,
    LoadHookCleanupFunction,
    LoadHookKind,
};
