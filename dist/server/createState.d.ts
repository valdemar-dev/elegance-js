import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
export declare const createStateOld: <T extends Record<string, any>>(augment: T) => { [K in keyof T]: {
    value: T[K];
    id: number;
    type: ObjectAttributeType.STATE;
}; };
type Widen<T> = T extends number ? number : T extends string ? string : T extends boolean ? boolean : T;
export declare const createState: <U extends number | string | boolean>(value: U, options?: {
    bind?: number;
}) => {
    id: number;
    value: Widen<U>;
    type: ObjectAttributeType.STATE;
    bind: string | undefined;
};
type Dependencies = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
    bind?: string;
}[];
type Parameters = {};
export type SetEvent<E, CT> = Omit<Parameters, "event"> & {
    event: Omit<E, "currentTarget"> & {
        currentTarget: CT;
    };
};
export type CreateEventListenerOptions<D extends Dependencies, P extends {} = {}> = {
    dependencies?: [...D] | [];
    eventListener: (params: P & {
        event: Event;
    }, ...subjects: {
        [K in keyof D]: ClientSubjectGeneric<D[K]["value"]>;
    }) => void;
    params?: P | null;
};
export declare const createEventListener: <D extends Dependencies, P extends Parameters>({ eventListener, dependencies, params, }: CreateEventListenerOptions<D, P>) => {
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
