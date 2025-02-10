import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
    globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}

let currentId = globalThis.__SERVER_CURRENT_STATE_ID__;

export const createState = <T extends Record<string, any>>(augment: T) => {
    const state: Record<string, any> = {};

    for (const [key, value] of Object.entries(augment)) {
        state[key] = {
            id: currentId++,
            value: value as typeof value,
            type: ObjectAttributeType.STATE,
        };
    }

    // type casting magic
    // makes type inferance not suck -val 2025-31-1
    return state as { 
        [K in keyof T]: { value: T[K], id: number, type: ObjectAttributeType.STATE } 
    };
};
