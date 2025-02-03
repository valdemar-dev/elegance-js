// src/server/createState.ts
var currentId = 0;
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
