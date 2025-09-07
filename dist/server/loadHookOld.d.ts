import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
type ServerSubject = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
    bind?: string;
};
type LoadHookOptions<T extends ServerSubject[]> = {
    bind?: number | undefined;
    deps?: [...T];
    fn: (state: State, ...subjects: {
        [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>;
    }) => void;
};
export type LoadHook = {
    fn: string;
    bind: number;
};
export type ClientLoadHook = {
    bind: number;
    fn: (state: State) => (void | (() => void) | Promise<(void | (() => void))>);
};
export declare const resetLoadHooks: () => never[];
export declare const getLoadHooks: () => any[];
export declare const createLoadHook: <T extends ServerSubject[]>(options: LoadHookOptions<T>) => void;
export {};
