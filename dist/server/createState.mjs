// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  const state = {};
  for (const [key, value] of Object.entries(augment)) {
    state[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return state;
};
export {
  createState
};
