import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
export declare const createState: <T extends Record<string, any>>(augment: T) => { [K in keyof T]: {
    value: T[K];
    id: number;
    type: ObjectAttributeType.STATE;
}; };
type Dependencies = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}[];
type Parameters = Record<string, any>;
export type CreateEventListenerOptions<D extends Dependencies, P extends Parameters> = {
    dependencies?: [...D] | [];
    eventListener: (params: P & {
        event: Event;
    }, ...subjects: {
        [K in keyof D]: ClientSubjectGeneric<D[K]["value"]>;
    }) => void;
    params?: P;
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
}[];
export {};
