// src/server/createReference.ts
if (!globalThis.__SERVER_CURRENT_REF_ID__) {
  globalThis.__SERVER_CURRENT_REF_ID__ = 0;
}
var currentRefId = globalThis.__SERVER_CURRENT_REF_ID__;
var createReference = () => {
  return {
    type: 6 /* REFERENCE */,
    value: currentRefId++
  };
};

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createEventListener = (dependencies, eventListener, params) => {
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

// src/docs/docs/components/CodeBlock.ts
var toastRef = createReference();
var copyCode = createEventListener(
  [],
  async ({ event, ref }) => {
    const children = event.currentTarget.children;
    const pre2 = children.item(0);
    await navigator.clipboard.writeText(pre2.innerText);
    console.log(`toast reference: ${ref}`);
  },
  {
    ref: toastRef.value
  }
);
var Toast = () => div(
  {
    ref: toastRef
  },
  "i am a toast!"
);
var CodeBlock = (value) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({
    innerText: value
  })
);
export {
  CodeBlock,
  Toast
};
