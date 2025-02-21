import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
export declare const createState: <T extends Record<string, any>>(augment: T) => { [K in keyof T]: {
    value: T[K];
    id: number;
    type: ObjectAttributeType.STATE;
}; };
export declare const createEventListener: <T extends {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}[]>(dependencies: [...T], eventListener: (event: Event, ...subjects: { [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>; }) => void) => {
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
