import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
type ServerSubject = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
};
type LoadHookOptions<T extends ServerSubject[]> = {
    bind?: string;
    deps?: [...T];
    fn: (state: State, ...subjects: {
        [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>;
    }) => void;
};
export type LoadHook = {
    fn: string;
    bind: string;
};
export type ClientLoadHook = {
    bind: string;
    fn: (state: State) => (void | (() => void));
};
export declare const resetLoadHooks: () => never[];
export declare const getLoadHooks: () => any[];
export declare const createLoadHook: <T extends ServerSubject[]>(options: LoadHookOptions<T>) => void;
export {};
