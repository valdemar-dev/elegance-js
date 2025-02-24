// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  const returnAugmentValue = {};
  for (const [key, value] of Object.entries(augment)) {
    const serverStateEntry = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
    globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
    returnAugmentValue[key] = serverStateEntry;
  }
  return returnAugmentValue;
};
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params)} }, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 3 /* OBSERVER */,
    ids: refs.map((ref) => ref.id),
    initialValues: refs.map((ref) => ref.value),
    update
  };
  return returnValue;
};

// src/docs/docs/components/CodeBlock.ts
var serverState = createState({
  isToastShowing: false,
  toastTimeoutId: 0
});
var copyCode = createEventListener({
  dependencies: [
    serverState.isToastShowing,
    serverState.toastTimeoutId
  ],
  params: {},
  eventListener: async (params, isToastShowing, toastTimeoutId) => {
    const children = params.event.currentTarget.children;
    const pre2 = children.item(0);
    const content = pre2.innerText;
    await navigator.clipboard.writeText(content);
    if (toastTimeoutId.value !== 0) clearTimeout(toastTimeoutId.value);
    isToastShowing.value = true;
    isToastShowing.signal();
    const timeoutId = window.setTimeout(() => {
      isToastShowing.value = false;
      isToastShowing.signal();
    }, 5e3);
    toastTimeoutId.value = timeoutId;
  }
});
var Toast = () => div(
  {
    class: observe(
      [serverState.isToastShowing],
      (isShowing) => {
        const defaultClassName = "fixed duration-200 bottom-4 max-w-[300px] w-full bg-white text-black ";
        if (isShowing) {
          return defaultClassName + "right-8";
        }
        return defaultClassName + "right-0 translate-x-full";
      }
    )
  },
  h1("Copied to clipboard!")
);
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
