import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
import { ShowDeprecationWarning } from "../internal/deprecate";

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
    fn: (
        state: State,
        ...subjects: {
            [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>
        }
    ) => void,
    deps?: [...T],
    bind?: number | undefined,
};

export type LoadHook = {
    fn: string,
    bind: number | string,
}

export type ClientLoadHook = {
    bind: string,
    fn: (
        state: State,
    ) => (void | (() => void) | Promise<(void | (() => void))>),
}

export const resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
export const getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;

export const loadHook = <T extends ServerSubject[]>(
    deps: LoadHookOptions<T>["deps"],
    fn: LoadHookOptions<T>["fn"],
    bind?: LoadHookOptions<T>["bind"]
) => {
    const stringFn = fn.toString();

    const depsArray = (deps || []).map(dep => ({
        id: dep.id,
        bind: dep.bind,
    }));

    let dependencyString = "[";
    for (const dep of depsArray) {
        dependencyString += `{id:${dep.id}`;
        if (dep.bind) dependencyString += `,bind:${dep.bind}`;
        dependencyString += `},`;
    }
    dependencyString += "]";

    const isAsync = fn.constructor.name === "AsyncFunction";
    
    const wrapperFn = isAsync
        ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))`
        : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;

    globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
        fn: wrapperFn,
        bind: bind || "",
    });
};

export const createLoadHook = <T extends ServerSubject[]>(options: LoadHookOptions<T>) => {
    ShowDeprecationWarning("WARNING: createLoadHook() is a deprecated function. Use loadHook() from elegance-js/loadHook instead.");
    
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
        ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))`
        : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;

    globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
        fn: wrapperFn,
        bind: options.bind || "",
    });
};
