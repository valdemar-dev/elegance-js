import type { EventListener, EventListenerCallback } from "./eventListener";
import type { LoadHookCallback } from "./loadHook";
import type { ServerObserver } from "./observer";
import type { ServerSubject } from "./state";
import type { Effect } from "./effect";
/**
 * A ServerSubject that has been serialized, shipped to the browser, and re-created as it's final form.
 *
 * Setting the `value` of this ClientSubject will trigger it's observers callbacks.
 *
 * To listen for changes in `value`, you may call the `observe()` method.
 */
declare class ClientSubject<T> {
    readonly id: string;
    private _value;
    private readonly observers;
    constructor(id: string, value: T);
    get value(): T;
    set value(newValue: T);
    /**
     * Manually trigger each of this subject's observers, with the subject's current value.
     *
     * Useful if you're mutating for example fields of an object, or pushing to an array.
     */
    triggerObservers(): void;
    /**
     * Add a new observer to this subject, `callback` is called whenever the value setter is called on this subject.
     *
     * Note: if an ID is already in use it's callback will just be overwritten with whatever you give it.
     *
     * Note: this triggers `callback` with the current value of this subject.
     *
     * @param id The unique id of this observer
     * @param callback Called whenever the value of this subject changes.
     */
    observe(id: string, callback: (newValue: T) => void): void;
    /**
     * Remove an observer from this subject.
     * @param id The unique id of the observer.
     */
    unobserve(id: string): void;
}
declare class StateManager {
    private readonly subjects;
    constructor();
    loadValues(values: ServerSubject<any>[], doOverwrite?: boolean): void;
    get(id: string): ClientSubject<any> | undefined;
    getAll(ids: string[]): Array<ClientSubject<any>>;
}
type ClientEventListenerOption = {
    /** The html attribute name this option should be attached to */
    option: string;
    /** The key of the element this option should be attached to. */
    key: string;
    /** The event listener id this option is referencing. */
    id: string;
};
/**
 * An event listener after it has been generated on the server, processed into pagedata, and reconstructed on the client.
 */
declare class ClientEventListener {
    id: string;
    callback: EventListenerCallback<any, any, any>;
    dependencies: string[];
    constructor(id: string, callback: EventListenerCallback<any, any, any>, depencencies: string[]);
    call(ev: Event): void;
}
declare class EventListenerManager {
    private readonly eventListeners;
    constructor();
    loadValues(serverEventListeners: EventListener<any, any, any>[], doOverride?: boolean): void;
    hookCallbacks(eventListenerOptions: ClientEventListenerOption[]): void;
    get(id: string): ClientEventListener | undefined;
}
type ClientObserverOption = {
    /** The html attribute name this option should be attached to */
    option: string;
    /** The key of the element this option should be attached to. */
    key: string;
    /** The event listener id this option is referencing. */
    id: string;
};
declare class ObserverManager {
    private readonly clientObservers;
    constructor();
    loadValues(serverObservers: ServerObserver<any>[], doOverride?: boolean): void;
    hookCallbacks(observerOptions: ClientObserverOption[]): void;
    /**
     * Take the results of ServerSubject.generateObserverNode(), replace their HTML placeins for text nodes, and turn those into observers.
     */
    transformSubjectObserverNodes(): void;
}
declare enum LoadHookKind {
    LAYOUT_LOADHOOK = 0,
    PAGE_LOADHOOK = 1
}
declare class EffectManager {
    private activeEffects;
    private cleanupProcedures;
    loadValues(effects: Effect<any>[]): void;
}
type ClientLoadHook = {
    callback: LoadHookCallback<any>;
    kind: LoadHookKind;
    id: string;
    pathname?: string;
};
declare class LoadHookManager {
    private cleanupProcedures;
    private activeLoadHooks;
    constructor();
    loadValues(loadHooks: ClientLoadHook[]): void;
    callCleanupFunctions(): void;
}
export { ClientSubject, StateManager, ObserverManager, LoadHookManager, EventListenerManager, EffectManager, };
