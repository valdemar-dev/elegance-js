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
    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null, pathname?: string, scope?: SubjectScope);
    observe(callback: (subject: T) => void): void;
    signal(): void;
    set(newValue: T): void;
    get(): T;
    getInitialValue(): T;
}
declare class StateController {
    subjectStore: Array<Subject<any>>;
    constructor();
    create(initialValue: any, { id, enforceRuntimeTypes, debounceUpdateMs }: {
        id: string;
        enforceRuntimeTypes?: boolean;
        debounceUpdateMs?: number;
    }): Subject<any>;
    createGlobal(initialValue: any, { id, enforceRuntimeTypes, debounceUpdateMs }: {
        id: string;
        enforceRuntimeTypes?: boolean;
        debounceUpdateMs?: number;
    }): Subject<any>;
    getGlobal(id: string): Subject<any>;
    get(id: string): Subject<any>;
    observe(id: string, callback: (value: any) => void, scope?: SubjectScope): void;
}
declare const getStateController: () => StateController;
export { getStateController, StateController };
