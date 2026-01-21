"use strict";
(() => {
  // ../src/elements/element.ts
  var SpecialElementOption = class {
  };
  function isAnElement(value) {
    if (value !== null && value !== void 0 && (typeof value !== "object" || Array.isArray(value) || value instanceof EleganceElement)) return true;
    return false;
  }
  var EleganceElement = class {
    constructor(tag, options = {}, children) {
      this.tag = tag;
      this.children = children;
      if (isAnElement(options)) {
        if (this.canHaveChildren() === false) {
          console.error("The element:", this, "is an invalid element. Reason:");
          throw "The options of an element may not be an element, if the element cannot have children.";
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
  };

  // ../src/elements/element_list.ts
  var htmlChildrenlessElementTags = [
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
    "track",
    "wbr"
  ];
  var htmlElementTags = [
    "a",
    "abbr",
    "address",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
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
    "head",
    "header",
    "hgroup",
    "html",
    "i",
    "iframe",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "menu",
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
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "search",
    "section",
    "select",
    "slot",
    "small",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
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
    "u",
    "ul",
    "var",
    "video"
  ];
  var svgChildrenlessElementTags = [
    "path",
    "circle",
    "ellipse",
    "line",
    "polygon",
    "polyline",
    "stop"
  ];
  var svgElementTags = [
    "svg",
    "g",
    "text",
    "tspan",
    "textPath",
    "defs",
    "symbol",
    "use",
    "image",
    "clipPath",
    "mask",
    "pattern",
    "linearGradient",
    "radialGradient",
    "filter",
    "marker",
    "view",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence"
  ];
  var mathmlChildrenlessElementTags = [
    "mi",
    "mn",
    "mo"
  ];
  var mathmlElementTags = [
    "math",
    "ms",
    "mtext",
    "mrow",
    "mfenced",
    "msup",
    "msub",
    "msubsup",
    "mfrac",
    "msqrt",
    "mroot",
    "mtable",
    "mtr",
    "mtd",
    "mstyle",
    "menclose",
    "mmultiscripts"
  ];
  var elements = {};
  var childrenlessElements = {};
  function createElementBuilder(tag) {
    return ((options, ...children) => new EleganceElement(tag, options, children));
  }
  function createChildrenlessElementBuilder(tag) {
    return ((options) => new EleganceElement(tag, options, null));
  }
  for (const tag of htmlElementTags) elements[tag] = createElementBuilder(tag);
  for (const tag of svgElementTags) elements[tag] = createElementBuilder(tag);
  for (const tag of mathmlElementTags) elements[tag] = createElementBuilder(tag);
  for (const tag of htmlChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);
  for (const tag of svgChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);
  for (const tag of mathmlChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);
  var allElements = {
    ...elements,
    ...childrenlessElements
  };

  // ../src/client/runtime.ts
  Object.assign(window, allElements);
  function createHTMLElementFromEleganceElement(element) {
    let specialElementOptions = [];
    const domElement = document.createElement(element.tag);
    {
      const entries = Object.entries(element.options);
      for (const [optionName, optionValue] of entries) {
        if (optionValue instanceof SpecialElementOption) {
          optionValue.mutate(element, optionName);
          const elementKey = (Math.random() * 1e4).toString();
          specialElementOptions.push({ elementKey, optionName, optionValue });
        } else {
          domElement.setAttribute(optionName, `${optionValue}`);
        }
      }
    }
    if (element.key) {
      domElement.setAttribute("key", element.key);
    }
    {
      if (element.children !== null) {
        for (const child of element.children) {
          const result = createHTMLElementFromElement(child);
          domElement.appendChild(result.root);
          specialElementOptions.push(...result.specialElementOptions);
        }
      }
    }
    return { root: domElement, specialElementOptions };
  }
  function createHTMLElementFromElement(element) {
    let specialElementOptions = [];
    if (element === void 0 || element === null) {
      throw new Error(`Undefined and null are not allowed as elements.`);
    }
    switch (typeof element) {
      case "object":
        if (Array.isArray(element)) {
          const fragment = document.createDocumentFragment();
          for (const subElement of element) {
            const result = createHTMLElementFromElement(subElement);
            fragment.appendChild(result.root);
            specialElementOptions.push(...result.specialElementOptions);
          }
          return { root: fragment, specialElementOptions };
        }
        if (element instanceof EleganceElement) {
          return createHTMLElementFromEleganceElement(element);
        }
        throw new Error(`This element is an arbitrary object, and arbitrary objects are not valid children. Please make sure all elements are one of: EleganceElement, boolean, number, string or Array.`);
      case "boolean":
      case "number":
      case "string":
        const text = typeof element === "string" ? element : element.toString();
        const textNode = document.createTextNode(text);
        return { root: textNode, specialElementOptions: [] };
      default:
        throw new Error(`The typeof of this element is not one of EleganceElement, boolean, number, string or Array. Please convert it into one of these types.`);
    }
  }
  (() => {
    let isErrored = false;
    (function connect() {
      const es = new EventSource("http://localhost:4000/elegance-hot-reload");
      es.onopen = () => {
        if (isErrored) {
          window.location.reload();
        }
      };
      es.onmessage = (event) => {
        if (event.data === "hot-reload") {
          window.location.reload();
        }
      };
      es.onerror = () => {
        isErrored = true;
        es.close();
        setTimeout(connect, 2e3);
      };
    })();
  })();
  var ClientSubject = class {
    constructor(id, value) {
      this.observers = /* @__PURE__ */ new Map();
      this._value = value;
      this.id = id;
    }
    get value() {
      return this._value;
    }
    set value(newValue) {
      this._value = newValue;
      for (const observer of this.observers.values()) {
        observer(newValue);
      }
    }
    triggerObesrvers() {
      for (const observer of this.observers.values()) {
        observer(this._value);
      }
    }
    observe(id, callback) {
      if (this.observers.has(id)) {
        this.observers.delete(id);
      }
      this.observers.set(id, callback);
    }
    unobserve(id) {
      this.observers.delete(id);
    }
  };
  var StateManager = class {
    constructor() {
      this.subjects = /* @__PURE__ */ new Map();
    }
    loadValues(values, doOverwrite = false) {
      for (const value of values) {
        if (this.subjects.has(value.id) && doOverwrite === false) continue;
        const clientSubject = new ClientSubject(value.id, value.value);
        this.subjects.set(value.id, clientSubject);
      }
    }
    get(id) {
      return this.subjects.get(id);
    }
    getAll(ids) {
      const results = [];
      for (const id of ids) {
        results.push(this.get(id));
      }
      return results;
    }
  };
  var ClientEventListener = class {
    constructor(id, callback, depencencies) {
      this.id = id;
      this.callback = callback;
      this.dependencies = depencencies;
    }
    call(ev) {
      const dependencies = stateManager.getAll(this.dependencies);
      this.callback(ev, ...dependencies);
    }
  };
  var EventListenerManager = class {
    constructor() {
      this.eventListeners = /* @__PURE__ */ new Map();
    }
    loadValues(serverEventListeners, doOverride = false) {
      for (const serverEventListener of serverEventListeners) {
        if (this.eventListeners.has(serverEventListener.id) && doOverride === false) continue;
        const clientEventListener = new ClientEventListener(serverEventListener.id, serverEventListener.callback, serverEventListener.dependencies);
        this.eventListeners.set(clientEventListener.id, clientEventListener);
      }
    }
    hookCallbacks(eventListenerOptions) {
      for (const eventListenerOption of eventListenerOptions) {
        const element = document.querySelector(`[key="${eventListenerOption.key}"]`);
        if (!element) {
          errorOut("Possibly corrupted HTML, failed to find element with key " + eventListenerOption.key + " for event listener.");
          return;
        }
        const eventListener = this.eventListeners.get(eventListenerOption.id);
        if (!eventListener) {
          errorOut("Invalid EventListenerOption: Event listener with id \u201D" + eventListenerOption.id + '" does not exist.');
          return;
        }
        element[eventListenerOption.option] = (ev) => {
          eventListener.call(ev);
        };
      }
    }
    get(id) {
      return this.eventListeners.get(id);
    }
  };
  var ClientObserver = class {
    constructor(id, callback, depencencies) {
      this.subjectValues = [];
      this.elements = [];
      this.id = id;
      this.callback = callback;
      this.dependencies = depencencies;
      const initialValues = stateManager.getAll(this.dependencies);
      for (const initialValue of initialValues) {
        const idx = this.subjectValues.length;
        this.subjectValues.push(initialValue.value);
        initialValue.observe(this.id, (newValue) => {
          this.subjectValues[idx] = newValue;
          this.call();
        });
      }
      this.call();
    }
    /**
     * Add an element to update when this observer updates.
     */
    addElement(element, optionName) {
      this.elements.push({ element, optionName });
    }
    call() {
      const newValue = this.callback(...this.subjectValues);
      for (const { element, optionName } of this.elements) {
        element[optionName] = newValue;
      }
    }
  };
  var ObserverManager = class {
    constructor() {
      this.clientObservers = /* @__PURE__ */ new Map();
    }
    loadValues(serverObservers, doOverride = false) {
      for (const serverObserver of serverObservers) {
        if (this.clientObservers.has(serverObserver.id) && doOverride === false) continue;
        const clientObserver = new ClientObserver(serverObserver.id, serverObserver.callback, serverObserver.dependencies);
        this.clientObservers.set(clientObserver.id, clientObserver);
      }
    }
    hookCallbacks(observerOptions) {
      for (const observerOption of observerOptions) {
        const element = document.querySelector(`[key="${observerOption.key}"]`);
        if (!element) {
          errorOut("Possibly corrupted HTML, failed to find element with key " + observerOption.key + " for event listener.");
          return;
        }
        const observer = this.clientObservers.get(observerOption.id);
        if (!observer) {
          errorOut("Invalid ObserverOption: Observer with id \u201D" + observerOption.id + '" does not exist.');
          return;
        }
        observer.addElement(element, observerOption.option);
        observer.call();
      }
    }
  };
  var LoadHookManager = class {
    constructor() {
      this.cleanupProcedures = [];
    }
    loadValues(loadHooks) {
      for (const loadHook of loadHooks) {
        const depencencies = stateManager.getAll(loadHook.dependencies);
        const cleanupFunction = loadHook.callback(...depencencies);
        if (cleanupFunction) {
          this.cleanupProcedures.push({
            kind: loadHook.kind,
            cleanupFunction,
            pathname: loadHook.pathname
          });
        }
      }
    }
    callCleanupFunctions() {
      let remainingProcedures = [];
      for (const cleanupProcedure of this.cleanupProcedures) {
        if (cleanupProcedure.kind === 0 /* LAYOUT_LOADHOOK */) {
          const isInScope = sanitizePathname(window.location.pathname).startsWith(cleanupProcedure.pathname);
          if (isInScope) {
            remainingProcedures.push(cleanupProcedure);
            continue;
          }
        }
        cleanupProcedure.cleanupFunction();
      }
      this.cleanupProcedures = remainingProcedures;
    }
  };
  var observerManager = new ObserverManager();
  var eventListenerManager = new EventListenerManager();
  var stateManager = new StateManager();
  var loadHookManager = new LoadHookManager();
  var domParser = new DOMParser();
  var xmlSerializer = new XMLSerializer();
  function sanitizePathname(pathname = "") {
    if (!pathname) return "/";
    pathname = "/" + pathname;
    pathname = pathname.replace(/\/+/g, "/");
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    return pathname;
  }
  async function getPageData(pathname) {
    const dataScriptTag = document.head.querySelector(`script[data-page="true"][data-pathname="${pathname}"]`);
    if (!dataScriptTag) {
      `Failed to find script tag for query:script[data-page="true"][data-pathname="${pathname}"]`;
      return;
    }
    const { data } = await import(dataScriptTag.src);
    const {
      subjects,
      eventListeners,
      eventListenerOptions,
      observers,
      observerOptions
    } = data;
    if (!eventListenerOptions || !eventListeners || !observers || !subjects || !observerOptions) {
      errorOut(`Possibly malformed page data ${data}`);
      return;
    }
    return data;
  }
  function errorOut(message) {
    throw new Error(message);
  }
  async function loadPage(previousPage) {
    const pathname = sanitizePathname(window.location.pathname);
    const pageData = await getPageData(pathname);
    const {
      subjects,
      eventListenerOptions,
      eventListeners,
      observers,
      observerOptions,
      loadHooks
    } = pageData;
    DEV_BUILD: {
      globalThis.devtools = {
        pageData,
        stateManager,
        eventListenerManager,
        observerManager,
        loadHookManager
      };
    }
    globalThis.eleganceClient = {
      createHTMLElementFromElement
    };
    stateManager.loadValues(subjects);
    eventListenerManager.loadValues(eventListeners);
    eventListenerManager.hookCallbacks(eventListenerOptions);
    observerManager.loadValues(observers);
    observerManager.hookCallbacks(observerOptions);
    loadHookManager.loadValues(loadHooks);
  }
  loadPage();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnQudHMiLCAiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnRfbGlzdC50cyIsICIuLi8uLi8uLi9zcmMvY2xpZW50L3J1bnRpbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBBbnkgdmFsaWQgZWxlbWVudCB0aGF0IGhhcyBub3QgYmVlbiBjb25zdHJ1Y3RlZCB2aWEgdGhlIHVzZSBvZiBhbiBlbGVtZW50IGNvbnN0cnVjdG9yIHN1Y2ggYXMgaDEoKSAqL1xudHlwZSBFbGVtZW50TGl0ZXJhbCA9IGJvb2xlYW4gfCBcbiAgICBudW1iZXIgfCBcbiAgICBzdHJpbmcgfCBcbiAgICBBcnJheTxhbnk+O1xuXG50eXBlIEFueUVsZW1lbnQgPSBFbGVnYW5jZUVsZW1lbnQ8YW55PiB8IEVsZW1lbnRMaXRlcmFsO1xuXG50eXBlIEVsZW1lbnRDaGlsZHJlbiA9IEFueUVsZW1lbnRbXTtcblxuLyoqIEVsZW1lbnQgb3B0aW9ucyBvZiB0aGlzIHR5cGUgd2lsbCBiZSBtYWRlIGludG8gZmllbGQ9XCJ2YWx1ZS50b1N0cmluZygpXCIgKi9cbnR5cGUgRWxlbWVudE9wdGlvbkxpdGVyYWwgPSBudW1iZXIgfCBzdHJpbmcgfCBSZWNvcmQ8YW55LCBhbnk+O1xuXG50eXBlIFByb2Nlc3NTcGVjaWFsRWxlbWVudE9wdGlvbiA9IChlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKiogXG4gKiBBbiBvcHRpb24gdGhhdCBzaG91bGQgYmUgdHJlYXRlZCBkaWZmZXJlbnRseSBieSB0aGUgY29tcGlsZXIuXG4gKi9cbmFic3RyYWN0IGNsYXNzIFNwZWNpYWxFbGVtZW50T3B0aW9uIHtcbiAgICAvKipcbiAgICAgKiBNdXRhdGUgdGhpcyBvcHRpb24gaW4gdGhlIGVsZW1lbnQgdG8gaXQncyBzZXJpYWxpemVhYmxlIHN0YXRlLlxuICAgICAqL1xuICAgIGFic3RyYWN0IG11dGF0ZShlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nKTogdm9pZFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCB0aGlzIHNwZWNpYWwgZWxlbWVudCBvcHRpb24gaW50byBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBhYnN0cmFjdCBzZXJpYWxpemUob3B0aW9uTmFtZTogc3RyaW5nLCBlbGVtZW50S2V5OiBzdHJpbmcpOiBzdHJpbmdcbn0gXG5cbnR5cGUgRWxlbWVudE9wdGlvbnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgfCBTcGVjaWFsRWxlbWVudE9wdGlvbj4gfCBFbGVtZW50T3B0aW9uTGl0ZXJhbDtcblxuLyoqIFxuICogUHVyZWx5IGZvciBzeW50YXggcmVhc29ucywgeW91IGNhbiB1c2UgYW4gZWxlbWVudCBhcyB0aGUgb3B0aW9ucyBwYXJhbWV0ZXJcbiAqIHdoZW4gY3JlYXRpbmcgYW4gZWxlbWVudCB1c2luZyBhbiBlbGVtZW50IGJ1aWxkZXIuXG4gKiBUaGlzIGlzIHRoZW4gcHJlcGVuZGVkIGludG8gdGhlIGNoaWxkcmVuIGJ5IHRoZSBlbGVtZW50IGJ1aWxkZXIuXG4gKi9cbnR5cGUgRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCA9IEVsZW1lbnRPcHRpb25zIHwgQW55RWxlbWVudDtcblxudHlwZSBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPVxuICB8IFwiYXJlYVwiIHwgXCJiYXNlXCIgfCBcImJyXCIgfCBcImNvbFwiIHwgXCJlbWJlZFwiIHwgXCJoclwiIHwgXCJpbWdcIiB8IFwiaW5wdXRcIlxuICB8IFwibGlua1wiIHwgXCJtZXRhXCIgfCBcInBhcmFtXCIgfCBcInNvdXJjZVwiIHwgXCJ0cmFja1wiIHwgXCJ3YnJcIjtcblxudHlwZSBIdG1sRWxlbWVudFRhZ3MgPVxuICB8IFwiYVwiIHwgXCJhYmJyXCIgfCBcImFkZHJlc3NcIiB8IFwiYXJ0aWNsZVwiIHwgXCJhc2lkZVwiIHwgXCJhdWRpb1wiIHwgXCJiXCIgfCBcImJkaVwiIHwgXCJiZG9cIlxuICB8IFwiYmxvY2txdW90ZVwiIHwgXCJib2R5XCIgfCBcImJ1dHRvblwiIHwgXCJjYW52YXNcIiB8IFwiY2FwdGlvblwiIHwgXCJjaXRlXCIgfCBcImNvZGVcIiB8IFwiY29sZ3JvdXBcIlxuICB8IFwiZGF0YVwiIHwgXCJkYXRhbGlzdFwiIHwgXCJkZFwiIHwgXCJkZWxcIiB8IFwiZGV0YWlsc1wiIHwgXCJkZm5cIiB8IFwiZGlhbG9nXCIgfCBcImRpdlwiIHwgXCJkbFwiIHwgXCJkdFwiXG4gIHwgXCJlbVwiIHwgXCJmaWVsZHNldFwiIHwgXCJmaWdjYXB0aW9uXCIgfCBcImZpZ3VyZVwiIHwgXCJmb290ZXJcIiB8IFwiZm9ybVwiIHwgXCJoMVwiIHwgXCJoMlwiIHwgXCJoM1wiXG4gIHwgXCJoNFwiIHwgXCJoNVwiIHwgXCJoNlwiIHwgXCJoZWFkXCIgfCBcImhlYWRlclwiIHwgXCJoZ3JvdXBcIiB8IFwiaHRtbFwiIHwgXCJpXCIgfCBcImlmcmFtZVwiIHwgXCJpbnNcIlxuICB8IFwia2JkXCIgfCBcImxhYmVsXCIgfCBcImxlZ2VuZFwiIHwgXCJsaVwiIHwgXCJtYWluXCIgfCBcIm1hcFwiIHwgXCJtYXJrXCIgfCBcIm1lbnVcIiB8IFwibWV0ZXJcIiB8IFwibmF2XCJcbiAgfCBcIm5vc2NyaXB0XCIgfCBcIm9iamVjdFwiIHwgXCJvbFwiIHwgXCJvcHRncm91cFwiIHwgXCJvcHRpb25cIiB8IFwib3V0cHV0XCIgfCBcInBcIiB8IFwicGljdHVyZVwiXG4gIHwgXCJwcmVcIiB8IFwicHJvZ3Jlc3NcIiB8IFwicVwiIHwgXCJycFwiIHwgXCJydFwiIHwgXCJydWJ5XCIgfCBcInNcIiB8IFwic2FtcFwiIHwgXCJzY3JpcHRcIiB8IFwic2VhcmNoXCJcbiAgfCBcInNlY3Rpb25cIiB8IFwic2VsZWN0XCIgfCBcInNsb3RcIiB8IFwic21hbGxcIiB8IFwic3BhblwiIHwgXCJzdHJvbmdcIiB8IFwic3R5bGVcIiB8IFwic3ViXCIgfCBcInN1bW1hcnlcIlxuICB8IFwic3VwXCIgfCBcInRhYmxlXCIgfCBcInRib2R5XCIgfCBcInRkXCIgfCBcInRlbXBsYXRlXCIgfCBcInRleHRhcmVhXCIgfCBcInRmb290XCIgfCBcInRoXCIgfCBcInRoZWFkXCJcbiAgfCBcInRpbWVcIiB8IFwidGl0bGVcIiB8IFwidHJcIiB8IFwidVwiIHwgXCJ1bFwiIHwgXCJ2YXJcIiB8IFwidmlkZW9cIjtcblxudHlwZSBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9XG4gIHwgXCJwYXRoXCIgfCBcImNpcmNsZVwiIHwgXCJlbGxpcHNlXCIgfCBcImxpbmVcIiB8IFwicG9seWdvblwiIHwgXCJwb2x5bGluZVwiIHwgXCJzdG9wXCI7XG5cbnR5cGUgU3ZnRWxlbWVudFRhZ3MgPVxuICB8IFwic3ZnXCIgfCBcImdcIiB8IFwidGV4dFwiIHwgXCJ0c3BhblwiIHwgXCJ0ZXh0UGF0aFwiIHwgXCJkZWZzXCIgfCBcInN5bWJvbFwiIHwgXCJ1c2VcIlxuICB8IFwiaW1hZ2VcIiB8IFwiY2xpcFBhdGhcIiB8IFwibWFza1wiIHwgXCJwYXR0ZXJuXCIgfCBcImxpbmVhckdyYWRpZW50XCIgfCBcInJhZGlhbEdyYWRpZW50XCJcbiAgfCBcImZpbHRlclwiIHwgXCJtYXJrZXJcIiB8IFwidmlld1wiXG4gIHwgXCJmZUJsZW5kXCIgfCBcImZlQ29sb3JNYXRyaXhcIiB8IFwiZmVDb21wb25lbnRUcmFuc2ZlclwiIHwgXCJmZUNvbXBvc2l0ZVwiXG4gIHwgXCJmZUNvbnZvbHZlTWF0cml4XCIgfCBcImZlRGlmZnVzZUxpZ2h0aW5nXCIgfCBcImZlRGlzcGxhY2VtZW50TWFwXCIgfCBcImZlRGlzdGFudExpZ2h0XCJcbiAgfCBcImZlRmxvb2RcIiB8IFwiZmVGdW5jQVwiIHwgXCJmZUZ1bmNCXCIgfCBcImZlRnVuY0dcIiB8IFwiZmVGdW5jUlwiIHwgXCJmZUdhdXNzaWFuQmx1clwiXG4gIHwgXCJmZUltYWdlXCIgfCBcImZlTWVyZ2VcIiB8IFwiZmVNZXJnZU5vZGVcIiB8IFwiZmVNb3JwaG9sb2d5XCIgfCBcImZlT2Zmc2V0XCIgfCBcImZlUG9pbnRMaWdodFwiXG4gIHwgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIiB8IFwiZmVTcG90TGlnaHRcIiB8IFwiZmVUaWxlXCIgfCBcImZlVHVyYnVsZW5jZVwiO1xuXG50eXBlIE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID1cbiAgfCBcIm1pXCIgfCBcIm1uXCIgfCBcIm1vXCI7XG5cbnR5cGUgTWF0aE1MRWxlbWVudFRhZ3MgPVxuICB8IFwibWF0aFwiIHwgXCJtc1wiIHwgXCJtdGV4dFwiIHwgXCJtcm93XCIgfCBcIm1mZW5jZWRcIiB8IFwibXN1cFwiIHwgXCJtc3ViXCIgfCBcIm1zdWJzdXBcIlxuICB8IFwibWZyYWNcIiB8IFwibXNxcnRcIiB8IFwibXJvb3RcIiB8IFwibXRhYmxlXCIgfCBcIm10clwiIHwgXCJtdGRcIiB8IFwibXN0eWxlXCJcbiAgfCBcIm1lbmNsb3NlXCIgfCBcIm1tdWx0aXNjcmlwdHNcIjtcblxudHlwZSBBbGxFbGVtZW50VGFncyA9XG4gIHwgSHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gIHwgSHRtbEVsZW1lbnRUYWdzXG4gIHwgU3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3NcbiAgfCBTdmdFbGVtZW50VGFnc1xuICB8IE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gIHwgTWF0aE1MRWxlbWVudFRhZ3M7XG5cbnR5cGUgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWcgZXh0ZW5kcyBBbGxFbGVtZW50VGFncz4gPVxuICBUYWcgZXh0ZW5kcyBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgfCBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyB8IE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gICAgPyAob3B0aW9ucz86IEVsZW1lbnRPcHRpb25zKSA9PiBFbGVnYW5jZUVsZW1lbnQ8ZmFsc2U+XG4gICAgOiAob3B0aW9ucz86IEVsZW1lbnRPcHRpb25zLCAuLi5jaGlsZHJlbjogRWxlbWVudENoaWxkcmVuKSA9PiBFbGVnYW5jZUVsZW1lbnQ8dHJ1ZT47XG5cbi8qKiBDaGVjayBpZiBhbnkgZ2l2ZW4gdmFsdWUgY2FuIGJlIGNsYXNzaWZpZWQgYXMgYW4gZWxlbWVudC4gKi9cbmZ1bmN0aW9uIGlzQW5FbGVtZW50KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBBbnlFbGVtZW50IHtcbiAgICBpZiAoXG4gICAgICAgIHZhbHVlICE9PSBudWxsICYmXG4gICAgICAgIHZhbHVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudClcbiAgICApIHJldHVybiB0cnVlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogUmVwcmVzZW50cyBhbiBlbGVtZW50IHRoYXQgaGFzIGJlZW4gY29uc3RydWN0ZWQgdmlhIHRoZSB1c2Ugb2YgYW4gZWxlbWVudCBjb25zdHJ1Y3RvciBzdWNoIGFzIGgxKCkgKi9cbmNsYXNzIEVsZWdhbmNlRWxlbWVudDxcbiAgICBDYW5IYXZlQ2hpbGRyZW4gZXh0ZW5kcyBib29sZWFuLFxuPiB7XG4gICAgcmVhZG9ubHkgdGFnOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA7XG4gICAgcmVhZG9ubHkgb3B0aW9uczogRWxlbWVudE9wdGlvbnM7XG5cbiAgICAvKiogXG4gICAgICogVGhlIHVuaXF1ZSBrZXkgb2YgdGhpcyBlbGVtZW50LiBcbiAgICAgKiBVc2UgZ2V0RWxlbWVudEtleSgpIGluIGZyb20gdGhlIGNvbXBpbGVyIHRvIHJldHJpZXZlIHRoaXMgdmFsdWVcbiAgICAgKi9cbiAgICBrZXk/OiBzdHJpbmc7XG5cbiAgICBjaGlsZHJlbjogQ2FuSGF2ZUNoaWxkcmVuIGV4dGVuZHMgdHJ1ZVxuICAgICAgICA/IEVsZW1lbnRDaGlsZHJlblxuICAgICAgICA6IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgdGFnOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgICAgIG9wdGlvbnM6IEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQgPSB7fSxcbiAgICAgICAgY2hpbGRyZW46IEVsZW1lbnRDaGlsZHJlbiB8IG51bGwsXG4gICAgKSB7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiBhcyBDYW5IYXZlQ2hpbGRyZW4gZXh0ZW5kcyB0cnVlID8gRWxlbWVudENoaWxkcmVuIDogbnVsbDtcblxuICAgICAgICBpZiAoaXNBbkVsZW1lbnQob3B0aW9ucykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbkhhdmVDaGlsZHJlbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGUgZWxlbWVudDpcIiwgdGhpcywgXCJpcyBhbiBpbnZhbGlkIGVsZW1lbnQuIFJlYXNvbjpcIilcbiAgICAgICAgICAgICAgICB0aHJvdyBcIlRoZSBvcHRpb25zIG9mIGFuIGVsZW1lbnQgbWF5IG5vdCBiZSBhbiBlbGVtZW50LCBpZiB0aGUgZWxlbWVudCBjYW5ub3QgaGF2ZSBjaGlsZHJlbi5cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi51bnNoaWZ0KG9wdGlvbnMpXG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyBhcyBFbGVtZW50T3B0aW9ucztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbkhhdmVDaGlsZHJlbigpOiB0aGlzIGlzIEVsZWdhbmNlRWxlbWVudDx0cnVlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuICE9PSBudWxsO1xuICAgIH1cbn1cblxuXG5leHBvcnQge1xuICAgIEVsZWdhbmNlRWxlbWVudCxcblxuICAgIFNwZWNpYWxFbGVtZW50T3B0aW9uLFxufVxuXG5leHBvcnQgdHlwZSB7XG4gICAgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcixcbiAgICBcbiAgICBBbnlFbGVtZW50LFxuICAgIEVsZW1lbnRDaGlsZHJlbixcbiAgICBcbiAgICBBbGxFbGVtZW50VGFncyxcbiAgICBIdG1sRWxlbWVudFRhZ3MsXG4gICAgSHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuICAgIFN2Z0VsZW1lbnRUYWdzLFxuICAgIFN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuICAgIE1hdGhNTEVsZW1lbnRUYWdzLFxuICAgIE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuXG4gICAgRWxlbWVudE9wdGlvbnMsXG4gICAgUHJvY2Vzc1NwZWNpYWxFbGVtZW50T3B0aW9uLFxuICAgIEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQsXG59IiwgImltcG9ydCB7XG4gICAgSHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuICAgIEh0bWxFbGVtZW50VGFncyxcbiAgICBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcbiAgICBTdmdFbGVtZW50VGFncyxcbiAgICBNYXRoTUxDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcbiAgICBNYXRoTUxFbGVtZW50VGFncyxcbiAgICBFbGVnYW5jZUVsZW1lbnQsXG4gICAgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcixcbiAgICBFbGVtZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudE9wdGlvbnMsXG4gICAgQWxsRWxlbWVudFRhZ3MsXG4gICAgRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCxcbn0gZnJvbSBcIi4vZWxlbWVudFwiO1xuXG5jb25zdCBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M6IEFycmF5PEh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncz4gPSBbXG4gICAgXCJhcmVhXCIsIFwiYmFzZVwiLCBcImJyXCIsIFwiY29sXCIsIFwiZW1iZWRcIiwgXCJoclwiLCBcImltZ1wiLCBcImlucHV0XCIsXG4gICAgXCJsaW5rXCIsIFwibWV0YVwiLCBcInBhcmFtXCIsIFwic291cmNlXCIsIFwidHJhY2tcIiwgXCJ3YnJcIixcbl07XG5cbmNvbnN0IGh0bWxFbGVtZW50VGFnczogQXJyYXk8SHRtbEVsZW1lbnRUYWdzPiA9IFtcbiAgICBcImFcIiwgXCJhYmJyXCIsIFwiYWRkcmVzc1wiLCBcImFydGljbGVcIiwgXCJhc2lkZVwiLCBcImF1ZGlvXCIsIFwiYlwiLCBcImJkaVwiLCBcImJkb1wiLFxuICAgIFwiYmxvY2txdW90ZVwiLCBcImJvZHlcIiwgXCJidXR0b25cIiwgXCJjYW52YXNcIiwgXCJjYXB0aW9uXCIsIFwiY2l0ZVwiLCBcImNvZGVcIixcbiAgICBcImNvbGdyb3VwXCIsIFwiZGF0YVwiLCBcImRhdGFsaXN0XCIsIFwiZGRcIiwgXCJkZWxcIiwgXCJkZXRhaWxzXCIsIFwiZGZuXCIsIFwiZGlhbG9nXCIsXG4gICAgXCJkaXZcIiwgXCJkbFwiLCBcImR0XCIsIFwiZW1cIiwgXCJmaWVsZHNldFwiLCBcImZpZ2NhcHRpb25cIiwgXCJmaWd1cmVcIiwgXCJmb290ZXJcIixcbiAgICBcImZvcm1cIiwgXCJoMVwiLCBcImgyXCIsIFwiaDNcIiwgXCJoNFwiLCBcImg1XCIsIFwiaDZcIiwgXCJoZWFkXCIsIFwiaGVhZGVyXCIsIFwiaGdyb3VwXCIsXG4gICAgXCJodG1sXCIsIFwiaVwiLCBcImlmcmFtZVwiLCBcImluc1wiLCBcImtiZFwiLCBcImxhYmVsXCIsIFwibGVnZW5kXCIsIFwibGlcIiwgXCJtYWluXCIsXG4gICAgXCJtYXBcIiwgXCJtYXJrXCIsIFwibWVudVwiLCBcIm1ldGVyXCIsIFwibmF2XCIsIFwibm9zY3JpcHRcIiwgXCJvYmplY3RcIiwgXCJvbFwiLFxuICAgIFwib3B0Z3JvdXBcIiwgXCJvcHRpb25cIiwgXCJvdXRwdXRcIiwgXCJwXCIsIFwicGljdHVyZVwiLCBcInByZVwiLCBcInByb2dyZXNzXCIsXG4gICAgXCJxXCIsIFwicnBcIiwgXCJydFwiLCBcInJ1YnlcIiwgXCJzXCIsIFwic2FtcFwiLCBcInNjcmlwdFwiLCBcInNlYXJjaFwiLCBcInNlY3Rpb25cIixcbiAgICBcInNlbGVjdFwiLCBcInNsb3RcIiwgXCJzbWFsbFwiLCBcInNwYW5cIiwgXCJzdHJvbmdcIiwgXCJzdHlsZVwiLCBcInN1YlwiLCBcInN1bW1hcnlcIixcbiAgICBcInN1cFwiLCBcInRhYmxlXCIsIFwidGJvZHlcIiwgXCJ0ZFwiLCBcInRlbXBsYXRlXCIsIFwidGV4dGFyZWFcIiwgXCJ0Zm9vdFwiLCBcInRoXCIsXG4gICAgXCJ0aGVhZFwiLCBcInRpbWVcIiwgXCJ0aXRsZVwiLCBcInRyXCIsIFwidVwiLCBcInVsXCIsIFwidmFyXCIsIFwidmlkZW9cIixcbl07XG5cbmNvbnN0IHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzOiBBcnJheTxTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncz4gPSBbXG4gICAgXCJwYXRoXCIsIFwiY2lyY2xlXCIsIFwiZWxsaXBzZVwiLCBcImxpbmVcIiwgXCJwb2x5Z29uXCIsIFwicG9seWxpbmVcIiwgXCJzdG9wXCIsXG5dO1xuXG5jb25zdCBzdmdFbGVtZW50VGFnczogQXJyYXk8U3ZnRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwic3ZnXCIsIFwiZ1wiLCBcInRleHRcIiwgXCJ0c3BhblwiLCBcInRleHRQYXRoXCIsIFwiZGVmc1wiLCBcInN5bWJvbFwiLCBcInVzZVwiLFxuICAgIFwiaW1hZ2VcIiwgXCJjbGlwUGF0aFwiLCBcIm1hc2tcIiwgXCJwYXR0ZXJuXCIsIFwibGluZWFyR3JhZGllbnRcIiwgXCJyYWRpYWxHcmFkaWVudFwiLFxuICAgIFwiZmlsdGVyXCIsIFwibWFya2VyXCIsIFwidmlld1wiLFxuICAgIFwiZmVCbGVuZFwiLCBcImZlQ29sb3JNYXRyaXhcIiwgXCJmZUNvbXBvbmVudFRyYW5zZmVyXCIsIFwiZmVDb21wb3NpdGVcIixcbiAgICBcImZlQ29udm9sdmVNYXRyaXhcIiwgXCJmZURpZmZ1c2VMaWdodGluZ1wiLCBcImZlRGlzcGxhY2VtZW50TWFwXCIsIFwiZmVEaXN0YW50TGlnaHRcIixcbiAgICBcImZlRmxvb2RcIiwgXCJmZUZ1bmNBXCIsIFwiZmVGdW5jQlwiLCBcImZlRnVuY0dcIiwgXCJmZUZ1bmNSXCIsIFwiZmVHYXVzc2lhbkJsdXJcIixcbiAgICBcImZlSW1hZ2VcIiwgXCJmZU1lcmdlXCIsIFwiZmVNZXJnZU5vZGVcIiwgXCJmZU1vcnBob2xvZ3lcIiwgXCJmZU9mZnNldFwiLFxuICAgIFwiZmVQb2ludExpZ2h0XCIsIFwiZmVTcGVjdWxhckxpZ2h0aW5nXCIsIFwiZmVTcG90TGlnaHRcIiwgXCJmZVRpbGVcIiwgXCJmZVR1cmJ1bGVuY2VcIixcbl07XG5cbmNvbnN0IG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzOiBBcnJheTxNYXRoTUxDaGlsZHJlbmxlc3NFbGVtZW50VGFncz4gPSBbXG4gICAgXCJtaVwiLCBcIm1uXCIsIFwibW9cIixcbl07XG5cbmNvbnN0IG1hdGhtbEVsZW1lbnRUYWdzOiBBcnJheTxNYXRoTUxFbGVtZW50VGFncz4gPSBbXG4gICAgXCJtYXRoXCIsIFwibXNcIiwgXCJtdGV4dFwiLCBcIm1yb3dcIiwgXCJtZmVuY2VkXCIsIFwibXN1cFwiLCBcIm1zdWJcIiwgXCJtc3Vic3VwXCIsXG4gICAgXCJtZnJhY1wiLCBcIm1zcXJ0XCIsIFwibXJvb3RcIiwgXCJtdGFibGVcIiwgXCJtdHJcIiwgXCJtdGRcIiwgXCJtc3R5bGVcIixcbiAgICBcIm1lbmNsb3NlXCIsIFwibW11bHRpc2NyaXB0c1wiLFxuXTtcblxuY29uc3QgZWxlbWVudHM6IFJlY29yZDxzdHJpbmcsIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8YW55Pj4gPSB7fTtcbmNvbnN0IGNoaWxkcmVubGVzc0VsZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPGFueT4+ID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRCdWlsZGVyPFRhZyBleHRlbmRzIEFsbEVsZW1lbnRUYWdzPihcbiAgICB0YWc6IFRhZ1xuKTogRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWc+IHtcbiAgICByZXR1cm4gKChvcHRpb25zOiBFbGVtZW50T3B0aW9uc09yQ2hpbGRFbGVtZW50LCAuLi5jaGlsZHJlbjogRWxlbWVudENoaWxkcmVuKSA9PiBcbiAgICAgICAgbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcgYXMgYW55LCBvcHRpb25zLCBjaGlsZHJlbikpIGFzIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8VGFnPjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXI8VGFnIGV4dGVuZHMgQWxsRWxlbWVudFRhZ3M+KFxuICAgIHRhZzogVGFnXG4pOiBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPFRhZz4ge1xuICAgIHJldHVybiAoKG9wdGlvbnM6IEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQpID0+XG4gICAgICAgIG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnIGFzIGFueSwgb3B0aW9ucywgbnVsbCkpIGFzIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8VGFnPjtcbn1cblxuZm9yIChjb25zdCB0YWcgb2YgaHRtbEVsZW1lbnRUYWdzKSBlbGVtZW50c1t0YWddID0gY3JlYXRlRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0VsZW1lbnRUYWdzKSBlbGVtZW50c1t0YWddID0gY3JlYXRlRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbEVsZW1lbnRUYWdzKSBlbGVtZW50c1t0YWddID0gY3JlYXRlRWxlbWVudEJ1aWxkZXIodGFnKTtcblxuZm9yIChjb25zdCB0YWcgb2YgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuXG5mb3IgKGNvbnN0IHRhZyBvZiBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncylcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcblxuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHNbdGFnXSA9IGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyKHRhZyk7XG5cbmNvbnN0IGFsbEVsZW1lbnRzID0ge1xuICAgIC4uLmVsZW1lbnRzLFxuICAgIC4uLmNoaWxkcmVubGVzc0VsZW1lbnRzLFxufTtcblxuZXhwb3J0IHtcbiAgICBlbGVtZW50cyxcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50cyxcbiAgICBhbGxFbGVtZW50cyxcbn07XG4iLCAiXG5pbXBvcnQgdHlwZSB7IEV2ZW50TGlzdGVuZXIsIEV2ZW50TGlzdGVuZXJDYWxsYmFjaywgRXZlbnRMaXN0ZW5lck9wdGlvbiB9IGZyb20gXCIuL2V2ZW50TGlzdGVuZXJcIjtcbmltcG9ydCB0eXBlIHsgTG9hZEhvb2tDbGVhbnVwRnVuY3Rpb24sIExvYWRIb29rIH0gZnJvbSBcIi4vbG9hZEhvb2tcIjtcbmltcG9ydCB0eXBlIHsgT2JzZXJ2ZXJDYWxsYmFjaywgU2VydmVyT2JzZXJ2ZXIgfSBmcm9tIFwiLi9vYnNlcnZlclwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2ZXJTdWJqZWN0IH0gZnJvbSBcIi4vc3RhdGVcIjtcblxuaW1wb3J0IHsgYWxsRWxlbWVudHMgfSBmcm9tIFwiLi4vZWxlbWVudHMvZWxlbWVudF9saXN0XCI7XG5pbXBvcnQgdHlwZSB7IEFueUVsZW1lbnQsIH0gZnJvbSBcIi4uL2VsZW1lbnRzL2VsZW1lbnRcIjtcbmltcG9ydCB7IFNwZWNpYWxFbGVtZW50T3B0aW9uLCBFbGVnYW5jZUVsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudHMvZWxlbWVudFwiO1xuXG5PYmplY3QuYXNzaWduKHdpbmRvdywgYWxsRWxlbWVudHMpO1xuXG5pbnRlcmZhY2UgU2VyaWFsaXphdGlvblJlc3VsdCB7XG4gIHJvb3Q6IE5vZGU7XG4gIHNwZWNpYWxFbGVtZW50T3B0aW9uczogeyBlbGVtZW50S2V5OiBzdHJpbmcsIG9wdGlvbk5hbWU6IHN0cmluZywgb3B0aW9uVmFsdWU6IFNwZWNpYWxFbGVtZW50T3B0aW9uIH1bXTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KFxuICAgIGVsZW1lbnQ6IEVsZWdhbmNlRWxlbWVudDxhbnk+LFxuKTogU2VyaWFsaXphdGlvblJlc3VsdCB7XG4gICAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9uczogeyBlbGVtZW50S2V5OiBzdHJpbmcsIG9wdGlvbk5hbWU6IHN0cmluZywgb3B0aW9uVmFsdWU6IFNwZWNpYWxFbGVtZW50T3B0aW9uIH1bXSA9IFtdO1xuICAgIGNvbnN0IGRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQudGFnKTtcblxuICAgIC8vIFByb2Nlc3Mgb3B0aW9ucy5cbiAgICB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlbGVtZW50Lm9wdGlvbnMpO1xuICAgICAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZS5tdXRhdGUoZWxlbWVudCwgb3B0aW9uTmFtZSk7XG4gICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRLZXkgPSAoTWF0aC5yYW5kb20oKSAqIDEwMDAwKS50b1N0cmluZygpO1xuICAgICBcbiAgICAgICAgICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCh7IGVsZW1lbnRLZXksIG9wdGlvbk5hbWUsIG9wdGlvblZhbHVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50LmtleSkge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShcImtleVwiLCBlbGVtZW50LmtleSk7XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBjaGlsZHJlbi5cbiAgICB7XG4gICAgICAgIGlmIChlbGVtZW50LmNoaWxkcmVuICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgXG4gICAgICAgICAgICAgICAgZG9tRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgcmV0dXJuIHsgcm9vdDogZG9tRWxlbWVudCwgc3BlY2lhbEVsZW1lbnRPcHRpb25zIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoXG4gICAgZWxlbWVudDogQW55RWxlbWVudCxcbik6IFNlcmlhbGl6YXRpb25SZXN1bHQge1xuICAgIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IHsgZWxlbWVudEtleTogc3RyaW5nLCBvcHRpb25OYW1lOiBzdHJpbmcsIG9wdGlvblZhbHVlOiBTcGVjaWFsRWxlbWVudE9wdGlvbiB9W10gPSBbXTtcblxuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBhbmQgbnVsbCBhcmUgbm90IGFsbG93ZWQgYXMgZWxlbWVudHMuYCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJFbGVtZW50IG9mIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCguLi5yZXN1bHQuc3BlY2lhbEVsZW1lbnRPcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LmApO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgXG4gICAgICAgIHJldHVybiB7IHJvb3Q6IHRleHROb2RlLCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IFtdIH07XG4gICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICAgIH1cbn1cblxuXG5kZWNsYXJlIGxldCBERVZfQlVJTEQ6IGJvb2xlYW47XG5kZWNsYXJlIGxldCBQUk9EX0JVSUxEOiBib29sZWFuO1xuXG50eXBlIENsaWVudFN1YmplY3RPYnNlcnZlcjxUPiA9IChuZXdWYWx1ZTogVCkgPT4gdm9pZDtcblxuREVWX0JVSUxEICYmICgoKSA9PiB7XG4gICAgbGV0IGlzRXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgKGZ1bmN0aW9uIGNvbm5lY3QoKSB7XG4gICAgICAgIGNvbnN0IGVzID0gbmV3IEV2ZW50U291cmNlKFwiaHR0cDovL2xvY2FsaG9zdDo0MDAwL2VsZWdhbmNlLWhvdC1yZWxvYWRcIik7XG5cbiAgICAgICAgZXMub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRXJyb3JlZCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09IFwiaG90LXJlbG9hZFwiKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGVzLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICBpc0Vycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgZXMuY2xvc2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0VGltZW91dChjb25uZWN0LCAyMDAwKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xufSkoKTtcblxuLyoqXG4gKiBBIFNlcnZlclN1YmplY3QgdGhhdCBoYXMgYmVlbiBzZXJpYWxpemVkLCBzaGlwcGVkIHRvIHRoZSBicm93c2VyLCBhbmQgcmUtY3JlYXRlZCBhcyBpdCdzIGZpbmFsIGZvcm0uXG4gKiBcbiAqIFNldHRpbmcgdGhlIGB2YWx1ZWAgb2YgdGhpcyBDbGllbnRTdWJqZWN0IHdpbGwgdHJpZ2dlciBpdCdzIG9ic2VydmVycyBjYWxsYmFja3MuXG4gKiBcbiAqIFRvIGxpc3RlbiBmb3IgY2hhbmdlcyBpbiBgdmFsdWVgLCB5b3UgbWF5IGNhbGwgdGhlIGBvYnNlcnZlKClgIG1ldGhvZC5cbiAqL1xuY2xhc3MgQ2xpZW50U3ViamVjdDxUPiB7XG4gICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF92YWx1ZTogVDtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzZXJ2ZXJzOiBNYXA8c3RyaW5nLCBDbGllbnRTdWJqZWN0T2JzZXJ2ZXI8VD4+ID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgdmFsdWU6IFQpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCB2YWx1ZSgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgIH1cblxuICAgIHNldCB2YWx1ZShuZXdWYWx1ZTogVCkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIG9ic2VydmVyKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyaWdnZXJPYmVzcnZlcnMoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIG9ic2VydmVyKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9ic2VydmUoaWQ6IHN0cmluZywgY2FsbGJhY2s6IChuZXdWYWx1ZTogVCkgPT4gdm9pZCkge1xuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcnMuaGFzKGlkKSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzLnNldChpZCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHVub2JzZXJ2ZShpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzLmRlbGV0ZShpZCk7XG4gICAgfVxufVxuXG5jbGFzcyBTdGF0ZU1hbmFnZXIge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3ViamVjdHM6IE1hcDxzdHJpbmcsIENsaWVudFN1YmplY3Q8YW55Pj4gPSBuZXcgTWFwKClcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXModmFsdWVzOiBTZXJ2ZXJTdWJqZWN0PGFueT5bXSwgZG9PdmVyd3JpdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRTdWJqZWN0ID0gbmV3IENsaWVudFN1YmplY3QodmFsdWUuaWQsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdHMuc2V0KHZhbHVlLmlkLCBjbGllbnRTdWJqZWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldChpZDogc3RyaW5nKTogQ2xpZW50U3ViamVjdDxhbnk+IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViamVjdHMuZ2V0KGlkKVxuICAgIH1cblxuICAgIGdldEFsbChpZHM6IHN0cmluZ1tdKTogQXJyYXk8Q2xpZW50U3ViamVjdDxhbnk+PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PENsaWVudFN1YmplY3Q8YW55Pj4gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG59XG5cblxudHlwZSBDbGllbnRFdmVudExpc3RlbmVyT3B0aW9uID0ge1xuICAgIC8qKiBUaGUgaHRtbCBhdHRyaWJ1dGUgbmFtZSB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8gKi9cbiAgICBvcHRpb246IHN0cmluZyxcbiAgICAvKiogVGhlIGtleSBvZiB0aGUgZWxlbWVudCB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8uICovXG4gICAga2V5OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBldmVudCBsaXN0ZW5lciBpZCB0aGlzIG9wdGlvbiBpcyByZWZlcmVuY2luZy4gKi8gXG4gICAgaWQ6IHN0cmluZyxcbn1cblxuLyoqXG4gKiBBbiBldmVudCBsaXN0ZW5lciBhZnRlciBpdCBoYXMgYmVlbiBnZW5lcmF0ZWQgb24gdGhlIHNlcnZlciwgcHJvY2Vzc2VkIGludG8gcGFnZWRhdGEsIGFuZCByZWNvbnN0cnVjdGVkIG9uIHRoZSBjbGllbnQuXG4gKi9cbmNsYXNzIENsaWVudEV2ZW50TGlzdGVuZXIge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJDYWxsYmFjazxhbnk+O1xuICAgIGRlcGVuZGVuY2llczogc3RyaW5nW107XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lckNhbGxiYWNrPGFueT4sIGRlcGVuY2VuY2llczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgIH1cblxuICAgIGNhbGwoZXY6IEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGV2IGFzIGFueSwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgICB9XG59XG5cbmNsYXNzIEV2ZW50TGlzdGVuZXJNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGV2ZW50TGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBDbGllbnRFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXMoc2VydmVyRXZlbnRMaXN0ZW5lcnM6IEV2ZW50TGlzdGVuZXI8YW55PltdLCBkb092ZXJyaWRlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRFdmVudExpc3RlbmVyID0gbmV3IENsaWVudEV2ZW50TGlzdGVuZXIoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCwgc2VydmVyRXZlbnRMaXN0ZW5lci5jYWxsYmFjaywgc2VydmVyRXZlbnRMaXN0ZW5lci5kZXBlbmRlbmNpZXMpO1xuICAgICAgICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQoY2xpZW50RXZlbnRMaXN0ZW5lci5pZCwgY2xpZW50RXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zOiBDbGllbnRFdmVudExpc3RlbmVyT3B0aW9uW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJQb3NzaWJseSBjb3JydXB0ZWQgSFRNTCwgZmFpbGVkIHRvIGZpbmQgZWxlbWVudCB3aXRoIGtleSBcIiArIGV2ZW50TGlzdGVuZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgICAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgRXZlbnRMaXN0ZW5lck9wdGlvbjogRXZlbnQgbGlzdGVuZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAoZWxlbWVudCBhcyBhbnkpW2V2ZW50TGlzdGVuZXJPcHRpb24ub3B0aW9uXSA9IChldjogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyLmNhbGwoZXYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldChpZDogc3RyaW5nKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoaWQpO1xuICAgIH1cbn1cblxuXG50eXBlIENsaWVudE9ic2VydmVyT3B0aW9uID0ge1xuICAgIC8qKiBUaGUgaHRtbCBhdHRyaWJ1dGUgbmFtZSB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8gKi9cbiAgICBvcHRpb246IHN0cmluZyxcbiAgICAvKiogVGhlIGtleSBvZiB0aGUgZWxlbWVudCB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8uICovXG4gICAga2V5OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBldmVudCBsaXN0ZW5lciBpZCB0aGlzIG9wdGlvbiBpcyByZWZlcmVuY2luZy4gKi8gXG4gICAgaWQ6IHN0cmluZyxcbn1cblxuY2xhc3MgQ2xpZW50T2JzZXJ2ZXIge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IE9ic2VydmVyQ2FsbGJhY2s8YW55PjtcbiAgICBkZXBlbmRlbmNpZXM6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN1YmplY3RWYWx1ZXM6IENsaWVudFN1YmplY3Q8YW55PltcInZhbHVlXCJdW10gPSBbXTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudHM6IHsgZWxlbWVudDogRWxlbWVudCwgb3B0aW9uTmFtZTogc3RyaW5nIH1bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgY2FsbGJhY2s6IE9ic2VydmVyQ2FsbGJhY2s8YW55PiwgZGVwZW5jZW5jaWVzOiBzdHJpbmdbXSkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG5cbiAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuXG4gICAgICAgICAgICBpbml0aWFsVmFsdWUub2JzZXJ2ZSh0aGlzLmlkLCAobmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBlbGVtZW50IHRvIHVwZGF0ZSB3aGVuIHRoaXMgb2JzZXJ2ZXIgdXBkYXRlcy5cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQsIG9wdGlvbk5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICAgIH1cblxuICAgIGNhbGwoKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjayguLi50aGlzLnN1YmplY3RWYWx1ZXMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgeyBlbGVtZW50LCBvcHRpb25OYW1lIH0gb2YgdGhpcy5lbGVtZW50cykge1xuICAgICAgICAgICAgKGVsZW1lbnQgYXMgYW55KVtvcHRpb25OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmNsYXNzIE9ic2VydmVyTWFuYWdlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjbGllbnRPYnNlcnZlcnM6IE1hcDxzdHJpbmcsIENsaWVudE9ic2VydmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXMoc2VydmVyT2JzZXJ2ZXJzOiBTZXJ2ZXJPYnNlcnZlcjxhbnk+W10sIGRvT3ZlcnJpZGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlcnZlck9ic2VydmVyIG9mIHNlcnZlck9ic2VydmVycykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmhhcyhzZXJ2ZXJPYnNlcnZlci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRPYnNlcnZlciA9IG5ldyBDbGllbnRPYnNlcnZlcihzZXJ2ZXJPYnNlcnZlci5pZCwgc2VydmVyT2JzZXJ2ZXIuY2FsbGJhY2ssIHNlcnZlck9ic2VydmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudE9ic2VydmVycy5zZXQoY2xpZW50T2JzZXJ2ZXIuaWQsIGNsaWVudE9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zOiBDbGllbnRPYnNlcnZlck9wdGlvbltdKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBvYnNlcnZlck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgT2JzZXJ2ZXJPcHRpb246IE9ic2VydmVyIHdpdGggaWQgXFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgXCJcXFwiIGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmFkZEVsZW1lbnQoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb24ub3B0aW9uKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNhbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG50eXBlIENsZWFudXBQcm9jZWR1cmUgPSB7XG4gICAgcGF0aG5hbWU/OiBzdHJpbmcsXG4gICAga2luZDogTG9hZEhvb2tLaW5kLFxuICAgIGNsZWFudXBGdW5jdGlvbjogTG9hZEhvb2tDbGVhbnVwRnVuY3Rpb24sXG59O1xuXG5lbnVtIExvYWRIb29rS2luZCB7XG4gICAgTEFZT1VUX0xPQURIT09LLFxuICAgIFBBR0VfTE9BREhPT0ssXG59O1xuXG5jbGFzcyBMb2FkSG9va01hbmFnZXIge1xuICAgIHByaXZhdGUgY2xlYW51cFByb2NlZHVyZXM6IENsZWFudXBQcm9jZWR1cmVbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgbG9hZFZhbHVlcyhsb2FkSG9va3M6IExvYWRIb29rPGFueT5bXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb24gPSBsb2FkSG9vay5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgICAgICAgaWYgKGNsZWFudXBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMucHVzaCh7IFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwRnVuY3Rpb246IGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcGF0aG5hbWU6IGxvYWRIb29rLnBhdGhuYW1lLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxsQ2xlYW51cEZ1bmN0aW9ucygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXM6IENsZWFudXBQcm9jZWR1cmVbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgY2xlYW51cFByb2NlZHVyZSBvZiB0aGlzLmNsZWFudXBQcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAoY2xlYW51cFByb2NlZHVyZS5raW5kID09PSBMb2FkSG9va0tpbmQuTEFZT1VUX0xPQURIT09LKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5TY29wZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IHJlbWFpbmluZ1Byb2NlZHVyZXM7XG4gICAgfVxufVxuXG5jb25zdCBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG5jb25zdCBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xuY29uc3Qgc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcigpO1xuY29uc3QgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xuXG5cbmNvbnN0IHBhZ2VTdHJpbmdDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5jb25zdCBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5jb25zdCB4bWxTZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcblxuY29uc3QgZmV0Y2hQYWdlID0gYXN5bmMgKHRhcmdldFVSTDogVVJMKTogUHJvbWlzZTxEb2N1bWVudCB8IHZvaWQ+ID0+IHtcbiAgICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcblxuICAgIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgICAgICByZXR1cm4gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwYWdlU3RyaW5nQ2FjaGUuZ2V0KHBhdGhuYW1lKSEsIFwidGV4dC9odG1sXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVSTCk7XG5cbiAgICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICAgIFxuICAgIHtcbiAgICAgICAgY29uc3QgZGF0YVNjcmlwdHMgPSBBcnJheS5mcm9tKG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1tb2R1bGU9XCJ0cnVlXCJdJykpIGFzIEhUTUxTY3JpcHRFbGVtZW50W11cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTY3JpcHRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLW1vZHVsZT1cInRydWVcIl0nKSkgYXMgSFRNTFNjcmlwdEVsZW1lbnRbXVxuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBkYXRhU2NyaXB0IG9mIGRhdGFTY3JpcHRzKSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnRTY3JpcHRzLmZpbmQocyA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGRhdGFTY3JpcHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIGdldCBwYWdlIHNjcmlwdFxuICAgIHtcbiAgICAgICAgY29uc3QgcGFnZURhdGFTY3JpcHQgPSBuZXdET00ucXVlcnlTZWxlY3Rvcignc2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl0nKSBhcyBIVE1MU2NyaXB0RWxlbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgKCFwYWdlRGF0YVNjcmlwdCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGF3YWl0IGltcG9ydChwYWdlRGF0YVNjcmlwdC5zcmMpO1xuICAgIH1cbiAgICBcbiAgICAvLyBnZXQgbGF5b3V0IHNjcmlwdHNcbiAgICB7XG4gICAgICAgIGNvbnN0IGxheW91dERhdGFTY3JpcHRzID0gQXJyYXkuZnJvbShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtbGF5b3V0PVwidHJ1ZVwiXScpKSBhcyBIVE1MU2NyaXB0RWxlbWVudFtdXG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHNjcmlwdCBvZiBsYXlvdXREYXRhU2NyaXB0cykge1xuICAgICAgICAgICAgYXdhaXQgaW1wb3J0KHNjcmlwdC5zcmMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGFnZVN0cmluZ0NhY2hlLnNldChwYXRobmFtZSwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcblxuICAgIHJldHVybiBuZXdET007XG59O1xuXG4vKlxuY29uc3QgbmF2aWdhdGVMb2NhbGx5ID0gYXN5bmMgKHRhcmdldDogc3RyaW5nLCBwdXNoU3RhdGU6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0VVJMID0gbmV3IFVSTCh0YXJnZXQpO1xuICAgIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh0YXJnZXRVUkwucGF0aG5hbWUpO1xuXG4gICAgbGV0IG5ld1BhZ2UgPSBhd2FpdCBmZXRjaFBhZ2UodGFyZ2V0VVJMKTtcbiAgICBpZiAoIW5ld1BhZ2UpIHJldHVybjtcblxuICAgIGlmIChwYXRobmFtZSA9PT0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGNsZWFudXBQcm9jZWR1cmUgb2YgWy4uLmNsZWFudXBQcm9jZWR1cmVzXSkge1xuICAgICAgICBjb25zdCBpc0luU2NvcGUgPSBwYXRobmFtZS5zdGFydHNXaXRoKGNsZWFudXBQcm9jZWR1cmUucGFnZSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzSW5TY29wZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwUHJvY2VkdXJlKCk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xlYW51cFByb2NlZHVyZXMuc3BsaWNlKGNsZWFudXBQcm9jZWR1cmVzLmluZGV4T2YoY2xlYW51cFByb2NlZHVyZSksIDEpO1xuICAgICAgICB9XG4gICAgfSBcbiAgICBcbiAgICBsZXQgb2xkUGFnZUxhdGVzdCA9IGRvY3VtZW50LmJvZHk7XG4gICAgbGV0IG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlLmJvZHk7XG4gICAgXG4gICAge1xuICAgICAgICBjb25zdCBuZXdQYWdlTGF5b3V0cyA9IEFycmF5LmZyb20obmV3UGFnZS5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSkgYXMgSFRNTFRlbXBsYXRlRWxlbWVudFtdO1xuICAgICAgICBjb25zdCBvbGRQYWdlTGF5b3V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpIGFzIEhUTUxUZW1wbGF0ZUVsZW1lbnRbXTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihuZXdQYWdlTGF5b3V0cy5sZW5ndGgsIG9sZFBhZ2VMYXlvdXRzLmxlbmd0aCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbmV3UGFnZUxheW91dCA9IG5ld1BhZ2VMYXlvdXRzW2ldO1xuICAgICAgICAgICAgY29uc3Qgb2xkUGFnZUxheW91dCA9IG9sZFBhZ2VMYXlvdXRzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBuZXdMYXlvdXRJZCA9IG5ld1BhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpITtcbiAgICAgICAgICAgIGNvbnN0IG9sZExheW91dElkID0gb2xkUGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIikhO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobmV3TGF5b3V0SWQgIT09IG9sZExheW91dElkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2xkUGFnZUxhdGVzdCA9IG9sZFBhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nISBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZyEgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgb2xkUGFnZUxhdGVzdC5yZXBsYWNlV2l0aChuZXdQYWdlTGF0ZXN0KTtcbiAgICBcbiAgICB7ICAgXG4gICAgICAgIC8vIEdyYWNlZnVsbHkgcmVwbGFjZSBoZWFkLlxuICAgICAgICAvLyBkb2N1bWVudC5oZWFkLnJlcGxhY2VXaXRoKCk7IGNhdXNlcyBGT1VDIG9uIENocm9taXVtIGJyb3dzZXJzLlxuICAgICAgICBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKT8ucmVwbGFjZVdpdGgoXG4gICAgICAgICAgICBuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpID8/IFwiXCJcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBkYXRlID0gKHRhcmdldExpc3Q6IEhUTUxFbGVtZW50W10sIG1hdGNoQWdhaW5zdDogSFRNTEVsZW1lbnRbXSwgYWN0aW9uOiAobm9kZTogSFRNTEVsZW1lbnQpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldExpc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGluZyA9IG1hdGNoQWdhaW5zdC5maW5kKG4gPT4gbi5pc0VxdWFsTm9kZSh0YXJnZXQpKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGFjdGlvbih0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gYWRkIG5ldyB0YWdzIGFuZCByZW9tdmUgb2xkIG9uZXNcbiAgICAgICAgY29uc3Qgb2xkVGFncyA9IEFycmF5LmZyb20oW1xuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSksXG4gICAgICAgIF0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbmV3VGFncyA9IEFycmF5LmZyb20oW1xuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpLFxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZShuZXdUYWdzLCBvbGRUYWdzLCAobm9kZSkgPT4gZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChub2RlKSk7XG4gICAgICAgIHVwZGF0ZShvbGRUYWdzLCBuZXdUYWdzLCAobm9kZSkgPT4gbm9kZS5yZW1vdmUoKSk7XG4gICAgfVxuXG4gICAgaWYgKHB1c2hTdGF0ZSkgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0VVJMLmhyZWYpOyBcbiAgICBcbiAgICBhd2FpdCBsb2FkUGFnZShwYXRobmFtZSk7XG5cbiAgICBpZiAodGFyZ2V0VVJMLmhhc2gpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0VVJMLmhhc2guc2xpY2UoMSkpPy5zY3JvbGxJbnRvVmlldygpO1xuICAgIH1cbn07XG4qL1xuXG4vKiogVGFrZSBhbnkgZGlyZWN0b3J5IHBhdGhuYW1lLCBhbmQgbWFrZSBpdCBpbnRvIHRoaXMgZm9ybWF0OiAvcGF0aCAqL1xuZnVuY3Rpb24gc2FuaXRpemVQYXRobmFtZShwYXRobmFtZTogc3RyaW5nID0gXCJcIik6IHN0cmluZyB7XG4gICAgaWYgKCFwYXRobmFtZSkgcmV0dXJuIFwiL1wiO1xuXG4gICAgcGF0aG5hbWUgPSBcIi9cIiArIHBhdGhuYW1lO1xuICAgIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKy9nLCBcIi9cIik7XG5cbiAgICBpZiAocGF0aG5hbWUubGVuZ3RoID4gMSAmJiBwYXRobmFtZS5lbmRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgcGF0aG5hbWUgPSBwYXRobmFtZS5zbGljZSgwLCAtMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhuYW1lO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRQYWdlRGF0YShwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgLyoqIEZpbmQgdGhlIGNvcnJlY3Qgc2NyaXB0IHRhZyBpbiBoZWFkLiAqL1xuICAgIGNvbnN0IGRhdGFTY3JpcHRUYWcgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApIGFzIEhUTUxTY3JpcHRFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoIWRhdGFTY3JpcHRUYWcpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIChcIkZhaWxlZCB0byBmaW5kIHNjcmlwdCB0YWcgZm9yIHF1ZXJ5OlwiICsgYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBpbXBvcnQoZGF0YVNjcmlwdFRhZy5zcmMpO1xuXG4gICAgY29uc3QgeyBcbiAgICAgICAgc3ViamVjdHMsIFxuICAgICAgICBldmVudExpc3RlbmVycywgXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLCBcbiAgICAgICAgb2JzZXJ2ZXJzLCBcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zXG4gICAgfSA9IGRhdGE7XG5cbiAgICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgUG9zc2libHkgbWFsZm9ybWVkIHBhZ2UgZGF0YSAke2RhdGF9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZXJyb3JPdXQobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufSBcblxuYXN5bmMgZnVuY3Rpb24gbG9hZFBhZ2UocHJldmlvdXNQYWdlPzogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG5cbiAgICBjb25zdCBwYWdlRGF0YSA9IGF3YWl0IGdldFBhZ2VEYXRhKHBhdGhuYW1lKTtcblxuICAgIGNvbnN0IHsgXG4gICAgICAgIHN1YmplY3RzLCBcbiAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsIFxuICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgICAgIGxvYWRIb29rc1xuICAgIH0gPSBwYWdlRGF0YTtcblxuICAgIERFVl9CVUlMRDoge1xuICAgICAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgICAgICAgcGFnZURhdGEsXG4gICAgICAgICAgICBzdGF0ZU1hbmFnZXIsXG4gICAgICAgICAgICBldmVudExpc3RlbmVyTWFuYWdlcixcbiAgICAgICAgICAgIG9ic2VydmVyTWFuYWdlcixcbiAgICAgICAgICAgIGxvYWRIb29rTWFuYWdlcixcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgICAgIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnRcbiAgICB9XG5cbiAgICBzdGF0ZU1hbmFnZXIubG9hZFZhbHVlcyhzdWJqZWN0cyk7XG5cbiAgICBldmVudExpc3RlbmVyTWFuYWdlci5sb2FkVmFsdWVzKGV2ZW50TGlzdGVuZXJzKTtcbiAgICBldmVudExpc3RlbmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcblxuICAgIG9ic2VydmVyTWFuYWdlci5sb2FkVmFsdWVzKG9ic2VydmVycyk7XG4gICAgb2JzZXJ2ZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKTtcblxuICAgIGxvYWRIb29rTWFuYWdlci5sb2FkVmFsdWVzKGxvYWRIb29rcyk7XG59XG5cbmxvYWRQYWdlKCk7XG5cbmV4cG9ydCB7XG4gICAgQ2xpZW50U3ViamVjdCxcbiAgICBTdGF0ZU1hbmFnZXIsXG4gICAgT2JzZXJ2ZXJNYW5hZ2VyLFxuICAgIExvYWRIb29rTWFuYWdlcixcbiAgICBFdmVudExpc3RlbmVyTWFuYWdlcixcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFrQkEsTUFBZSx1QkFBZixNQUFvQztBQUFBLEVBVXBDO0FBK0RBLFdBQVMsWUFBWSxPQUFpQztBQUNsRCxRQUNJLFVBQVUsUUFDVixVQUFVLFdBQ1QsT0FBTyxVQUFVLFlBQVksTUFBTSxRQUFRLEtBQUssS0FBSyxpQkFBaUIsaUJBQ3pFLFFBQU87QUFFVCxXQUFPO0FBQUEsRUFDWDtBQUdBLE1BQU0sa0JBQU4sTUFFRTtBQUFBLElBY0UsWUFDSSxLQUNBLFVBQXdDLENBQUMsR0FDekMsVUFDRjtBQUNFLFdBQUssTUFBTTtBQUVYLFdBQUssV0FBVztBQUVoQixVQUFJLFlBQVksT0FBTyxHQUFHO0FBQ3RCLFlBQUksS0FBSyxnQkFBZ0IsTUFBTSxPQUFPO0FBQ2xDLGtCQUFRLE1BQU0sZ0JBQWdCLE1BQU0sZ0NBQWdDO0FBQ3BFLGdCQUFNO0FBQUEsUUFDVjtBQUVBLGFBQUssU0FBUyxRQUFRLE9BQU87QUFFN0IsYUFBSyxVQUFVLENBQUM7QUFBQSxNQUNwQixPQUFPO0FBQ0gsYUFBSyxVQUFVO0FBQUEsTUFDbkI7QUFBQSxJQUNKO0FBQUEsSUFFQSxrQkFBaUQ7QUFDN0MsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUM3QjtBQUFBLEVBQ0o7OztBQ2pJQSxNQUFNLDhCQUFrRTtBQUFBLElBQ3BFO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQ25EO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBVTtBQUFBLElBQVM7QUFBQSxFQUNoRDtBQUVBLE1BQU0sa0JBQTBDO0FBQUEsSUFDNUM7QUFBQSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFXO0FBQUEsSUFBUztBQUFBLElBQVM7QUFBQSxJQUFLO0FBQUEsSUFBTztBQUFBLElBQ2pFO0FBQUEsSUFBYztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFDN0Q7QUFBQSxJQUFZO0FBQUEsSUFBUTtBQUFBLElBQVk7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQVc7QUFBQSxJQUFPO0FBQUEsSUFDL0Q7QUFBQSxJQUFPO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBWTtBQUFBLElBQWM7QUFBQSxJQUFVO0FBQUEsSUFDN0Q7QUFBQSxJQUFRO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUM5RDtBQUFBLElBQVE7QUFBQSxJQUFLO0FBQUEsSUFBVTtBQUFBLElBQU87QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQVU7QUFBQSxJQUFNO0FBQUEsSUFDOUQ7QUFBQSxJQUFPO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBTztBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFDN0Q7QUFBQSxJQUFZO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFLO0FBQUEsSUFBVztBQUFBLElBQU87QUFBQSxJQUN2RDtBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQVE7QUFBQSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFDMUQ7QUFBQSxJQUFVO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFDN0Q7QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBWTtBQUFBLElBQVk7QUFBQSxJQUFTO0FBQUEsSUFDaEU7QUFBQSxJQUFTO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsRUFDdEQ7QUFFQSxNQUFNLDZCQUFnRTtBQUFBLElBQ2xFO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFXO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFZO0FBQUEsRUFDaEU7QUFFQSxNQUFNLGlCQUF3QztBQUFBLElBQzFDO0FBQUEsSUFBTztBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQVk7QUFBQSxJQUFRO0FB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QUFXLFNBQVMsUUFBUSxRQUFRLEdBQUc7QUFFdkMsUUFBSSxTQUFTLFNBQVMsS0FBSyxTQUFTLFNBQVMsR0FBRyxHQUFHO0FBQy9DLGlCQUFXLFNBQVMsTUFBTSxHQUFHLEVBQUU7QUFBQSxJQUNuQztBQUVBLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsWUFBWSxVQUFrQjtBQUV6QyxVQUFNLGdCQUFnQixTQUFTLEtBQUssY0FBYywyQ0FBMkMsUUFBUSxJQUFJO0FBQ3pHLFFBQUksQ0FBQyxlQUFlO0FBQ2hCLE1BQWMsK0VBQW9GLFFBQVE7QUFDMUc7QUFBQSxJQUNKO0FBRUEsVUFBTSxFQUFFLEtBQUssSUFBSSxNQUFNLE9BQU8sY0FBYztBQUU1QyxVQUFNO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKLElBQUk7QUFFSixRQUFJLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxpQkFBaUI7QUFDekYsTUFBYSxTQUFTLGdDQUFnQyxJQUFJLEVBQUU7QUFDNUQ7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLFNBQVMsU0FBaUI7QUFDL0IsVUFBTSxJQUFJLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBRUEsaUJBQWUsU0FBUyxjQUF1QjtBQUMzQyxVQUFNLFdBQVcsaUJBQWlCLE9BQU8sU0FBUyxRQUFRO0FBRTFELFVBQU0sV0FBVyxNQUFNLFlBQVksUUFBUTtBQUUzQyxVQUFNO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSixJQUFJO0FBRUosZUFBVztBQUNQLGlCQUFXLFdBQVc7QUFBQSxRQUNsQjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUVBLGVBQVcsaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxJQUNKO0FBRUEsaUJBQWEsV0FBVyxRQUFRO0FBRWhDLHlCQUFxQixXQUFXLGNBQWM7QUFDOUMseUJBQXFCLGNBQWMsb0JBQW9CO0FBRXZELG9CQUFnQixXQUFXLFNBQVM7QUFDcEMsb0JBQWdCLGNBQWMsZUFBZTtBQUU3QyxvQkFBZ0IsV0FBVyxTQUFTO0FBQUEsRUFDeEM7QUFFQSxXQUFTOyIsCiAgIm5hbWVzIjogW10KfQo=
