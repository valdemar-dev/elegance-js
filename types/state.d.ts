type Debounce = (delay: number) => (callback: () => void) => void;

class Subject<T> {
    enforceRuntimeTypes: boolean;
    observers: Array<{ callback: (value: T) => void }>;
    value: T;
    initialValue: T;
    id: string;
    debounce?: (callback: () => void) => void;
    signalId: number;

    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null);

    observe(callback: (value: T) => void): void;

    signal(): void;

    set(newValue: T): void;

    get(): T;

    getInitialValue(): T;
}

class StateController {
    currentPage: string;
    private globalSubjectCache: Array<Subject<any>>;
    private pageSubjectCaches: Map<string, Array<Subject<any>>>;

    constructor();

    private addSubjectPageCache(pathname: string): void;

    setCurrentPage(pathname: string): void;

    create<T>(
        initialValue: T,
        { id, enforceRuntimeTypes, debounceUpdateMs }: { id: string; enforceRuntimeTypes?: boolean; debounceUpdateMs?: number | null }
    ): Subject<T>;

    createGlobal<T>(
        initialValue: T,
        { id, enforceRuntimeTypes, debounceUpdateMs }: { id: string; enforceRuntimeTypes?: boolean; debounceUpdateMs?: number | null }
    ): Subject<T>;

    getGlobal(id: string): Subject<any>;

    get(id: string): Subject<any>;

    observe(id: string, callback: (value: any) => void): void;
}

declare const getStateController: () => StateController;

export { getStateController, StateController };
