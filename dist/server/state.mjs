// src/server/loadHook.ts
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
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};

// src/server/state.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var state = (value, options) => {
  const serverStateEntry = {
    id: currentId += 1,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  if (Array.isArray(value)) {
    serverStateEntry.reactiveMap = reactiveMap;
  }
  return serverStateEntry;
};
var reactiveMap = function(template, deps) {
  const subject = this;
  const dependencies = state(deps || []);
  const templateFn = state(template);
  loadHook(
    [subject, templateFn, dependencies],
    (state2, subject2, templateFn2, dependencies2) => {
      const el = document.querySelector(
        `[map-id="${subject2.id}"]`
      );
      if (!el) return;
      const trackedElement = el.previousSibling;
      if (!trackedElement) return;
      if (!trackedElement.parentElement) return;
      el.remove();
      const value = subject2.value;
      const deps2 = state2.getAll(dependencies2.value.map((dep) => ({ id: dep.id, bind: dep.bind })));
      const attributes = [];
      const currentlyWatched = [];
      const createElements = () => {
        const renderRecursively = (element) => {
          if (typeof element === "boolean") {
            return null;
          }
          if (typeof element === "number" || typeof element === "string") {
            return document.createTextNode(element.toString());
          }
          if (Array.isArray(element)) {
            const fragment = document.createDocumentFragment();
            element.forEach((item) => {
              const childNode = renderRecursively(item);
              if (childNode) fragment.appendChild(childNode);
            });
            return fragment;
          }
          const domElement = document.createElement(element.tag);
          if (typeof element.options === "object" && element.options !== null) {
            for (const [attrName, attrValue] of Object.entries(element.options)) {
              if (typeof attrValue === "object") {
                const { isAttribute } = attrValue;
                if (isAttribute === void 0 || isAttribute === false) {
                  throw "Objects are not valid option property values.";
                }
                attributes.push({
                  ...attrValue,
                  field: attrName
                });
                continue;
              }
              domElement.setAttribute(attrName.toLowerCase(), attrValue);
            }
          }
          if (element.children !== null) {
            if (Array.isArray(element.children)) {
              element.children.forEach((child) => {
                const childNode = renderRecursively(child);
                if (childNode) domElement.appendChild(childNode);
              });
            } else {
              const childNode = renderRecursively(element.children);
              if (childNode) domElement.appendChild(childNode);
            }
          }
          return domElement;
        };
        const state3 = pd[client.currentPage].stateManager;
        for (let i = value.length - 1; i >= 0; i -= 1) {
          const htmlElement = renderRecursively(templateFn2.value(value[i], ...deps2));
          htmlElement.setAttribute("map-id", subject2.id.toString());
          const elementKey = (i * -1).toString();
          htmlElement.setAttribute("key", elementKey);
          for (const attribute of attributes) {
            let values = {};
            const { field, subjects, updateCallback } = attribute;
            for (const reference of subjects) {
              const subject3 = state3.get(reference.id, reference.bind);
              const updateFunction = (value2) => {
                values[subject3.id] = value2;
                try {
                  const newValue = updateCallback(...Object.values(values));
                  let attribute2 = field === "class" ? "className" : field;
                  htmlElement[attribute2] = newValue;
                } catch (e) {
                  console.error(e);
                  return;
                }
              };
              updateFunction(subject3.value);
              state3.observe(subject3, updateFunction, elementKey);
              console.log("observed");
              currentlyWatched.push({
                key: elementKey,
                subject: subject3
              });
            }
          }
          trackedElement.parentElement.insertBefore(htmlElement, trackedElement.nextSibling);
          attributes.splice(0, attributes.length);
        }
      };
      const removeOldElements = () => {
        const list = Array.from(document.querySelectorAll(`[map-id="${subject2.id}"]`));
        for (const el2 of list) {
          el2.remove();
        }
        const pageData = pd[client.currentPage];
        const state3 = pageData.stateManager;
        for (const watched of currentlyWatched) {
          state3.unobserve(watched.subject, watched.key);
          console.log("unobserved");
        }
        currentlyWatched.splice(0, currentlyWatched.length);
      };
      createElements();
      const uniqueId = `${Date.now()}`;
      state2.observe(subject2, (value2) => {
        removeOldElements();
        createElements();
      }, uniqueId);
    }
  );
  return globalThis.template({
    "map-id": subject.id
  });
};
var eventListener = (dependencies, eventListener2) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId += 1,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener2.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};
var initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
var getState = () => {
  return globalThis.__SERVER_CURRENT_STATE__;
};
export {
  eventListener,
  getState,
  initializeState,
  state
};
