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

// src/shared/bindBrowserElements.ts
var elementsWithAttributesAndChildren = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "body",
  "blockquote",
  "button",
  "canvas",
  "cite",
  "code",
  "colgroup",
  "data",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "u",
  "ul",
  "var",
  "video",
  "details",
  "datalist"
];
var elementsWithAttributesOnly = [
  "audio",
  "base",
  "br",
  "col",
  "embed",
  "link",
  "meta",
  "noscript",
  "source",
  "track",
  "wbr",
  "area",
  "command",
  "picture",
  "progress",
  "html",
  "head"
];
var elementsWithChildrenOnly = [
  "title",
  "template"
];
var define = (tagName, hasAttr, hasChildren) => {
  return (...args) => {
    let options = {};
    let children = [];
    if (hasAttr && args.length > 0 && typeof args[0] === "object") {
      options = args[0];
      if (hasChildren && args.length > 1) {
        children = args.slice(1);
      }
    } else if (hasChildren && args.length > 0) {
      children = args;
    }
    return () => ({
      tag: tagName,
      getOptions: options ? () => {
        const reevaluatedObj = {};
        for (const key of Object.keys(options)) {
          const value = options[key];
          if (typeof value !== "function") {
            reevaluatedObj[key] = value;
            continue;
          }
          if (key.startsWith("on")) {
            reevaluatedObj[key] = value;
            continue;
          }
          reevaluatedObj[key] = value();
        }
        return reevaluatedObj;
      } : () => ({}),
      children
    });
  };
};
globalThis._e = {
  ...elementsWithAttributesAndChildren.reduce((acc, el) => {
    acc[el] = define(el, true, true);
    return acc;
  }, {}),
  ...elementsWithChildrenOnly.reduce((acc, el) => {
    acc[el] = define(el, false, true);
    return acc;
  }, {}),
  ...elementsWithAttributesOnly.reduce((acc, el) => {
    acc[el] = define(el, true, false);
    return acc;
  }, {})
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
