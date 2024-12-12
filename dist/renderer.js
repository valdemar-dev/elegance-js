import { camelToKebabCase } from "./helpers/camelToKebab";
class Renderer {
  constructor() {
    console.log("%cElegance renderer is loading..", "font-size: 30px; color: #ffffaa");
    this.renderTime = 0;
    this.onRenderFinishCallbacks = [];
  }
  log(content) {
    console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
  }
  getDomTree(element) {
    const domTree = [];
    let currentElement = element;
    while (currentElement) {
      domTree.push(`${currentElement.tagName}`);
      currentElement = currentElement.parentElement;
    }
    return domTree.reverse().join(" -> ");
  }
  getPageRenderTime() {
    return this.renderTime;
  }
  onRenderFinish(callback) {
    this.log("Added render callback.");
    this.onRenderFinishCallbacks.push(callback);
  }
  renderPage(page) {
    const start = performance.now();
    this.log("Starting render..");
    this.log("Emptying previous onRenderFinishCallbacks..");
    this.onRenderFinishCallbacks = [];
    const fragment = document.createDocumentFragment();
    const serverData = globalThis.__ELEGANCE_SERVER_DATA__;
    const router = globalThis.eleganceRouter;
    const stateController = globalThis.eleganceStateController;
    if (!router) {
      throw `Cannot render page without router.`;
    }
    if (!stateController) {
      throw `Cannot render page without stateController.`;
    }
    const calledPage = page({
      router,
      state: stateController,
      renderer: this,
      serverData: serverData ? serverData.data : void 0
    });
    const element = this.createElement(
      calledPage,
      fragment,
      true
    );
    const renderTime = performance.now() - start;
    this.log(`Page fully rendered after: ${renderTime}ms`);
    if (!element) {
      throw `The first element of a page may never be null.`;
    }
    fragment.appendChild(element);
    document.documentElement.replaceChild(element, document.body);
    this.renderTime = renderTime;
    this.log("Calling on render finish callbacks..");
    for (const onRenderFinishCallback of this.onRenderFinishCallbacks) {
      onRenderFinishCallback();
    }
    router.setPopState();
  }
  buildElement(element) {
    if (typeof element === "string") return element;
    if (element instanceof Promise) {
      throw `Asynchronous elements are not supported, consider using a suspense element.`;
    }
    if (Array.isArray(element)) {
      throw "Array elements are not supported.";
    }
    if (typeof element !== "function") {
      throw `Cannot build a non-functional element, got ${element}.`;
    }
    return element();
  }
  assignPropertyToHTMLElement(elementInDocument, propertyName, propertyValue) {
    if (!(elementInDocument instanceof HTMLElement)) {
      throw new Error(`Provided elementInDocument is not a valid HTML element. Got: ${elementInDocument}.`);
    }
    if (propertyName.toLowerCase() in elementInDocument && propertyName.startsWith("on")) {
      elementInDocument[propertyName.toLowerCase()] = propertyValue;
      return;
    }
    if (propertyName in elementInDocument) {
      elementInDocument[propertyName] = propertyValue;
      return;
    }
    if (propertyName === "class") {
      elementInDocument.className = propertyValue;
      return;
    }
    if (propertyName === "style" && typeof propertyValue === "object") {
      Object.assign(elementInDocument.style, propertyValue);
      return;
    }
    if (typeof propertyValue === "function") {
      elementInDocument.setAttribute(camelToKebabCase(propertyName), propertyValue());
      return;
    }
    elementInDocument.setAttribute(camelToKebabCase(propertyName), propertyValue);
  }
  processElementOptions(builtElement, elementInDocument, skipObservables) {
    if (!Object.hasOwn(builtElement, "getOptions")) {
      return;
    }
    const element = builtElement;
    const options = element.getOptions();
    if (!options) return;
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const value = options[key];
        if (typeof value !== "object") {
          this.assignPropertyToHTMLElement(elementInDocument, key, value);
        } else if (!skipObservables) {
          this.processOptionAsObserver(value, elementInDocument, element, key);
        }
      }
    }
  }
  anyToString(value) {
    if (typeof value === "function") {
      return value.toString();
    }
    if (value instanceof Promise) {
      return `Promise { <state> }`;
    }
    if (value === null) {
      return "null";
    }
    if (value === void 0) {
      return "undefined";
    }
    if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.anyToString(item)).join(", ")}]`;
    }
    if (typeof value === "object") {
      let className = value.constructor.name;
      if (className !== "Object") {
        return `${className} { ${Object.entries(value).map(([key, val]) => `${key}: ${this.anyToString(val)}`).join(", ")} }`;
      } else {
        return `{ ${Object.entries(value).map(([key, val]) => `${key}: ${this.anyToString(val)}`).join(", ")} }`;
      }
    }
    return String(value);
  }
  createElement(element, parentInDocument, doRenderAllChildren) {
    let builtElement;
    if (typeof element === "boolean") return null;
    try {
      builtElement = this.buildElement(element);
    } catch (error) {
      throw `Failed to build element ${this.anyToString(element)}. Encountered an error: ${error}`;
    }
    if (typeof builtElement === "string") {
      const elementInDocument2 = document.createTextNode(builtElement);
      parentInDocument.appendChild(elementInDocument2);
      return elementInDocument2;
    }
    const elementInDocument = document.createElement(builtElement.tag);
    this.processElementOptions(builtElement, elementInDocument, false);
    if (doRenderAllChildren) {
      const childrenLength = builtElement.children.length;
      for (let i = 0; i < childrenLength; i++) {
        const child = builtElement.children[i];
        if (child) {
          this.createElement(child, elementInDocument, true);
        }
      }
    }
    parentInDocument.appendChild(elementInDocument);
    if (builtElement.onMount) {
      const elementAsBuildable = element;
      builtElement.onMount({ builtElement, elementInDocument, buildableElement: elementAsBuildable });
    }
    return elementInDocument;
  }
  updateElement(elementInDocument, buildableElement) {
    const builtElement = this.buildElement(buildableElement);
    const parent = elementInDocument.parentElement;
    if (!parent) {
      const domTree = this.getDomTree(elementInDocument);
      throw `Cannot update element ${elementInDocument.tagName}, since it does not have a parent. Dom Tree: ${domTree}`;
    }
    if (typeof builtElement === "string") {
      const textNode = document.createTextNode(builtElement);
      parent.replaceChild(elementInDocument, textNode);
      return textNode;
    }
    const newElement = document.createElement(builtElement.tag);
    this.processElementOptions(builtElement, newElement, false);
    const childrenLength = builtElement.children.length;
    for (let i = 0; i < childrenLength; i++) {
      const child = builtElement.children[i];
      if (child) {
        this.createElement(child, newElement, true);
      }
    }
    elementInDocument.parentElement.replaceChild(newElement, elementInDocument);
    return newElement;
  }
  processOptionAsObserver(option, elementInDocument, builtElement, updateKey) {
    const { ids, scope, update } = option;
    const subjectValues = [];
    const stateController = globalThis.eleganceStateController;
    for (let i = 0; i < ids.length; i++) {
      const subjectId = ids[i];
      const subject = scope === "local" ? stateController.get(subjectId) : stateController.getGlobal(subjectId);
      subjectValues.push(subject.get());
      const callbackFunction = async (newValue) => {
        subjectValues[i] = newValue;
        this.assignPropertyToHTMLElement(elementInDocument, updateKey, update(...subjectValues));
      };
      subject.observe(callbackFunction);
    }
    this.assignPropertyToHTMLElement(elementInDocument, updateKey, update(...subjectValues));
  }
}
export {
  Renderer
};