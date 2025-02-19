import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

export const pageLoadHook = <
    T extends { type: ObjectAttributeType; value: unknown; id: number }[]
>(
    dependencies: [...T], 
    pageLoadHook: (state: State<any>, ...subjects: { [K in keyof T]: ClientSubjectGeneric<T[K]["value"]> }) => void,
) => {
    return new Function(
        "state", `return (${pageLoadHook.toString()})(state, ...state.getAll([${dependencies.map(dep => dep.id)}]))`
    )
};

