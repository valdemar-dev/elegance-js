import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
    globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}

let currentId = globalThis.__SERVER_CURRENT_STATE_ID__;

export const createStateOld = <T extends Record<string, any>>(augment: T) => {
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

type Widen<T> =
    T extends number ? number :
    T extends string ? string :
    T extends boolean ? boolean :
    T;

export const createState = <
    U extends number | string | boolean,
>(
    value: U,
    options?: {
        bind?: number;
        // ephemeral?: boolean;
    },
) => {
    type ValueType = Widen<U>;

    const serverStateEntry = {
        id: currentId++,
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

type Dependencies = { type: ObjectAttributeType; value: unknown; id: number; bind?: string, }[];
type Parameters = {};

export type SetEvent<E, CT> = Omit<Parameters, "event"> & {
    event: Omit<E, "currentTarget"> & { currentTarget: CT }
};

export type CreateEventListenerOptions<
    D extends Dependencies,
    P extends {} = {},
> = {
    dependencies?: [...D] | [], 
    eventListener: (
        params: P & {
            event: Event,
        },
        ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]> }
    ) => void,
    params?: P | null
}

export const createEventListener = <
    D extends Dependencies,
    P extends Parameters,
>({
    eventListener,
    dependencies = [],
    params,
}: CreateEventListenerOptions<D,P>,
) => {
    const deps = dependencies.map(dep => ({ id: dep.id, bind: dep.bind, }));

    let dependencyString = "[";
    for (const dep of deps) {
        dependencyString += `{id:${dep.id}`;

        if (dep.bind) dependencyString += `,bind:${dep.bind}`;

        dependencyString += `},`;
    }

    dependencyString += "]";

    const value = {
        id: currentId++,
        type: ObjectAttributeType.STATE,
        value: new Function(
            "state",
            "event",
            `(${eventListener.toString()})({ event, ...${JSON.stringify(params || {})} }, ...state.getAll(${dependencyString}))`
        ),
    };

    globalThis.__SERVER_CURRENT_STATE__.push(value);

    return value;
};


export const initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
export const getState = () => {
    return globalThis.__SERVER_CURRENT_STATE__;
}


