// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var als = new AsyncLocalStorage();
var runAls = als.run;
var getStore = () => {
  const store = als.getStore();
  if (store === void 0)
    throw new Error("Tried to access ALS outside of ALS context.");
  return store;
};

// src/server/loadHook.ts
var resetLoadHooks = () => {
  const store = getStore();
  store.loadHooks = [];
};
var getLoadHooks = () => {
  const store = getStore();
  return store.loadHooks;
};
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
  const store = getStore();
  store.loadHooks.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};

// src/server/state.ts
var state = (value, options) => {
  const store = getStore();
  const serverStateEntry = {
    id: store.currentStateId += 1,
    value,
    type: 1 /* STATE */
  };
  if (Array.isArray(value)) {
    serverStateEntry.reactiveMap = reactiveMap;
  }
  store.currentState.push(serverStateEntry);
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
      if (!el) {
        console.error(`Couldn't find map tag with map-id=${subject2.id}`);
        return;
      }
      const parentElement = el.parentElement;
      const nextSibling = el.nextSibling;
      el.remove();
      const value = subject2.value;
      const deps2 = state2.getAll(dependencies2.value.map((dep) => ({ id: dep.id, bind: dep.bind })));
      const attributes = [];
      const currentlyWatched = [];
      const createElements = () => {
        for (let i = 0; i < value.length; i += 1) {
          const htmlElement = client.renderRecursively(templateFn2.value(value[i], i, ...deps2), attributes);
          htmlElement.setAttribute("map-id", subject2.id.toString());
          const elementKey = ((i - 1) * -1).toString();
          htmlElement.setAttribute("key", elementKey);
          for (const attribute of attributes) {
            let values = {};
            const type = attribute.type;
            switch (type) {
              case 2 /* OBSERVER */: {
                const { field, subjects, updateCallback } = attribute;
                for (const reference of subjects) {
                  const subject3 = state2.get(reference.id, reference.bind);
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
                  state2.observe(subject3, updateFunction, elementKey);
                  currentlyWatched.push({
                    key: elementKey,
                    subject: subject3
                  });
                }
                break;
              }
              case 1 /* STATE */: {
                const { field, element, subjects, eventListener: eventListener2 } = attribute;
                const lc = field.toLowerCase();
                const fn = (event) => {
                  eventListener2(event, ...subjects);
                };
                element[lc] = fn;
                break;
              }
            }
          }
          parentElement.insertBefore(htmlElement, nextSibling);
          attributes.splice(0, attributes.length);
        }
      };
      const removeOldElements = () => {
        const list = Array.from(document.querySelectorAll(`[map-id="${subject2.id}"]`));
        for (const el2 of list) {
          el2.remove();
        }
        for (const watched of currentlyWatched) {
          state2.unobserve(watched.subject, watched.key);
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
  const store = getStore();
  const value = {
    id: store.currentStateId += 1,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener2.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  store.currentState.push(value);
  return value;
};
var initializeState = () => {
  const store = getStore();
  store.currentState = [];
};
var getState = () => {
  return getStore().currentState;
};
var initializeObjectAttributes = () => {
  getStore().currentObjectAttributes = [];
};
var getObjectAttributes = () => {
  return getStore().currentObjectAttributes;
};

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 2 /* OBSERVER */,
    initialValues: refs.map((ref) => ref.value),
    update,
    refs: refs.map((ref) => ({
      id: ref.id,
      bind: ref.bind
    }))
  };
  return returnValue;
};
export {
  eventListener,
  getLoadHooks,
  getObjectAttributes,
  getState,
  initializeObjectAttributes,
  initializeState,
  loadHook,
  observe,
  resetLoadHooks,
  state
};
