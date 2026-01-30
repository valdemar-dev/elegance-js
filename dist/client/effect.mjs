import { compilerStore } from "../compilation/compiler";
class Effect {
  constructor(callback, dependencies, id) {
    this.callback = callback;
    this.dependencies = dependencies.map((d) => d.id);
    this.id = id;
  }
  serialize() {
    let result = "{";
    result += `callback:${this.callback.toString()},`;
    result += `dependencies:[${this.dependencies.map((d) => `"${d}"`).join(",")}],`;
    result += `id:"${this.id}",`;
    result += "}";
    return result;
  }
}
function effect(callback, dependencies) {
  const store = compilerStore.getStore();
  if (!store) throw new Error("Illegal invocation of effect(). Ensure that the effect() function is only called inside components, and never at the top-level of a page or layout.");
  const id = store.generateId();
  const effect2 = new Effect(callback, dependencies, id);
  store.addClientToken(effect2);
}
export {
  Effect,
  effect
};
