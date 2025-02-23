// src/server/createReference.ts
if (!globalThis.__SERVER_CURRENT_REF_ID__) {
  globalThis.__SERVER_CURRENT_REF_ID__ = 0;
}
var currentRefId = globalThis.__SERVER_CURRENT_REF_ID__;
var getReference = (ref) => {
  return document.querySelector(`[ref="${ref}]"`);
};
var createReference = () => {
  return {
    type: 6 /* REFERENCE */,
    value: currentRefId++
  };
};
export {
  createReference,
  getReference
};
