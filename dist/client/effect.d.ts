import { ServerSubject } from "./state";
import type { ClientSubject } from "./runtime";
type EffectCallback<D extends readonly ServerSubject<unknown>[]> = (...dependencies: {
    [K in keyof D]: ClientSubject<D[K]["value"]>;
}) => any;
declare class Effect<const T extends readonly ServerSubject<unknown>[]> {
    callback: EffectCallback<T>;
    dependencies: string[];
    id: string;
    constructor(callback: EffectCallback<T>, dependencies: [...T], id: string);
    serialize(): string;
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
declare function effect<const T extends readonly ServerSubject<unknown>[]>(callback: EffectCallback<T>, dependencies: [...T]): void;
export { effect, Effect };
export type { EffectCallback, };
