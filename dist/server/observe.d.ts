import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
export declare const observe: <T extends {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
}[]>(refs: [...T], update: (...values: { [K in keyof T]: T[K] extends {
    value: infer V;
} ? V : never; }) => string) => {
    type: ObjectAttributeType;
    ids: number[];
    initialValues: unknown[];
    update: (...values: { [K in keyof T]: T[K] extends {
        value: infer V;
    } ? V : never; }) => string;
};
