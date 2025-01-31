import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const observe = <T>(ref: { type: ObjectAttributeType, value: T; id: number }, update: (value: T) => string) => {
    return {
        type: ObjectAttributeType.OBSERVER,
        id: ref.id as number,
	initialValue: ref.value as T,
        update: update,
    };
};
