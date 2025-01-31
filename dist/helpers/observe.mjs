// src/helpers/observe.ts
var observe = (ref, update) => {
  return {
    type: ObjectAttributeType.OBSERVER,
    id: ref.value.id,
    update
  };
};
export {
  observe
};
