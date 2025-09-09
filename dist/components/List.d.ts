import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};
type ServerSubject = {
    type: ObjectAttributeType;
    value: unknown;
    id: number;
    bind?: string;
};
type ListOptions<T extends ServerSubject[]> = {
    template: (...subjects: {
        [K in keyof T]: ClientSubjectGeneric<T[K]["value"]>;
    }) => Child;
    deps?: [...T];
};
declare const List: <T extends ServerSubject[]>(options: ListOptions<T>) => void;
export { List };
