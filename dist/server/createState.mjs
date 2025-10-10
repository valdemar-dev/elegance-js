// src/internal/deprecate.ts
var ShowDeprecationWarning = (msg) => {
  console.warn("\x1B[31m", msg, "\x1B[0m");
  console.trace("Stack Trace:");
};

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}
var createState = (value, options) => {
  ShowDeprecationWarning("WARNING: The createState() and function is deprecated. Please use state() instead, from elegance-js/state.");
  const serverStateEntry = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  return serverStateEntry;
};
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
  ShowDeprecationWarning("WARNING: The createEventListener() and function is deprecated. Please use eventListener() instead, from elegance-js/state.");
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params || {})} }, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};
var initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};
var initializeObjectAttributes = () => globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__ = [];
var getObjectAttributes = () => {
  return globalThis.__SERVER_CURRENT_OBJECT_ATTRIBUTES__;
};
export {
  createEventListener,
  createState,
  getObjectAttributes,
  getState,
  initializeObjectAttributes,
  initializeState
};
