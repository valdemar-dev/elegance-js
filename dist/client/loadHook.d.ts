import { ServerSubject } from "./state";
import type { ClientSubject } from "./runtime";
declare enum LoadHookKind {
    LAYOUT_LOADHOOK = 0,
    PAGE_LOADHOOK = 1
}
type LoadHookCleanupFunction = (() => void);
type LoadHookCallback<D extends readonly ServerSubject<unknown>[]> = (...dependencies: {
    [K in keyof D]: ClientSubject<D[K]["value"]>;
}) => LoadHookCleanupFunction | void;
declare class LoadHook<const T extends readonly ServerSubject<unknown>[]> {
    pathname?: string;
    kind: LoadHookKind;
    callback: LoadHookCallback<T>;
    dependencies: string[];
    id: string;
    constructor(callback: LoadHookCallback<T>, dependencies: [...T], kind: LoadHookKind, id: string, pathname?: string);
    serialize(): string;
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
declare function loadHook<const T extends readonly ServerSubject<unknown>[]>(callback: LoadHookCallback<T>, dependencies: [...T]): void;
export { loadHook, LoadHook };
export type { LoadHookCallback, LoadHookCleanupFunction, LoadHookKind, };
