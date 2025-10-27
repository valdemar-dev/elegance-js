// src/internal/deprecate.ts
var ShowDeprecationWarning = (msg) => {
  console.warn("\x1B[31m", msg, "\x1B[0m");
  console.trace("Stack Trace:");
};

// src/server/loadHook.ts
var resetLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__ = [];
var getLoadHooks = () => globalThis.__SERVER_CURRENT_LOADHOOKS__;
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
var createLoadHook = (options) => {
  ShowDeprecationWarning("WARNING: createLoadHook() is a deprecated function. Use loadHook() from elegance-js/loadHook instead.");
  const stringFn = options.fn.toString();
  const deps = (options.deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const isAsync = options.fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: options.bind || ""
  });
};

// src/server/state.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}
var state = (value, options) => {
  const serverStateEntry = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
    value,
    type: 1 /* STATE */
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
  const value = {
    id: __SERVER_CURRENT_STATE_ID__ += 1,
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
  createLoadHook,
  eventListener,
  getLoadHooks,
  getState,
  initializeState,
  loadHook,
  observe,
  resetLoadHooks,
  state
};
