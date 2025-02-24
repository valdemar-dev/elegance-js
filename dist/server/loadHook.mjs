// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;
var createLoadHook = (options) => {
  const stringFn = options.fn.toString();
  const deps = (options.deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`,
    bind: options.bind || ""
  });
};
export {
  createLoadHook,
  getLoadHooks,
  resetLoadHooks
};
