import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
export declare const createState: <T extends Record<string, any>>(augment: T) => { [K in keyof T]: {
    value: T[K];
    id: number;
    type: ObjectAttributeType.STATE;
}; };
export declare const initializeState: () => {};
export declare const getState: () => Record<string, any>;
