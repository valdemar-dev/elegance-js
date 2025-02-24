// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (value, options) => {
  const serverStateEntry = {
    id: currentId++,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  return serverStateEntry;
};
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params || {})} }, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/loadHook.ts
var createLoadHook = (options) => {
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
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`,
    bind: options.bind || ""
  });
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

// src/docs/docs/components/CodeBlock.ts
var isToastShowing = createState(false);
var toastTimeoutId = createState(0);
var copyCode = createEventListener({
  dependencies: [
    isToastShowing,
    toastTimeoutId
  ],
  params: {},
  eventListener: async (params, isToastShowing2, toastTimeoutId2) => {
    const children = params.event.currentTarget.children;
    const pre2 = children.item(0);
    const content = pre2.innerText;
    await navigator.clipboard.writeText(content);
    if (toastTimeoutId2.value !== 0) clearTimeout(toastTimeoutId2.value);
    isToastShowing2.value = true;
    isToastShowing2.signal();
    const timeoutId = window.setTimeout(() => {
      isToastShowing2.value = false;
      isToastShowing2.signal();
    }, 5e3);
    toastTimeoutId2.value = timeoutId;
  }
});
var Toast = (bind) => {
  createLoadHook({
    bind,
    deps: [
      toastTimeoutId,
      isToastShowing
    ],
    fn: (state, toastTimeoutId2, isToastShowing2) => {
      return () => {
        clearTimeout(toastTimeoutId2.value);
        isToastShowing2.value = false;
        isToastShowing2.signal();
      };
    }
  });
  return div(
    {
      class: observe(
        [isToastShowing],
        (isShowing) => {
          const defaultClassName = "fixed duration-200 bottom-4 max-w-[300px] w-full bg-background-800 ";
          if (isShowing) {
            return defaultClassName + "right-8";
          }
          return defaultClassName + "right-0 translate-x-full";
        }
      )
    },
    h1("Copied to clipboard!")
  );
};
var CodeBlock = (value) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({}, value)
);
export {
  CodeBlock,
  Toast
};
