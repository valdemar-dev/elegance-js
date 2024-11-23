type Debounce = (delay: number) => (callback: () => void) => void;

class Subject<T> {
    enforceRuntimeTypes: boolean;
    observers: Array<{ callback: (value: T) => void }>;
    value: T;
    initialValue: T;
    id: string;
    debounce?: (callback: () => void) => void;
    signalId: number;
    pathname: string;

    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null, pathname: string);

    observe(callback: (value: T) => void): void;

    signal(): void;

    set(newValue: T): void;

    get(): T;

    getInitialValue(): T;
}

class StateController {
    private subjectStore: Array<Subject<any>>

    constructor();

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
