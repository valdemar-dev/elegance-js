import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
export declare const getReference: (ref: number) => Element | null;
export declare const createReference: () => {
    type: ObjectAttributeType;
    value: number;
};
