// src/server/createState.ts
var currentId = 0;
var createState = (augment) => {
  const state2 = {};
  for (const [key, value] of Object.entries(augment)) {
    state2[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return state2;
};

// src/docs/page.ts
var state = createState({});
var page = body(
  {},
  "hi"
);
export {
  page,
  state
};
