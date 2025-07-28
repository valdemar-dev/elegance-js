import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

type ServerSubject = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
    bind?: string;
}

type LoadHookOptions<T extends ServerSubject[]> = {
    bind?: number | undefined,
    deps?: [...T],
    fn: (
        state: State,
        ...subjects: {
            [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>
        }
    ) => void,
};

export type LoadHook = {
    fn: string,
    bind: number,
}

export type ClientLoadHook = {
    bind: number,
    fn: (
        state: State,
    ) => (void | (() => void) | Promise<(void | (() => void))>),
}

export const resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
export const getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

export const createLoadHook = <T extends ServerSubject[]>(options: LoadHookOptions<T>) => {
    const stringFn = options.fn.toString();

    const deps = (options.deps || []).map(dep => ({
        id: dep.id,
        bind: dep.bind,
    }));

    let dependencyString = "[";
    for (const dep of deps) {
        dependencyString += `{id:${dep.id}`;
        if (dep.bind) dependencyString += `,bind:${dep.bind}`;
        dependencyString += `},`;
    }
    dependencyString += "]";

    const isAsync = options.fn.constructor.name === "AsyncFunction";

    const wrapperFn = isAsync
        ? `async (state) => {
            return await (${stringFn})(state, ...state.getAll(${dependencyString}));
          }`
        : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;

    globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
        fn: wrapperFn,
        bind: options.bind || "",
    });
};

