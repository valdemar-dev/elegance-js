import util from "util";
class SpecialElementOption {
  constructor(value, processCallback) {
    this.value = value;
    this.processCallback = processCallback;
  }
  process(element, optionName) {
    this.processCallback(element, optionName, this.value);
  }
}
function isAnElement(value) {
  return typeof value !== "object" || value instanceof EleganceElement === true;
}
function invalidElementError(element, reason) {
  const message = 'The element "' + util.inspect(element, { depth: 1, colors: true });
  '" is an invalid element.\n\n';
  return new Error(message);
}
class EleganceElement {
  constructor(tag, options, children) {
    this.tag = tag;
    this.children = children;
    if (isAnElement(options)) {
      if (this.canHaveChildren() === false) {
        throw invalidElementError(this, "The options of an element may not be an element, if the element cannot have children.");
      }
      this.children = [options, ...this.children];
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
