import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
    globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}

let currentId = globalThis.__SERVER_CURRENT_STATE_ID__;

export const createState = <T extends Record<string, any>>(augment: T) => {
    const returnAugmentValue: Record<string, any> = {};

    for (const [key, value] of Object.entries(augment)) {
        const serverStateEntry = {
            id: currentId++,
            value: value as typeof value,
            type: ObjectAttributeType.STATE,
        };

        globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);

        // make it so you can access stuff!!
        returnAugmentValue[key] = serverStateEntry;
    }

    return returnAugmentValue as { 
        [K in keyof T]: { value: T[K], id: number, type: ObjectAttributeType.STATE } 
    };
};


type Dependencies = { type: ObjectAttributeType; value: unknown; id: number }[];
type Parameters = Record<string, any>;


export type SetEvent<E, CT> = Omit<Parameters, "event"> & {
    event: Omit<E, "currentTarget"> & { currentTarget: CT }
};

export type CreateEventListenerOptions<
    D extends Dependencies,
    P extends Parameters,
> = {
    dependencies?: [...D] | [], 
    eventListener: (
        params: {
            event: Event,
        } & P,
        ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]> }
    ) => void,
    params?: P
}

export const createEventListener = <
    D extends Dependencies = Dependencies,
    P extends Parameters = Parameters,
>({
    eventListener,
    dependencies = [],
    params,
}: CreateEventListenerOptions<D,P>,
) => {
    const value = {
        id: currentId++,
        type: ObjectAttributeType.STATE,
        value: new Function(
            "state",
            "event",
            `(${eventListener.toString()})({ event, ...${JSON.stringify(params)} }, ...state.getAll([${dependencies.map(dep => dep.id)}]))`
        ),
    };

    globalThis.__SERVER_CURRENT_STATE__.push(value);

    return value;
};


export const initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
export const getState = () => {
    return globalThis.__SERVER_CURRENT_STATE__;
}


