// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;
var createLoadHook = (options) => {
  const stringFn = options.fn.toString();
  const depIds = options.deps?.map((dep) => dep.id);
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll([${depIds}]))`,
    bind: options.bind || ""
  });
};
export {
  createLoadHook,
  getLoadHooks,
  resetLoadHooks
};
