import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

type ServerSubject = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}

type LoadHookOptions<T extends ServerSubject[]> = {
    bind?: string,
    deps?: [...T],
    fn: (
        state: State<any>,
        ...subjects: {
            [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>
        }
    ) => void,
};

export type LoadHook = {
    fn: string,
    bind: string,
}

export type ClientLoadHook = {
    bind: string,
    fn: (
        state: State<any>,
    ) => (void | (() => void)),
}

export const resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
export const getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

export const createLoadHook = <T extends ServerSubject[]>(options: LoadHookOptions<T>) => {
    const stringFn = options.fn.toString();
    const depIds = options.deps?.map(dep => dep.id);

    // hi 
    // send this so the build system
    // so it does shiot
    // thanks love ou bye

    globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
        fn: `(state) => (${stringFn})(state, ...state.getAll([${depIds}]))`,
        bind: options.bind || "",
    })
};
