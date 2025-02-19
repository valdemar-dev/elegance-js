import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

export const eventListener = <
    T extends { type: ObjectAttributeType; value: unknown; id: number }[]
>(
    dependencies: [...T], 
    eventListener: (event: Event, ...subjects: { [K in keyof T]: ClientSubjectGeneric<T[K]["value"]> }) => void,
) => {
    return new Function(
        "state", "event", `(${eventListener.toString()})(event, ...state.getAll([${dependencies.map(dep => dep.id)}]))`
    )
};

