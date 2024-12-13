// src/elements.ts
var createElementOptions = (obj) => {
  return function() {
    const reevaluatedObj = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "function") {
        if (key.startsWith("on")) {
          reevaluatedObj[key] = value;
        } else {
          reevaluatedObj[key] = value();
        }
      } else {
        reevaluatedObj[key] = value;
      }
    }
    return reevaluatedObj;
  };
};
var createBuildableElement = (tag) => {
  return (options, ...children) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children
    });
  };
};
var createOptionlessBuildableElement = (tag) => {
  return (...children) => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children
    });
  };
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children: []
    });
  };
};
var createChildrenlessOptionlessBuildableElement = (tag) => {
  return () => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children: []
    });
  };
};
var optionlessElementTags = [
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "strong",
  "sub",
  "sup",
  "u",
  "var",
  "wbr"
];
var childrenlessElementTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track"
];
var childrenlessOptionlessElementTags = [
  "basefont",
  "isindex",
  "keygen"
];
var elementTags = [
  "a",
  "address",
  "article",
  "aside",
  "audio",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dialog",
  "div",
  "dl",
  "dt",
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
  "head",
  "header",
  "hgroup",
  "html",
  "iframe",
  "ins",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "summary",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "ul",
  "video",
  "span"
];
var elements = {};
var optionlessElements = {};
var childrenlessElements = {};
var childrenlessOptionlessElements = {};
for (const element of elementTags) {
  elements[element] = createBuildableElement(element);
}
for (const element of optionlessElementTags) {
  optionlessElements[element] = createOptionlessBuildableElement(element);
}
for (const element of childrenlessElementTags) {
  childrenlessElements[element] = createChildrenlessBuildableElement(element);
}
for (const element of childrenlessOptionlessElementTags) {
  childrenlessOptionlessElements[element] = createChildrenlessOptionlessBuildableElement(element);
}
var allElements = {
  ...elements,
  ...optionlessElements,
  ...childrenlessElements,
  ...childrenlessOptionlessElements
};

// src/bindElements.ts
Object.assign(globalThis, elements);
Object.assign(globalThis, optionlessElements);
Object.assign(globalThis, childrenlessElements);
Object.assign(globalThis, childrenlessOptionlessElements);

// src/router.ts
var Router = class {
  constructor() {
    this.stateController = globalThis.eleganceStateController;
    this.renderer = globalThis.eleganceRenderer;
    console.log("%cElegance router is loading..", "font-size: 30px; color: #aaffaa");
    this.savedPages = /* @__PURE__ */ new Map();
    this.onNavigateCallbacks = [];
    this.currentPage = window.location.pathname;
  }
  log(content) {
    console.log(`%c${content}`, "font-size: 15px; color: #aaffaa");
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async navigate(pathname, pushState = true) {
    if (!pathname.startsWith("/")) {
      throw new Error("Elegance router can only navigate to local pages.");
    }
    this.log("Calling onNavigateCallbacks..");
    for (const onNavigateCallback of this.onNavigateCallbacks) {
      onNavigateCallback();
    }
    this.onNavigateCallbacks = [];
    this.log("Performing state cleanup..");
    this.stateController.resetEphemeralSubjects();
    this.stateController.cleanSubjectObservers();
    this.log(`Navigating to page: ${pathname}`);
    const page = this.savedPages.get(pathname) ?? await this.getPage(pathname);
    if (!page) throw new Error("Failed to fetch page.");
    if (pushState) {
      history.pushState(null, "", pathname);
    }
    this.currentPage = pathname;
    this.renderer.renderPage(page);
  }
  async getPage(pathname) {
    if (this.savedPages.has(pathname)) return;
    if (!pathname.startsWith("/")) {
      throw new Error("Elegance router can only fetch local pages.");
    }
    this.log(`Fetching URL: ${pathname}`);
    const optionalSlash = pathname === "/" ? "" : "/";
    const pageDataRaw = await fetch(pathname);
    if (!pageDataRaw.ok) {
      throw `Could not load page at ${pathname}, received HTTP response status ${pageDataRaw.status}. ${pageDataRaw.statusText}`;
    }
    const pageData = await pageDataRaw.text();
    const parser = new DOMParser();
    const parsedPageData = parser.parseFromString(pageData, "text/html");
    try {
      const { page } = await import(pathname + optionalSlash + "page.js");
      if (!page) {
        throw new Error(`Page at ${pathname} could not be loaded.`);
      }
      this.addPage(pathname, page);
      return page;
    } catch (error) {
      this.log(`Could not load the page at ${pathname}: ${error}`);
      return;
    }
  }
  addPage(pathname, page) {
    this.log(`Saving page with pathname: ${pathname}`);
    this.savedPages.set(pathname, page);
  }
  async prefetch(pathname) {
    await this.getPage(pathname);
  }
  onNavigate(callback) {
    this.log("Adding onNavigateCallback.");
    this.onNavigateCallbacks.push(callback);
  }
  setPopState() {
    window.onpopstate = (event) => {
      event.preventDefault();
      const currentOrigin = window.location.origin;
      const target = event.target;
      const newOrigin = target.origin;
      if (newOrigin !== currentOrigin) return;
      if (this.currentPage === target.location.pathname) return;
      const relativeLocation = window.location.href.replace(window.location.origin, "");
      this.navigate(relativeLocation, false);
    };
  }
};

// src/helpers/camelToKebab.ts
var camelToKebabCase = (input) => {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// src/renderer.ts
var Renderer = class {
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
    if (propertyName === "style" && typeof propertyValue === "object") {
      Object.assign(elementInDocument.style, propertyValue);
      return;
    } else if (propertyName.toLowerCase() in elementInDocument && propertyName.startsWith("on")) {
      elementInDocument[propertyName.toLowerCase()] = propertyValue;
      return;
    } else if (propertyName in elementInDocument) {
      elementInDocument[propertyName] = propertyValue;
      return;
    } else if (propertyName === "class") {
      elementInDocument.className = propertyValue;
      return;
    } else if (typeof propertyValue === "function") {
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
      if (Object.hasOwn(options, key)) {
        const value = options[key];
        if (Object.hasOwn(value, "ids") && Object.hasOwn(value, "update") && Object.hasOwn(value, "scope")) {
          if (skipObservables) continue;
          this.processOptionAsObserver(value, elementInDocument, element, key);
        }
        this.assignPropertyToHTMLElement(elementInDocument, key, value);
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
};

// src/state.ts
var debounce = (delay) => {
  let timer;
  return (callback) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, delay);
  };
};
var Subject = class {
  constructor(initialValue, id, enforceRuntimeTypes = false, debounceUpdateMs = null, pathname = "", scope = 1 /* LOCAL */, resetOnPageLeave = false) {
    this.enforceRuntimeTypes = enforceRuntimeTypes;
    this.observers = [];
    this.value = initialValue;
    this.initialValue = structuredClone(initialValue);
    this.id = id;
    this.pathname = pathname;
    this.scope = scope;
    this.resetOnPageLeave = resetOnPageLeave;
    if (debounceUpdateMs) {
      this.debounce = debounce(debounceUpdateMs);
    }
  }
  observe(callback) {
    if (typeof callback !== "function") {
      throw new Error("The provided callback function must be a function.");
    }
    if (callback.length !== 1) {
      throw new Error("The callback function must take one parameter (new value of the subject).");
    }
    this.observers.push({ callback });
  }
  signal() {
    const notifyObservers = async () => {
      const value = this.get();
      for (const observer of this.observers) {
        observer.callback(value);
      }
    };
    if (this.debounce) {
      this.debounce(notifyObservers);
    } else {
      notifyObservers();
    }
  }
  set(newValue) {
    if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
      throw `Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`;
    }
    this.value = newValue;
  }
  add(entry) {
    if (!Array.isArray(this.value)) {
      throw `The add method of a subject may only be used if the subject's value is an Array.`;
    }
    this.value.push(entry);
  }
  remove(entry) {
    if (!Array.isArray(this.value)) {
      throw `The remove method of a subject may only be used if the subject's value is an Array.`;
    }
    const index = this.value.indexOf(entry);
    if (!index) throw `Element ${entry} does not exist in this subject, therefore it cannot be removed.`;
    this.value.splice(index, 1);
  }
  reset() {
    this.value = this.initialValue;
  }
  get() {
    return this.value;
  }
  getInitialValue() {
    return this.initialValue;
  }
};
var StateController = class {
  constructor() {
    this.subjectStore = [];
  }
  create(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.pathname === window.location.pathname && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cSubject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      window.location.pathname,
      1 /* LOCAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  createGlobal(initialValue, {
    id,
    enforceRuntimeTypes = true,
    debounceUpdateMs,
    resetOnPageLeave = false
  }) {
    const existingSubject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (existingSubject) {
      console.info(
        `%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`,
        "font-size: 12px; color: #aaaaff"
      );
      return existingSubject;
    }
    const subject = new Subject(
      initialValue,
      id,
      enforceRuntimeTypes,
      debounceUpdateMs,
      "",
      2 /* GLOBAL */,
      resetOnPageLeave
    );
    this.subjectStore.push(subject);
    return subject;
  }
  getGlobal(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.scope === 2 /* GLOBAL */ && sub.id === id;
    });
    if (!subject) {
      throw new Error(`Could not find a global subject with the ID of ${id}.`);
    }
    return subject;
  }
  get(id) {
    const subject = this.subjectStore.find((sub) => {
      return sub.pathname === window.location.pathname && sub.id === id;
    });
    if (!subject) {
      throw new Error(`Could not find a subject with the ID of ${id} in the page ${window.location.pathname}`);
    }
    return subject;
  }
  observe(id, callback, scope = 1 /* LOCAL */) {
    if (scope === 1 /* LOCAL */) {
      const subject = this.get(id);
      subject.observe(callback);
    } else {
      const subject = this.getGlobal(id);
      subject.observe(callback);
    }
  }
  resetEphemeralSubjects() {
    this.subjectStore = this.subjectStore.filter((subj) => subj.resetOnPageLeave === false);
  }
  cleanSubjectObservers() {
    for (const subject of this.subjectStore) {
      subject.observers = [];
    }
  }
};

// src/client/csr_client.ts
(async () => {
  const unminimizePageInfo = (minimized) => {
    return {
      renderingMethod: minimized.rm,
      storedEventListeners: minimized.sels?.map((selection) => ({
        eleganceID: selection.id,
        eventListeners: selection.els.map((element) => ({
          attributeName: element.an,
          eventListener: element.el
        }))
      }))
    };
  };
  const minimizedPageInfo = globalThis.__ELEGANCE_PAGE_INFO__;
  if (!minimizedPageInfo) {
    alert("Misconfigured Elegance.JS server, check console.");
    throw `globalThis.__ELEGANCE_PAGE_INFO__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.`;
  }
  const pageInfo = unminimizePageInfo(minimizedPageInfo);
  if (pageInfo.renderingMethod !== 3 /* CLIENT_SIDE_RENDERING */) {
    throw `The CLIENT_SIDE_RENDERING client may only be used if the page has been rendered via the CLIENT_SIDE_RENDERING renderingMethod.`;
  }
  const scripts = document.querySelectorAll('script[type="module"]');
  const pageScript = Array.from(scripts).find((script) => {
    const htmlScript = script;
    return htmlScript.src.includes("/page.js");
  });
  if (!pageScript) {
    throw new Error("Failed to mount elegance. No page script found.");
  }
  const module = await import(pageScript.src);
  if (!module.page) throw new Error("Page script does not export page function.");
  const renderer = new Renderer();
  const stateController = new StateController();
  const router = new Router();
  globalThis.eleganceRouter = router;
  globalThis.eleganceStateController = stateController;
  globalThis.eleganceRenderer = renderer;
  router.addPage(window.location.pathname, module.page);
  renderer.renderPage(module.page);
})();
