export declare const enum SubjectScope {
    LOCAL = 1,
    GLOBAL = 2
}
declare class Subject<T> {
    enforceRuntimeTypes: boolean;
    observers: Array<{
        callback: (value: T) => void;
    }>;
    id: string;
    value: T;
    pathname: string;
    debounce?: (callback: () => void) => void;
    scope: SubjectScope;
    resetOnPageLeave: boolean;
    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null, pathname?: string, scope?: SubjectScope, resetOnPageLeave?: boolean);
    set(newValue: T): void;
    add(entry: T extends Array<infer U> ? U : never): void;
    remove(entry: T extends Array<infer U> ? U : never): void;
    get(): T;
}
declare class ServerStateController {
    subjectStore: Array<Subject<any>>;
    observerStore: Array<{
        [key: string]: "local" | "global";
    }>;
    pathname: string;
    constructor(pathname: string);
    create<T>(initialValue: T, { id, enforceRuntimeTypes, debounceUpdateMs, resetOnPageLeave, }: {
        id: string;
        enforceRuntimeTypes?: boolean;
        debounceUpdateMs?: number;
        resetOnPageLeave?: boolean;
    }): Subject<any>;
    createGlobal<T>(initialValue: T, { id, enforceRuntimeTypes, debounceUpdateMs, resetOnPageLeave, }: {
        id: string;
        enforceRuntimeTypes?: boolean;
        debounceUpdateMs?: number;
        resetOnPageLeave?: boolean;
    }): Subject<any>;
    getGlobal(id: string): Subject<any>;
    get(id: string): Subject<any> | undefined;
    storeObserver(id: string, scope: "local" | "global"): void;
}
export { ServerStateController };
export type { Subject };
