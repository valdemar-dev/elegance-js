import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
export declare const eventListener: <T extends {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}[]>(dependencies: [...T], eventListener: (event: Event, ...subjects: { [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>; }) => void) => Function;
export {};
