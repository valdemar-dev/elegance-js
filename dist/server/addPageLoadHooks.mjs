// src/server/addPageLoadHooks.ts
var initializePageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__ = [];
var getPageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__;
var addPageLoadHooks = (hooks) => {
  globalThis.__SERVER_CURRENT_PAGELOADHOOKS__.push(...hooks);
};
export {
  addPageLoadHooks,
  getPageLoadHooks,
  initializePageLoadHooks
};
