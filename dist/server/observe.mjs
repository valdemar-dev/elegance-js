// src/server/observe.ts
var observe = (ref, update) => {
  return {
    type: 3 /* OBSERVER */,
    id: ref.id,
    initialValue: ref.value,
    update
  };
};
export {
  observe
};
