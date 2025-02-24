// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createStateOld = (augment) => {
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
var createState = (value, options) => {
  const serverStateEntry = {
    id: currentId++,
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
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId++,
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
export {
  createEventListener,
  createState,
  createStateOld,
  getState,
  initializeState
};
