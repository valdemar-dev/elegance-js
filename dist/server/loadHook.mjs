// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var als = new AsyncLocalStorage();
var runAls = als.run;
var getStore = () => {
  const store = als.getStore();
  if (store === void 0)
    throw new Error("Tried to access ALS outside of ALS context.");
  return store;
};

// src/server/loadHook.ts
var resetLoadHooks = () => {
  const store = getStore();
  store.loadHooks = [];
};
var getLoadHooks = () => {
  const store = getStore();
  return store.loadHooks;
};
var loadHook = (deps, fn, bind) => {
  const stringFn = fn.toString();
  const depsArray = (deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of depsArray) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const isAsync = fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  const store = getStore();
  store.loadHooks.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};
export {
  getLoadHooks,
  loadHook,
  resetLoadHooks
};
