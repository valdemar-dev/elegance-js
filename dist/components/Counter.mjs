// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  for (const [key, value] of Object.entries(augment)) {
    globalThis.__SERVER_CURRENT_STATE__[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return globalThis.__SERVER_CURRENT_STATE__;
};

// src/server/eventListener.ts
var eventListener = (dependencies, eventListener2) => {
  return new Function(
    "state",
    "event",
    `(${eventListener2.toString()})(event, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
  );
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

// src/components/Counter.ts
var variables = createState({
  counter: 0
});
var functions = createState({
  incrementCounter: eventListener(
    [variables.counter],
    (event, counter) => {
      counter.set(counter.value + 1);
      counter.signal();
    }
  )
});
var Counter = () => div(
  {},
  p({
    innerText: observe(
      [variables.counter],
      (counter) => `The Counter is at: ${counter}`
    )
  }),
  button({
    onClick: functions.incrementCounter,
    innerText: "Increment Counter"
  })
);
export {
  Counter
};
