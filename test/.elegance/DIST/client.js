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
    /**
     * Manually trigger each of this subject's observers, with the subject's current value.
     * 
     * Useful if you're mutating for example fields of an object, or pushing to an array.
     */
    triggerObservers() {
      for (const observer of this.observers.values()) {
        observer(this._value);
      }
    }
    /**
     * Add a new observer to this subject, `callback` is called whenever the value setter is called on this subject.
     * 
     * Note: if an ID is already in use it's callback will just be overwritten with whatever you give it.
     * 
     * @param id The unique id of this observer
     * @param callback Called whenever the value of this subject changes.
     */
    observe(id, callback) {
      if (this.observers.has(id)) {
        this.observers.delete(id);
      }
      this.observers.set(id, callback);
    }
    /**
     * Remove an observer from this subject.
     * @param id The unique id of the observer.
     */
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
  var pageStringCache = /* @__PURE__ */ new Map();
  var domParser = new DOMParser();
  var xmlSerializer = new XMLSerializer();
  var fetchPage = async (targetURL) => {
    const pathname = sanitizePathname(targetURL.pathname);
    if (pageStringCache.has(pathname)) {
      return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
    }
    const res = await fetch(targetURL);
    const newDOM = domParser.parseFromString(await res.text(), "text/html");
    {
      const dataScripts = Array.from(newDOM.querySelectorAll('script[data-module="true"]'));
      const currentScripts = Array.from(document.head.querySelectorAll('script[data-module="true"]'));
      for (const dataScript of dataScripts) {
        const existing = currentScripts.find((s) => s.src === dataScript.src);
        if (existing) {
          continue;
        }
        document.head.appendChild(dataScript);
      }
    }
    {
      const pageDataScript = newDOM.querySelector('script[data-page="true"]');
      if (!pageDataScript) {
        return;
      }
      await import(pageDataScript.src);
    }
    {
      const layoutDataScripts = Array.from(newDOM.querySelectorAll('script[data-layout="true"]'));
      for (const script of layoutDataScripts) {
        await import(script.src);
      }
    }
    pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));
    return newDOM;
  };
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
      createHTMLElementFromElement,
      fetchPage
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnQudHMiLCAiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnRfbGlzdC50cyIsICIuLi8uLi8uLi9zcmMvY2xpZW50L3J1bnRpbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBBbnkgdmFsaWQgZWxlbWVudCB0aGF0IGhhcyBub3QgYmVlbiBjb25zdHJ1Y3RlZCB2aWEgdGhlIHVzZSBvZiBhbiBlbGVtZW50IGNvbnN0cnVjdG9yIHN1Y2ggYXMgaDEoKSAqL1xudHlwZSBFbGVtZW50TGl0ZXJhbCA9IGJvb2xlYW4gfCBcbiAgICBudW1iZXIgfCBcbiAgICBzdHJpbmcgfCBcbiAgICBBcnJheTxhbnk+O1xuXG50eXBlIEFueUVsZW1lbnQgPSBFbGVnYW5jZUVsZW1lbnQ8YW55PiB8IEVsZW1lbnRMaXRlcmFsO1xuXG50eXBlIEVsZW1lbnRDaGlsZHJlbiA9IEFueUVsZW1lbnRbXTtcblxuLyoqIEVsZW1lbnQgb3B0aW9ucyBvZiB0aGlzIHR5cGUgd2lsbCBiZSBtYWRlIGludG8gZmllbGQ9XCJ2YWx1ZS50b1N0cmluZygpXCIgKi9cbnR5cGUgRWxlbWVudE9wdGlvbkxpdGVyYWwgPSBudW1iZXIgfCBzdHJpbmcgfCBSZWNvcmQ8YW55LCBhbnk+O1xuXG50eXBlIFByb2Nlc3NTcGVjaWFsRWxlbWVudE9wdGlvbiA9IChlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKiogXG4gKiBBbiBvcHRpb24gdGhhdCBzaG91bGQgYmUgdHJlYXRlZCBkaWZmZXJlbnRseSBieSB0aGUgY29tcGlsZXIuXG4gKi9cbmFic3RyYWN0IGNsYXNzIFNwZWNpYWxFbGVtZW50T3B0aW9uIHtcbiAgICAvKipcbiAgICAgKiBNdXRhdGUgdGhpcyBvcHRpb24gaW4gdGhlIGVsZW1lbnQgdG8gaXQncyBzZXJpYWxpemVhYmxlIHN0YXRlLlxuICAgICAqL1xuICAgIGFic3RyYWN0IG11dGF0ZShlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nKTogdm9pZFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCB0aGlzIHNwZWNpYWwgZWxlbWVudCBvcHRpb24gaW50byBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBhYnN0cmFjdCBzZXJpYWxpemUob3B0aW9uTmFtZTogc3RyaW5nLCBlbGVtZW50S2V5OiBzdHJpbmcpOiBzdHJpbmdcbn0gXG5cbnR5cGUgRWxlbWVudE9wdGlvbnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgfCBTcGVjaWFsRWxlbWVudE9wdGlvbj4gfCBFbGVtZW50T3B0aW9uTGl0ZXJhbDtcblxuLyoqIFxuICogUHVyZWx5IGZvciBzeW50YXggcmVhc29ucywgeW91IGNhbiB1c2UgYW4gZWxlbWVudCBhcyB0aGUgb3B0aW9ucyBwYXJhbWV0ZXJcbiAqIHdoZW4gY3JlYXRpbmcgYW4gZWxlbWVudCB1c2luZyBhbiBlbGVtZW50IGJ1aWxkZXIuXG4gKiBUaGlzIGlzIHRoZW4gcHJlcGVuZGVkIGludG8gdGhlIGNoaWxkcmVuIGJ5IHRoZSBlbGVtZW50IGJ1aWxkZXIuXG4gKi9cbnR5cGUgRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCA9IEVsZW1lbnRPcHRpb25zIHwgQW55RWxlbWVudDtcblxudHlwZSBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPVxuICB8IFwiYXJlYVwiIHwgXCJiYXNlXCIgfCBcImJyXCIgfCBcImNvbFwiIHwgXCJlbWJlZFwiIHwgXCJoclwiIHwgXCJpbWdcIiB8IFwiaW5wdXRcIlxuICB8IFwibGlua1wiIHwgXCJtZXRhXCIgfCBcInBhcmFtXCIgfCBcInNvdXJjZVwiIHwgXCJ0cmFja1wiIHwgXCJ3YnJcIjtcblxudHlwZSBIdG1sRWxlbWVudFRhZ3MgPVxuICB8IFwiYVwiIHwgXCJhYmJyXCIgfCBcImFkZHJlc3NcIiB8IFwiYXJ0aWNsZVwiIHwgXCJhc2lkZVwiIHwgXCJhdWRpb1wiIHwgXCJiXCIgfCBcImJkaVwiIHwgXCJiZG9cIlxuICB8IFwiYmxvY2txdW90ZVwiIHwgXCJib2R5XCIgfCBcImJ1dHRvblwiIHwgXCJjYW52YXNcIiB8IFwiY2FwdGlvblwiIHwgXCJjaXRlXCIgfCBcImNvZGVcIiB8IFwiY29sZ3JvdXBcIlxuICB8IFwiZGF0YVwiIHwgXCJkYXRhbGlzdFwiIHwgXCJkZFwiIHwgXCJkZWxcIiB8IFwiZGV0YWlsc1wiIHwgXCJkZm5cIiB8IFwiZGlhbG9nXCIgfCBcImRpdlwiIHwgXCJkbFwiIHwgXCJkdFwiXG4gIHwgXCJlbVwiIHwgXCJmaWVsZHNldFwiIHwgXCJmaWdjYXB0aW9uXCIgfCBcImZpZ3VyZVwiIHwgXCJmb290ZXJcIiB8IFwiZm9ybVwiIHwgXCJoMVwiIHwgXCJoMlwiIHwgXCJoM1wiXG4gIHwgXCJoNFwiIHwgXCJoNVwiIHwgXCJoNlwiIHwgXCJoZWFkXCIgfCBcImhlYWRlclwiIHwgXCJoZ3JvdXBcIiB8IFwiaHRtbFwiIHwgXCJpXCIgfCBcImlmcmFtZVwiIHwgXCJpbnNcIlxuICB8IFwia2JkXCIgfCBcImxhYmVsXCIgfCBcImxlZ2VuZFwiIHwgXCJsaVwiIHwgXCJtYWluXCIgfCBcIm1hcFwiIHwgXCJtYXJrXCIgfCBcIm1lbnVcIiB8IFwibWV0ZXJcIiB8IFwibmF2XCJcbiAgfCBcIm5vc2NyaXB0XCIgfCBcIm9iamVjdFwiIHwgXCJvbFwiIHwgXCJvcHRncm91cFwiIHwgXCJvcHRpb25cIiB8IFwib3V0cHV0XCIgfCBcInBcIiB8IFwicGljdHVyZVwiXG4gIHwgXCJwcmVcIiB8IFwicHJvZ3Jlc3NcIiB8IFwicVwiIHwgXCJycFwiIHwgXCJydFwiIHwgXCJydWJ5XCIgfCBcInNcIiB8IFwic2FtcFwiIHwgXCJzY3JpcHRcIiB8IFwic2VhcmNoXCJcbiAgfCBcInNlY3Rpb25cIiB8IFwic2VsZWN0XCIgfCBcInNsb3RcIiB8IFwic21hbGxcIiB8IFwic3BhblwiIHwgXCJzdHJvbmdcIiB8IFwic3R5bGVcIiB8IFwic3ViXCIgfCBcInN1bW1hcnlcIlxuICB8IFwic3VwXCIgfCBcInRhYmxlXCIgfCBcInRib2R5XCIgfCBcInRkXCIgfCBcInRlbXBsYXRlXCIgfCBcInRleHRhcmVhXCIgfCBcInRmb290XCIgfCBcInRoXCIgfCBcInRoZWFkXCJcbiAgfCBcInRpbWVcIiB8IFwidGl0bGVcIiB8IFwidHJcIiB8IFwidVwiIHwgXCJ1bFwiIHwgXCJ2YXJcIiB8IFwidmlkZW9cIjtcblxudHlwZSBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9XG4gIHwgXCJwYXRoXCIgfCBcImNpcmNsZVwiIHwgXCJlbGxpcHNlXCIgfCBcImxpbmVcIiB8IFwicG9seWdvblwiIHwgXCJwb2x5bGluZVwiIHwgXCJzdG9wXCI7XG5cbnR5cGUgU3ZnRWxlbWVudFRhZ3MgPVxuICB8IFwic3ZnXCIgfCBcImdcIiB8IFwidGV4dFwiIHwgXCJ0c3BhblwiIHwgXCJ0ZXh0UGF0aFwiIHwgXCJkZWZzXCIgfCBcInN5bWJvbFwiIHwgXCJ1c2VcIlxuICB8IFwiaW1hZ2VcIiB8IFwiY2xpcFBhdGhcIiB8IFwibWFza1wiIHwgXCJwYXR0ZXJuXCIgfCBcImxpbmVhckdyYWRpZW50XCIgfCBcInJhZGlhbEdyYWRpZW50XCJcbiAgfCBcImZpbHRlclwiIHwgXCJtYXJrZXJcIiB8IFwidmlld1wiXG4gIHwgXCJmZUJsZW5kXCIgfCBcImZlQ29sb3JNYXRyaXhcIiB8IFwiZmVDb21wb25lbnRUcmFuc2ZlclwiIHwgXCJmZUNvbXBvc2l0ZVwiXG4gIHwgXCJmZUNvbnZvbHZlTWF0cml4XCIgfCBcImZlRGlmZnVzZUxpZ2h0aW5nXCIgfCBcImZlRGlzcGxhY2VtZW50TWFwXCIgfCBcImZlRGlzdGFudExpZ2h0XCJcbiAgfCBcImZlRmxvb2RcIiB8IFwiZmVGdW5jQVwiIHwgXCJmZUZ1bmNCXCIgfCBcImZlRnVuY0dcIiB8IFwiZmVGdW5jUlwiIHwgXCJmZUdhdXNzaWFuQmx1clwiXG4gIHwgXCJmZUltYWdlXCIgfCBcImZlTWVyZ2VcIiB8IFwiZmVNZXJnZU5vZGVcIiB8IFwiZmVNb3JwaG9sb2d5XCIgfCBcImZlT2Zmc2V0XCIgfCBcImZlUG9pbnRMaWdodFwiXG4gIHwgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIiB8IFwiZmVTcG90TGlnaHRcIiB8IFwiZmVUaWxlXCIgfCBcImZlVHVyYnVsZW5jZVwiO1xuXG50eXBlIE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID1cbiAgfCBcIm1pXCIgfCBcIm1uXCIgfCBcIm1vXCI7XG5cbnR5cGUgTWF0aE1MRWxlbWVudFRhZ3MgPVxuICB8IFwibWF0aFwiIHwgXCJtc1wiIHwgXCJtdGV4dFwiIHwgXCJtcm93XCIgfCBcIm1mZW5jZWRcIiB8IFwibXN1cFwiIHwgXCJtc3ViXCIgfCBcIm1zdWJzdXBcIlxuICB8IFwibWZyYWNcIiB8IFwibXNxcnRcIiB8IFwibXJvb3RcIiB8IFwibXRhYmxlXCIgfCBcIm10clwiIHwgXCJtdGRcIiB8IFwibXN0eWxlXCJcbiAgfCBcIm1lbmNsb3NlXCIgfCBcIm1tdWx0aXNjcmlwdHNcIjtcblxudHlwZSBBbGxFbGVtZW50VGFncyA9XG4gIHwgSHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gIHwgSHRtbEVsZW1lbnRUYWdzXG4gIHwgU3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3NcbiAgfCBTdmdFbGVtZW50VGFnc1xuICB8IE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gIHwgTWF0aE1MRWxlbWVudFRhZ3M7XG5cbnR5cGUgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWcgZXh0ZW5kcyBBbGxFbGVtZW50VGFncz4gPVxuICBUYWcgZXh0ZW5kcyBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgfCBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyB8IE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gICAgPyAob3B0aW9ucz86IEVsZW1lbnRPcHRpb25zKSA9PiBFbGVnYW5jZUVsZW1lbnQ8ZmFsc2U+XG4gICAgOiAob3B0aW9ucz86IEVsZW1lbnRPcHRpb25zLCAuLi5jaGlsZHJlbjogRWxlbWVudENoaWxkcmVuKSA9PiBFbGVnYW5jZUVsZW1lbnQ8dHJ1ZT47XG5cbi8qKiBDaGVjayBpZiBhbnkgZ2l2ZW4gdmFsdWUgY2FuIGJlIGNsYXNzaWZpZWQgYXMgYW4gZWxlbWVudC4gKi9cbmZ1bmN0aW9uIGlzQW5FbGVtZW50KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBBbnlFbGVtZW50IHtcbiAgICBpZiAoXG4gICAgICAgIHZhbHVlICE9PSBudWxsICYmXG4gICAgICAgIHZhbHVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudClcbiAgICApIHJldHVybiB0cnVlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogUmVwcmVzZW50cyBhbiBlbGVtZW50IHRoYXQgaGFzIGJlZW4gY29uc3RydWN0ZWQgdmlhIHRoZSB1c2Ugb2YgYW4gZWxlbWVudCBjb25zdHJ1Y3RvciBzdWNoIGFzIGgxKCkgKi9cbmNsYXNzIEVsZWdhbmNlRWxlbWVudDxcbiAgICBDYW5IYXZlQ2hpbGRyZW4gZXh0ZW5kcyBib29sZWFuLFxuPiB7XG4gICAgcmVhZG9ubHkgdGFnOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA7XG4gICAgcmVhZG9ubHkgb3B0aW9uczogRWxlbWVudE9wdGlvbnM7XG5cbiAgICAvKiogXG4gICAgICogVGhlIHVuaXF1ZSBrZXkgb2YgdGhpcyBlbGVtZW50LiBcbiAgICAgKiBVc2UgZ2V0RWxlbWVudEtleSgpIGluIGZyb20gdGhlIGNvbXBpbGVyIHRvIHJldHJpZXZlIHRoaXMgdmFsdWVcbiAgICAgKi9cbiAgICBrZXk/OiBzdHJpbmc7XG5cbiAgICBjaGlsZHJlbjogQ2FuSGF2ZUNoaWxkcmVuIGV4dGVuZHMgdHJ1ZVxuICAgICAgICA/IEVsZW1lbnRDaGlsZHJlblxuICAgICAgICA6IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgdGFnOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsXG4gICAgICAgIG9wdGlvbnM6IEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQgPSB7fSxcbiAgICAgICAgY2hpbGRyZW46IEVsZW1lbnRDaGlsZHJlbiB8IG51bGwsXG4gICAgKSB7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiBhcyBDYW5IYXZlQ2hpbGRyZW4gZXh0ZW5kcyB0cnVlID8gRWxlbWVudENoaWxkcmVuIDogbnVsbDtcblxuICAgICAgICBpZiAoaXNBbkVsZW1lbnQob3B0aW9ucykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbkhhdmVDaGlsZHJlbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGUgZWxlbWVudDpcIiwgdGhpcywgXCJpcyBhbiBpbnZhbGlkIGVsZW1lbnQuIFJlYXNvbjpcIilcbiAgICAgICAgICAgICAgICB0aHJvdyBcIlRoZSBvcHRpb25zIG9mIGFuIGVsZW1lbnQgbWF5IG5vdCBiZSBhbiBlbGVtZW50LCBpZiB0aGUgZWxlbWVudCBjYW5ub3QgaGF2ZSBjaGlsZHJlbi5cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi51bnNoaWZ0KG9wdGlvbnMpXG5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyBhcyBFbGVtZW50T3B0aW9ucztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbkhhdmVDaGlsZHJlbigpOiB0aGlzIGlzIEVsZWdhbmNlRWxlbWVudDx0cnVlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuICE9PSBudWxsO1xuICAgIH1cbn1cblxuXG5leHBvcnQge1xuICAgIEVsZWdhbmNlRWxlbWVudCxcblxuICAgIFNwZWNpYWxFbGVtZW50T3B0aW9uLFxuXG4gICAgaXNBbkVsZW1lbnQsXG59XG5cbmV4cG9ydCB0eXBlIHtcbiAgICBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyLFxuICAgIFxuICAgIEFueUVsZW1lbnQsXG4gICAgRWxlbWVudENoaWxkcmVuLFxuICAgIFxuICAgIEFsbEVsZW1lbnRUYWdzLFxuICAgIEh0bWxFbGVtZW50VGFncyxcbiAgICBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG4gICAgU3ZnRWxlbWVudFRhZ3MsXG4gICAgU3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG4gICAgTWF0aE1MRWxlbWVudFRhZ3MsXG4gICAgTWF0aE1MQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG5cbiAgICBFbGVtZW50T3B0aW9ucyxcbiAgICBQcm9jZXNzU3BlY2lhbEVsZW1lbnRPcHRpb24sXG4gICAgRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCxcbn0iLCAiaW1wb3J0IHtcbiAgICBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG4gICAgSHRtbEVsZW1lbnRUYWdzLFxuICAgIFN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuICAgIFN2Z0VsZW1lbnRUYWdzLFxuICAgIE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzLFxuICAgIE1hdGhNTEVsZW1lbnRUYWdzLFxuICAgIEVsZWdhbmNlRWxlbWVudCxcbiAgICBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyLFxuICAgIEVsZW1lbnRDaGlsZHJlbixcbiAgICBFbGVtZW50T3B0aW9ucyxcbiAgICBBbGxFbGVtZW50VGFncyxcbiAgICBFbGVtZW50T3B0aW9uc09yQ2hpbGRFbGVtZW50LFxufSBmcm9tIFwiLi9lbGVtZW50XCI7XG5cbmNvbnN0IGh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFnczogQXJyYXk8SHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzPiA9IFtcbiAgICBcImFyZWFcIiwgXCJiYXNlXCIsIFwiYnJcIiwgXCJjb2xcIiwgXCJlbWJlZFwiLCBcImhyXCIsIFwiaW1nXCIsIFwiaW5wdXRcIixcbiAgICBcImxpbmtcIiwgXCJtZXRhXCIsIFwicGFyYW1cIiwgXCJzb3VyY2VcIiwgXCJ0cmFja1wiLCBcIndiclwiLFxuXTtcblxuY29uc3QgaHRtbEVsZW1lbnRUYWdzOiBBcnJheTxIdG1sRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJ0aWNsZVwiLCBcImFzaWRlXCIsIFwiYXVkaW9cIiwgXCJiXCIsIFwiYmRpXCIsIFwiYmRvXCIsXG4gICAgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJ1dHRvblwiLCBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLFxuICAgIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIixcbiAgICBcImRpdlwiLCBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLFxuICAgIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIiwgXCJoZWFkZXJcIiwgXCJoZ3JvdXBcIixcbiAgICBcImh0bWxcIiwgXCJpXCIsIFwiaWZyYW1lXCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcIm1haW5cIixcbiAgICBcIm1hcFwiLCBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsXG4gICAgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsIFwicHJvZ3Jlc3NcIixcbiAgICBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLFxuICAgIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic3BhblwiLCBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLFxuICAgIFwic3VwXCIsIFwidGFibGVcIiwgXCJ0Ym9keVwiLCBcInRkXCIsIFwidGVtcGxhdGVcIiwgXCJ0ZXh0YXJlYVwiLCBcInRmb290XCIsIFwidGhcIixcbiAgICBcInRoZWFkXCIsIFwidGltZVwiLCBcInRpdGxlXCIsIFwidHJcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJcIiwgXCJ2aWRlb1wiLFxuXTtcblxuY29uc3Qgc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M6IEFycmF5PFN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzPiA9IFtcbiAgICBcInBhdGhcIiwgXCJjaXJjbGVcIiwgXCJlbGxpcHNlXCIsIFwibGluZVwiLCBcInBvbHlnb25cIiwgXCJwb2x5bGluZVwiLCBcInN0b3BcIixcbl07XG5cbmNvbnN0IHN2Z0VsZW1lbnRUYWdzOiBBcnJheTxTdmdFbGVtZW50VGFncz4gPSBbXG4gICAgXCJzdmdcIiwgXCJnXCIsIFwidGV4dFwiLCBcInRzcGFuXCIsIFwidGV4dFBhdGhcIiwgXCJkZWZzXCIsIFwic3ltYm9sXCIsIFwidXNlXCIsXG4gICAgXCJpbWFnZVwiLCBcImNsaXBQYXRoXCIsIFwibWFza1wiLCBcInBhdHRlcm5cIiwgXCJsaW5lYXJHcmFkaWVudFwiLCBcInJhZGlhbEdyYWRpZW50XCIsXG4gICAgXCJmaWx0ZXJcIiwgXCJtYXJrZXJcIiwgXCJ2aWV3XCIsXG4gICAgXCJmZUJsZW5kXCIsIFwiZmVDb2xvck1hdHJpeFwiLCBcImZlQ29tcG9uZW50VHJhbnNmZXJcIiwgXCJmZUNvbXBvc2l0ZVwiLFxuICAgIFwiZmVDb252b2x2ZU1hdHJpeFwiLCBcImZlRGlmZnVzZUxpZ2h0aW5nXCIsIFwiZmVEaXNwbGFjZW1lbnRNYXBcIiwgXCJmZURpc3RhbnRMaWdodFwiLFxuICAgIFwiZmVGbG9vZFwiLCBcImZlRnVuY0FcIiwgXCJmZUZ1bmNCXCIsIFwiZmVGdW5jR1wiLCBcImZlRnVuY1JcIiwgXCJmZUdhdXNzaWFuQmx1clwiLFxuICAgIFwiZmVJbWFnZVwiLCBcImZlTWVyZ2VcIiwgXCJmZU1lcmdlTm9kZVwiLCBcImZlTW9ycGhvbG9neVwiLCBcImZlT2Zmc2V0XCIsXG4gICAgXCJmZVBvaW50TGlnaHRcIiwgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIiwgXCJmZVNwb3RMaWdodFwiLCBcImZlVGlsZVwiLCBcImZlVHVyYnVsZW5jZVwiLFxuXTtcblxuY29uc3QgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M6IEFycmF5PE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzPiA9IFtcbiAgICBcIm1pXCIsIFwibW5cIiwgXCJtb1wiLFxuXTtcblxuY29uc3QgbWF0aG1sRWxlbWVudFRhZ3M6IEFycmF5PE1hdGhNTEVsZW1lbnRUYWdzPiA9IFtcbiAgICBcIm1hdGhcIiwgXCJtc1wiLCBcIm10ZXh0XCIsIFwibXJvd1wiLCBcIm1mZW5jZWRcIiwgXCJtc3VwXCIsIFwibXN1YlwiLCBcIm1zdWJzdXBcIixcbiAgICBcIm1mcmFjXCIsIFwibXNxcnRcIiwgXCJtcm9vdFwiLCBcIm10YWJsZVwiLCBcIm10clwiLCBcIm10ZFwiLCBcIm1zdHlsZVwiLFxuICAgIFwibWVuY2xvc2VcIiwgXCJtbXVsdGlzY3JpcHRzXCIsXG5dO1xuXG5jb25zdCBlbGVtZW50czogUmVjb3JkPHN0cmluZywgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxhbnk+PiA9IHt9O1xuY29uc3QgY2hpbGRyZW5sZXNzRWxlbWVudHM6IFJlY29yZDxzdHJpbmcsIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8YW55Pj4gPSB7fTtcblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEJ1aWxkZXI8VGFnIGV4dGVuZHMgQWxsRWxlbWVudFRhZ3M+KFxuICAgIHRhZzogVGFnXG4pOiBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPFRhZz4ge1xuICAgIHJldHVybiAoKG9wdGlvbnM6IEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQsIC4uLmNoaWxkcmVuOiBFbGVtZW50Q2hpbGRyZW4pID0+IFxuICAgICAgICBuZXcgRWxlZ2FuY2VFbGVtZW50KHRhZyBhcyBhbnksIG9wdGlvbnMsIGNoaWxkcmVuKSkgYXMgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWc+O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcjxUYWcgZXh0ZW5kcyBBbGxFbGVtZW50VGFncz4oXG4gICAgdGFnOiBUYWdcbik6IEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8VGFnPiB7XG4gICAgcmV0dXJuICgob3B0aW9uczogRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCkgPT5cbiAgICAgICAgbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcgYXMgYW55LCBvcHRpb25zLCBudWxsKSkgYXMgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWc+O1xufVxuXG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuXG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHNbdGFnXSA9IGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyKHRhZyk7XG5cbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuXG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncylcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcblxuY29uc3QgYWxsRWxlbWVudHMgPSB7XG4gICAgLi4uZWxlbWVudHMsXG4gICAgLi4uY2hpbGRyZW5sZXNzRWxlbWVudHMsXG59O1xuXG5leHBvcnQge1xuICAgIGVsZW1lbnRzLFxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzLFxuICAgIGFsbEVsZW1lbnRzLFxufTtcbiIsICJcbmltcG9ydCB0eXBlIHsgRXZlbnRMaXN0ZW5lciwgRXZlbnRMaXN0ZW5lckNhbGxiYWNrLCBFdmVudExpc3RlbmVyT3B0aW9uIH0gZnJvbSBcIi4vZXZlbnRMaXN0ZW5lclwiO1xuaW1wb3J0IHR5cGUgeyBMb2FkSG9va0NsZWFudXBGdW5jdGlvbiwgTG9hZEhvb2sgfSBmcm9tIFwiLi9sb2FkSG9va1wiO1xuaW1wb3J0IHR5cGUgeyBPYnNlcnZlckNhbGxiYWNrLCBTZXJ2ZXJPYnNlcnZlciB9IGZyb20gXCIuL29ic2VydmVyXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZlclN1YmplY3QgfSBmcm9tIFwiLi9zdGF0ZVwiO1xuXG5pbXBvcnQgeyBhbGxFbGVtZW50cyB9IGZyb20gXCIuLi9lbGVtZW50cy9lbGVtZW50X2xpc3RcIjtcbmltcG9ydCB0eXBlIHsgQW55RWxlbWVudCwgfSBmcm9tIFwiLi4vZWxlbWVudHMvZWxlbWVudFwiO1xuaW1wb3J0IHsgU3BlY2lhbEVsZW1lbnRPcHRpb24sIEVsZWdhbmNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9lbGVtZW50XCI7XG5cbk9iamVjdC5hc3NpZ24od2luZG93LCBhbGxFbGVtZW50cyk7XG5cbi8vIHRoZXNlIGFyZSBib3RoIGRlZmluZWQgaW4gdGhlIGJ1aWxkIG9mIHRoaXMgaW4gdGhlIGVzYnVpbGQgYnVpbGQgY2FsbFxuZGVjbGFyZSBsZXQgREVWX0JVSUxEOiBib29sZWFuO1xuZGVjbGFyZSBsZXQgUFJPRF9CVUlMRDogYm9vbGVhbjtcblxuaW50ZXJmYWNlIFNlcmlhbGl6YXRpb25SZXN1bHQge1xuICByb290OiBOb2RlO1xuICBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IHsgZWxlbWVudEtleTogc3RyaW5nLCBvcHRpb25OYW1lOiBzdHJpbmcsIG9wdGlvblZhbHVlOiBTcGVjaWFsRWxlbWVudE9wdGlvbiB9W107XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChcbiAgICBlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Pixcbik6IFNlcmlhbGl6YXRpb25SZXN1bHQge1xuICAgIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IHsgZWxlbWVudEtleTogc3RyaW5nLCBvcHRpb25OYW1lOiBzdHJpbmcsIG9wdGlvblZhbHVlOiBTcGVjaWFsRWxlbWVudE9wdGlvbiB9W10gPSBbXTtcbiAgICBjb25zdCBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50LnRhZyk7XG5cbiAgICAvLyBQcm9jZXNzIG9wdGlvbnMuXG4gICAge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZWxlbWVudC5vcHRpb25zKTtcbiAgICAgICAgZm9yIChjb25zdCBbb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25WYWx1ZSBpbnN0YW5jZW9mIFNwZWNpYWxFbGVtZW50T3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUubXV0YXRlKGVsZW1lbnQsIG9wdGlvbk5hbWUpO1xuICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gKE1hdGgucmFuZG9tKCkgKiAxMDAwMCkudG9TdHJpbmcoKTtcbiAgICAgXG4gICAgICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goeyBlbGVtZW50S2V5LCBvcHRpb25OYW1lLCBvcHRpb25WYWx1ZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUob3B0aW9uTmFtZSwgYCR7b3B0aW9uVmFsdWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5rZXkpIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgY2hpbGRyZW4uXG4gICAge1xuICAgICAgICBpZiAoZWxlbWVudC5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChjaGlsZCk7XG4gICAgIFxuICAgICAgICAgICAgICAgIGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KFxuICAgIGVsZW1lbnQ6IEFueUVsZW1lbnQsXG4pOiBTZXJpYWxpemF0aW9uUmVzdWx0IHtcbiAgICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiB7IGVsZW1lbnRLZXk6IHN0cmluZywgb3B0aW9uTmFtZTogc3RyaW5nLCBvcHRpb25WYWx1ZTogU3BlY2lhbEVsZW1lbnRPcHRpb24gfVtdID0gW107XG5cbiAgICBpZiAoZWxlbWVudCA9PT0gdW5kZWZpbmVkIHx8IGVsZW1lbnQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgYW5kIG51bGwgYXJlIG5vdCBhbGxvd2VkIGFzIGVsZW1lbnRzLmApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZW9mIGVsZW1lbnQpIHtcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KHN1YkVsZW1lbnQpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyByb290OiBmcmFnbWVudCwgc3BlY2lhbEVsZW1lbnRPcHRpb25zIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVnYW5jZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRoaXMgZWxlbWVudCBpcyBhbiBhcmJpdHJhcnkgb2JqZWN0LCBhbmQgYXJiaXRyYXJ5IG9iamVjdHMgYXJlIG5vdCB2YWxpZCBjaGlsZHJlbi4gUGxlYXNlIG1ha2Ugc3VyZSBhbGwgZWxlbWVudHMgYXJlIG9uZSBvZjogRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS5gKTtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgIGNvbnN0IHRleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiA/IGVsZW1lbnQgOiBlbGVtZW50LnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gIFxuICAgICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHR5cGVvZiBvZiB0aGlzIGVsZW1lbnQgaXMgbm90IG9uZSBvZiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBQbGVhc2UgY29udmVydCBpdCBpbnRvIG9uZSBvZiB0aGVzZSB0eXBlcy5gKTtcbiAgICB9XG59XG5cbnR5cGUgQ2xpZW50U3ViamVjdE9ic2VydmVyPFQ+ID0gKG5ld1ZhbHVlOiBUKSA9PiB2b2lkO1xuXG5ERVZfQlVJTEQgJiYgKCgpID0+IHtcbiAgICBsZXQgaXNFcnJvcmVkID0gZmFsc2U7XG5cbiAgICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICAgICAgY29uc3QgZXMgPSBuZXcgRXZlbnRTb3VyY2UoXCJodHRwOi8vbG9jYWxob3N0OjQwMDAvZWxlZ2FuY2UtaG90LXJlbG9hZFwiKTtcblxuICAgICAgICBlcy5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGVzLm9ubWVzc2FnZSA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJob3QtcmVsb2FkXCIpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICBlcy5jbG9zZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDIwMDApO1xuICAgICAgICB9O1xuICAgIH0pKCk7XG59KSgpO1xuXG4vKipcbiAqIEEgU2VydmVyU3ViamVjdCB0aGF0IGhhcyBiZWVuIHNlcmlhbGl6ZWQsIHNoaXBwZWQgdG8gdGhlIGJyb3dzZXIsIGFuZCByZS1jcmVhdGVkIGFzIGl0J3MgZmluYWwgZm9ybS5cbiAqIFxuICogU2V0dGluZyB0aGUgYHZhbHVlYCBvZiB0aGlzIENsaWVudFN1YmplY3Qgd2lsbCB0cmlnZ2VyIGl0J3Mgb2JzZXJ2ZXJzIGNhbGxiYWNrcy5cbiAqIFxuICogVG8gbGlzdGVuIGZvciBjaGFuZ2VzIGluIGB2YWx1ZWAsIHlvdSBtYXkgY2FsbCB0aGUgYG9ic2VydmUoKWAgbWV0aG9kLlxuICovXG5jbGFzcyBDbGllbnRTdWJqZWN0PFQ+IHtcbiAgICByZWFkb25seSBpZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX3ZhbHVlOiBUO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBvYnNlcnZlcnM6IE1hcDxzdHJpbmcsIENsaWVudFN1YmplY3RPYnNlcnZlcjxUPj4gPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB2YWx1ZTogVCkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHZhbHVlKCk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKG5ld1ZhbHVlOiBUKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG5cbiAgICAgICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAgICogXG4gICAgICogVXNlZnVsIGlmIHlvdSdyZSBtdXRhdGluZyBmb3IgZXhhbXBsZSBmaWVsZHMgb2YgYW4gb2JqZWN0LCBvciBwdXNoaW5nIHRvIGFuIGFycmF5LlxuICAgICAqL1xuICAgIHRyaWdnZXJPYnNlcnZlcnMoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIG9ic2VydmVyKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICAgKiBcbiAgICAgKiBOb3RlOiBpZiBhbiBJRCBpcyBhbHJlYWR5IGluIHVzZSBpdCdzIGNhbGxiYWNrIHdpbGwganVzdCBiZSBvdmVyd3JpdHRlbiB3aXRoIHdoYXRldmVyIHlvdSBnaXZlIGl0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCBUaGUgdW5pcXVlIGlkIG9mIHRoaXMgb2JzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBvZiB0aGlzIHN1YmplY3QgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBvYnNlcnZlKGlkOiBzdHJpbmcsIGNhbGxiYWNrOiAobmV3VmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmRlbGV0ZShpZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9ic2VydmVycy5zZXQoaWQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gb2JzZXJ2ZXIgZnJvbSB0aGlzIHN1YmplY3QuXG4gICAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgICAqL1xuICAgIHVub2JzZXJ2ZShpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzLmRlbGV0ZShpZCk7XG4gICAgfVxufVxuXG5jbGFzcyBTdGF0ZU1hbmFnZXIge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3ViamVjdHM6IE1hcDxzdHJpbmcsIENsaWVudFN1YmplY3Q8YW55Pj4gPSBuZXcgTWFwKClcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXModmFsdWVzOiBTZXJ2ZXJTdWJqZWN0PGFueT5bXSwgZG9PdmVyd3JpdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRTdWJqZWN0ID0gbmV3IENsaWVudFN1YmplY3QodmFsdWUuaWQsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdHMuc2V0KHZhbHVlLmlkLCBjbGllbnRTdWJqZWN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldChpZDogc3RyaW5nKTogQ2xpZW50U3ViamVjdDxhbnk+IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViamVjdHMuZ2V0KGlkKVxuICAgIH1cblxuICAgIGdldEFsbChpZHM6IHN0cmluZ1tdKTogQXJyYXk8Q2xpZW50U3ViamVjdDxhbnk+PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PENsaWVudFN1YmplY3Q8YW55Pj4gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG59XG5cblxudHlwZSBDbGllbnRFdmVudExpc3RlbmVyT3B0aW9uID0ge1xuICAgIC8qKiBUaGUgaHRtbCBhdHRyaWJ1dGUgbmFtZSB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8gKi9cbiAgICBvcHRpb246IHN0cmluZyxcbiAgICAvKiogVGhlIGtleSBvZiB0aGUgZWxlbWVudCB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8uICovXG4gICAga2V5OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBldmVudCBsaXN0ZW5lciBpZCB0aGlzIG9wdGlvbiBpcyByZWZlcmVuY2luZy4gKi8gXG4gICAgaWQ6IHN0cmluZyxcbn1cblxuLyoqXG4gKiBBbiBldmVudCBsaXN0ZW5lciBhZnRlciBpdCBoYXMgYmVlbiBnZW5lcmF0ZWQgb24gdGhlIHNlcnZlciwgcHJvY2Vzc2VkIGludG8gcGFnZWRhdGEsIGFuZCByZWNvbnN0cnVjdGVkIG9uIHRoZSBjbGllbnQuXG4gKi9cbmNsYXNzIENsaWVudEV2ZW50TGlzdGVuZXIge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJDYWxsYmFjazxhbnk+O1xuICAgIGRlcGVuZGVuY2llczogc3RyaW5nW107XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lckNhbGxiYWNrPGFueT4sIGRlcGVuY2VuY2llczogc3RyaW5nW10pIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgIH1cblxuICAgIGNhbGwoZXY6IEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrKGV2IGFzIGFueSwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgICB9XG59XG5cbmNsYXNzIEV2ZW50TGlzdGVuZXJNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGV2ZW50TGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBDbGllbnRFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXMoc2VydmVyRXZlbnRMaXN0ZW5lcnM6IEV2ZW50TGlzdGVuZXI8YW55PltdLCBkb092ZXJyaWRlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRFdmVudExpc3RlbmVyID0gbmV3IENsaWVudEV2ZW50TGlzdGVuZXIoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCwgc2VydmVyRXZlbnRMaXN0ZW5lci5jYWxsYmFjaywgc2VydmVyRXZlbnRMaXN0ZW5lci5kZXBlbmRlbmNpZXMpO1xuICAgICAgICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQoY2xpZW50RXZlbnRMaXN0ZW5lci5pZCwgY2xpZW50RXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zOiBDbGllbnRFdmVudExpc3RlbmVyT3B0aW9uW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJQb3NzaWJseSBjb3JydXB0ZWQgSFRNTCwgZmFpbGVkIHRvIGZpbmQgZWxlbWVudCB3aXRoIGtleSBcIiArIGV2ZW50TGlzdGVuZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgICAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgRXZlbnRMaXN0ZW5lck9wdGlvbjogRXZlbnQgbGlzdGVuZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAoZWxlbWVudCBhcyBhbnkpW2V2ZW50TGlzdGVuZXJPcHRpb24ub3B0aW9uXSA9IChldjogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyLmNhbGwoZXYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldChpZDogc3RyaW5nKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoaWQpO1xuICAgIH1cbn1cblxuXG50eXBlIENsaWVudE9ic2VydmVyT3B0aW9uID0ge1xuICAgIC8qKiBUaGUgaHRtbCBhdHRyaWJ1dGUgbmFtZSB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8gKi9cbiAgICBvcHRpb246IHN0cmluZyxcbiAgICAvKiogVGhlIGtleSBvZiB0aGUgZWxlbWVudCB0aGlzIG9wdGlvbiBzaG91bGQgYmUgYXR0YWNoZWQgdG8uICovXG4gICAga2V5OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBldmVudCBsaXN0ZW5lciBpZCB0aGlzIG9wdGlvbiBpcyByZWZlcmVuY2luZy4gKi8gXG4gICAgaWQ6IHN0cmluZyxcbn1cblxuY2xhc3MgQ2xpZW50T2JzZXJ2ZXIge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IE9ic2VydmVyQ2FsbGJhY2s8YW55PjtcbiAgICBkZXBlbmRlbmNpZXM6IHN0cmluZ1tdO1xuICAgIFxuICAgIHN1YmplY3RWYWx1ZXM6IENsaWVudFN1YmplY3Q8YW55PltcInZhbHVlXCJdW10gPSBbXTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudHM6IHsgZWxlbWVudDogRWxlbWVudCwgb3B0aW9uTmFtZTogc3RyaW5nIH1bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgY2FsbGJhY2s6IE9ic2VydmVyQ2FsbGJhY2s8YW55PiwgZGVwZW5jZW5jaWVzOiBzdHJpbmdbXSkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG5cbiAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuXG4gICAgICAgICAgICBpbml0aWFsVmFsdWUub2JzZXJ2ZSh0aGlzLmlkLCAobmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBlbGVtZW50IHRvIHVwZGF0ZSB3aGVuIHRoaXMgb2JzZXJ2ZXIgdXBkYXRlcy5cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQsIG9wdGlvbk5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICAgIH1cblxuICAgIGNhbGwoKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjayguLi50aGlzLnN1YmplY3RWYWx1ZXMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgeyBlbGVtZW50LCBvcHRpb25OYW1lIH0gb2YgdGhpcy5lbGVtZW50cykge1xuICAgICAgICAgICAgKGVsZW1lbnQgYXMgYW55KVtvcHRpb25OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmNsYXNzIE9ic2VydmVyTWFuYWdlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjbGllbnRPYnNlcnZlcnM6IE1hcDxzdHJpbmcsIENsaWVudE9ic2VydmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGxvYWRWYWx1ZXMoc2VydmVyT2JzZXJ2ZXJzOiBTZXJ2ZXJPYnNlcnZlcjxhbnk+W10sIGRvT3ZlcnJpZGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlcnZlck9ic2VydmVyIG9mIHNlcnZlck9ic2VydmVycykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmhhcyhzZXJ2ZXJPYnNlcnZlci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBjbGllbnRPYnNlcnZlciA9IG5ldyBDbGllbnRPYnNlcnZlcihzZXJ2ZXJPYnNlcnZlci5pZCwgc2VydmVyT2JzZXJ2ZXIuY2FsbGJhY2ssIHNlcnZlck9ic2VydmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudE9ic2VydmVycy5zZXQoY2xpZW50T2JzZXJ2ZXIuaWQsIGNsaWVudE9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zOiBDbGllbnRPYnNlcnZlck9wdGlvbltdKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBvYnNlcnZlck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgT2JzZXJ2ZXJPcHRpb246IE9ic2VydmVyIHdpdGggaWQgXFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgXCJcXFwiIGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLmFkZEVsZW1lbnQoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb24ub3B0aW9uKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNhbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG50eXBlIENsZWFudXBQcm9jZWR1cmUgPSB7XG4gICAgcGF0aG5hbWU/OiBzdHJpbmcsXG4gICAga2luZDogTG9hZEhvb2tLaW5kLFxuICAgIGNsZWFudXBGdW5jdGlvbjogTG9hZEhvb2tDbGVhbnVwRnVuY3Rpb24sXG59O1xuXG5lbnVtIExvYWRIb29rS2luZCB7XG4gICAgTEFZT1VUX0xPQURIT09LLFxuICAgIFBBR0VfTE9BREhPT0ssXG59O1xuXG5jbGFzcyBMb2FkSG9va01hbmFnZXIge1xuICAgIHByaXZhdGUgY2xlYW51cFByb2NlZHVyZXM6IENsZWFudXBQcm9jZWR1cmVbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgbG9hZFZhbHVlcyhsb2FkSG9va3M6IExvYWRIb29rPGFueT5bXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb24gPSBsb2FkSG9vay5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgICAgICAgaWYgKGNsZWFudXBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMucHVzaCh7IFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwRnVuY3Rpb246IGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcGF0aG5hbWU6IGxvYWRIb29rLnBhdGhuYW1lLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxsQ2xlYW51cEZ1bmN0aW9ucygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXM6IENsZWFudXBQcm9jZWR1cmVbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgY2xlYW51cFByb2NlZHVyZSBvZiB0aGlzLmNsZWFudXBQcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAoY2xlYW51cFByb2NlZHVyZS5raW5kID09PSBMb2FkSG9va0tpbmQuTEFZT1VUX0xPQURIT09LKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5TY29wZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IHJlbWFpbmluZ1Byb2NlZHVyZXM7XG4gICAgfVxufVxuXG5jb25zdCBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG5jb25zdCBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xuY29uc3Qgc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcigpO1xuY29uc3QgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xuXG5jb25zdCBwYWdlU3RyaW5nQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuY29uc3QgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuY29uc3QgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG5cbmNvbnN0IGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkw6IFVSTCk6IFByb21pc2U8RG9jdW1lbnQgfCB2b2lkPiA9PiB7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG5cbiAgICBpZiAocGFnZVN0cmluZ0NhY2hlLmhhcyhwYXRobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcocGFnZVN0cmluZ0NhY2hlLmdldChwYXRobmFtZSkhLCBcInRleHQvaHRtbFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuXG4gICAgY29uc3QgbmV3RE9NID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhhd2FpdCByZXMudGV4dCgpLCBcInRleHQvaHRtbFwiKTtcbiAgICBcbiAgICB7XG4gICAgICAgIGNvbnN0IGRhdGFTY3JpcHRzID0gQXJyYXkuZnJvbShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtbW9kdWxlPVwidHJ1ZVwiXScpKSBhcyBIVE1MU2NyaXB0RWxlbWVudFtdXG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50U2NyaXB0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1tb2R1bGU9XCJ0cnVlXCJdJykpIGFzIEhUTUxTY3JpcHRFbGVtZW50W11cbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZGF0YVNjcmlwdCBvZiBkYXRhU2NyaXB0cykge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50U2NyaXB0cy5maW5kKHMgPT4gcy5zcmMgPT09IGRhdGFTY3JpcHQuc3JjKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChkYXRhU2NyaXB0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBnZXQgcGFnZSBzY3JpcHRcbiAgICB7XG4gICAgICAgIGNvbnN0IHBhZ2VEYXRhU2NyaXB0ID0gbmV3RE9NLnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdJykgYXMgSFRNTFNjcmlwdEVsZW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmICghcGFnZURhdGFTY3JpcHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBhd2FpdCBpbXBvcnQocGFnZURhdGFTY3JpcHQuc3JjKTtcbiAgICB9XG4gICAgXG4gICAgLy8gZ2V0IGxheW91dCBzY3JpcHRzXG4gICAge1xuICAgICAgICBjb25zdCBsYXlvdXREYXRhU2NyaXB0cyA9IEFycmF5LmZyb20obmV3RE9NLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLWxheW91dD1cInRydWVcIl0nKSkgYXMgSFRNTFNjcmlwdEVsZW1lbnRbXVxuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBzY3JpcHQgb2YgbGF5b3V0RGF0YVNjcmlwdHMpIHtcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydChzY3JpcHQuc3JjKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhZ2VTdHJpbmdDYWNoZS5zZXQocGF0aG5hbWUsIHhtbFNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcobmV3RE9NKSk7XG5cbiAgICByZXR1cm4gbmV3RE9NO1xufTtcblxuLypcbmNvbnN0IG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQ6IHN0cmluZywgcHVzaFN0YXRlOiBib29sZWFuID0gdHJ1ZSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldFVSTCA9IG5ldyBVUkwodGFyZ2V0KTtcbiAgICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcblxuICAgIGxldCBuZXdQYWdlID0gYXdhaXQgZmV0Y2hQYWdlKHRhcmdldFVSTCk7XG4gICAgaWYgKCFuZXdQYWdlKSByZXR1cm47XG5cbiAgICBpZiAocGF0aG5hbWUgPT09IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIFsuLi5jbGVhbnVwUHJvY2VkdXJlc10pIHtcbiAgICAgICAgY29uc3QgaXNJblNjb3BlID0gcGF0aG5hbWUuc3RhcnRzV2l0aChjbGVhbnVwUHJvY2VkdXJlLnBhZ2UpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc0luU2NvcGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cFByb2NlZHVyZSgpO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsZWFudXBQcm9jZWR1cmVzLnNwbGljZShjbGVhbnVwUHJvY2VkdXJlcy5pbmRleE9mKGNsZWFudXBQcm9jZWR1cmUpLCAxKTtcbiAgICAgICAgfVxuICAgIH0gXG4gICAgXG4gICAgbGV0IG9sZFBhZ2VMYXRlc3QgPSBkb2N1bWVudC5ib2R5O1xuICAgIGxldCBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZS5ib2R5O1xuICAgIFxuICAgIHtcbiAgICAgICAgY29uc3QgbmV3UGFnZUxheW91dHMgPSBBcnJheS5mcm9tKG5ld1BhZ2UucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpIGFzIEhUTUxUZW1wbGF0ZUVsZW1lbnRbXTtcbiAgICAgICAgY29uc3Qgb2xkUGFnZUxheW91dHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKSBhcyBIVE1MVGVtcGxhdGVFbGVtZW50W107XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5taW4obmV3UGFnZUxheW91dHMubGVuZ3RoLCBvbGRQYWdlTGF5b3V0cy5sZW5ndGgpO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXQgPSBuZXdQYWdlTGF5b3V0c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXQgPSBvbGRQYWdlTGF5b3V0c1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgbmV3TGF5b3V0SWQgPSBuZXdQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKSE7XG4gICAgICAgICAgICBjb25zdCBvbGRMYXlvdXRJZCA9IG9sZFBhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpITtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG5ld0xheW91dElkICE9PSBvbGRMYXlvdXRJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9sZFBhZ2VMYXRlc3QgPSBvbGRQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZyEgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmchIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gICAgXG4gICAgeyAgIFxuICAgICAgICAvLyBHcmFjZWZ1bGx5IHJlcGxhY2UgaGVhZC5cbiAgICAgICAgLy8gZG9jdW1lbnQuaGVhZC5yZXBsYWNlV2l0aCgpOyBjYXVzZXMgRk9VQyBvbiBDaHJvbWl1bSBicm93c2Vycy5cbiAgICAgICAgZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIik/LnJlcGxhY2VXaXRoKFxuICAgICAgICAgICAgbmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKSA/PyBcIlwiXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9ICh0YXJnZXRMaXN0OiBIVE1MRWxlbWVudFtdLCBtYXRjaEFnYWluc3Q6IEhUTUxFbGVtZW50W10sIGFjdGlvbjogKG5vZGU6IEhUTUxFbGVtZW50KSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hpbmcgPSBtYXRjaEFnYWluc3QuZmluZChuID0+IG4uaXNFcXVhbE5vZGUodGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBhY3Rpb24odGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIGFkZCBuZXcgdGFncyBhbmQgcmVvbXZlIG9sZCBvbmVzXG4gICAgICAgIGNvbnN0IG9sZFRhZ3MgPSBBcnJheS5mcm9tKFtcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpLFxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld1RhZ3MgPSBBcnJheS5mcm9tKFtcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20obmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20obmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20obmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKSxcbiAgICAgICAgXSk7XG4gICAgICAgIFxuICAgICAgICB1cGRhdGUobmV3VGFncywgb2xkVGFncywgKG5vZGUpID0+IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobm9kZSkpO1xuICAgICAgICB1cGRhdGUob2xkVGFncywgbmV3VGFncywgKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICAgIH1cblxuICAgIGlmIChwdXNoU3RhdGUpIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTsgXG4gICAgXG4gICAgYXdhaXQgbG9hZFBhZ2UocGF0aG5hbWUpO1xuXG4gICAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG59O1xuKi9cblxuLyoqIFRha2UgYW55IGRpcmVjdG9yeSBwYXRobmFtZSwgYW5kIG1ha2UgaXQgaW50byB0aGlzIGZvcm1hdDogL3BhdGggKi9cbmZ1bmN0aW9uIHNhbml0aXplUGF0aG5hbWUocGF0aG5hbWU6IHN0cmluZyA9IFwiXCIpOiBzdHJpbmcge1xuICAgIGlmICghcGF0aG5hbWUpIHJldHVybiBcIi9cIjtcblxuICAgIHBhdGhuYW1lID0gXCIvXCIgKyBwYXRobmFtZTtcbiAgICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1xcLysvZywgXCIvXCIpO1xuXG4gICAgaWYgKHBhdGhuYW1lLmxlbmd0aCA+IDEgJiYgcGF0aG5hbWUuZW5kc1dpdGgoXCIvXCIpKSB7XG4gICAgICAgIHBhdGhuYW1lID0gcGF0aG5hbWUuc2xpY2UoMCwgLTEpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXRobmFtZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZURhdGEocGF0aG5hbWU6IHN0cmluZykge1xuICAgIC8qKiBGaW5kIHRoZSBjb3JyZWN0IHNjcmlwdCB0YWcgaW4gaGVhZC4gKi9cbiAgICBjb25zdCBkYXRhU2NyaXB0VGFnID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKSBhcyBIVE1MU2NyaXB0RWxlbWVudCB8IG51bGw7XG4gICAgaWYgKCFkYXRhU2NyaXB0VGFnKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiAoXCJGYWlsZWQgdG8gZmluZCBzY3JpcHQgdGFnIGZvciBxdWVyeTpcIiArIGBzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaW1wb3J0KGRhdGFTY3JpcHRUYWcuc3JjKTtcblxuICAgIGNvbnN0IHsgXG4gICAgICAgIHN1YmplY3RzLCBcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMsIFxuICAgICAgICBldmVudExpc3RlbmVyT3B0aW9ucywgXG4gICAgICAgIG9ic2VydmVycywgXG4gICAgICAgIG9ic2VydmVyT3B0aW9uc1xuICAgIH0gPSBkYXRhO1xuXG4gICAgaWYgKCFldmVudExpc3RlbmVyT3B0aW9ucyB8fCAhZXZlbnRMaXN0ZW5lcnMgfHwgIW9ic2VydmVycyB8fCAhc3ViamVjdHMgfHwgIW9ic2VydmVyT3B0aW9ucykge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYFBvc3NpYmx5IG1hbGZvcm1lZCBwYWdlIGRhdGEgJHtkYXRhfWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGVycm9yT3V0KG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn0gXG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQYWdlKHByZXZpb3VzUGFnZT86IHN0cmluZykge1xuICAgIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuXG4gICAgY29uc3QgcGFnZURhdGEgPSBhd2FpdCBnZXRQYWdlRGF0YShwYXRobmFtZSk7XG5cbiAgICBjb25zdCB7IFxuICAgICAgICBzdWJqZWN0cywgXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLCBcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgICAgIG9ic2VydmVycyxcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zLFxuICAgICAgICBsb2FkSG9va3NcbiAgICB9ID0gcGFnZURhdGE7XG5cbiAgICBERVZfQlVJTEQ6IHtcbiAgICAgICAgZ2xvYmFsVGhpcy5kZXZ0b29scyA9IHtcbiAgICAgICAgICAgIHBhZ2VEYXRhLFxuICAgICAgICAgICAgc3RhdGVNYW5hZ2VyLFxuICAgICAgICAgICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIsXG4gICAgICAgICAgICBvYnNlcnZlck1hbmFnZXIsXG4gICAgICAgICAgICBsb2FkSG9va01hbmFnZXIsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnbG9iYWxUaGlzLmVsZWdhbmNlQ2xpZW50ID0ge1xuICAgICAgICBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50LFxuICAgICAgICBmZXRjaFBhZ2UsXG4gICAgfVxuXG4gICAgc3RhdGVNYW5hZ2VyLmxvYWRWYWx1ZXMoc3ViamVjdHMpO1xuXG4gICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIubG9hZFZhbHVlcyhldmVudExpc3RlbmVycyk7XG4gICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIuaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucyk7XG5cbiAgICBvYnNlcnZlck1hbmFnZXIubG9hZFZhbHVlcyhvYnNlcnZlcnMpO1xuICAgIG9ic2VydmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucyk7XG5cbiAgICBsb2FkSG9va01hbmFnZXIubG9hZFZhbHVlcyhsb2FkSG9va3MpO1xufVxuXG5sb2FkUGFnZSgpO1xuXG5leHBvcnQge1xuICAgIENsaWVudFN1YmplY3QsXG4gICAgU3RhdGVNYW5hZ2VyLFxuICAgIE9ic2VydmVyTWFuYWdlcixcbiAgICBMb2FkSG9va01hbmFnZXIsXG4gICAgRXZlbnRMaXN0ZW5lck1hbmFnZXIsXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7O0FBa0JBLE1BQWUsdUJBQWYsTUFBb0M7QUFBQSxFQVVwQztBQStEQSxXQUFTLFlBQVksT0FBaUM7QUFDbEQsUUFDSSxVQUFVLFFBQ1YsVUFBVSxXQUNULE9BQU8sVUFBVSxZQUFZLE1BQU0sUUFBUSxLQUFLLEtBQUssaUJBQWlCLGlCQUN6RSxRQUFPO0FBRVQsV0FBTztBQUFBLEVBQ1g7QUFHQSxNQUFNLGtCQUFOLE1BRUU7QUFBQSxJQWNFLFlBQ0ksS0FDQSxVQUF3QyxDQUFDLEdBQ3pDLFVBQ0Y7QUFDRSxXQUFLLE1BQU07QUFFWCxXQUFLLFdBQVc7QUFFaEIsVUFBSSxZQUFZLE9BQU8sR0FBRztBQUN0QixZQUFJLEtBQUssZ0JBQWdCLE1BQU0sT0FBTztBQUNsQyxrQkFBUSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUNwRSxnQkFBTTtBQUFBLFFBQ1Y7QUFFQSxhQUFLLFNBQVMsUUFBUSxPQUFPO0FBRTdCLGFBQUssVUFBVSxDQUFDO0FBQUEsTUFDcEIsT0FBTztBQUNILGFBQUssVUFBVTtBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUFBLElBRUEsa0JBQWlEO0FBQzdDLGFBQU8sS0FBSyxhQUFhO0FBQUEsSUFDN0I7QUFBQSxFQUNKOzs7QUNqSUEsTUFBTSw4QkFBa0U7QUFBQSxJQUNwRTtBQUFBLElBQVE7QUFBQSxJQUFRO0FBQUEsSUFBTTtBQUFBLElBQU87QUFBQSxJQUFTO0FBQUEsSUFBTTtBQUFBLElBQU87QUFBQSxJQUNuRDtBQUFBLElBQVE7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQVU7QUFBQSxJQUFTO0FBQUEsRUFDaEQ7QUFFQSxNQUFNLGtCQUEwQztBQUFBLElBQzVDO0FBQUEsSUFBSztBQUFBLElBQVE7QUFBQSxJQUFXO0FBQUEsSUFBVztBQUFBLElBQVM7QUFBQSxJQUFTO0FBQUEsSUFBSztBQUFBLElBQU87QUFBQSxJQUNqRTtBQUFBLElBQWM7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFXO0FBQUEsSUFBUTtBQUFBLElBQzdEO0FBQUEsSUFBWTtBQUFBLElBQVE7QUFBQSxJQUFZO0FBQUEsSUFBTTtBQUFBLElBQU87QUFBQSxJQUFXO0FBQUEsSUFBTztBQUFBLElBQy9EO0FBQUEsSUFBTztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQVk7QUFBQSxJQUFjO0FBQUEsSUFBVTtBQUFBLElBQzdEO0FBQUEsSUFBUTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFDOUQ7QUFBQSxJQUFRO0FBQUEsSUFBSztBQUFBLElBQVU7QUFBQSxJQUFPO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFVO0FBQUEsSUFBTTtBQUFBLElBQzlEO0FBQUEsSUFBTztBQUFBLElBQVE7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQU87QUFBQSxJQUFZO0FBQUEsSUFBVTtBQUFBLElBQzdEO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBSztBQUFBLElBQVc7QUFBQSxJQUFPO0FBQUEsSUFDdkQ7QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFRO0FBQUEsSUFBSztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQzFEO0FBQUEsSUFBVTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFTO0FBQUEsSUFBTztBQUFBLElBQzdEO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFTO0FBQUEsSUFBTTtBQUFBLElBQVk7QUFBQSxJQUFZO0FBQUEsSUFBUztBQUFBLElBQ2hFO0FBQUEsSUFBUztBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBTTtBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLEVBQ3REO0FBRUEsTUFBTSw2QkFBZ0U7QUFBQSxJQUNsRTtBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBVztBQUFBLElBQVE7QUFBQSxJQUFXO0FBQUEsSUFBWTtBQUFBLEVBQ2hFO0FBRUEsTUFBTSxpQkFBd0M7QUFBQSxJQUMxQztBQUFBLElBQU87QUFBQSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFZO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUMzRDtBQUFBLElBQVM7QUFBQSxJQUFZO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFrQjtBQUFBLElBQzFE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
