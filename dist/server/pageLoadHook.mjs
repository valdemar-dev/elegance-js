// src/server/pageLoadHook.ts
var pageLoadHook = (dependencies, pageLoadHook2) => {
  return new Function(
    "state",
    `return (${pageLoadHook2.toString()})(state, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
  );
};
export {
  pageLoadHook
};
