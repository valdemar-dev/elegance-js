// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  const returnAugmentValue = {};
  for (const [key, value] of Object.entries(augment)) {
    const serverStateEntry = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
    globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
    returnAugmentValue[key] = serverStateEntry;
  }
  return returnAugmentValue;
};
var createEventListener = (dependencies, eventListener) => {
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})(event, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 3 /* OBSERVER */,
    ids: refs.map((ref) => ref.id),
    initialValues: refs.map((ref) => ref.value),
    update
  };
  return returnValue;
};

// src/docs/nullpage/page.ts
var variables = createState({
  counter: 0
});
var increment = createEventListener(
  [variables.counter],
  (event, counter) => {
    counter.value++;
    counter.signal();
  }
);
var page = body(
  {},
  p({
    innerText: observe(
      [variables.counter],
      (value) => `The Counter is at: ${value}`
    )
  }),
  button(
    {
      onClick: increment
    },
    "Increment Counter"
  )
);
export {
  page
};
