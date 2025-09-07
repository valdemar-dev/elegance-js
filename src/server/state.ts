import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
    globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}

let currentId = globalThis.__SERVER_CURRENT_STATE_ID__;


type Widen<T> =
    T extends number ? number :
    T extends string ? string :
    T extends boolean ? boolean :
    T extends {} ? T & Record<string, any> :
    T;

export const state = <
    U extends number | string | boolean | {},
>(
    value: U,
    options?: {
        bind?: number;
        // ephemeral?: boolean;
    },
) => {
    type ValueType = Widen<U>;

    const serverStateEntry = {
        id: currentId += 1,
        value: value,
        type: ObjectAttributeType.STATE,
        bind: options?.bind,
    };

    globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);

    return serverStateEntry as {
        id: number,
        value: ValueType,
        type: ObjectAttributeType.STATE,
        bind: string | undefined,
    };
};

type Dependencies = { type: ObjectAttributeType; value: unknown; id: number; bind?: string }[];

export type SetEvent<Event, Target> =
  Omit<Event, "currentTarget"> & { currentTarget: Target };

export const eventListener = <
    D extends Dependencies,
    E extends Event,
    T,
>(
    dependencies: [...D] | [],
    eventListener: (
        event: SetEvent<E, T>,
        ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]> }
    ) => void
) => {
    const deps = dependencies.map(dep => ({ id: dep.id, bind: dep.bind }));

    let dependencyString = "[";
    for (const dep of deps) {
        dependencyString += `{id:${dep.id}`;

        if (dep.bind) dependencyString += `,bind:${dep.bind}`;

        dependencyString += `},`;
    }

    dependencyString += "]";

    const value = {
        id: currentId += 1,
        type: ObjectAttributeType.STATE,
        value: new Function(
            "state",
            "event",
            `(${eventListener.toString()})(event, ...state.getAll(${dependencyString}))`
        ),
    };

    globalThis.__SERVER_CURRENT_STATE__.push(value);

    return value;
};

export const initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
export const getState = () => {
    return globalThis.__SERVER_CURRENT_STATE__;
}


