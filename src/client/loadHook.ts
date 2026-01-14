import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type SetEvent<E extends Event = Event, T extends EventTarget = EventTarget> =
    E & { target: T; currentTarget: T };

type ToClientTuple<T extends readonly ServerSubject<any>[]> = {
    [K in keyof T]: T[K] extends ServerSubject<infer V> ? ClientSubject<V> : never;
};

type LoadHookCleanupFunction = (() => void) | void;

type LoadHookCallback<T extends readonly ServerSubject<any>[]> =
    (event: SetEvent, ...dependencies: ToClientTuple<T>) => LoadHookCleanupFunction;

class LoadHook<T extends readonly ServerSubject<any>[]> {
    pathname: string;
    callback: LoadHookCallback<T>;
    dependencies: string[];

    constructor(pathname: string, callback: LoadHookCallback<T>, dependencies: [...T]) {
        this.pathname = pathname;
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
    }

    serialize(): string {
        return `{pathname:\"${this.pathname}\",callback:${this.callback.toString()},dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}]}`;
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

    const id = store.generateId();
    const listener = new LoadHook<T>(id, callback, dependencies);

    store.addLoadHook(listener);
}

export {
    loadHook,
    LoadHook
};

export type {
    LoadHookCallback,
    SetEvent,
    ToClientTuple
};
