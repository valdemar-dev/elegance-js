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
    fn: (state: State, ...subjects: {
        [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>;
    }) => void;
    deps?: [...T];
    bind?: number | undefined;
};
export type LoadHook = {
    fn: string;
    bind: number | string;
};
export type ClientLoadHook = {
    bind: string;
    fn: (state: State) => (void | (() => void) | Promise<(void | (() => void))>);
};
export declare const resetLoadHooks: () => void;
export declare const getLoadHooks: () => any;
export declare const loadHook: <T extends ServerSubject[]>(deps: LoadHookOptions<T>["deps"], fn: LoadHookOptions<T>["fn"], bind?: LoadHookOptions<T>["bind"]) => void;
export {};
