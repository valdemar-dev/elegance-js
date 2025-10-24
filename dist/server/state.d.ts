import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
type Widen<T> = T extends number ? number : T extends string ? string : T extends boolean ? boolean : T extends {} ? T & Record<string, any> : T;
export declare const state: <U extends number | string | boolean | {} | undefined | null | Array<any>>(value: U, options?: {
    isGlobal: boolean;
}) => {
    id: number;
    value: Widen<U>;
    type: ObjectAttributeType.STATE;
    bind: string | undefined;
    reactiveMap: U extends Array<any> ? ReactiveMap<U, any> : null;
};
type ReactiveMap<T extends any[], D extends Dependencies> = (this: {
    id: number;
    value: any;
    type: ObjectAttributeType.STATE;
    bind: string | undefined;
}, template: (item: T[number], index: number, ...deps: {
    [K in keyof D]: ClientSubjectGeneric<D[K]>["value"];
}) => Child, deps?: [...D]) => Child;
type Dependencies = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
    bind?: string;
}[];
export type SetEvent<Event, Target> = Omit<Event, "currentTarget"> & {
    currentTarget: Target;
};
export declare const eventListener: <D extends Dependencies, E extends Event, T>(dependencies: [...D] | [], eventListener: (event: SetEvent<E, T>, ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]>; }) => void) => {
    id: number;
    type: ObjectAttributeType;
    value: Function;
};
export declare const initializeState: () => never[];
export declare const getState: () => {
    value: unknown;
    type: ObjectAttributeType;
    id: number;
    bind?: number;
}[];
export {};
