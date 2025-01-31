import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
export declare const observe: <T>(ref: {
    type: ObjectAttributeType;
    value: T;
    id: number;
}, update: (value: T) => string) => {
    type: ObjectAttributeType;
    id: number;
    initialValue: T;
    update: (value: T) => string;
};
