import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
export declare const createState: <T extends Record<string, any>>(augment: T) => { [K in keyof T]: {
    value: T[K];
    id: number;
    type: ObjectAttributeType.STATE;
}; };
export declare const createEventListener: <D extends {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}[], P extends Record<string, any>>(dependencies: [...D], eventListener: (params: {
    event: Event;
} & P, ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]>; }) => void, params?: P) => {
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
