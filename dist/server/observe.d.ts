import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
export declare const observe: <T extends {
    type: ObjectAttributeType;
    value: unknown;
    id: string | number;
    bind?: string;
}[]>(refs: [...T], update: (...values: { [K in keyof T]: T[K] extends {
    value: infer V;
} ? V : never; }) => string) => {
    type: ObjectAttributeType;
    initialValues: unknown[];
    update: (...values: { [K in keyof T]: T[K] extends {
        value: infer V;
    } ? V : never; }) => string;
    refs: {
        id: string | number;
        bind: string | undefined;
    }[];
};
