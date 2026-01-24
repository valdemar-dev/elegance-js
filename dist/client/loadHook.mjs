import { compilerStore } from "../compilation/compiler";
var LoadHookKind = /* @__PURE__ */ ((LoadHookKind2) => {
  LoadHookKind2[LoadHookKind2["LAYOUT_LOADHOOK"] = 0] = "LAYOUT_LOADHOOK";
  LoadHookKind2[LoadHookKind2["PAGE_LOADHOOK"] = 1] = "PAGE_LOADHOOK";
  return LoadHookKind2;
})(LoadHookKind || {});
;
class LoadHook {
  constructor(callback, dependencies, kind, id, pathname) {
    this.pathname = pathname;
    this.callback = callback;
    this.kind = kind;
    this.dependencies = dependencies.map((d) => d.id);
    this.id = id;
  }
  serialize() {
    let result = "{";
    result += `callback:${this.callback.toString()},`;
    result += `dependencies:[${this.dependencies.map((d) => `"${d}"`).join(",")}],`;
    result += `id:"${this.id}",`;
    result += `kind:${this.kind}`;
    if (this.kind === 0 /* LAYOUT_LOADHOOK */ && this.pathname) {
      result += `,pathname:"${this.pathname}"`;
    }
    result += "}";
    return result;
  }
}
function loadHook(callback, dependencies) {
  const store = compilerStore.getStore();
  if (!store) throw new Error("Illegal invocation of loadHook(). Ensure that the loadHook() function is only called inside components, and never at the top-level of a page or layout.");
  const isLayoutLoadHook = store.compilationContext.kind === "layout";
  const loadHookKind = isLayoutLoadHook === true ? 0 /* LAYOUT_LOADHOOK */ : 1 /* PAGE_LOADHOOK */;
  const pathname = loadHookKind === 0 /* LAYOUT_LOADHOOK */ ? store.compilationContext.pathname : void 0;
  const id = store.generateId();
  const listener = new LoadHook(callback, dependencies, loadHookKind, id, pathname);
  store.addClientToken(listener);
}
export {
  LoadHook,
  loadHook
};
