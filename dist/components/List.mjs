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
var state = (value2, options) => {
  const serverStateEntry = {
    id: currentId += 1,
    value: value2,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  if (Array.isArray(value2)) {
    serverStateEntry.reactiveMap = reactiveMap;
  }
  return serverStateEntry;
};
var reactiveMap = (template, deps) => {
  const strVal = template.toString();
  console.log(strVal);
  const id = currentId += 1;
  const subject = void 0;
  loadHook(
    [subject],
    (state2, subject2) => {
      const el = document.querySelector(`[map-id]=${id}`);
      if (!el) return;
      const trackedElement = el.previousSibling;
      if (!trackedElement) return;
      state2.observe(subject2, () => {
        console.log(trackedElement);
      });
    }
  );
  return div({
    "map-id": id
  });
};

// src/components/List.ts
var value = state([2, 3, "hi"]);
var List = (options) => {
};
div(
  value.reactiveMap((item) => div(
    {},
    item
  ))
);
export {
  List
};
