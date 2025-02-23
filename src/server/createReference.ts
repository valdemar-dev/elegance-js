import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

if (!globalThis.__SERVER_CURRENT_REF_ID__) {
    globalThis.__SERVER_CURRENT_REF_ID__ = 0;
}

let currentRefId = globalThis.__SERVER_CURRENT_REF_ID__;

export const getReference = (ref: number) => {
    return document.querySelector(`[ref="${ref}]"`)
};

export const createReference = () => {
    return {
        type: ObjectAttributeType.REFERENCE,
        value: currentRefId++
    }
};
