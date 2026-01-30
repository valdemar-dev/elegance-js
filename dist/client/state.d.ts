import { EleganceElement } from "../elements/element";
type StateCreationOptions = {
    /**
     * Override the default ID generation, this is not generally encouraged,
     * but can be useful if you cannot guarantee order-dependent state() calls.
     */
    explicitId?: string;
};
declare class ServerSubject<T extends any> {
    readonly id: string;
    value: T;
    constructor(id: string, value: T);
    /**
     * Create a client-side reactiveMap, that dynamically updates itself whenever the subject changes.
     *
     * **IMPORTANT** `callback` is sent literally to the browser, and thus doesn't have access to server-side variables, and is untrusted.
     * @param callback Client side templating function that gets each entry of T, and returns an EleganceElement.
     * @returns An HTML represent used to track the position of the reactive map.
     */
    reactiveMap(callback: (entry: T extends (infer U)[] ? U : never) => EleganceElement<any, any>): EleganceElement<any, true>;
    /**
     * Allows the use of a ServerSubject as the child of an EleganceElement.
     *
     * Returns an HTML string that will be removed on page-load in the client and replaced with the appropriate value.
     * @returns HTML string
     */
    generateObserverNode(): string;
    toString(): string;
    serialize(): string;
}
/**
 * Create a reactive ServerSubject which will be serialized and sent to the browser.
 *
 * Once in the callback of a loadHook, eventListener, etc. it will become a *ClientSubject*.
 * @param value Any value you want to be accessible in the browser. Value is sent literally as-is. Functions are supported.
 * @param options Set options for the state (usually unused)
 * @returns An instance of ServerSubject you can use as a reference to this state in functions like `loadHook()`
 */
declare function state<T>(value: T, options?: StateCreationOptions): ServerSubject<T>;
export { state, ServerSubject, };
