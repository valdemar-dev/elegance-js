import { SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
class EventListenerOption extends SpecialElementOption {
  constructor(id) {
    super();
    this.id = id;
  }
  mutate(element, optionName) {
    delete element.options[optionName];
  }
  serialize(optionName, elementKey) {
    let result = "{";
    result += `option:"${optionName.toLowerCase()}",`;
    result += `key:"${elementKey}",`;
    result += `id:"${this.id}"`;
    result += "}";
    return result;
  }
}
class EventListener {
  constructor(id, callback, dependencies) {
    this.id = id;
    this.callback = callback;
    this.dependencies = dependencies.map((d) => d.id);
  }
  serialize() {
    return `{id:"${this.id}",callback:${this.callback.toString()},dependencies:[${this.dependencies.map((d) => `"${d}"`).join(",")}]}`;
  }
}
function eventListener(callback, dependencies) {
  const store = compilerStore.getStore();
  if (!store) throw new Error("Illegal invocation of eventListener(). Ensure that the eventListener() function is only called inside components, and never at the top-level of a page or layout.");
  const id = store.generateId();
  const listener = new EventListener(id, callback, dependencies);
  store.addClientToken(listener);
  return new EventListenerOption(id);
}
export {
  EventListener,
  EventListenerOption,
  eventListener
};
