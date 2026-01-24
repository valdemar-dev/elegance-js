import { loadHook } from "../client/loadHook";
import { state } from "../client/state";
import { compilerStore } from "../compilation/compiler";
function ClientComponent(callback, dependencies) {
  const callbackState = state(callback);
  const store = compilerStore.getStore();
  if (!store) {
    throw new Error("ClientComponent() can only be invoked during the compilation of a page or layout.");
  }
  const componentId = state(store.generateId());
  loadHook((componentId2, callback2, ...dependencies2) => {
    let node;
    function update() {
      if (node) node.remove();
      const element = callback2.value(...dependencies2);
      const HTMLElement = eleganceClient.createHTMLElementFromElement(element);
      node = HTMLElement.root;
      const trackedElement = document.querySelector(`template[component-id="${componentId2.value}"]`);
      if (!trackedElement) return;
      trackedElement.parentElement.insertBefore(HTMLElement.root, trackedElement);
    }
    const observers = [];
    for (const dep of dependencies2) {
      const id = `${Math.random() * 1e3 + Date.now()}`;
      dep.observe(id, update);
      observers.push({ subject: dep, id });
    }
    update();
    return () => {
      for (const observer of observers) {
        observer.subject.unobserve(observer.id);
      }
    };
  }, [componentId, callbackState, ...dependencies]);
  return template({
    "component-id": componentId.value
  });
}
export {
  ClientComponent
};
