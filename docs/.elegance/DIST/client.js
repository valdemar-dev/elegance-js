"use strict";
(() => {
  // ../dist/client/runtime.mjs
  var SpecialElementOption = class {
  };
  function isAnElement(value) {
    if (value !== null && value !== void 0 && (typeof value !== "object" || Array.isArray(value) || value instanceof EleganceElement)) return true;
    return false;
  }
  var EleganceElement = class {
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
  };
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
  Object.assign(window, allElements);
  var newArray = Array.from;
  var idCounter = 0;
  function genLocalID() {
    idCounter++;
    return idCounter;
  }
  function createHTMLElementFromEleganceElement(element) {
    let specialElementOptions = [];
    const domElement = document.createElement(element.tag);
    {
      const entries = Object.entries(element.options);
      for (const [optionName, optionValue] of entries) {
        if (optionValue instanceof SpecialElementOption) {
          optionValue.mutate(element, optionName);
          const elementKey = genLocalID().toString();
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
      return { root: document.createTextNode(""), specialElementOptions: [] };
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
        throw new Error(`This element is an arbitrary object, and arbitrary objects are not valid children. Please make sure all elements are one of: EleganceElement, boolean, number, string or Array. Also note that currently in client components like reactiveMap, state subject references are not valid children.`);
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
        setTimeout(connect, 1e3);
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
     * Note: this triggers `callback` with the current value of this subject.
     * 
     * @param id The unique id of this observer
     * @param callback Called whenever the value of this subject changes.
     */
    observe(id, callback) {
      if (this.observers.has(id)) {
        this.observers.delete(id);
      }
      this.observers.set(id, callback);
      callback(this.value);
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
    setProp(element, key, value) {
      if (key === "class") {
        element.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key.startsWith("on") && typeof value === "function") {
        element.addEventListener(key.slice(2), value);
      } else if (key in element) {
        const isTruthy = value === "true" || value === "false";
        if (isTruthy) {
          element[key] = Boolean(value);
        } else {
          element[key] = value;
        }
      } else {
        element.setAttribute(key, value);
      }
    }
    call() {
      const newValue = this.callback(...this.subjectValues);
      for (const { element, optionName } of this.elements) {
        this.setProp(element, optionName, newValue);
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
    /**
     * Take the results of ServerSubject.generateObserverNode(), replace their HTML placeins for text nodes, and turn those into observers.
     */
    transformSubjectObserverNodes() {
      const observerNodes = newArray(document.querySelectorAll("template[o]"));
      for (const node of observerNodes) {
        let update2 = function(value) {
          textNode.textContent = value;
        };
        var update = update2;
        const subjectId = node.getAttribute("o");
        const subject = stateManager.get(subjectId);
        if (!subject) {
          DEV_BUILD: errorOut("Failed to find subject with id " + subjectId + " for observerNode.");
          continue;
        }
        const textNode = document.createTextNode(subject.value);
        const id = genLocalID().toString();
        subject.observe(id, update2);
        update2(subject.value);
        node.replaceWith(textNode);
      }
    }
  };
  var LoadHookManager = class {
    constructor() {
      this.cleanupProcedures = [];
      this.activeLoadHooks = [];
    }
    loadValues(loadHooks) {
      for (const loadHook of loadHooks) {
        const depencencies = stateManager.getAll(loadHook.dependencies);
        if (this.activeLoadHooks.includes(loadHook.id)) {
          continue;
        }
        this.activeLoadHooks.push(loadHook.id);
        const cleanupFunction = loadHook.callback(...depencencies);
        if (cleanupFunction) {
          this.cleanupProcedures.push({
            kind: loadHook.kind,
            cleanupFunction,
            pathname: loadHook.pathname,
            loadHookIdx: this.activeLoadHooks.length - 1
          });
        }
      }
    }
    callCleanupFunctions() {
      let remainingProcedures = [];
      for (const cleanupProcedure of this.cleanupProcedures) {
        if (cleanupProcedure.kind === 0) {
          const isInScope = sanitizePathname(window.location.pathname).startsWith(cleanupProcedure.pathname);
          if (isInScope) {
            remainingProcedures.push(cleanupProcedure);
            continue;
          }
        }
        cleanupProcedure.cleanupFunction();
        this.activeLoadHooks.splice(cleanupProcedure.loadHookIdx, 1);
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
      const dataScripts = newArray(newDOM.querySelectorAll('script[data-package="true"]'));
      const currentScripts = newArray(document.head.querySelectorAll('script[data-package="true"]'));
      for (const dataScript of dataScripts) {
        const existing = currentScripts.find((s) => s.src === dataScript.src);
        if (existing) {
          continue;
        }
        document.head.appendChild(dataScript);
      }
    }
    {
      const pageDataScript = newDOM.querySelector(`script[data-hook="true"][data-pathname="${pathname}"]`);
      const text = pageDataScript.textContent;
      pageDataScript.remove();
      const blob = new Blob([text], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const script = document.createElement("script");
      script.src = url;
      script.type = "module";
      script.setAttribute("data-page", "true");
      script.setAttribute("data-pathname", `${pathname}`);
      newDOM.head.appendChild(script);
    }
    pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));
    return newDOM;
  };
  var navigationCallbacks = [];
  function onNavigate(callback) {
    navigationCallbacks.push(callback);
    return navigationCallbacks.length - 1;
  }
  function removeNavigationCallback(idx) {
    navigationCallbacks.splice(idx, 1);
  }
  var navigateLocally = async (target, pushState = true) => {
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);
    let newPage = await fetchPage(targetURL);
    if (!newPage) return;
    let oldPageLatest = document.body;
    let newPageLatest = newPage.body;
    {
      const newPageLayouts = newArray(newPage.querySelectorAll("template[layout-id]"));
      const oldPageLayouts = newArray(document.querySelectorAll("template[layout-id]"));
      const size = Math.min(newPageLayouts.length, oldPageLayouts.length);
      for (let i = 0; i < size; i++) {
        const newPageLayout = newPageLayouts[i];
        const oldPageLayout = oldPageLayouts[i];
        const newLayoutId = newPageLayout.getAttribute("layout-id");
        const oldLayoutId = oldPageLayout.getAttribute("layout-id");
        if (newLayoutId !== oldLayoutId) {
          break;
        }
        oldPageLatest = oldPageLayout.nextElementSibling;
        newPageLatest = newPageLayout.nextElementSibling;
      }
    }
    const head = document.head;
    const newHead = newPage.head;
    oldPageLatest.replaceWith(newPageLatest);
    {
      document.head.querySelector("title")?.replaceWith(
        newPage.head.querySelector("title") ?? ""
      );
      const update = (targetList, matchAgainst, action) => {
        for (const target2 of targetList) {
          const matching = matchAgainst.find((n) => n.isEqualNode(target2));
          if (matching) {
            continue;
          }
          action(target2);
        }
      };
      const oldTags = [
        ...newArray(head.querySelectorAll("link")),
        ...newArray(head.querySelectorAll("meta")),
        ...newArray(head.querySelectorAll("script")),
        ...newArray(head.querySelectorAll("base")),
        ...newArray(head.querySelectorAll("style"))
      ];
      const newTags = [
        ...newArray(newHead.querySelectorAll("link")),
        ...newArray(newHead.querySelectorAll("meta")),
        ...newArray(newHead.querySelectorAll("script")),
        ...newArray(newHead.querySelectorAll("base")),
        ...newArray(newHead.querySelectorAll("style"))
      ];
      update(newTags, oldTags, (node) => document.head.appendChild(node));
      update(oldTags, newTags, (node) => node.remove());
    }
    if (pushState) history.pushState(null, "", targetURL.href);
    loadHookManager.callCleanupFunctions();
    {
      for (const callback of navigationCallbacks) {
        callback(pathname);
      }
    }
    await loadPage();
    if (targetURL.hash) {
      document.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }
  };
  function safePercentDecode(input) {
    return input.replace(
      /%[0-9A-Fa-f]{2}/g,
      (m) => String.fromCharCode(parseInt(m.slice(1), 16))
    );
  }
  function sanitizePathname(pathname = "") {
    if (!pathname) return "/";
    pathname = safePercentDecode(pathname);
    pathname = "/" + pathname;
    pathname = pathname.replace(/\/+/g, "/");
    const segments = pathname.split("/");
    const resolved = [];
    for (const segment of segments) {
      if (!segment || segment === ".") continue;
      if (segment === "..") {
        resolved.pop();
        continue;
      }
      resolved.push(segment);
    }
    const encoded = resolved.map((s) => encodeURIComponent(s));
    return "/" + encoded.join("/");
  }
  async function getPageData(pathname) {
    const dataScriptTag = document.head.querySelector(`script[data-page="true"][data-pathname="${pathname}"]`);
    if (!dataScriptTag) {
      errorOut(`Failed to find script tag for query:script[data-page="true"][data-pathname="${pathname}"]`);
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
  async function loadPage() {
    window.onpopstate = async (event) => {
      event.preventDefault();
      const target = event.target;
      await navigateLocally(target.location.href, false);
      history.replaceState(null, "", target.location.href);
    };
    const pathname = sanitizePathname(window.location.pathname);
    const {
      subjects,
      eventListenerOptions,
      eventListeners,
      observers,
      observerOptions,
      loadHooks
    } = await getPageData(pathname);
    DEV_BUILD: {
      globalThis.devtools = {
        pageData: {
          subjects,
          eventListenerOptions,
          eventListeners,
          observers,
          observerOptions,
          loadHooks
        },
        stateManager,
        eventListenerManager,
        observerManager,
        loadHookManager
      };
    }
    globalThis.eleganceClient = {
      createHTMLElementFromElement,
      fetchPage,
      navigateLocally,
      onNavigate,
      removeNavigationCallback
    };
    stateManager.loadValues(subjects);
    eventListenerManager.loadValues(eventListeners);
    eventListenerManager.hookCallbacks(eventListenerOptions);
    observerManager.loadValues(observers);
    observerManager.hookCallbacks(observerOptions);
    observerManager.transformSubjectObserverNodes();
    loadHookManager.loadValues(loadHooks);
  }
  loadPage();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4gPSBudWxsKSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW29wdGlvbnMsIC4uLmNoaWxkcmVuID8/IFtdXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBjYW5IYXZlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gIH1cbn07XG5cbi8vIHNyYy9lbGVtZW50cy9lbGVtZW50X2xpc3QudHNcbnZhciBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwiYXJlYVwiLFxuICBcImJhc2VcIixcbiAgXCJiclwiLFxuICBcImNvbFwiLFxuICBcImVtYmVkXCIsXG4gIFwiaHJcIixcbiAgXCJpbWdcIixcbiAgXCJpbnB1dFwiLFxuICBcImxpbmtcIixcbiAgXCJtZXRhXCIsXG4gIFwicGFyYW1cIixcbiAgXCJzb3VyY2VcIixcbiAgXCJ0cmFja1wiLFxuICBcIndiclwiXG5dO1xudmFyIGh0bWxFbGVtZW50VGFncyA9IFtcbiAgXCJhXCIsXG4gIFwiYWJiclwiLFxuICBcImFkZHJlc3NcIixcbiAgXCJhcnRpY2xlXCIsXG4gIFwiYXNpZGVcIixcbiAgXCJhdWRpb1wiLFxuICBcImJcIixcbiAgXCJiZGlcIixcbiAgXCJiZG9cIixcbiAgXCJibG9ja3F1b3RlXCIsXG4gIFwiYm9keVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFxuICBcImNhcHRpb25cIixcbiAgXCJjaXRlXCIsXG4gIFwiY29kZVwiLFxuICBcImNvbGdyb3VwXCIsXG4gIFwiZGF0YVwiLFxuICBcImRhdGFsaXN0XCIsXG4gIFwiZGRcIixcbiAgXCJkZWxcIixcbiAgXCJkZXRhaWxzXCIsXG4gIFwiZGZuXCIsXG4gIFwiZGlhbG9nXCIsXG4gIFwiZGl2XCIsXG4gIFwiZGxcIixcbiAgXCJkdFwiLFxuICBcImVtXCIsXG4gIFwiZmllbGRzZXRcIixcbiAgXCJmaWdjYXB0aW9uXCIsXG4gIFwiZmlndXJlXCIsXG4gIFwiZm9vdGVyXCIsXG4gIFwiZm9ybVwiLFxuICBcImgxXCIsXG4gIFwiaDJcIixcbiAgXCJoM1wiLFxuICBcImg0XCIsXG4gIFwiaDVcIixcbiAgXCJoNlwiLFxuICBcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcbiAgXCJoZ3JvdXBcIixcbiAgXCJodG1sXCIsXG4gIFwiaVwiLFxuICBcImlmcmFtZVwiLFxuICBcImluc1wiLFxuICBcImtiZFwiLFxuICBcImxhYmVsXCIsXG4gIFwibGVnZW5kXCIsXG4gIFwibGlcIixcbiAgXCJtYWluXCIsXG4gIFwibWFwXCIsXG4gIFwibWFya1wiLFxuICBcIm1lbnVcIixcbiAgXCJtZXRlclwiLFxuICBcIm5hdlwiLFxuICBcIm5vc2NyaXB0XCIsXG4gIFwib2JqZWN0XCIsXG4gIFwib2xcIixcbiAgXCJvcHRncm91cFwiLFxuICBcIm9wdGlvblwiLFxuICBcIm91dHB1dFwiLFxuICBcInBcIixcbiAgXCJwaWN0dXJlXCIsXG4gIFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcbiAgXCJxXCIsXG4gIFwicnBcIixcbiAgXCJydFwiLFxuICBcInJ1YnlcIixcbiAgXCJzXCIsXG4gIFwic2FtcFwiLFxuICBcInNjcmlwdFwiLFxuICBcInNlYXJjaFwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJzZWxlY3RcIixcbiAgXCJzbG90XCIsXG4gIFwic21hbGxcIixcbiAgXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXG4gIFwic3R5bGVcIixcbiAgXCJzdWJcIixcbiAgXCJzdW1tYXJ5XCIsXG4gIFwic3VwXCIsXG4gIFwidGFibGVcIixcbiAgXCJ0Ym9keVwiLFxuICBcInRkXCIsXG4gIFwidGVtcGxhdGVcIixcbiAgXCJ0ZXh0YXJlYVwiLFxuICBcInRmb290XCIsXG4gIFwidGhcIixcbiAgXCJ0aGVhZFwiLFxuICBcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFxuICBcInRyXCIsXG4gIFwidVwiLFxuICBcInVsXCIsXG4gIFwidmFyXCIsXG4gIFwidmlkZW9cIlxuXTtcbnZhciBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9IFtcbiAgXCJwYXRoXCIsXG4gIFwiY2lyY2xlXCIsXG4gIFwiZWxsaXBzZVwiLFxuICBcImxpbmVcIixcbiAgXCJwb2x5Z29uXCIsXG4gIFwicG9seWxpbmVcIixcbiAgXCJzdG9wXCJcbl07XG52YXIgc3ZnRWxlbWVudFRhZ3MgPSBbXG4gIFwic3ZnXCIsXG4gIFwiZ1wiLFxuICBcInRleHRcIixcbiAgXCJ0c3BhblwiLFxuICBcInRleHRQYXRoXCIsXG4gIFwiZGVmc1wiLFxuICBcInN5bWJvbFwiLFxuICBcInVzZVwiLFxuICBcImltYWdlXCIsXG4gIFwiY2xpcFBhdGhcIixcbiAgXCJtYXNrXCIsXG4gIFwicGF0dGVyblwiLFxuICBcImxpbmVhckdyYWRpZW50XCIsXG4gIFwicmFkaWFsR3JhZGllbnRcIixcbiAgXCJmaWx0ZXJcIixcbiAgXCJtYXJrZXJcIixcbiAgXCJ2aWV3XCIsXG4gIFwiZmVCbGVuZFwiLFxuICBcImZlQ29sb3JNYXRyaXhcIixcbiAgXCJmZUNvbXBvbmVudFRyYW5zZmVyXCIsXG4gIFwiZmVDb21wb3NpdGVcIixcbiAgXCJmZUNvbnZvbHZlTWF0cml4XCIsXG4gIFwiZmVEaWZmdXNlTGlnaHRpbmdcIixcbiAgXCJmZURpc3BsYWNlbWVudE1hcFwiLFxuICBcImZlRGlzdGFudExpZ2h0XCIsXG4gIFwiZmVGbG9vZFwiLFxuICBcImZlRnVuY0FcIixcbiAgXCJmZUZ1bmNCXCIsXG4gIFwiZmVGdW5jR1wiLFxuICBcImZlRnVuY1JcIixcbiAgXCJmZUdhdXNzaWFuQmx1clwiLFxuICBcImZlSW1hZ2VcIixcbiAgXCJmZU1lcmdlXCIsXG4gIFwiZmVNZXJnZU5vZGVcIixcbiAgXCJmZU1vcnBob2xvZ3lcIixcbiAgXCJmZU9mZnNldFwiLFxuICBcImZlUG9pbnRMaWdodFwiLFxuICBcImZlU3BlY3VsYXJMaWdodGluZ1wiLFxuICBcImZlU3BvdExpZ2h0XCIsXG4gIFwiZmVUaWxlXCIsXG4gIFwiZmVUdXJidWxlbmNlXCJcbl07XG52YXIgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwibWlcIixcbiAgXCJtblwiLFxuICBcIm1vXCJcbl07XG52YXIgbWF0aG1sRWxlbWVudFRhZ3MgPSBbXG4gIFwibWF0aFwiLFxuICBcIm1zXCIsXG4gIFwibXRleHRcIixcbiAgXCJtcm93XCIsXG4gIFwibWZlbmNlZFwiLFxuICBcIm1zdXBcIixcbiAgXCJtc3ViXCIsXG4gIFwibXN1YnN1cFwiLFxuICBcIm1mcmFjXCIsXG4gIFwibXNxcnRcIixcbiAgXCJtcm9vdFwiLFxuICBcIm10YWJsZVwiLFxuICBcIm10clwiLFxuICBcIm10ZFwiLFxuICBcIm1zdHlsZVwiLFxuICBcIm1lbmNsb3NlXCIsXG4gIFwibW11bHRpc2NyaXB0c1wiXG5dO1xudmFyIGVsZW1lbnRzID0ge307XG52YXIgY2hpbGRyZW5sZXNzRWxlbWVudHMgPSB7fTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZykge1xuICByZXR1cm4gKChvcHRpb25zLCAuLi5jaGlsZHJlbikgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIGNoaWxkcmVuKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucykgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIG51bGwpKTtcbn1cbmZvciAoY29uc3QgdGFnIG9mIGh0bWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBzdmdFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xudmFyIGFsbEVsZW1lbnRzID0ge1xuICAuLi5lbGVtZW50cyxcbiAgLi4uY2hpbGRyZW5sZXNzRWxlbWVudHNcbn07XG5cbi8vIHNyYy9jbGllbnQvcnVudGltZS50c1xuT2JqZWN0LmFzc2lnbih3aW5kb3csIGFsbEVsZW1lbnRzKTtcbnZhciBuZXdBcnJheSA9IEFycmF5LmZyb207XG52YXIgaWRDb3VudGVyID0gMDtcbmZ1bmN0aW9uIGdlbkxvY2FsSUQoKSB7XG4gIGlkQ291bnRlcisrO1xuICByZXR1cm4gaWRDb3VudGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICBjb25zdCBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50LnRhZyk7XG4gIHtcbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZWxlbWVudC5vcHRpb25zKTtcbiAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgb3B0aW9uVmFsdWUubXV0YXRlKGVsZW1lbnQsIG9wdGlvbk5hbWUpO1xuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gZ2VuTG9jYWxJRCgpLnRvU3RyaW5nKCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGVsZW1lbnQua2V5KSB7XG4gICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICB9XG4gIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICBkb21FbGVtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCB8fCBlbGVtZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHsgcm9vdDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIiksIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiBlbGVtZW50KSB7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChzdWJFbGVtZW50KTtcbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcm9vdDogZnJhZ21lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBBbHNvIG5vdGUgdGhhdCBjdXJyZW50bHkgaW4gY2xpZW50IGNvbXBvbmVudHMgbGlrZSByZWFjdGl2ZU1hcCwgc3RhdGUgc3ViamVjdCByZWZlcmVuY2VzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uYCk7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0eXBlb2Ygb2YgdGhpcyBlbGVtZW50IGlzIG5vdCBvbmUgb2YgRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gUGxlYXNlIGNvbnZlcnQgaXQgaW50byBvbmUgb2YgdGhlc2UgdHlwZXMuYCk7XG4gIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICBsZXQgaXNFcnJvcmVkID0gZmFsc2U7XG4gIChmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgIGNvbnN0IGVzID0gbmV3IEV2ZW50U291cmNlKFwiaHR0cDovL2xvY2FsaG9zdDo0MDAwL2VsZWdhbmNlLWhvdC1yZWxvYWRcIik7XG4gICAgZXMub25vcGVuID0gKCkgPT4ge1xuICAgICAgaWYgKGlzRXJyb3JlZCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgaXNFcnJvcmVkID0gdHJ1ZTtcbiAgICAgIGVzLmNsb3NlKCk7XG4gICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDFlMyk7XG4gICAgfTtcbiAgfSkoKTtcbn0pKCk7XG52YXIgQ2xpZW50U3ViamVjdCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoaWQsIHZhbHVlKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBNYW51YWxseSB0cmlnZ2VyIGVhY2ggb2YgdGhpcyBzdWJqZWN0J3Mgb2JzZXJ2ZXJzLCB3aXRoIHRoZSBzdWJqZWN0J3MgY3VycmVudCB2YWx1ZS5cbiAgICogXG4gICAqIFVzZWZ1bCBpZiB5b3UncmUgbXV0YXRpbmcgZm9yIGV4YW1wbGUgZmllbGRzIG9mIGFuIG9iamVjdCwgb3IgcHVzaGluZyB0byBhbiBhcnJheS5cbiAgICovXG4gIHRyaWdnZXJPYnNlcnZlcnMoKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQWRkIGEgbmV3IG9ic2VydmVyIHRvIHRoaXMgc3ViamVjdCwgYGNhbGxiYWNrYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIHNldHRlciBpcyBjYWxsZWQgb24gdGhpcyBzdWJqZWN0LlxuICAgKiBcbiAgICogTm90ZTogaWYgYW4gSUQgaXMgYWxyZWFkeSBpbiB1c2UgaXQncyBjYWxsYmFjayB3aWxsIGp1c3QgYmUgb3ZlcndyaXR0ZW4gd2l0aCB3aGF0ZXZlciB5b3UgZ2l2ZSBpdC5cbiAgICogXG4gICAqIE5vdGU6IHRoaXMgdHJpZ2dlcnMgYGNhbGxiYWNrYCB3aXRoIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIEBwYXJhbSBpZCBUaGUgdW5pcXVlIGlkIG9mIHRoaXMgb2JzZXJ2ZXJcbiAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAqL1xuICBvYnNlcnZlKGlkLCBjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLm9ic2VydmVycy5oYXMoaWQpKSB7XG4gICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmVycy5zZXQoaWQsIGNhbGxiYWNrKTtcbiAgICBjYWxsYmFjayh0aGlzLnZhbHVlKTtcbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGFuIG9ic2VydmVyIGZyb20gdGhpcyBzdWJqZWN0LlxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGUgb2JzZXJ2ZXIuXG4gICAqL1xuICB1bm9ic2VydmUoaWQpIHtcbiAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICB9XG59O1xudmFyIFN0YXRlTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJqZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyh2YWx1ZXMsIGRvT3ZlcndyaXRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50U3ViamVjdCA9IG5ldyBDbGllbnRTdWJqZWN0KHZhbHVlLmlkLCB2YWx1ZS52YWx1ZSk7XG4gICAgICB0aGlzLnN1YmplY3RzLnNldCh2YWx1ZS5pZCwgY2xpZW50U3ViamVjdCk7XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3RzLmdldChpZCk7XG4gIH1cbiAgZ2V0QWxsKGlkcykge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59O1xudmFyIENsaWVudEV2ZW50TGlzdGVuZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuY2VuY2llcztcbiAgfVxuICBjYWxsKGV2KSB7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgdGhpcy5jYWxsYmFjayhldiwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgfVxufTtcbnZhciBFdmVudExpc3RlbmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyhzZXJ2ZXJFdmVudExpc3RlbmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50RXZlbnRMaXN0ZW5lciA9IG5ldyBDbGllbnRFdmVudExpc3RlbmVyKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQsIHNlcnZlckV2ZW50TGlzdGVuZXIuY2FsbGJhY2ssIHNlcnZlckV2ZW50TGlzdGVuZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KGNsaWVudEV2ZW50TGlzdGVuZXIuaWQsIGNsaWVudEV2ZW50TGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBldmVudExpc3RlbmVyT3B0aW9uLmtleSArIFwiIGZvciBldmVudCBsaXN0ZW5lci5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIEV2ZW50TGlzdGVuZXJPcHRpb246IEV2ZW50IGxpc3RlbmVyIHdpdGggaWQgXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArICdcIiBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lci5jYWxsKGV2KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChpZCk7XG4gIH1cbn07XG52YXIgQ2xpZW50T2JzZXJ2ZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc3ViamVjdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY2FsbCgpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAqL1xuICBhZGRFbGVtZW50KGVsZW1lbnQsIG9wdGlvbk5hbWUpIHtcbiAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICB9XG4gIHNldFByb3AoZWxlbWVudCwga2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgPT09IFwiY2xhc3NcIikge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkuc3RhcnRzV2l0aChcIm9uXCIpICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkgaW4gZWxlbWVudCkge1xuICAgICAgY29uc3QgaXNUcnV0aHkgPSB2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIjtcbiAgICAgIGlmIChpc1RydXRoeSkge1xuICAgICAgICBlbGVtZW50W2tleV0gPSBCb29sZWFuKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgY2FsbCgpIHtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMuY2FsbGJhY2soLi4udGhpcy5zdWJqZWN0VmFsdWVzKTtcbiAgICBmb3IgKGNvbnN0IHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9IG9mIHRoaXMuZWxlbWVudHMpIHtcbiAgICAgIHRoaXMuc2V0UHJvcChlbGVtZW50LCBvcHRpb25OYW1lLCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG59O1xudmFyIE9ic2VydmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGllbnRPYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoc2VydmVyT2JzZXJ2ZXJzLCBkb092ZXJyaWRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHNlcnZlck9ic2VydmVyIG9mIHNlcnZlck9ic2VydmVycykge1xuICAgICAgaWYgKHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmhhcyhzZXJ2ZXJPYnNlcnZlci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50T2JzZXJ2ZXIgPSBuZXcgQ2xpZW50T2JzZXJ2ZXIoc2VydmVyT2JzZXJ2ZXIuaWQsIHNlcnZlck9ic2VydmVyLmNhbGxiYWNrLCBzZXJ2ZXJPYnNlcnZlci5kZXBlbmRlbmNpZXMpO1xuICAgICAgdGhpcy5jbGllbnRPYnNlcnZlcnMuc2V0KGNsaWVudE9ic2VydmVyLmlkLCBjbGllbnRPYnNlcnZlcik7XG4gICAgfVxuICB9XG4gIGhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlck9wdGlvbiBvZiBvYnNlcnZlck9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtvYnNlcnZlck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBvYnNlcnZlck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBvYnNlcnZlciA9IHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmdldChvYnNlcnZlck9wdGlvbi5pZCk7XG4gICAgICBpZiAoIW9ic2VydmVyKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgT2JzZXJ2ZXJPcHRpb246IE9ic2VydmVyIHdpdGggaWQgXFx1MjAxRFwiICsgb2JzZXJ2ZXJPcHRpb24uaWQgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG9ic2VydmVyLmFkZEVsZW1lbnQoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb24ub3B0aW9uKTtcbiAgICAgIG9ic2VydmVyLmNhbGwoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFRha2UgdGhlIHJlc3VsdHMgb2YgU2VydmVyU3ViamVjdC5nZW5lcmF0ZU9ic2VydmVyTm9kZSgpLCByZXBsYWNlIHRoZWlyIEhUTUwgcGxhY2VpbnMgZm9yIHRleHQgbm9kZXMsIGFuZCB0dXJuIHRob3NlIGludG8gb2JzZXJ2ZXJzLlxuICAgKi9cbiAgdHJhbnNmb3JtU3ViamVjdE9ic2VydmVyTm9kZXMoKSB7XG4gICAgY29uc3Qgb2JzZXJ2ZXJOb2RlcyA9IG5ld0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtvXVwiKSk7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG9ic2VydmVyTm9kZXMpIHtcbiAgICAgIGxldCB1cGRhdGUyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdGV4dE5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgIH07XG4gICAgICB2YXIgdXBkYXRlID0gdXBkYXRlMjtcbiAgICAgIGNvbnN0IHN1YmplY3RJZCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwib1wiKTtcbiAgICAgIGNvbnN0IHN1YmplY3QgPSBzdGF0ZU1hbmFnZXIuZ2V0KHN1YmplY3RJZCk7XG4gICAgICBpZiAoIXN1YmplY3QpIHtcbiAgICAgICAgREVWX0JVSUxEOiBlcnJvck91dChcIkZhaWxlZCB0byBmaW5kIHN1YmplY3Qgd2l0aCBpZCBcIiArIHN1YmplY3RJZCArIFwiIGZvciBvYnNlcnZlck5vZGUuXCIpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3ViamVjdC52YWx1ZSk7XG4gICAgICBjb25zdCBpZCA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgc3ViamVjdC5vYnNlcnZlKGlkLCB1cGRhdGUyKTtcbiAgICAgIHVwZGF0ZTIoc3ViamVjdC52YWx1ZSk7XG4gICAgICBub2RlLnJlcGxhY2VXaXRoKHRleHROb2RlKTtcbiAgICB9XG4gIH1cbn07XG52YXIgTG9hZEhvb2tNYW5hZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gW107XG4gICAgdGhpcy5hY3RpdmVMb2FkSG9va3MgPSBbXTtcbiAgfVxuICBsb2FkVmFsdWVzKGxvYWRIb29rcykge1xuICAgIGZvciAoY29uc3QgbG9hZEhvb2sgb2YgbG9hZEhvb2tzKSB7XG4gICAgICBjb25zdCBkZXBlbmNlbmNpZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKGxvYWRIb29rLmRlcGVuZGVuY2llcyk7XG4gICAgICBpZiAodGhpcy5hY3RpdmVMb2FkSG9va3MuaW5jbHVkZXMobG9hZEhvb2suaWQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3MucHVzaChsb2FkSG9vay5pZCk7XG4gICAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb24gPSBsb2FkSG9vay5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgaWYgKGNsZWFudXBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzLnB1c2goe1xuICAgICAgICAgIGtpbmQ6IGxvYWRIb29rLmtpbmQsXG4gICAgICAgICAgY2xlYW51cEZ1bmN0aW9uLFxuICAgICAgICAgIHBhdGhuYW1lOiBsb2FkSG9vay5wYXRobmFtZSxcbiAgICAgICAgICBsb2FkSG9va0lkeDogdGhpcy5hY3RpdmVMb2FkSG9va3MubGVuZ3RoIC0gMVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2FsbENsZWFudXBGdW5jdGlvbnMoKSB7XG4gICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsZWFudXBQcm9jZWR1cmUgb2YgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcykge1xuICAgICAgaWYgKGNsZWFudXBQcm9jZWR1cmUua2luZCA9PT0gMCAvKiBMQVlPVVRfTE9BREhPT0sgKi8pIHtcbiAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSk7XG4gICAgICAgIGlmIChpc0luU2NvcGUpIHtcbiAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNsZWFudXBQcm9jZWR1cmUuY2xlYW51cEZ1bmN0aW9uKCk7XG4gICAgICB0aGlzLmFjdGl2ZUxvYWRIb29rcy5zcGxpY2UoY2xlYW51cFByb2NlZHVyZS5sb2FkSG9va0lkeCwgMSk7XG4gICAgfVxuICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMgPSByZW1haW5pbmdQcm9jZWR1cmVzO1xuICB9XG59O1xudmFyIG9ic2VydmVyTWFuYWdlciA9IG5ldyBPYnNlcnZlck1hbmFnZXIoKTtcbnZhciBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xudmFyIHN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIoKTtcbnZhciBsb2FkSG9va01hbmFnZXIgPSBuZXcgTG9hZEhvb2tNYW5hZ2VyKCk7XG52YXIgcGFnZVN0cmluZ0NhY2hlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG52YXIgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG52YXIgZmV0Y2hQYWdlID0gYXN5bmMgKHRhcmdldFVSTCkgPT4ge1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgaWYgKHBhZ2VTdHJpbmdDYWNoZS5oYXMocGF0aG5hbWUpKSB7XG4gICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcocGFnZVN0cmluZ0NhY2hlLmdldChwYXRobmFtZSksIFwidGV4dC9odG1sXCIpO1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVSTCk7XG4gIGNvbnN0IG5ld0RPTSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoYXdhaXQgcmVzLnRleHQoKSwgXCJ0ZXh0L2h0bWxcIik7XG4gIHtcbiAgICBjb25zdCBkYXRhU2NyaXB0cyA9IG5ld0FycmF5KG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKTtcbiAgICBjb25zdCBjdXJyZW50U2NyaXB0cyA9IG5ld0FycmF5KGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgZm9yIChjb25zdCBkYXRhU2NyaXB0IG9mIGRhdGFTY3JpcHRzKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnRTY3JpcHRzLmZpbmQoKHMpID0+IHMuc3JjID09PSBkYXRhU2NyaXB0LnNyYyk7XG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGRhdGFTY3JpcHQpO1xuICAgIH1cbiAgfVxuICB7XG4gICAgY29uc3QgcGFnZURhdGFTY3JpcHQgPSBuZXdET00ucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtaG9vaz1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgY29uc3QgdGV4dCA9IHBhZ2VEYXRhU2NyaXB0LnRleHRDb250ZW50O1xuICAgIHBhZ2VEYXRhU2NyaXB0LnJlbW92ZSgpO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBzY3JpcHQudHlwZSA9IFwibW9kdWxlXCI7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGFnZVwiLCBcInRydWVcIik7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGF0aG5hbWVcIiwgYCR7cGF0aG5hbWV9YCk7XG4gICAgbmV3RE9NLmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfVxuICBwYWdlU3RyaW5nQ2FjaGUuc2V0KHBhdGhuYW1lLCB4bWxTZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKG5ld0RPTSkpO1xuICByZXR1cm4gbmV3RE9NO1xufTtcbnZhciBuYXZpZ2F0aW9uQ2FsbGJhY2tzID0gW107XG5mdW5jdGlvbiBvbk5hdmlnYXRlKGNhbGxiYWNrKSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiBuYXZpZ2F0aW9uQ2FsbGJhY2tzLmxlbmd0aCAtIDE7XG59XG5mdW5jdGlvbiByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2soaWR4KSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3Muc3BsaWNlKGlkeCwgMSk7XG59XG52YXIgbmF2aWdhdGVMb2NhbGx5ID0gYXN5bmMgKHRhcmdldCwgcHVzaFN0YXRlID0gdHJ1ZSkgPT4ge1xuICBjb25zdCB0YXJnZXRVUkwgPSBuZXcgVVJMKHRhcmdldCk7XG4gIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh0YXJnZXRVUkwucGF0aG5hbWUpO1xuICBsZXQgbmV3UGFnZSA9IGF3YWl0IGZldGNoUGFnZSh0YXJnZXRVUkwpO1xuICBpZiAoIW5ld1BhZ2UpIHJldHVybjtcbiAgbGV0IG9sZFBhZ2VMYXRlc3QgPSBkb2N1bWVudC5ib2R5O1xuICBsZXQgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2UuYm9keTtcbiAge1xuICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXRzID0gbmV3QXJyYXkobmV3UGFnZS5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgY29uc3Qgb2xkUGFnZUxheW91dHMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgY29uc3Qgc2l6ZSA9IE1hdGgubWluKG5ld1BhZ2VMYXlvdXRzLmxlbmd0aCwgb2xkUGFnZUxheW91dHMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgY29uc3QgbmV3UGFnZUxheW91dCA9IG5ld1BhZ2VMYXlvdXRzW2ldO1xuICAgICAgY29uc3Qgb2xkUGFnZUxheW91dCA9IG9sZFBhZ2VMYXlvdXRzW2ldO1xuICAgICAgY29uc3QgbmV3TGF5b3V0SWQgPSBuZXdQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgIGNvbnN0IG9sZExheW91dElkID0gb2xkUGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICBpZiAobmV3TGF5b3V0SWQgIT09IG9sZExheW91dElkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgb2xkUGFnZUxhdGVzdCA9IG9sZFBhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgfVxuICBjb25zdCBoZWFkID0gZG9jdW1lbnQuaGVhZDtcbiAgY29uc3QgbmV3SGVhZCA9IG5ld1BhZ2UuaGVhZDtcbiAgb2xkUGFnZUxhdGVzdC5yZXBsYWNlV2l0aChuZXdQYWdlTGF0ZXN0KTtcbiAge1xuICAgIGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpPy5yZXBsYWNlV2l0aChcbiAgICAgIG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIikgPz8gXCJcIlxuICAgICk7XG4gICAgY29uc3QgdXBkYXRlID0gKHRhcmdldExpc3QsIG1hdGNoQWdhaW5zdCwgYWN0aW9uKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHRhcmdldDIgb2YgdGFyZ2V0TGlzdCkge1xuICAgICAgICBjb25zdCBtYXRjaGluZyA9IG1hdGNoQWdhaW5zdC5maW5kKChuKSA9PiBuLmlzRXF1YWxOb2RlKHRhcmdldDIpKTtcbiAgICAgICAgaWYgKG1hdGNoaW5nKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9uKHRhcmdldDIpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb2xkVGFncyA9IFtcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSlcbiAgICBdO1xuICAgIGNvbnN0IG5ld1RhZ3MgPSBbXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpXG4gICAgXTtcbiAgICB1cGRhdGUobmV3VGFncywgb2xkVGFncywgKG5vZGUpID0+IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobm9kZSkpO1xuICAgIHVwZGF0ZShvbGRUYWdzLCBuZXdUYWdzLCAobm9kZSkgPT4gbm9kZS5yZW1vdmUoKSk7XG4gIH1cbiAgaWYgKHB1c2hTdGF0ZSkgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0VVJMLmhyZWYpO1xuICBsb2FkSG9va01hbmFnZXIuY2FsbENsZWFudXBGdW5jdGlvbnMoKTtcbiAge1xuICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgbmF2aWdhdGlvbkNhbGxiYWNrcykge1xuICAgICAgY2FsbGJhY2socGF0aG5hbWUpO1xuICAgIH1cbiAgfVxuICBhd2FpdCBsb2FkUGFnZSgpO1xuICBpZiAodGFyZ2V0VVJMLmhhc2gpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRVUkwuaGFzaC5zbGljZSgxKSk/LnNjcm9sbEludG9WaWV3KCk7XG4gIH1cbn07XG5mdW5jdGlvbiBzYWZlUGVyY2VudERlY29kZShpbnB1dCkge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZShcbiAgICAvJVswLTlBLUZhLWZdezJ9L2csXG4gICAgKG0pID0+IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobS5zbGljZSgxKSwgMTYpKVxuICApO1xufVxuZnVuY3Rpb24gc2FuaXRpemVQYXRobmFtZShwYXRobmFtZSA9IFwiXCIpIHtcbiAgaWYgKCFwYXRobmFtZSkgcmV0dXJuIFwiL1wiO1xuICBwYXRobmFtZSA9IHNhZmVQZXJjZW50RGVjb2RlKHBhdGhuYW1lKTtcbiAgcGF0aG5hbWUgPSBcIi9cIiArIHBhdGhuYW1lO1xuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1xcLysvZywgXCIvXCIpO1xuICBjb25zdCBzZWdtZW50cyA9IHBhdGhuYW1lLnNwbGl0KFwiL1wiKTtcbiAgY29uc3QgcmVzb2x2ZWQgPSBbXTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgaWYgKCFzZWdtZW50IHx8IHNlZ21lbnQgPT09IFwiLlwiKSBjb250aW51ZTtcbiAgICBpZiAoc2VnbWVudCA9PT0gXCIuLlwiKSB7XG4gICAgICByZXNvbHZlZC5wb3AoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXNvbHZlZC5wdXNoKHNlZ21lbnQpO1xuICB9XG4gIGNvbnN0IGVuY29kZWQgPSByZXNvbHZlZC5tYXAoKHMpID0+IGVuY29kZVVSSUNvbXBvbmVudChzKSk7XG4gIHJldHVybiBcIi9cIiArIGVuY29kZWQuam9pbihcIi9cIik7XG59XG5hc3luYyBmdW5jdGlvbiBnZXRQYWdlRGF0YShwYXRobmFtZSkge1xuICBjb25zdCBkYXRhU2NyaXB0VGFnID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgaWYgKCFkYXRhU2NyaXB0VGFnKSB7XG4gICAgREVWX0JVSUxEICYmIGVycm9yT3V0KGBGYWlsZWQgdG8gZmluZCBzY3JpcHQgdGFnIGZvciBxdWVyeTpzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBpbXBvcnQoZGF0YVNjcmlwdFRhZy5zcmMpO1xuICBjb25zdCB7XG4gICAgc3ViamVjdHMsXG4gICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgb2JzZXJ2ZXJzLFxuICAgIG9ic2VydmVyT3B0aW9uc1xuICB9ID0gZGF0YTtcbiAgaWYgKCFldmVudExpc3RlbmVyT3B0aW9ucyB8fCAhZXZlbnRMaXN0ZW5lcnMgfHwgIW9ic2VydmVycyB8fCAhc3ViamVjdHMgfHwgIW9ic2VydmVyT3B0aW9ucykge1xuICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgUG9zc2libHkgbWFsZm9ybWVkIHBhZ2UgZGF0YSAke2RhdGF9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuZnVuY3Rpb24gZXJyb3JPdXQobWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUGFnZSgpIHtcbiAgd2luZG93Lm9ucG9wc3RhdGUgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICBhd2FpdCBuYXZpZ2F0ZUxvY2FsbHkodGFyZ2V0LmxvY2F0aW9uLmhyZWYsIGZhbHNlKTtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXQubG9jYXRpb24uaHJlZik7XG4gIH07XG4gIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICBjb25zdCB7XG4gICAgc3ViamVjdHMsXG4gICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgb2JzZXJ2ZXJzLFxuICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICBsb2FkSG9va3NcbiAgfSA9IGF3YWl0IGdldFBhZ2VEYXRhKHBhdGhuYW1lKTtcbiAgREVWX0JVSUxEOiB7XG4gICAgZ2xvYmFsVGhpcy5kZXZ0b29scyA9IHtcbiAgICAgIHBhZ2VEYXRhOiB7XG4gICAgICAgIHN1YmplY3RzLFxuICAgICAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgICAgIG9ic2VydmVycyxcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zLFxuICAgICAgICBsb2FkSG9va3NcbiAgICAgIH0sXG4gICAgICBzdGF0ZU1hbmFnZXIsXG4gICAgICBldmVudExpc3RlbmVyTWFuYWdlcixcbiAgICAgIG9ic2VydmVyTWFuYWdlcixcbiAgICAgIGxvYWRIb29rTWFuYWdlclxuICAgIH07XG4gIH1cbiAgZ2xvYmFsVGhpcy5lbGVnYW5jZUNsaWVudCA9IHtcbiAgICBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50LFxuICAgIGZldGNoUGFnZSxcbiAgICBuYXZpZ2F0ZUxvY2FsbHksXG4gICAgb25OYXZpZ2F0ZSxcbiAgICByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2tcbiAgfTtcbiAgc3RhdGVNYW5hZ2VyLmxvYWRWYWx1ZXMoc3ViamVjdHMpO1xuICBldmVudExpc3RlbmVyTWFuYWdlci5sb2FkVmFsdWVzKGV2ZW50TGlzdGVuZXJzKTtcbiAgZXZlbnRMaXN0ZW5lck1hbmFnZXIuaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gIG9ic2VydmVyTWFuYWdlci5sb2FkVmFsdWVzKG9ic2VydmVycyk7XG4gIG9ic2VydmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucyk7XG4gIG9ic2VydmVyTWFuYWdlci50cmFuc2Zvcm1TdWJqZWN0T2JzZXJ2ZXJOb2RlcygpO1xuICBsb2FkSG9va01hbmFnZXIubG9hZFZhbHVlcyhsb2FkSG9va3MpO1xufVxubG9hZFBhZ2UoKTtcbmV4cG9ydCB7XG4gIENsaWVudFN1YmplY3QsXG4gIEV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICBMb2FkSG9va01hbmFnZXIsXG4gIE9ic2VydmVyTWFuYWdlcixcbiAgU3RhdGVNYW5hZ2VyXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQ0EsTUFBSSx1QkFBdUIsTUFBTTtBQUFBLEVBQ2pDO0FBQ0EsV0FBUyxZQUFZLE9BQU87QUFDMUIsUUFBSSxVQUFVLFFBQVEsVUFBVSxXQUFXLE9BQU8sVUFBVSxZQUFZLE1BQU0sUUFBUSxLQUFLLEtBQUssaUJBQWlCLGlCQUFrQixRQUFPO0FBQzFJLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxrQkFBa0IsTUFBTTtBQUFBLElBQzFCLFlBQVksS0FBSyxVQUFVLENBQUMsR0FBRyxXQUFXLE1BQU07QUFDOUMsV0FBSyxNQUFNO0FBQ1gsVUFBSSxZQUFZLE9BQU8sR0FBRztBQUN4QixZQUFJLEtBQUssZ0JBQWdCLE1BQU0sT0FBTztBQUNwQyxrQkFBUSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUNwRSxnQkFBTTtBQUFBLFFBQ1I7QUFDQSxhQUFLLFdBQVcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUM7QUFDM0MsYUFBSyxVQUFVLENBQUM7QUFBQSxNQUNsQixPQUFPO0FBQ0wsYUFBSyxVQUFVO0FBQ2YsYUFBSyxXQUFXO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxrQkFBa0I7QUFDaEIsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLDhCQUE4QjtBQUFBLElBQ2hDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGtCQUFrQjtBQUFBLElBQ3BCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSw2QkFBNkI7QUFBQSxJQUMvQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxvQkFBb0I7QUFBQSxJQUN0QjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxXQUFXLENBQUM7QUFDaEIsTUFBSSx1QkFBdUIsQ0FBQztBQUM1QixXQUFTLHFCQUFxQixLQUFLO0FBQ2pDLFlBQVEsQ0FBQyxZQUFZLGFBQWEsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLFFBQVE7QUFBQSxFQUM5RTtBQUNBLFdBQVMsaUNBQWlDLEtBQUs7QUFDN0MsWUFBUSxDQUFDLFlBQVksSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLElBQUk7QUFBQSxFQUM3RDtBQUNBLGFBQVcsT0FBTyxnQkFBaUIsVUFBUyxHQUFHLElBQUkscUJBQXFCLEdBQUc7QUFDM0UsYUFBVyxPQUFPLGVBQWdCLFVBQVMsR0FBRyxJQUFJLHFCQUFxQixHQUFHO0FBQzFFLGFBQVcsT0FBTyxrQkFBbUIsVUFBUyxHQUFHLElBQUkscUJBQXFCLEdBQUc7QUFDN0UsYUFBVyxPQUFPO0FBQ2hCLHlCQUFxQixHQUFHLElBQUksaUNBQWlDLEdBQUc7QUFDbEUsYUFBVyxPQUFPO0FBQ2hCLHlCQUFxQixHQUFHLElBQUksaUNBQWlDLEdBQUc7QUFDbEUsYUFBVyxPQUFPO0FBQ2hCLHlCQUFxQixHQUFHLElBQUksaUNBQWlDLEdBQUc7QUFDbEUsTUFBSSxjQUFjO0FBQUEsSUFDaEIsR0FBRztBQUFBLElBQ0gsR0FBRztBQUFBLEVBQ0w7QUFHQSxTQUFPLE9BQU8sUUFBUSxXQUFXO0FBQ2pDLE1BQUksV0FBVyxNQUFNO0FBQ3JCLE1BQUksWUFBWTtBQUNoQixXQUFTLGFBQWE7QUFDcEI7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMscUNBQXFDLFNBQVM7QUFDckQsUUFBSSx3QkFBd0IsQ0FBQztBQUM3QixVQUFNLGFBQWEsU0FBUyxjQUFjLFFBQVEsR0FBRztBQUNyRDtBQUNFLFlBQU0sVUFBVSxPQUFPLFFBQVEsUUFBUSxPQUFPO0FBQzlDLGlCQUFXLENBQUMsWUFBWSxXQUFXLEtBQUssU0FBUztBQUMvQyxZQUFJLHVCQUF1QixzQkFBc0I7QUFDL0Msc0JBQVksT0FBTyxTQUFTLFVBQVU7QUFDdEMsZ0JBQU0sYUFBYSxXQUFXLEVBQUUsU0FBUztBQUN6QyxnQ0FBc0IsS0FBSyxFQUFFLFlBQVksWUFBWSxZQUFZLENBQUM7QUFBQSxRQUNwRSxPQUFPO0FBQ0wscUJBQVcsYUFBYSxZQUFZLEdBQUcsV0FBVyxFQUFFO0FBQUEsUUFDdEQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLFFBQUksUUFBUSxLQUFLO0FBQ2YsaUJBQVcsYUFBYSxPQUFPLFFBQVEsR0FBRztBQUFBLElBQzVDO0FBQ0E7QUFDRSxVQUFJLFFBQVEsYUFBYSxNQUFNO0FBQzdCLG1CQUFXLFNBQVMsUUFBUSxVQUFVO0FBQ3BDLGdCQUFNLFNBQVMsNkJBQTZCLEtBQUs7QUFDakQscUJBQVcsWUFBWSxPQUFPLElBQUk7QUFDbEMsZ0NBQXNCLEtBQUssR0FBRyxPQUFPLHFCQUFxQjtBQUFBLFFBQzVEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFDQSxXQUFPLEVBQUUsTUFBTSxZQUFZLHNCQUFzQjtBQUFBLEVBQ25EO0FBQ0EsV0FBUyw2QkFBNkIsU0FBUztBQUM3QyxRQUFJLHdCQUF3QixDQUFDO0FBQzdCLFFBQUksWUFBWSxVQUFVLFlBQVksTUFBTTtBQUMxQyxhQUFPLEVBQUUsTUFBTSxTQUFTLGVBQWUsRUFBRSxHQUFHLHVCQUF1QixDQUFDLEVBQUU7QUFBQSxJQUN4RTtBQUNBLFlBQVEsT0FBTyxTQUFTO0FBQUEsTUFDdEIsS0FBSztBQUNILFlBQUksTUFBTSxRQUFRLE9BQU8sR0FBRztBQUMxQixnQkFBTSxXQUFXLFNBQVMsdUJBQXVCO0FBQ2pELHFCQUFXLGNBQWMsU0FBUztBQUNoQyxrQkFBTSxTQUFTLDZCQUE2QixVQUFVO0FBQ3RELHFCQUFTLFlBQVksT0FBTyxJQUFJO0FBQ2hDLGtDQUFzQixLQUFLLEdBQUcsT0FBTyxxQkFBcUI7QUFBQSxVQUM1RDtBQUNBLGlCQUFPLEVBQUUsTUFBTSxVQUFVLHNCQUFzQjtBQUFBLFFBQ2pEO0FBQ0EsWUFBSSxtQkFBbUIsaUJBQWlCO0FBQ3RDLGlCQUFPLHFDQUFxQyxPQUFPO0FBQUEsUUFDckQ7QUFDQSxjQUFNLElBQUksTUFBTSxrU0FBa1M7QUFBQSxNQUNwVCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0gsY0FBTSxPQUFPLE9BQU8sWUFBWSxXQUFXLFVBQVUsUUFBUSxTQUFTO0FBQ3RFLGNBQU0sV0FBVyxTQUFTLGVBQWUsSUFBSTtBQUM3QyxlQUFPLEVBQUUsTUFBTSxVQUFVLHVCQUF1QixDQUFDLEVBQUU7QUFBQSxNQUNyRDtBQUNFLGNBQU0sSUFBSSxNQUFNLHdJQUF3STtBQUFBLElBQzVKO0FBQUEsRUFDRjtBQUNBLEdBQWMsTUFBTTtBQUNsQixRQUFJLFlBQVk7QUFDaEIsS0FBQyxTQUFTLFVBQVU7QUFDbEIsWUFBTSxLQUFLLElBQUksWUFBWSwyQ0FBMkM7QUFDdEUsU0FBRyxTQUFTLE1BQU07QUFDaEIsWUFBSSxXQUFXO0FBQ2IsaUJBQU8sU0FBUyxPQUFPO0FBQUEsUUFDekI7QUFBQSxNQUNGO0FBQ0EsU0FBRyxZQUFZLENBQUMsVUFBVTtBQUN4QixZQUFJLE1BQU0sU0FBUyxjQUFjO0FBQy9CLGlCQUFPLFNBQVMsT0FBTztBQUFBLFFBQ3pCO0FBQUEsTUFDRjtBQUNBLFNBQUcsVUFBVSxNQUFNO0FBQ2pCLG9CQUFZO0FBQ1osV0FBRyxNQUFNO0FBQ1QsbUJBQVcsU0FBUyxHQUFHO0FBQUEsTUFDekI7QUFBQSxJQUNGLEdBQUc7QUFBQSxFQUNMLEdBQUc7QUFDSCxNQUFJLGdCQUFnQixNQUFNO0FBQUEsSUFDeEIsWUFBWSxJQUFJLE9BQU87QUFDckIsV0FBSyxZQUE0QixvQkFBSSxJQUFJO0FBQ3pDLFdBQUssU0FBUztBQUNkLFdBQUssS0FBSztBQUFBLElBQ1o7QUFBQSxJQUNBLElBQUksUUFBUTtBQUNWLGFBQU8sS0FBSztBQUFBLElBQ2Q7QUFBQSxJQUNBLElBQUksTUFBTSxVQUFVO0FBQ2xCLFdBQUssU0FBUztBQUNkLGlCQUFXLFlBQVksS0FBSyxVQUFVLE9BQU8sR0FBRztBQUM5QyxpQkFBUyxRQUFRO0FBQUEsTUFDbkI7QUFBQSxJQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsbUJBQW1CO0FBQ2pCLGlCQUFXLFlBQVksS0FBSyxVQUFVLE9BQU8sR0FBRztBQUM5QyxpQkFBUyxLQUFLLE1BQU07QUFBQSxNQUN0QjtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBV0EsUUFBUSxJQUFJLFVBQVU7QUFDcEIsVUFBSSxLQUFLLFVBQVUsSUFBSSxFQUFFLEdBQUc7QUFDMUIsYUFBSyxVQUFVLE9BQU8sRUFBRTtBQUFBLE1BQzFCO0FBQ0EsV0FBSyxVQUFVLElBQUksSUFBSSxRQUFRO0FBQy9CLGVBQVMsS0FBSyxLQUFLO0FBQUEsSUFDckI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsVUFBVSxJQUFJO0FBQ1osV0FBSyxVQUFVLE9BQU8sRUFBRTtBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNBLE1BQUksZUFBZSxNQUFNO0FBQUEsSUFDdkIsY0FBYztBQUNaLFdBQUssV0FBMkIsb0JBQUksSUFBSTtBQUFBLElBQzFDO0FBQUEsSUFDQSxXQUFXLFFBQVEsY0FBYyxPQUFPO0FBQ3RDLGlCQUFXLFNBQVMsUUFBUTtBQUMxQixZQUFJLEtBQUssU0FBUyxJQUFJLE1BQU0sRUFBRSxLQUFLLGdCQUFnQixNQUFPO0FBQzFELGNBQU0sZ0JBQWdCLElBQUksY0FBYyxNQUFNLElBQUksTUFBTSxLQUFLO0FBQzdELGFBQUssU0FBUyxJQUFJLE1BQU0sSUFBSSxhQUFhO0FBQUEsTUFDM0M7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJLElBQUk7QUFDTixhQUFPLEtBQUssU0FBUyxJQUFJLEVBQUU7QUFBQSxJQUM3QjtBQUFBLElBQ0EsT0FBTyxLQUFLO0FBQ1YsWUFBTSxVQUFVLENBQUM7QUFDakIsaUJBQVcsTUFBTSxLQUFLO0FBQ3BCLGdCQUFRLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUFBLE1BQzNCO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsTUFBSSxzQkFBc0IsTUFBTTtBQUFBLElBQzlCLFlBQVksSUFBSSxVQUFVLGNBQWM7QUFDdEMsV0FBSyxLQUFLO0FBQ1YsV0FBSyxXQUFXO0FBQ2hCLFdBQUssZUFBZTtBQUFBLElBQ3RCO0FBQUEsSUFDQSxLQUFLLElBQUk7QUFDUCxZQUFNLGVBQWUsYUFBYSxPQUFPLEtBQUssWUFBWTtBQUMxRCxXQUFLLFNBQVMsSUFBSSxHQUFHLFlBQVk7QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFDQSxNQUFJLHVCQUF1QixNQUFNO0FBQUEsSUFDL0IsY0FBYztBQUNaLFdBQUssaUJBQWlDLG9CQUFJLElBQUk7QUFBQSxJQUNoRDtBQUFBLElBQ0EsV0FBVyxzQkFBc0IsYUFBYSxPQUFPO0FBQ25ELGlCQUFXLHVCQUF1QixzQkFBc0I7QUFDdEQsWUFBSSxLQUFLLGVBQWUsSUFBSSxvQkFBb0IsRUFBRSxLQUFLLGVBQWUsTUFBTztBQUM3RSxjQUFNLHNCQUFzQixJQUFJLG9CQUFvQixvQkFBb0IsSUFBSSxvQkFBb0IsVUFBVSxvQkFBb0IsWUFBWTtBQUMxSSxhQUFLLGVBQWUsSUFBSSxvQkFBb0IsSUFBSSxtQkFBbUI7QUFBQSxNQUNyRTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWMsc0JBQXNCO0FBQ2xDLGlCQUFXLHVCQUF1QixzQkFBc0I7QUFDdEQsY0FBTSxVQUFVLFNBQVMsY0FBYyxTQUFTLG9CQUFvQixHQUFHLElBQUk7QUFDM0UsWUFBSSxDQUFDLFNBQVM7QUFDWixVQUFhLFNBQVMsOERBQThELG9CQUFvQixNQUFNLHNCQUFzQjtBQUNwSTtBQUFBLFFBQ0Y7QUFDQSxjQUFNLGdCQUFnQixLQUFLLGVBQWUsSUFBSSxvQkFBb0IsRUFBRTtBQUNwRSxZQUFJLENBQUMsZUFBZTtBQUNsQixVQUFhLFNBQVMsK0RBQStELG9CQUFvQixLQUFLLG1CQUFtQjtBQUNqSTtBQUFBLFFBQ0Y7QUFDQSxnQkFBUSxvQkFBb0IsTUFBTSxJQUFJLENBQUMsT0FBTztBQUM1Qyx3QkFBYyxLQUFLLEVBQUU7QUFBQSxRQUN2QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJLElBQUk7QUFDTixhQUFPLEtBQUssZUFBZSxJQUFJLEVBQUU7QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFDQSxNQUFJLGlCQUFpQixNQUFNO0FBQUEsSUFDekIsWUFBWSxJQUFJLFVBQVUsY0FBYztBQUN0QyxXQUFLLGdCQUFnQixDQUFDO0FBQ3RCLFdBQUssV0FBVyxDQUFDO0FBQ2pCLFdBQUssS0FBSztBQUNWLFdBQUssV0FBVztBQUNoQixXQUFLLGVBQWU7QUFDcEIsWUFBTSxnQkFBZ0IsYUFBYSxPQUFPLEtBQUssWUFBWTtBQUMzRCxpQkFBVyxnQkFBZ0IsZUFBZTtBQUN4QyxjQUFNLE1BQU0sS0FBSyxjQUFjO0FBQy9CLGFBQUssY0FBYyxLQUFLLGFBQWEsS0FBSztBQUMxQyxxQkFBYSxRQUFRLEtBQUssSUFBSSxDQUFDLGFBQWE7QUFDMUMsZUFBSyxjQUFjLEdBQUcsSUFBSTtBQUMxQixlQUFLLEtBQUs7QUFBQSxRQUNaLENBQUM7QUFBQSxNQUNIO0FBQ0EsV0FBSyxLQUFLO0FBQUEsSUFDWjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSUEsV0FBVyxTQUFTLFlBQVk7QUFDOUIsV0FBSyxTQUFTLEtBQUssRUFBRSxTQUFTLFdBQVcsQ0FBQztBQUFBLElBQzVDO0FBQUEsSUFDQSxRQUFRLFNBQVMsS0FBSyxPQUFPO0FBQzNCLFVBQUksUUFBUSxTQUFTO0FBQ25CLGdCQUFRLFlBQVk7QUFBQSxNQUN0QixXQUFXLFFBQVEsV0FBVyxPQUFPLFVBQVUsVUFBVTtBQUN2RCxlQUFPLE9BQU8sUUFBUSxPQUFPLEtBQUs7QUFBQSxNQUNwQyxXQUFXLElBQUksV0FBVyxJQUFJLEtBQUssT0FBTyxVQUFVLFlBQVk7QUFDOUQsZ0JBQVEsaUJBQWlCLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSztBQUFBLE1BQzlDLFdBQVcsT0FBTyxTQUFTO0FBQ3pCLGNBQU0sV0FBVyxVQUFVLFVBQVUsVUFBVTtBQUMvQyxZQUFJLFVBQVU7QUFDWixrQkFBUSxHQUFHLElBQUksUUFBUSxLQUFLO0FBQUEsUUFDOUIsT0FBTztBQUNMLGtCQUFRLEdBQUcsSUFBSTtBQUFBLFFBQ2pCO0FBQUEsTUFDRixPQUFPO0FBQ0wsZ0JBQVEsYUFBYSxLQUFLLEtBQUs7QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFDTCxZQUFNLFdBQVcsS0FBSyxTQUFTLEdBQUcsS0FBSyxhQUFhO0FBQ3BELGlCQUFXLEVBQUUsU0FBUyxXQUFXLEtBQUssS0FBSyxVQUFVO0FBQ25ELGFBQUssUUFBUSxTQUFTLFlBQVksUUFBUTtBQUFBLE1BQzVDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGtCQUFrQixNQUFNO0FBQUEsSUFDMUIsY0FBYztBQUNaLFdBQUssa0JBQWtDLG9CQUFJLElBQUk7QUFBQSxJQUNqRDtBQUFBLElBQ0EsV0FBVyxpQkFBaUIsYUFBYSxPQUFPO0FBQzlDLGlCQUFXLGtCQUFrQixpQkFBaUI7QUFDNUMsWUFBSSxLQUFLLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxLQUFLLGVBQWUsTUFBTztBQUN6RSxjQUFNLGlCQUFpQixJQUFJLGVBQWUsZUFBZSxJQUFJLGVBQWUsVUFBVSxlQUFlLFlBQVk7QUFDakgsYUFBSyxnQkFBZ0IsSUFBSSxlQUFlLElBQUksY0FBYztBQUFBLE1BQzVEO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYyxpQkFBaUI7QUFDN0IsaUJBQVcsa0JBQWtCLGlCQUFpQjtBQUM1QyxjQUFNLFVBQVUsU0FBUyxjQUFjLFNBQVMsZUFBZSxHQUFHLElBQUk7QUFDdEUsWUFBSSxDQUFDLFNBQVM7QUFDWixVQUFhLFNBQVMsOERBQThELGVBQWUsTUFBTSxzQkFBc0I7QUFDL0g7QUFBQSxRQUNGO0FBQ0EsY0FBTSxXQUFXLEtBQUssZ0JBQWdCLElBQUksZUFBZSxFQUFFO0FBQzNELFlBQUksQ0FBQyxVQUFVO0FBQ2IsVUFBYSxTQUFTLG9EQUFvRCxlQUFlLEtBQUssbUJBQW1CO0FBQ2pIO0FBQUEsUUFDRjtBQUNBLGlCQUFTLFdBQVcsU0FBUyxlQUFlLE1BQU07QUFDbEQsaUJBQVMsS0FBSztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSUEsZ0NBQWdDO0FBQzlCLFlBQU0sZ0JBQWdCLFNBQVMsU0FBUyxpQkFBaUIsYUFBYSxDQUFDO0FBQ3ZFLGlCQUFXLFFBQVEsZUFBZTtBQUNoQyxZQUFJLFVBQVUsU0FBUyxPQUFPO0FBQzVCLG1CQUFTLGNBQWM7QUFBQSxRQUN6QjtBQUNBLFlBQUksU0FBUztBQUNiLGNBQU0sWUFBWSxLQUFLLGFBQWEsR0FBRztBQUN2QyxjQUFNLFVBQVUsYUFBYSxJQUFJLFNBQVM7QUFDMUMsWUFBSSxDQUFDLFNBQVM7QUFDWixvQkFBVyxVQUFTLG9DQUFvQyxZQUFZLG9CQUFvQjtBQUN4RjtBQUFBLFFBQ0Y7QUFDQSxjQUFNLFdBQVcsU0FBUyxlQUFlLFFBQVEsS0FBSztBQUN0RCxjQUFNLEtBQUssV0FBVyxFQUFFLFNBQVM7QUFDakMsZ0JBQVEsUUFBUSxJQUFJLE9BQU87QUFDM0IsZ0JBQVEsUUFBUSxLQUFLO0FBQ3JCLGFBQUssWUFBWSxRQUFRO0FBQUEsTUFDM0I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksa0JBQWtCLE1BQU07QUFBQSxJQUMxQixjQUFjO0FBQ1osV0FBSyxvQkFBb0IsQ0FBQztBQUMxQixXQUFLLGtCQUFrQixDQUFDO0FBQUEsSUFDMUI7QUFBQSxJQUNBLFdBQVcsV0FBVztBQUNwQixpQkFBVyxZQUFZLFdBQVc7QUFDaEMsY0FBTSxlQUFlLGFBQWEsT0FBTyxTQUFTLFlBQVk7QUFDOUQsWUFBSSxLQUFLLGdCQUFnQixTQUFTLFNBQVMsRUFBRSxHQUFHO0FBQzlDO0FBQUEsUUFDRjtBQUNBLGFBQUssZ0JBQWdCLEtBQUssU0FBUyxFQUFFO0FBQ3JDLGNBQU0sa0JBQWtCLFNBQVMsU0FBUyxHQUFHLFlBQVk7QUFDekQsWUFBSSxpQkFBaUI7QUFDbkIsZUFBSyxrQkFBa0IsS0FBSztBQUFBLFlBQzFCLE1BQU0sU0FBUztBQUFBLFlBQ2Y7QUFBQSxZQUNBLFVBQVUsU0FBUztBQUFBLFlBQ25CLGFBQWEsS0FBSyxnQkFBZ0IsU0FBUztBQUFBLFVBQzdDLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUNyQixVQUFJLHNCQUFzQixDQUFDO0FBQzNCLGlCQUFXLG9CQUFvQixLQUFLLG1CQUFtQjtBQUNyRCxZQUFJLGlCQUFpQixTQUFTLEdBQXlCO0FBQ3JELGdCQUFNLFlBQVksaUJBQWlCLE9BQU8sU0FBUyxRQUFRLEVBQUUsV0FBVyxpQkFBaUIsUUFBUTtBQUNqRyxjQUFJLFdBQVc7QUFDYixnQ0FBb0IsS0FBSyxnQkFBZ0I7QUFDekM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUNBLHlCQUFpQixnQkFBZ0I7QUFDakMsYUFBSyxnQkFBZ0IsT0FBTyxpQkFBaUIsYUFBYSxDQUFDO0FBQUEsTUFDN0Q7QUFDQSxXQUFLLG9CQUFvQjtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUNBLE1BQUksa0JBQWtCLElBQUksZ0JBQWdCO0FBQzFDLE1BQUksdUJBQXVCLElBQUkscUJBQXFCO0FBQ3BELE1BQUksZUFBZSxJQUFJLGFBQWE7QUFDcEMsTUFBSSxrQkFBa0IsSUFBSSxnQkFBZ0I7QUFDMUMsTUFBSSxrQkFBa0Msb0JBQUksSUFBSTtBQUM5QyxNQUFJLFlBQVksSUFBSSxVQUFVO0FBQzlCLE1BQUksZ0JBQWdCLElBQUksY0FBYztBQUN0QyxNQUFJLFlBQVksT0FBTyxjQUFjO0FBQ25DLFVBQU0sV0FBVyxpQkFBaUIsVUFBVSxRQUFRO0FBQ3BELFFBQUksZ0JBQWdCLElBQUksUUFBUSxHQUFHO0FBQ2pDLGFBQU8sVUFBVSxnQkFBZ0IsZ0JBQWdCLElBQUksUUFBUSxHQUFHLFdBQVc7QUFBQSxJQUM3RTtBQUNBLFVBQU0sTUFBTSxNQUFNLE1BQU0sU0FBUztBQUNqQyxVQUFNLFNBQVMsVUFBVSxnQkFBZ0IsTUFBTSxJQUFJLEtBQUssR0FBRyxXQUFXO0FBQ3RFO0FBQ0UsWUFBTSxjQUFjLFNBQVMsT0FBTyxpQkFBaUIsNkJBQTZCLENBQUM7QUFDbkYsWUFBTSxpQkFBaUIsU0FBUyxTQUFTLEtBQUssaUJBQWlCLDZCQUE2QixDQUFDO0FBQzdGLGlCQUFXLGNBQWMsYUFBYTtBQUNwQyxjQUFNLFdBQVcsZUFBZSxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsV0FBVyxHQUFHO0FBQ3BFLFlBQUksVUFBVTtBQUNaO0FBQUEsUUFDRjtBQUNBLGlCQUFTLEtBQUssWUFBWSxVQUFVO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQ0E7QUFDRSxZQUFNLGlCQUFpQixPQUFPLGNBQWMsMkNBQTJDLFFBQVEsSUFBSTtBQUNuRyxZQUFNLE9BQU8sZUFBZTtBQUM1QixxQkFBZSxPQUFPO0FBQ3RCLFlBQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pELFlBQU0sTUFBTSxJQUFJLGdCQUFnQixJQUFJO0FBQ3BDLFlBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxhQUFPLE1BQU07QUFDYixhQUFPLE9BQU87QUFDZCxhQUFPLGFBQWEsYUFBYSxNQUFNO0FBQ3ZDLGFBQU8sYUFBYSxpQkFBaUIsR0FBRyxRQUFRLEVBQUU7QUFDbEQsYUFBTyxLQUFLLFlBQVksTUFBTTtBQUFBLElBQ2hDO0FBQ0Esb0JBQWdCLElBQUksVUFBVSxjQUFjLGtCQUFrQixNQUFNLENBQUM7QUFDckUsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLHNCQUFzQixDQUFDO0FBQzNCLFdBQVMsV0FBVyxVQUFVO0FBQzVCLHdCQUFvQixLQUFLLFFBQVE7QUFDakMsV0FBTyxvQkFBb0IsU0FBUztBQUFBLEVBQ3RDO0FBQ0EsV0FBUyx5QkFBeUIsS0FBSztBQUNyQyx3QkFBb0IsT0FBTyxLQUFLLENBQUM7QUFBQSxFQUNuQztBQUNBLE1BQUksa0JBQWtCLE9BQU8sUUFBUSxZQUFZLFNBQVM7QUFDeEQsVUFBTSxZQUFZLElBQUksSUFBSSxNQUFNO0FBQ2hDLFVBQU0sV0FBVyxpQkFBaUIsVUFBVSxRQUFRO0FBQ3BELFFBQUksVUFBVSxNQUFNLFVBQVUsU0FBUztBQUN2QyxRQUFJLENBQUMsUUFBUztBQUNkLFFBQUksZ0JBQWdCLFNBQVM7QUFDN0IsUUFBSSxnQkFBZ0IsUUFBUTtBQUM1QjtBQUNFLFlBQU0saUJBQWlCLFNBQVMsUUFBUSxpQkFBaUIscUJBQXFCLENBQUM7QUFDL0UsWUFBTSxpQkFBaUIsU0FBUyxTQUFTLGlCQUFpQixxQkFBcUIsQ0FBQztBQUNoRixZQUFNLE9BQU8sS0FBSyxJQUFJLGVBQWUsUUFBUSxlQUFlLE1BQU07QUFDbEUsZUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLEtBQUs7QUFDN0IsY0FBTSxnQkFBZ0IsZUFBZSxDQUFDO0FBQ3RDLGNBQU0sZ0JBQWdCLGVBQWUsQ0FBQztBQUN0QyxjQUFNLGNBQWMsY0FBYyxhQUFhLFdBQVc7QUFDMUQsY0FBTSxjQUFjLGNBQWMsYUFBYSxXQUFXO0FBQzFELFlBQUksZ0JBQWdCLGFBQWE7QUFDL0I7QUFBQSxRQUNGO0FBQ0Esd0JBQWdCLGNBQWM7QUFDOUIsd0JBQWdCLGNBQWM7QUFBQSxNQUNoQztBQUFBLElBQ0Y7QUFDQSxVQUFNLE9BQU8sU0FBUztBQUN0QixVQUFNLFVBQVUsUUFBUTtBQUN4QixrQkFBYyxZQUFZLGFBQWE7QUFDdkM7QUFDRSxlQUFTLEtBQUssY0FBYyxPQUFPLEdBQUc7QUFBQSxRQUNwQyxRQUFRLEtBQUssY0FBYyxPQUFPLEtBQUs7QUFBQSxNQUN6QztBQUNBLFlBQU0sU0FBUyxDQUFDLFlBQVksY0FBYyxXQUFXO0FBQ25ELG1CQUFXLFdBQVcsWUFBWTtBQUNoQyxnQkFBTSxXQUFXLGFBQWEsS0FBSyxDQUFDLE1BQU0sRUFBRSxZQUFZLE9BQU8sQ0FBQztBQUNoRSxjQUFJLFVBQVU7QUFDWjtBQUFBLFVBQ0Y7QUFDQSxpQkFBTyxPQUFPO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQ0EsWUFBTSxVQUFVO0FBQUEsUUFDZCxHQUFHLFNBQVMsS0FBSyxpQkFBaUIsTUFBTSxDQUFDO0FBQUEsUUFDekMsR0FBRyxTQUFTLEtBQUssaUJBQWlCLE1BQU0sQ0FBQztBQUFBLFFBQ3pDLEdBQUcsU0FBUyxLQUFLLGlCQUFpQixRQUFRLENBQUM7QUFBQSxRQUMzQyxHQUFHLFNBQVMsS0FBSyxpQkFBaUIsTUFBTSxDQUFDO0FBQUEsUUFDekMsR0FBRyxTQUFTLEtBQUssaUJBQWlCLE9BQU8sQ0FBQztBQUFBLE1BQzVDO0FBQ0EsWUFBTSxVQUFVO0FBQUEsUUFDZCxHQUFHLFNBQVMsUUFBUSxpQkFBaUIsTUFBTSxDQUFDO0FBQUEsUUFDNUMsR0FBRyxTQUFTLFFBQVEsaUJBQWlCLE1BQU0sQ0FBQztBQUFBLFFBQzVDLEdBQUcsU0FBUyxRQUFRLGlCQUFpQixRQUFRLENBQUM7QUFBQSxRQUM5QyxHQUFHLFNBQVMsUUFBUSxpQkFBaUIsTUFBTSxDQUFDO0FBQUEsUUFDNUMsR0FBRyxTQUFTLFFBQVEsaUJBQWlCLE9BQU8sQ0FBQztBQUFBLE1BQy9DO0FBQ0EsYUFBTyxTQUFTLFNBQVMsQ0FBQyxTQUFTLFNBQVMsS0FBSyxZQUFZLElBQUksQ0FBQztBQUNsRSxhQUFPLFNBQVMsU0FBUyxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUM7QUFBQSxJQUNsRDtBQUNBLFFBQUksVUFBVyxTQUFRLFVBQVUsTUFBTSxJQUFJLFVBQVUsSUFBSTtBQUN6RCxvQkFBZ0IscUJBQXFCO0FBQ3JDO0FBQ0UsaUJBQVcsWUFBWSxxQkFBcUI7QUFDMUMsaUJBQVMsUUFBUTtBQUFBLE1BQ25CO0FBQUEsSUFDRjtBQUNBLFVBQU0sU0FBUztBQUNmLFFBQUksVUFBVSxNQUFNO0FBQ2xCLGVBQVMsZUFBZSxVQUFVLEtBQUssTUFBTSxDQUFDLENBQUMsR0FBRyxlQUFlO0FBQUEsSUFDbkU7QUFBQSxFQUNGO0FBQ0EsV0FBUyxrQkFBa0IsT0FBTztBQUNoQyxXQUFPLE1BQU07QUFBQSxNQUNYO0FBQUEsTUFDQSxDQUFDLE1BQU0sT0FBTyxhQUFhLFNBQVMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFBQSxJQUNyRDtBQUFBLEVBQ0Y7QUFDQSxXQUFTLGlCQUFpQixXQUFXLElBQUk7QUFDdkMsUUFBSSxDQUFDLFNBQVUsUUFBTztBQUN0QixlQUFXLGtCQUFrQixRQUFRO0FBQ3JDLGVBQVcsTUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxRQUFRLEdBQUc7QUFDdkMsVUFBTSxXQUFXLFNBQVMsTUFBTSxHQUFHO0FBQ25DLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGVBQVcsV0FBVyxVQUFVO0FBQzlCLFVBQUksQ0FBQyxXQUFXLFlBQVksSUFBSztBQUNqQyxVQUFJLFlBQVksTUFBTTtBQUNwQixpQkFBUyxJQUFJO0FBQ2I7QUFBQSxNQUNGO0FBQ0EsZUFBUyxLQUFLLE9BQU87QUFBQSxJQUN2QjtBQUNBLFVBQU0sVUFBVSxTQUFTLElBQUksQ0FBQyxNQUFNLG1CQUFtQixDQUFDLENBQUM7QUFDekQsV0FBTyxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsRUFDL0I7QUFDQSxpQkFBZSxZQUFZLFVBQVU7QUFDbkMsVUFBTSxnQkFBZ0IsU0FBUyxLQUFLLGNBQWMsMkNBQTJDLFFBQVEsSUFBSTtBQUN6RyxRQUFJLENBQUMsZUFBZTtBQUNsQixNQUFhLFNBQVMsK0VBQStFLFFBQVEsSUFBSTtBQUNqSDtBQUFBLElBQ0Y7QUFDQSxVQUFNLEVBQUUsS0FBSyxJQUFJLE1BQU0sT0FBTyxjQUFjO0FBQzVDLFVBQU07QUFBQSxNQUNKO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0YsSUFBSTtBQUNKLFFBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGlCQUFpQjtBQUMzRixNQUFhLFNBQVMsZ0NBQWdDLElBQUksRUFBRTtBQUM1RDtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsU0FBUyxTQUFTO0FBQ3pCLFVBQU0sSUFBSSxNQUFNLE9BQU87QUFBQSxFQUN6QjtBQUNBLGlCQUFlLFdBQVc7QUFDeEIsV0FBTyxhQUFhLE9BQU8sVUFBVTtBQUNuQyxZQUFNLGVBQWU7QUFDckIsWUFBTSxTQUFTLE1BQU07QUFDckIsWUFBTSxnQkFBZ0IsT0FBTyxTQUFTLE1BQU0sS0FBSztBQUNqRCxjQUFRLGFBQWEsTUFBTSxJQUFJLE9BQU8sU0FBUyxJQUFJO0FBQUEsSUFDckQ7QUFDQSxVQUFNLFdBQVcsaUJBQWlCLE9BQU8sU0FBUyxRQUFRO0FBQzFELFVBQU07QUFBQSxNQUNKO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLElBQUksTUFBTSxZQUFZLFFBQVE7QUFDOUIsZUFBVztBQUNULGlCQUFXLFdBQVc7QUFBQSxRQUNwQixVQUFVO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLGVBQVcsaUJBQWlCO0FBQUEsTUFDMUI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUNBLGlCQUFhLFdBQVcsUUFBUTtBQUNoQyx5QkFBcUIsV0FBVyxjQUFjO0FBQzlDLHlCQUFxQixjQUFjLG9CQUFvQjtBQUN2RCxvQkFBZ0IsV0FBVyxTQUFTO0FBQ3BDLG9CQUFnQixjQUFjLGVBQWU7QUFDN0Msb0JBQWdCLDhCQUE4QjtBQUM5QyxvQkFBZ0IsV0FBVyxTQUFTO0FBQUEsRUFDdEM7QUFDQSxXQUFTOyIsCiAgIm5hbWVzIjogW10KfQo=
