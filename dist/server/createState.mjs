// src/server/createState.ts
var createState = (augment) => {
  const state = {};
  let currentId = 0;
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
