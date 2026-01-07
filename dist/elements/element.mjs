import util from "util";
class SpecialElementOption {
}
function isAnElement(value) {
  if (value !== null && value !== void 0 && (typeof value !== "object" || Array.isArray(value) || value instanceof EleganceElement)) return true;
  return false;
}
function invalidElementError(element, reason) {
  const message = 'The element "' + util.inspect(element, { depth: 1, colors: true }) + '" is an invalid element.\n' + reason;
  return new Error(message);
}
class EleganceElement {
  constructor(tag, options = {}, children) {
    this.tag = tag;
    this.children = children;
    if (isAnElement(options)) {
      if (this.canHaveChildren() === false) {
        throw invalidElementError(this, "The options of an element may not be an element, if the element cannot have children.");
      }
      this.children.unshift(options);
      this.options = {};
    } else {
      this.options = options;
    }
  }
  canHaveChildren() {
    return this.children !== null;
  }
}
export {
  EleganceElement,
  SpecialElementOption,
  invalidElementError
};
