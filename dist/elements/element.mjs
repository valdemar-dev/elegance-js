class SpecialElementOption {
}
function isAnElement(value) {
  if (value !== null && value !== void 0 && (typeof value !== "object" || Array.isArray(value) || value instanceof EleganceElement)) return true;
  return false;
}
class EleganceElement {
  constructor(tag, options = {}, children = null) {
    this.tag = tag;
    if (isAnElement(options)) {
      if (this.canHaveChildren() === false) {
        console.error("The element:", this, "is an invalid element. Reason:");
        throw "The options of an element may not be an element, if the element cannot have children.";
      }
      this.children = [options, ...children ?? []];
      this.options = {};
    } else {
      this.options = options;
      this.children = children;
    }
  }
  canHaveChildren() {
    return this.children !== null;
  }
}
export {
  EleganceElement,
  SpecialElementOption,
  isAnElement
};
