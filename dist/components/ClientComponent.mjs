import { loadHook } from "../client/loadHook";
import { state } from "../client/state";
import { compilerStore } from "../compilation/compiler";
function ClientComponent(callback, dependencies) {
  const callbackState = state(callback);
  const dependenciesState = state(dependencies);
  const store = compilerStore.getStore();
  if (!store) {
    throw new Error("ClientComponent() can only be invoked during the compilation of a page or layout.");
  }
  const componentId = state(store.generateId());
  const depIds = state(dependencies.map((d) => d.id));
  loadHook((componentId2, ...depIds2) => {
    console.log(...dependencies);
  }, [componentId, ...dependencies]);
  return template({
    "component-id": componentId.value
  });
}
export {
  ClientComponent
};
