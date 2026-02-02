import { SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
class ObserverOption extends SpecialElementOption {
  constructor(id) {
    super();
    this.id = id;
  }
  mutate(element, optionName) {
    delete element.options[optionName];
  }
  serialize(optionName, elementKey) {
    let result = "{";
    result += `option:"${optionName}",`;
    result += `key:"${elementKey}",`;
    result += `id:"${this.id}"`;
    result += "}";
    return result;
  }
}
class ServerObserver {
  constructor(id, callback, dependencies) {
    this.id = id;
    this.callback = callback;
    this.dependencies = dependencies.map((d) => d.id);
  }
  serialize() {
    let result = "{";
    result += `id:"${this.id}",`;
    result += `callback:${this.callback.toString()},`;
    result += `dependencies:[${this.dependencies.map((d) => `"${d}"`).join(",")}],`;
    result += "}";
    return result;
  }
}
function observer(callbackOrSubject, dependencies) {
  const store = compilerStore.getStore();
  if (!store) {
    throw new Error("Illegal invocation of observer(). Ensure that the observer() function is only called inside components, and never at the top-level of a page or layout.");
  }
  let callback;
  let deps;
  if (dependencies) {
    callback = callbackOrSubject;
    deps = dependencies;
  } else {
    const subject = callbackOrSubject;
    callback = (s) => `${s.value}`;
    deps = [subject];
  }
  const id = store.generateId();
  const listener = new ServerObserver(id, callback, deps);
  store.addClientToken(listener);
  return new ObserverOption(id);
}
const getSelf = function() {
  return "CLIENT_SIDE_FUNCTION";
};
export {
  ObserverOption,
  ServerObserver,
  getSelf,
  observer
};
