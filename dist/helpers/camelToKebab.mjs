// src/helpers/camelToKebab.ts
var camelToKebabCase = (input) => {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
export {
  camelToKebabCase
};
