import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const observe = <T extends { type: ObjectAttributeType; value: unknown; id: string | number, bind?: string }[]>(
    refs: [...T], 
    update: (...values: { [K in keyof T]: T[K] extends { value: infer V } ? V : never }) => string
) => {
    const returnValue = {
        type: ObjectAttributeType.OBSERVER,

        initialValues: refs.map(ref => ref.value),

        update: update,

        refs: refs.map(ref => ({
            id: ref.id,
            bind: ref.bind,
        })),
    };
    return returnValue;
};