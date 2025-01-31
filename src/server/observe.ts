import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const observe = <T extends { type: ObjectAttributeType; value: unknown; id: number }[]>(
    refs: [...T], 
    update: (...values: { [K in keyof T]: T[K] extends { value: infer V } ? V : never }) => string
) => {
    const returnValue = {
        type: ObjectAttributeType.OBSERVER,
        ids: refs.map(ref => ref.id),
        initialValues: refs.map(ref => ref.value),
        update: update,
    };
    return returnValue;
};
