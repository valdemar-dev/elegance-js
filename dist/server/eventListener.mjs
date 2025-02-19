// src/server/eventListener.ts
var eventListener = (dependencies, eventListener2) => {
  return new Function(
    "state",
    "event",
    `(${eventListener2.toString()})(event, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
  );
};
export {
  eventListener
};
