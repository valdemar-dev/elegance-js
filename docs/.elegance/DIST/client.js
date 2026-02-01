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
      for (const { element, optionName } of this.elements) {
        const newValue = this.callback.call(element, ...this.subjectValues);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4gPSBudWxsKSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW29wdGlvbnMsIC4uLmNoaWxkcmVuID8/IFtdXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBjYW5IYXZlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gIH1cbn07XG5cbi8vIHNyYy9lbGVtZW50cy9lbGVtZW50X2xpc3QudHNcbnZhciBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwiYXJlYVwiLFxuICBcImJhc2VcIixcbiAgXCJiclwiLFxuICBcImNvbFwiLFxuICBcImVtYmVkXCIsXG4gIFwiaHJcIixcbiAgXCJpbWdcIixcbiAgXCJpbnB1dFwiLFxuICBcImxpbmtcIixcbiAgXCJtZXRhXCIsXG4gIFwicGFyYW1cIixcbiAgXCJzb3VyY2VcIixcbiAgXCJ0cmFja1wiLFxuICBcIndiclwiXG5dO1xudmFyIGh0bWxFbGVtZW50VGFncyA9IFtcbiAgXCJhXCIsXG4gIFwiYWJiclwiLFxuICBcImFkZHJlc3NcIixcbiAgXCJhcnRpY2xlXCIsXG4gIFwiYXNpZGVcIixcbiAgXCJhdWRpb1wiLFxuICBcImJcIixcbiAgXCJiZGlcIixcbiAgXCJiZG9cIixcbiAgXCJibG9ja3F1b3RlXCIsXG4gIFwiYm9keVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFxuICBcImNhcHRpb25cIixcbiAgXCJjaXRlXCIsXG4gIFwiY29kZVwiLFxuICBcImNvbGdyb3VwXCIsXG4gIFwiZGF0YVwiLFxuICBcImRhdGFsaXN0XCIsXG4gIFwiZGRcIixcbiAgXCJkZWxcIixcbiAgXCJkZXRhaWxzXCIsXG4gIFwiZGZuXCIsXG4gIFwiZGlhbG9nXCIsXG4gIFwiZGl2XCIsXG4gIFwiZGxcIixcbiAgXCJkdFwiLFxuICBcImVtXCIsXG4gIFwiZmllbGRzZXRcIixcbiAgXCJmaWdjYXB0aW9uXCIsXG4gIFwiZmlndXJlXCIsXG4gIFwiZm9vdGVyXCIsXG4gIFwiZm9ybVwiLFxuICBcImgxXCIsXG4gIFwiaDJcIixcbiAgXCJoM1wiLFxuICBcImg0XCIsXG4gIFwiaDVcIixcbiAgXCJoNlwiLFxuICBcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcbiAgXCJoZ3JvdXBcIixcbiAgXCJodG1sXCIsXG4gIFwiaVwiLFxuICBcImlmcmFtZVwiLFxuICBcImluc1wiLFxuICBcImtiZFwiLFxuICBcImxhYmVsXCIsXG4gIFwibGVnZW5kXCIsXG4gIFwibGlcIixcbiAgXCJtYWluXCIsXG4gIFwibWFwXCIsXG4gIFwibWFya1wiLFxuICBcIm1lbnVcIixcbiAgXCJtZXRlclwiLFxuICBcIm5hdlwiLFxuICBcIm5vc2NyaXB0XCIsXG4gIFwib2JqZWN0XCIsXG4gIFwib2xcIixcbiAgXCJvcHRncm91cFwiLFxuICBcIm9wdGlvblwiLFxuICBcIm91dHB1dFwiLFxuICBcInBcIixcbiAgXCJwaWN0dXJlXCIsXG4gIFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcbiAgXCJxXCIsXG4gIFwicnBcIixcbiAgXCJydFwiLFxuICBcInJ1YnlcIixcbiAgXCJzXCIsXG4gIFwic2FtcFwiLFxuICBcInNjcmlwdFwiLFxuICBcInNlYXJjaFwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJzZWxlY3RcIixcbiAgXCJzbG90XCIsXG4gIFwic21hbGxcIixcbiAgXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXG4gIFwic3R5bGVcIixcbiAgXCJzdWJcIixcbiAgXCJzdW1tYXJ5XCIsXG4gIFwic3VwXCIsXG4gIFwidGFibGVcIixcbiAgXCJ0Ym9keVwiLFxuICBcInRkXCIsXG4gIFwidGVtcGxhdGVcIixcbiAgXCJ0ZXh0YXJlYVwiLFxuICBcInRmb290XCIsXG4gIFwidGhcIixcbiAgXCJ0aGVhZFwiLFxuICBcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFxuICBcInRyXCIsXG4gIFwidVwiLFxuICBcInVsXCIsXG4gIFwidmFyXCIsXG4gIFwidmlkZW9cIlxuXTtcbnZhciBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9IFtcbiAgXCJwYXRoXCIsXG4gIFwiY2lyY2xlXCIsXG4gIFwiZWxsaXBzZVwiLFxuICBcImxpbmVcIixcbiAgXCJwb2x5Z29uXCIsXG4gIFwicG9seWxpbmVcIixcbiAgXCJzdG9wXCJcbl07XG52YXIgc3ZnRWxlbWVudFRhZ3MgPSBbXG4gIFwic3ZnXCIsXG4gIFwiZ1wiLFxuICBcInRleHRcIixcbiAgXCJ0c3BhblwiLFxuICBcInRleHRQYXRoXCIsXG4gIFwiZGVmc1wiLFxuICBcInN5bWJvbFwiLFxuICBcInVzZVwiLFxuICBcImltYWdlXCIsXG4gIFwiY2xpcFBhdGhcIixcbiAgXCJtYXNrXCIsXG4gIFwicGF0dGVyblwiLFxuICBcImxpbmVhckdyYWRpZW50XCIsXG4gIFwicmFkaWFsR3JhZGllbnRcIixcbiAgXCJmaWx0ZXJcIixcbiAgXCJtYXJrZXJcIixcbiAgXCJ2aWV3XCIsXG4gIFwiZmVCbGVuZFwiLFxuICBcImZlQ29sb3JNYXRyaXhcIixcbiAgXCJmZUNvbXBvbmVudFRyYW5zZmVyXCIsXG4gIFwiZmVDb21wb3NpdGVcIixcbiAgXCJmZUNvbnZvbHZlTWF0cml4XCIsXG4gIFwiZmVEaWZmdXNlTGlnaHRpbmdcIixcbiAgXCJmZURpc3BsYWNlbWVudE1hcFwiLFxuICBcImZlRGlzdGFudExpZ2h0XCIsXG4gIFwiZmVGbG9vZFwiLFxuICBcImZlRnVuY0FcIixcbiAgXCJmZUZ1bmNCXCIsXG4gIFwiZmVGdW5jR1wiLFxuICBcImZlRnVuY1JcIixcbiAgXCJmZUdhdXNzaWFuQmx1clwiLFxuICBcImZlSW1hZ2VcIixcbiAgXCJmZU1lcmdlXCIsXG4gIFwiZmVNZXJnZU5vZGVcIixcbiAgXCJmZU1vcnBob2xvZ3lcIixcbiAgXCJmZU9mZnNldFwiLFxuICBcImZlUG9pbnRMaWdodFwiLFxuICBcImZlU3BlY3VsYXJMaWdodGluZ1wiLFxuICBcImZlU3BvdExpZ2h0XCIsXG4gIFwiZmVUaWxlXCIsXG4gIFwiZmVUdXJidWxlbmNlXCJcbl07XG52YXIgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwibWlcIixcbiAgXCJtblwiLFxuICBcIm1vXCJcbl07XG52YXIgbWF0aG1sRWxlbWVudFRhZ3MgPSBbXG4gIFwibWF0aFwiLFxuICBcIm1zXCIsXG4gIFwibXRleHRcIixcbiAgXCJtcm93XCIsXG4gIFwibWZlbmNlZFwiLFxuICBcIm1zdXBcIixcbiAgXCJtc3ViXCIsXG4gIFwibXN1YnN1cFwiLFxuICBcIm1mcmFjXCIsXG4gIFwibXNxcnRcIixcbiAgXCJtcm9vdFwiLFxuICBcIm10YWJsZVwiLFxuICBcIm10clwiLFxuICBcIm10ZFwiLFxuICBcIm1zdHlsZVwiLFxuICBcIm1lbmNsb3NlXCIsXG4gIFwibW11bHRpc2NyaXB0c1wiXG5dO1xudmFyIGVsZW1lbnRzID0ge307XG52YXIgY2hpbGRyZW5sZXNzRWxlbWVudHMgPSB7fTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZykge1xuICByZXR1cm4gKChvcHRpb25zLCAuLi5jaGlsZHJlbikgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIGNoaWxkcmVuKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucykgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIG51bGwpKTtcbn1cbmZvciAoY29uc3QgdGFnIG9mIGh0bWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBzdmdFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xudmFyIGFsbEVsZW1lbnRzID0ge1xuICAuLi5lbGVtZW50cyxcbiAgLi4uY2hpbGRyZW5sZXNzRWxlbWVudHNcbn07XG5cbi8vIHNyYy9jbGllbnQvcnVudGltZS50c1xuT2JqZWN0LmFzc2lnbih3aW5kb3csIGFsbEVsZW1lbnRzKTtcbnZhciBuZXdBcnJheSA9IEFycmF5LmZyb207XG52YXIgaWRDb3VudGVyID0gMDtcbmZ1bmN0aW9uIGdlbkxvY2FsSUQoKSB7XG4gIGlkQ291bnRlcisrO1xuICByZXR1cm4gaWRDb3VudGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICBjb25zdCBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50LnRhZyk7XG4gIHtcbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZWxlbWVudC5vcHRpb25zKTtcbiAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgb3B0aW9uVmFsdWUubXV0YXRlKGVsZW1lbnQsIG9wdGlvbk5hbWUpO1xuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gZ2VuTG9jYWxJRCgpLnRvU3RyaW5nKCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGVsZW1lbnQua2V5KSB7XG4gICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICB9XG4gIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICBkb21FbGVtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCB8fCBlbGVtZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHsgcm9vdDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIiksIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiBlbGVtZW50KSB7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChzdWJFbGVtZW50KTtcbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcm9vdDogZnJhZ21lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBBbHNvIG5vdGUgdGhhdCBjdXJyZW50bHkgaW4gY2xpZW50IGNvbXBvbmVudHMgbGlrZSByZWFjdGl2ZU1hcCwgc3RhdGUgc3ViamVjdCByZWZlcmVuY2VzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uYCk7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0eXBlb2Ygb2YgdGhpcyBlbGVtZW50IGlzIG5vdCBvbmUgb2YgRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gUGxlYXNlIGNvbnZlcnQgaXQgaW50byBvbmUgb2YgdGhlc2UgdHlwZXMuYCk7XG4gIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICBsZXQgaXNFcnJvcmVkID0gZmFsc2U7XG4gIChmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgIGNvbnN0IGVzID0gbmV3IEV2ZW50U291cmNlKFwiaHR0cDovL2xvY2FsaG9zdDo0MDAwL2VsZWdhbmNlLWhvdC1yZWxvYWRcIik7XG4gICAgZXMub25vcGVuID0gKCkgPT4ge1xuICAgICAgaWYgKGlzRXJyb3JlZCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgaXNFcnJvcmVkID0gdHJ1ZTtcbiAgICAgIGVzLmNsb3NlKCk7XG4gICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDFlMyk7XG4gICAgfTtcbiAgfSkoKTtcbn0pKCk7XG52YXIgQ2xpZW50U3ViamVjdCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoaWQsIHZhbHVlKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBNYW51YWxseSB0cmlnZ2VyIGVhY2ggb2YgdGhpcyBzdWJqZWN0J3Mgb2JzZXJ2ZXJzLCB3aXRoIHRoZSBzdWJqZWN0J3MgY3VycmVudCB2YWx1ZS5cbiAgICogXG4gICAqIFVzZWZ1bCBpZiB5b3UncmUgbXV0YXRpbmcgZm9yIGV4YW1wbGUgZmllbGRzIG9mIGFuIG9iamVjdCwgb3IgcHVzaGluZyB0byBhbiBhcnJheS5cbiAgICovXG4gIHRyaWdnZXJPYnNlcnZlcnMoKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQWRkIGEgbmV3IG9ic2VydmVyIHRvIHRoaXMgc3ViamVjdCwgYGNhbGxiYWNrYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIHNldHRlciBpcyBjYWxsZWQgb24gdGhpcyBzdWJqZWN0LlxuICAgKiBcbiAgICogTm90ZTogaWYgYW4gSUQgaXMgYWxyZWFkeSBpbiB1c2UgaXQncyBjYWxsYmFjayB3aWxsIGp1c3QgYmUgb3ZlcndyaXR0ZW4gd2l0aCB3aGF0ZXZlciB5b3UgZ2l2ZSBpdC5cbiAgICogXG4gICAqIE5vdGU6IHRoaXMgdHJpZ2dlcnMgYGNhbGxiYWNrYCB3aXRoIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIEBwYXJhbSBpZCBUaGUgdW5pcXVlIGlkIG9mIHRoaXMgb2JzZXJ2ZXJcbiAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAqL1xuICBvYnNlcnZlKGlkLCBjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLm9ic2VydmVycy5oYXMoaWQpKSB7XG4gICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmVycy5zZXQoaWQsIGNhbGxiYWNrKTtcbiAgICBjYWxsYmFjayh0aGlzLnZhbHVlKTtcbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGFuIG9ic2VydmVyIGZyb20gdGhpcyBzdWJqZWN0LlxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGUgb2JzZXJ2ZXIuXG4gICAqL1xuICB1bm9ic2VydmUoaWQpIHtcbiAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICB9XG59O1xudmFyIFN0YXRlTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJqZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyh2YWx1ZXMsIGRvT3ZlcndyaXRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50U3ViamVjdCA9IG5ldyBDbGllbnRTdWJqZWN0KHZhbHVlLmlkLCB2YWx1ZS52YWx1ZSk7XG4gICAgICB0aGlzLnN1YmplY3RzLnNldCh2YWx1ZS5pZCwgY2xpZW50U3ViamVjdCk7XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3RzLmdldChpZCk7XG4gIH1cbiAgZ2V0QWxsKGlkcykge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59O1xudmFyIENsaWVudEV2ZW50TGlzdGVuZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuY2VuY2llcztcbiAgfVxuICBjYWxsKGV2KSB7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgdGhpcy5jYWxsYmFjayhldiwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgfVxufTtcbnZhciBFdmVudExpc3RlbmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyhzZXJ2ZXJFdmVudExpc3RlbmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50RXZlbnRMaXN0ZW5lciA9IG5ldyBDbGllbnRFdmVudExpc3RlbmVyKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQsIHNlcnZlckV2ZW50TGlzdGVuZXIuY2FsbGJhY2ssIHNlcnZlckV2ZW50TGlzdGVuZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KGNsaWVudEV2ZW50TGlzdGVuZXIuaWQsIGNsaWVudEV2ZW50TGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBldmVudExpc3RlbmVyT3B0aW9uLmtleSArIFwiIGZvciBldmVudCBsaXN0ZW5lci5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIEV2ZW50TGlzdGVuZXJPcHRpb246IEV2ZW50IGxpc3RlbmVyIHdpdGggaWQgXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArICdcIiBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lci5jYWxsKGV2KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChpZCk7XG4gIH1cbn07XG52YXIgQ2xpZW50T2JzZXJ2ZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc3ViamVjdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY2FsbCgpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAqL1xuICBhZGRFbGVtZW50KGVsZW1lbnQsIG9wdGlvbk5hbWUpIHtcbiAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICB9XG4gIHNldFByb3AoZWxlbWVudCwga2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgPT09IFwiY2xhc3NcIikge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkuc3RhcnRzV2l0aChcIm9uXCIpICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkgaW4gZWxlbWVudCkge1xuICAgICAgY29uc3QgaXNUcnV0aHkgPSB2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIjtcbiAgICAgIGlmIChpc1RydXRoeSkge1xuICAgICAgICBlbGVtZW50W2tleV0gPSBCb29sZWFuKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgY2FsbCgpIHtcbiAgICBmb3IgKGNvbnN0IHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9IG9mIHRoaXMuZWxlbWVudHMpIHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjay5jYWxsKGVsZW1lbnQsIC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG4gICAgICB0aGlzLnNldFByb3AoZWxlbWVudCwgb3B0aW9uTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxufTtcbnZhciBPYnNlcnZlck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgfVxuICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJPYnNlcnZlciBvZiBzZXJ2ZXJPYnNlcnZlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudE9ic2VydmVycy5oYXMoc2VydmVyT2JzZXJ2ZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvYnNlcnZlci5hZGRFbGVtZW50KGVsZW1lbnQsIG9ic2VydmVyT3B0aW9uLm9wdGlvbik7XG4gICAgICBvYnNlcnZlci5jYWxsKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgIGNvbnN0IG9ic2VydmVyTm9kZXMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbb11cIikpO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICBsZXQgdXBkYXRlMiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9O1xuICAgICAgdmFyIHVwZGF0ZSA9IHVwZGF0ZTI7XG4gICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9cIik7XG4gICAgICBjb25zdCBzdWJqZWN0ID0gc3RhdGVNYW5hZ2VyLmdldChzdWJqZWN0SWQpO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIERFVl9CVUlMRDogZXJyb3JPdXQoXCJGYWlsZWQgdG8gZmluZCBzdWJqZWN0IHdpdGggaWQgXCIgKyBzdWJqZWN0SWQgKyBcIiBmb3Igb2JzZXJ2ZXJOb2RlLlwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YmplY3QudmFsdWUpO1xuICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgIHN1YmplY3Qub2JzZXJ2ZShpZCwgdXBkYXRlMik7XG4gICAgICB1cGRhdGUyKHN1YmplY3QudmFsdWUpO1xuICAgICAgbm9kZS5yZXBsYWNlV2l0aCh0ZXh0Tm9kZSk7XG4gICAgfVxuICB9XG59O1xudmFyIExvYWRIb29rTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzID0gW107XG4gIH1cbiAgbG9hZFZhbHVlcyhsb2FkSG9va3MpIHtcbiAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuICAgICAgaWYgKHRoaXMuYWN0aXZlTG9hZEhvb2tzLmluY2x1ZGVzKGxvYWRIb29rLmlkKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzLnB1c2gobG9hZEhvb2suaWQpO1xuICAgICAgY29uc3QgY2xlYW51cEZ1bmN0aW9uID0gbG9hZEhvb2suY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgIGlmIChjbGVhbnVwRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgIGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICBwYXRobmFtZTogbG9hZEhvb2sucGF0aG5hbWUsXG4gICAgICAgICAgbG9hZEhvb2tJZHg6IHRoaXMuYWN0aXZlTG9hZEhvb2tzLmxlbmd0aCAtIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxDbGVhbnVwRnVuY3Rpb25zKCkge1xuICAgIGxldCByZW1haW5pbmdQcm9jZWR1cmVzID0gW107XG4gICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IDAgLyogTEFZT1VUX0xPQURIT09LICovKSB7XG4gICAgICAgIGNvbnN0IGlzSW5TY29wZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKS5zdGFydHNXaXRoKGNsZWFudXBQcm9jZWR1cmUucGF0aG5hbWUpO1xuICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgcmVtYWluaW5nUHJvY2VkdXJlcy5wdXNoKGNsZWFudXBQcm9jZWR1cmUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3Muc3BsaWNlKGNsZWFudXBQcm9jZWR1cmUubG9hZEhvb2tJZHgsIDEpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgfVxufTtcbnZhciBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG52YXIgZXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbnZhciBzdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKCk7XG52YXIgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xudmFyIHBhZ2VTdHJpbmdDYWNoZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xudmFyIHhtbFNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xudmFyIGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkwpID0+IHtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgIHJldHVybiBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBhZ2VTdHJpbmdDYWNoZS5nZXQocGF0aG5hbWUpLCBcInRleHQvaHRtbFwiKTtcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICB7XG4gICAgY29uc3QgZGF0YVNjcmlwdHMgPSBuZXdBcnJheShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgY29uc3QgY3VycmVudFNjcmlwdHMgPSBuZXdBcnJheShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLXBhY2thZ2U9XCJ0cnVlXCJdJykpO1xuICAgIGZvciAoY29uc3QgZGF0YVNjcmlwdCBvZiBkYXRhU2NyaXB0cykge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50U2NyaXB0cy5maW5kKChzKSA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChkYXRhU2NyaXB0KTtcbiAgICB9XG4gIH1cbiAge1xuICAgIGNvbnN0IHBhZ2VEYXRhU2NyaXB0ID0gbmV3RE9NLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLWhvb2s9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIGNvbnN0IHRleHQgPSBwYWdlRGF0YVNjcmlwdC50ZXh0Q29udGVudDtcbiAgICBwYWdlRGF0YVNjcmlwdC5yZW1vdmUoKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6IFwidGV4dC9qYXZhc2NyaXB0XCIgfSk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgc2NyaXB0LnR5cGUgPSBcIm1vZHVsZVwiO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhZ2VcIiwgXCJ0cnVlXCIpO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgIG5ld0RPTS5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH1cbiAgcGFnZVN0cmluZ0NhY2hlLnNldChwYXRobmFtZSwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcbiAgcmV0dXJuIG5ld0RPTTtcbn07XG52YXIgbmF2aWdhdGlvbkNhbGxiYWNrcyA9IFtdO1xuZnVuY3Rpb24gb25OYXZpZ2F0ZShjYWxsYmFjaykge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gbmF2aWdhdGlvbkNhbGxiYWNrcy5sZW5ndGggLSAxO1xufVxuZnVuY3Rpb24gcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrKGlkeCkge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnNwbGljZShpZHgsIDEpO1xufVxudmFyIG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQsIHB1c2hTdGF0ZSA9IHRydWUpID0+IHtcbiAgY29uc3QgdGFyZ2V0VVJMID0gbmV3IFVSTCh0YXJnZXQpO1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgbGV0IG5ld1BhZ2UgPSBhd2FpdCBmZXRjaFBhZ2UodGFyZ2V0VVJMKTtcbiAgaWYgKCFuZXdQYWdlKSByZXR1cm47XG4gIGxldCBvbGRQYWdlTGF0ZXN0ID0gZG9jdW1lbnQuYm9keTtcbiAgbGV0IG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlLmJvZHk7XG4gIHtcbiAgICBjb25zdCBuZXdQYWdlTGF5b3V0cyA9IG5ld0FycmF5KG5ld1BhZ2UucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXRzID0gbmV3QXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihuZXdQYWdlTGF5b3V0cy5sZW5ndGgsIG9sZFBhZ2VMYXlvdXRzLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXQgPSBuZXdQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXQgPSBvbGRQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG5ld0xheW91dElkID0gbmV3UGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICBjb25zdCBvbGRMYXlvdXRJZCA9IG9sZFBhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgaWYgKG5ld0xheW91dElkICE9PSBvbGRMYXlvdXRJZCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG9sZFBhZ2VMYXRlc3QgPSBvbGRQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gIH1cbiAgY29uc3QgaGVhZCA9IGRvY3VtZW50LmhlYWQ7XG4gIGNvbnN0IG5ld0hlYWQgPSBuZXdQYWdlLmhlYWQ7XG4gIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gIHtcbiAgICBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKT8ucmVwbGFjZVdpdGgoXG4gICAgICBuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpID8/IFwiXCJcbiAgICApO1xuICAgIGNvbnN0IHVwZGF0ZSA9ICh0YXJnZXRMaXN0LCBtYXRjaEFnYWluc3QsIGFjdGlvbikgPT4ge1xuICAgICAgZm9yIChjb25zdCB0YXJnZXQyIG9mIHRhcmdldExpc3QpIHtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmcgPSBtYXRjaEFnYWluc3QuZmluZCgobikgPT4gbi5pc0VxdWFsTm9kZSh0YXJnZXQyKSk7XG4gICAgICAgIGlmIChtYXRjaGluZykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbih0YXJnZXQyKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG9sZFRhZ3MgPSBbXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpXG4gICAgXTtcbiAgICBjb25zdCBuZXdUYWdzID0gW1xuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKVxuICAgIF07XG4gICAgdXBkYXRlKG5ld1RhZ3MsIG9sZFRhZ3MsIChub2RlKSA9PiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICB1cGRhdGUob2xkVGFncywgbmV3VGFncywgKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICB9XG4gIGlmIChwdXNoU3RhdGUpIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgbG9hZEhvb2tNYW5hZ2VyLmNhbGxDbGVhbnVwRnVuY3Rpb25zKCk7XG4gIHtcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIG5hdmlnYXRpb25DYWxsYmFja3MpIHtcbiAgICAgIGNhbGxiYWNrKHBhdGhuYW1lKTtcbiAgICB9XG4gIH1cbiAgYXdhaXQgbG9hZFBhZ2UoKTtcbiAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0VVJMLmhhc2guc2xpY2UoMSkpPy5zY3JvbGxJbnRvVmlldygpO1xuICB9XG59O1xuZnVuY3Rpb24gc2FmZVBlcmNlbnREZWNvZGUoaW5wdXQpIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoXG4gICAgLyVbMC05QS1GYS1mXXsyfS9nLFxuICAgIChtKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG0uc2xpY2UoMSksIDE2KSlcbiAgKTtcbn1cbmZ1bmN0aW9uIHNhbml0aXplUGF0aG5hbWUocGF0aG5hbWUgPSBcIlwiKSB7XG4gIGlmICghcGF0aG5hbWUpIHJldHVybiBcIi9cIjtcbiAgcGF0aG5hbWUgPSBzYWZlUGVyY2VudERlY29kZShwYXRobmFtZSk7XG4gIHBhdGhuYW1lID0gXCIvXCIgKyBwYXRobmFtZTtcbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9cXC8rL2csIFwiL1wiKTtcbiAgY29uc3Qgc2VnbWVudHMgPSBwYXRobmFtZS5zcGxpdChcIi9cIik7XG4gIGNvbnN0IHJlc29sdmVkID0gW107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIGlmICghc2VnbWVudCB8fCBzZWdtZW50ID09PSBcIi5cIikgY29udGludWU7XG4gICAgaWYgKHNlZ21lbnQgPT09IFwiLi5cIikge1xuICAgICAgcmVzb2x2ZWQucG9wKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmVzb2x2ZWQucHVzaChzZWdtZW50KTtcbiAgfVxuICBjb25zdCBlbmNvZGVkID0gcmVzb2x2ZWQubWFwKChzKSA9PiBlbmNvZGVVUklDb21wb25lbnQocykpO1xuICByZXR1cm4gXCIvXCIgKyBlbmNvZGVkLmpvaW4oXCIvXCIpO1xufVxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZURhdGEocGF0aG5hbWUpIHtcbiAgY29uc3QgZGF0YVNjcmlwdFRhZyA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gIGlmICghZGF0YVNjcmlwdFRhZykge1xuICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgRmFpbGVkIHRvIGZpbmQgc2NyaXB0IHRhZyBmb3IgcXVlcnk6c2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaW1wb3J0KGRhdGFTY3JpcHRUYWcuc3JjKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnNcbiAgfSA9IGRhdGE7XG4gIGlmICghZXZlbnRMaXN0ZW5lck9wdGlvbnMgfHwgIWV2ZW50TGlzdGVuZXJzIHx8ICFvYnNlcnZlcnMgfHwgIXN1YmplY3RzIHx8ICFvYnNlcnZlck9wdGlvbnMpIHtcbiAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYFBvc3NpYmx5IG1hbGZvcm1lZCBwYWdlIGRhdGEgJHtkYXRhfWApO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn1cbmZ1bmN0aW9uIGVycm9yT3V0KG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBhZ2UoKSB7XG4gIHdpbmRvdy5vbnBvcHN0YXRlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgYXdhaXQgbmF2aWdhdGVMb2NhbGx5KHRhcmdldC5sb2NhdGlvbi5ocmVmLCBmYWxzZSk7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0LmxvY2F0aW9uLmhyZWYpO1xuICB9O1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgbG9hZEhvb2tzXG4gIH0gPSBhd2FpdCBnZXRQYWdlRGF0YShwYXRobmFtZSk7XG4gIERFVl9CVUlMRDoge1xuICAgIGdsb2JhbFRoaXMuZGV2dG9vbHMgPSB7XG4gICAgICBwYWdlRGF0YToge1xuICAgICAgICBzdWJqZWN0cyxcbiAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgICAgICBvYnNlcnZlcnMsXG4gICAgICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICAgICAgbG9hZEhvb2tzXG4gICAgICB9LFxuICAgICAgc3RhdGVNYW5hZ2VyLFxuICAgICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIsXG4gICAgICBvYnNlcnZlck1hbmFnZXIsXG4gICAgICBsb2FkSG9va01hbmFnZXJcbiAgICB9O1xuICB9XG4gIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudCxcbiAgICBmZXRjaFBhZ2UsXG4gICAgbmF2aWdhdGVMb2NhbGx5LFxuICAgIG9uTmF2aWdhdGUsXG4gICAgcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrXG4gIH07XG4gIHN0YXRlTWFuYWdlci5sb2FkVmFsdWVzKHN1YmplY3RzKTtcbiAgZXZlbnRMaXN0ZW5lck1hbmFnZXIubG9hZFZhbHVlcyhldmVudExpc3RlbmVycyk7XG4gIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3MoZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICBvYnNlcnZlck1hbmFnZXIubG9hZFZhbHVlcyhvYnNlcnZlcnMpO1xuICBvYnNlcnZlck1hbmFnZXIuaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnMpO1xuICBvYnNlcnZlck1hbmFnZXIudHJhbnNmb3JtU3ViamVjdE9ic2VydmVyTm9kZXMoKTtcbiAgbG9hZEhvb2tNYW5hZ2VyLmxvYWRWYWx1ZXMobG9hZEhvb2tzKTtcbn1cbmxvYWRQYWdlKCk7XG5leHBvcnQge1xuICBDbGllbnRTdWJqZWN0LFxuICBFdmVudExpc3RlbmVyTWFuYWdlcixcbiAgTG9hZEhvb2tNYW5hZ2VyLFxuICBPYnNlcnZlck1hbmFnZXIsXG4gIFN0YXRlTWFuYWdlclxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUNBLE1BQUksdUJBQXVCLE1BQU07QUFBQSxFQUNqQztBQUNBLFdBQVMsWUFBWSxPQUFPO0FBQzFCLFFBQUksVUFBVSxRQUFRLFVBQVUsV0FBVyxPQUFPLFVBQVUsWUFBWSxNQUFNLFFBQVEsS0FBSyxLQUFLLGlCQUFpQixpQkFBa0IsUUFBTztBQUMxSSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksa0JBQWtCLE1BQU07QUFBQSxJQUMxQixZQUFZLEtBQUssVUFBVSxDQUFDLEdBQUcsV0FBVyxNQUFNO0FBQzlDLFdBQUssTUFBTTtBQUNYLFVBQUksWUFBWSxPQUFPLEdBQUc7QUFDeEIsWUFBSSxLQUFLLGdCQUFnQixNQUFNLE9BQU87QUFDcEMsa0JBQVEsTUFBTSxnQkFBZ0IsTUFBTSxnQ0FBZ0M7QUFDcEUsZ0JBQU07QUFBQSxRQUNSO0FBQ0EsYUFBSyxXQUFXLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGFBQUssVUFBVSxDQUFDO0FBQUEsTUFDbEIsT0FBTztBQUNMLGFBQUssVUFBVTtBQUNmLGFBQUssV0FBVztBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0Esa0JBQWtCO0FBQ2hCLGFBQU8sS0FBSyxhQUFhO0FBQUEsSUFDM0I7QUFBQSxFQUNGO0FBR0EsTUFBSSw4QkFBOEI7QUFBQSxJQUNoQztBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElB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
