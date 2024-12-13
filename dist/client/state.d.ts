declare enum SubjectScope {
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
    initialValue: T;
    pathname: string;
    debounce?: (callback: () => void) => void;
    scope: SubjectScope;
    resetOnPageLeave: boolean;
    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null, pathname?: string, scope?: SubjectScope, resetOnPageLeave?: boolean);
    observe(callback: (subject: T) => void): void;
    signal(): void;
    set(newValue: T): void;
    add(entry: T extends Array<infer U> ? U : never): void;
    remove(entry: T extends Array<infer U> ? U : never): void;
    reset(): void;
    get(): T;
    getInitialValue(): T;
}
declare class StateController {
    subjectStore: Array<Subject<any>>;
    constructor();
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
    get(id: string): Subject<any>;
    observe(id: string, callback: (value: any) => void, scope?: SubjectScope): void;
    resetEphemeralSubjects(): void;
    cleanSubjectObservers(): void;
}
export { StateController };
export type { Subject };
