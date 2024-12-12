// src/helpers/camelToKebab.ts
var camelToKebabCase = (input) => {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// src/server/renderer.ts
var reservedAttributes = [
  "clientOnly"
];
var ServerRenderer = class {
  constructor(router, stateController) {
    this.currentElementIndex = 0;
    this.HTMLString = "";
    this.eventListenerStore = [];
    this.router = router;
    this.stateController = stateController;
    this.renderTime = 0;
    this.onRenderFinishCallbacks = [];
  }
  log(content) {
    console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
  }
  getOption(key, elementOptions) {
    const value = elementOptions.find(([k]) => k === key);
    if (!value) return null;
    return value[1];
  }
  serializeEventHandler(attributeName, el, eleganceID) {
    let elementInStore = this.eventListenerStore.find((el2) => el2.eleganceID === eleganceID);
    if (!elementInStore) {
      elementInStore = {
        eleganceID,
        eventListeners: []
      };
      this.eventListenerStore.push(elementInStore);
    }
    const eventListenerString = el.toString();
    const elAsString = `{an:"${attributeName}",el:${eventListenerString.replace(/\s+/g, "")}}`;
    elementInStore.eventListeners.push(elAsString);
    console.log(`Serialized attribute ${attributeName} for element with id: ${eleganceID}. Set to string ${eventListenerString}`);
  }
  renderElement(element) {
    if (typeof element === "string" || typeof element === "number" || typeof element === "boolean") {
      return this.HTMLString += `${element}`;
    } else if (typeof element !== "function") {
      throw `Elements must be either a string, number or function.`;
    }
    const builtElement = element();
    let elementEleganceID = null;
    const options = Object.entries(builtElement.getOptions());
    const clientOnlyOption = this.getOption("clientOnly", options);
    if (clientOnlyOption === true) {
      console.log("CLIENT ONLY");
    }
    this.HTMLString += `<${builtElement.tag}`;
    for (const [key, value] of options) {
      if (reservedAttributes.includes(key)) {
        console.log("reserved attr");
        continue;
      }
      if (!key.startsWith("on")) {
        this.HTMLString += ` ${camelToKebabCase(value)}="${value}"`;
        continue;
      }
      if (!elementEleganceID) {
        elementEleganceID = this.currentElementIndex++;
        this.HTMLString += ` e-id=${elementEleganceID}`;
      }
      this.serializeEventHandler(key, value, elementEleganceID);
    }
    if (!builtElement.children) {
      this.HTMLString += "/>";
      return;
    }
    this.HTMLString += ">";
    for (const element2 of builtElement.children) {
      this.renderElement(element2);
    }
    this.HTMLString += `</${builtElement.tag}>`;
  }
  async renderPage(page) {
    const builtPage = page({
      router: this.router,
      renderer: this,
      state: this.stateController
    });
    this.renderElement(builtPage);
  }
};

// src/server/router.ts
var ServerRouter = class {
  constructor() {
  }
};

// src/server/state.ts
var ServerStateController = class {
  constructor() {
  }
  create() {
  }
  createGlobal() {
  }
};

// src/server/render.ts
var serverSideRenderPage = async (page) => {
  if (!page) {
    throw `No Page Provided.`;
  }
  if (typeof page !== "function") {
    throw `Page must be a function.`;
  }
  const state = new ServerStateController();
  const router = new ServerRouter();
  const renderer = new ServerRenderer(router, state);
  await renderer.renderPage(page);
  return {
    bodyHTML: renderer.HTMLString,
    storedEventListeners: renderer.eventListenerStore
  };
};
export {
  serverSideRenderPage
};
