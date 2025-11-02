import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

import { getStore } from "../context";

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

export const resetLoadHooks = () => {
    const store = getStore();
    store.loadHooks = [];
}
export const getLoadHooks = () => {
    const store = getStore();
    return store.loadHooks;
}

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

    const store = getStore();
    store.loadHooks.push({
        fn: wrapperFn,
        bind: bind || "",
    });
};