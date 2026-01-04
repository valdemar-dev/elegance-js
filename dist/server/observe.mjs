import { ObjectAttributeType } from "../helpers/ObjectAttributeType";
const observe = (refs, update) => {
  const returnValue = {
    type: ObjectAttributeType.OBSERVER,
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
  observe
};
