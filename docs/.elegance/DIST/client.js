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
    if (pathname === sanitizePathname(window.location.pathname)) {
      if (targetURL.hash) {
        document.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
      }
      return;
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4gPSBudWxsKSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW29wdGlvbnMsIC4uLmNoaWxkcmVuID8/IFtdXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBjYW5IYXZlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gIH1cbn07XG5cbi8vIHNyYy9lbGVtZW50cy9lbGVtZW50X2xpc3QudHNcbnZhciBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwiYXJlYVwiLFxuICBcImJhc2VcIixcbiAgXCJiclwiLFxuICBcImNvbFwiLFxuICBcImVtYmVkXCIsXG4gIFwiaHJcIixcbiAgXCJpbWdcIixcbiAgXCJpbnB1dFwiLFxuICBcImxpbmtcIixcbiAgXCJtZXRhXCIsXG4gIFwicGFyYW1cIixcbiAgXCJzb3VyY2VcIixcbiAgXCJ0cmFja1wiLFxuICBcIndiclwiXG5dO1xudmFyIGh0bWxFbGVtZW50VGFncyA9IFtcbiAgXCJhXCIsXG4gIFwiYWJiclwiLFxuICBcImFkZHJlc3NcIixcbiAgXCJhcnRpY2xlXCIsXG4gIFwiYXNpZGVcIixcbiAgXCJhdWRpb1wiLFxuICBcImJcIixcbiAgXCJiZGlcIixcbiAgXCJiZG9cIixcbiAgXCJibG9ja3F1b3RlXCIsXG4gIFwiYm9keVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFxuICBcImNhcHRpb25cIixcbiAgXCJjaXRlXCIsXG4gIFwiY29kZVwiLFxuICBcImNvbGdyb3VwXCIsXG4gIFwiZGF0YVwiLFxuICBcImRhdGFsaXN0XCIsXG4gIFwiZGRcIixcbiAgXCJkZWxcIixcbiAgXCJkZXRhaWxzXCIsXG4gIFwiZGZuXCIsXG4gIFwiZGlhbG9nXCIsXG4gIFwiZGl2XCIsXG4gIFwiZGxcIixcbiAgXCJkdFwiLFxuICBcImVtXCIsXG4gIFwiZmllbGRzZXRcIixcbiAgXCJmaWdjYXB0aW9uXCIsXG4gIFwiZmlndXJlXCIsXG4gIFwiZm9vdGVyXCIsXG4gIFwiZm9ybVwiLFxuICBcImgxXCIsXG4gIFwiaDJcIixcbiAgXCJoM1wiLFxuICBcImg0XCIsXG4gIFwiaDVcIixcbiAgXCJoNlwiLFxuICBcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcbiAgXCJoZ3JvdXBcIixcbiAgXCJodG1sXCIsXG4gIFwiaVwiLFxuICBcImlmcmFtZVwiLFxuICBcImluc1wiLFxuICBcImtiZFwiLFxuICBcImxhYmVsXCIsXG4gIFwibGVnZW5kXCIsXG4gIFwibGlcIixcbiAgXCJtYWluXCIsXG4gIFwibWFwXCIsXG4gIFwibWFya1wiLFxuICBcIm1lbnVcIixcbiAgXCJtZXRlclwiLFxuICBcIm5hdlwiLFxuICBcIm5vc2NyaXB0XCIsXG4gIFwib2JqZWN0XCIsXG4gIFwib2xcIixcbiAgXCJvcHRncm91cFwiLFxuICBcIm9wdGlvblwiLFxuICBcIm91dHB1dFwiLFxuICBcInBcIixcbiAgXCJwaWN0dXJlXCIsXG4gIFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcbiAgXCJxXCIsXG4gIFwicnBcIixcbiAgXCJydFwiLFxuICBcInJ1YnlcIixcbiAgXCJzXCIsXG4gIFwic2FtcFwiLFxuICBcInNjcmlwdFwiLFxuICBcInNlYXJjaFwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJzZWxlY3RcIixcbiAgXCJzbG90XCIsXG4gIFwic21hbGxcIixcbiAgXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXG4gIFwic3R5bGVcIixcbiAgXCJzdWJcIixcbiAgXCJzdW1tYXJ5XCIsXG4gIFwic3VwXCIsXG4gIFwidGFibGVcIixcbiAgXCJ0Ym9keVwiLFxuICBcInRkXCIsXG4gIFwidGVtcGxhdGVcIixcbiAgXCJ0ZXh0YXJlYVwiLFxuICBcInRmb290XCIsXG4gIFwidGhcIixcbiAgXCJ0aGVhZFwiLFxuICBcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFxuICBcInRyXCIsXG4gIFwidVwiLFxuICBcInVsXCIsXG4gIFwidmFyXCIsXG4gIFwidmlkZW9cIlxuXTtcbnZhciBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9IFtcbiAgXCJwYXRoXCIsXG4gIFwiY2lyY2xlXCIsXG4gIFwiZWxsaXBzZVwiLFxuICBcImxpbmVcIixcbiAgXCJwb2x5Z29uXCIsXG4gIFwicG9seWxpbmVcIixcbiAgXCJzdG9wXCJcbl07XG52YXIgc3ZnRWxlbWVudFRhZ3MgPSBbXG4gIFwic3ZnXCIsXG4gIFwiZ1wiLFxuICBcInRleHRcIixcbiAgXCJ0c3BhblwiLFxuICBcInRleHRQYXRoXCIsXG4gIFwiZGVmc1wiLFxuICBcInN5bWJvbFwiLFxuICBcInVzZVwiLFxuICBcImltYWdlXCIsXG4gIFwiY2xpcFBhdGhcIixcbiAgXCJtYXNrXCIsXG4gIFwicGF0dGVyblwiLFxuICBcImxpbmVhckdyYWRpZW50XCIsXG4gIFwicmFkaWFsR3JhZGllbnRcIixcbiAgXCJmaWx0ZXJcIixcbiAgXCJtYXJrZXJcIixcbiAgXCJ2aWV3XCIsXG4gIFwiZmVCbGVuZFwiLFxuICBcImZlQ29sb3JNYXRyaXhcIixcbiAgXCJmZUNvbXBvbmVudFRyYW5zZmVyXCIsXG4gIFwiZmVDb21wb3NpdGVcIixcbiAgXCJmZUNvbnZvbHZlTWF0cml4XCIsXG4gIFwiZmVEaWZmdXNlTGlnaHRpbmdcIixcbiAgXCJmZURpc3BsYWNlbWVudE1hcFwiLFxuICBcImZlRGlzdGFudExpZ2h0XCIsXG4gIFwiZmVGbG9vZFwiLFxuICBcImZlRnVuY0FcIixcbiAgXCJmZUZ1bmNCXCIsXG4gIFwiZmVGdW5jR1wiLFxuICBcImZlRnVuY1JcIixcbiAgXCJmZUdhdXNzaWFuQmx1clwiLFxuICBcImZlSW1hZ2VcIixcbiAgXCJmZU1lcmdlXCIsXG4gIFwiZmVNZXJnZU5vZGVcIixcbiAgXCJmZU1vcnBob2xvZ3lcIixcbiAgXCJmZU9mZnNldFwiLFxuICBcImZlUG9pbnRMaWdodFwiLFxuICBcImZlU3BlY3VsYXJMaWdodGluZ1wiLFxuICBcImZlU3BvdExpZ2h0XCIsXG4gIFwiZmVUaWxlXCIsXG4gIFwiZmVUdXJidWxlbmNlXCJcbl07XG52YXIgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwibWlcIixcbiAgXCJtblwiLFxuICBcIm1vXCJcbl07XG52YXIgbWF0aG1sRWxlbWVudFRhZ3MgPSBbXG4gIFwibWF0aFwiLFxuICBcIm1zXCIsXG4gIFwibXRleHRcIixcbiAgXCJtcm93XCIsXG4gIFwibWZlbmNlZFwiLFxuICBcIm1zdXBcIixcbiAgXCJtc3ViXCIsXG4gIFwibXN1YnN1cFwiLFxuICBcIm1mcmFjXCIsXG4gIFwibXNxcnRcIixcbiAgXCJtcm9vdFwiLFxuICBcIm10YWJsZVwiLFxuICBcIm10clwiLFxuICBcIm10ZFwiLFxuICBcIm1zdHlsZVwiLFxuICBcIm1lbmNsb3NlXCIsXG4gIFwibW11bHRpc2NyaXB0c1wiXG5dO1xudmFyIGVsZW1lbnRzID0ge307XG52YXIgY2hpbGRyZW5sZXNzRWxlbWVudHMgPSB7fTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZykge1xuICByZXR1cm4gKChvcHRpb25zLCAuLi5jaGlsZHJlbikgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIGNoaWxkcmVuKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucykgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIG51bGwpKTtcbn1cbmZvciAoY29uc3QgdGFnIG9mIGh0bWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBzdmdFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xudmFyIGFsbEVsZW1lbnRzID0ge1xuICAuLi5lbGVtZW50cyxcbiAgLi4uY2hpbGRyZW5sZXNzRWxlbWVudHNcbn07XG5cbi8vIHNyYy9jbGllbnQvcnVudGltZS50c1xuT2JqZWN0LmFzc2lnbih3aW5kb3csIGFsbEVsZW1lbnRzKTtcbnZhciBuZXdBcnJheSA9IEFycmF5LmZyb207XG52YXIgaWRDb3VudGVyID0gMDtcbmZ1bmN0aW9uIGdlbkxvY2FsSUQoKSB7XG4gIGlkQ291bnRlcisrO1xuICByZXR1cm4gaWRDb3VudGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICBjb25zdCBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50LnRhZyk7XG4gIHtcbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZWxlbWVudC5vcHRpb25zKTtcbiAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgb3B0aW9uVmFsdWUubXV0YXRlKGVsZW1lbnQsIG9wdGlvbk5hbWUpO1xuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gZ2VuTG9jYWxJRCgpLnRvU3RyaW5nKCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGVsZW1lbnQua2V5KSB7XG4gICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICB9XG4gIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICBkb21FbGVtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCB8fCBlbGVtZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHsgcm9vdDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIiksIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiBlbGVtZW50KSB7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChzdWJFbGVtZW50KTtcbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcm9vdDogZnJhZ21lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBBbHNvIG5vdGUgdGhhdCBjdXJyZW50bHkgaW4gY2xpZW50IGNvbXBvbmVudHMgbGlrZSByZWFjdGl2ZU1hcCwgc3RhdGUgc3ViamVjdCByZWZlcmVuY2VzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uYCk7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0eXBlb2Ygb2YgdGhpcyBlbGVtZW50IGlzIG5vdCBvbmUgb2YgRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gUGxlYXNlIGNvbnZlcnQgaXQgaW50byBvbmUgb2YgdGhlc2UgdHlwZXMuYCk7XG4gIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICBsZXQgaXNFcnJvcmVkID0gZmFsc2U7XG4gIChmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgIGNvbnN0IGVzID0gbmV3IEV2ZW50U291cmNlKFwiaHR0cDovL2xvY2FsaG9zdDo0MDAwL2VsZWdhbmNlLWhvdC1yZWxvYWRcIik7XG4gICAgZXMub25vcGVuID0gKCkgPT4ge1xuICAgICAgaWYgKGlzRXJyb3JlZCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgaXNFcnJvcmVkID0gdHJ1ZTtcbiAgICAgIGVzLmNsb3NlKCk7XG4gICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDFlMyk7XG4gICAgfTtcbiAgfSkoKTtcbn0pKCk7XG52YXIgQ2xpZW50U3ViamVjdCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoaWQsIHZhbHVlKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBNYW51YWxseSB0cmlnZ2VyIGVhY2ggb2YgdGhpcyBzdWJqZWN0J3Mgb2JzZXJ2ZXJzLCB3aXRoIHRoZSBzdWJqZWN0J3MgY3VycmVudCB2YWx1ZS5cbiAgICogXG4gICAqIFVzZWZ1bCBpZiB5b3UncmUgbXV0YXRpbmcgZm9yIGV4YW1wbGUgZmllbGRzIG9mIGFuIG9iamVjdCwgb3IgcHVzaGluZyB0byBhbiBhcnJheS5cbiAgICovXG4gIHRyaWdnZXJPYnNlcnZlcnMoKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQWRkIGEgbmV3IG9ic2VydmVyIHRvIHRoaXMgc3ViamVjdCwgYGNhbGxiYWNrYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIHNldHRlciBpcyBjYWxsZWQgb24gdGhpcyBzdWJqZWN0LlxuICAgKiBcbiAgICogTm90ZTogaWYgYW4gSUQgaXMgYWxyZWFkeSBpbiB1c2UgaXQncyBjYWxsYmFjayB3aWxsIGp1c3QgYmUgb3ZlcndyaXR0ZW4gd2l0aCB3aGF0ZXZlciB5b3UgZ2l2ZSBpdC5cbiAgICogXG4gICAqIE5vdGU6IHRoaXMgdHJpZ2dlcnMgYGNhbGxiYWNrYCB3aXRoIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIEBwYXJhbSBpZCBUaGUgdW5pcXVlIGlkIG9mIHRoaXMgb2JzZXJ2ZXJcbiAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAqL1xuICBvYnNlcnZlKGlkLCBjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLm9ic2VydmVycy5oYXMoaWQpKSB7XG4gICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmVycy5zZXQoaWQsIGNhbGxiYWNrKTtcbiAgICBjYWxsYmFjayh0aGlzLnZhbHVlKTtcbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGFuIG9ic2VydmVyIGZyb20gdGhpcyBzdWJqZWN0LlxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGUgb2JzZXJ2ZXIuXG4gICAqL1xuICB1bm9ic2VydmUoaWQpIHtcbiAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICB9XG59O1xudmFyIFN0YXRlTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJqZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyh2YWx1ZXMsIGRvT3ZlcndyaXRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50U3ViamVjdCA9IG5ldyBDbGllbnRTdWJqZWN0KHZhbHVlLmlkLCB2YWx1ZS52YWx1ZSk7XG4gICAgICB0aGlzLnN1YmplY3RzLnNldCh2YWx1ZS5pZCwgY2xpZW50U3ViamVjdCk7XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3RzLmdldChpZCk7XG4gIH1cbiAgZ2V0QWxsKGlkcykge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59O1xudmFyIENsaWVudEV2ZW50TGlzdGVuZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuY2VuY2llcztcbiAgfVxuICBjYWxsKGV2KSB7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgdGhpcy5jYWxsYmFjayhldiwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgfVxufTtcbnZhciBFdmVudExpc3RlbmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyhzZXJ2ZXJFdmVudExpc3RlbmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50RXZlbnRMaXN0ZW5lciA9IG5ldyBDbGllbnRFdmVudExpc3RlbmVyKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQsIHNlcnZlckV2ZW50TGlzdGVuZXIuY2FsbGJhY2ssIHNlcnZlckV2ZW50TGlzdGVuZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KGNsaWVudEV2ZW50TGlzdGVuZXIuaWQsIGNsaWVudEV2ZW50TGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBldmVudExpc3RlbmVyT3B0aW9uLmtleSArIFwiIGZvciBldmVudCBsaXN0ZW5lci5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIEV2ZW50TGlzdGVuZXJPcHRpb246IEV2ZW50IGxpc3RlbmVyIHdpdGggaWQgXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArICdcIiBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lci5jYWxsKGV2KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChpZCk7XG4gIH1cbn07XG52YXIgQ2xpZW50T2JzZXJ2ZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc3ViamVjdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY2FsbCgpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAqL1xuICBhZGRFbGVtZW50KGVsZW1lbnQsIG9wdGlvbk5hbWUpIHtcbiAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICB9XG4gIHNldFByb3AoZWxlbWVudCwga2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgPT09IFwiY2xhc3NcIikge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkuc3RhcnRzV2l0aChcIm9uXCIpICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkgaW4gZWxlbWVudCkge1xuICAgICAgY29uc3QgaXNUcnV0aHkgPSB2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIjtcbiAgICAgIGlmIChpc1RydXRoeSkge1xuICAgICAgICBlbGVtZW50W2tleV0gPSBCb29sZWFuKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgY2FsbCgpIHtcbiAgICBmb3IgKGNvbnN0IHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9IG9mIHRoaXMuZWxlbWVudHMpIHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjay5jYWxsKGVsZW1lbnQsIC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG4gICAgICB0aGlzLnNldFByb3AoZWxlbWVudCwgb3B0aW9uTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxufTtcbnZhciBPYnNlcnZlck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgfVxuICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJPYnNlcnZlciBvZiBzZXJ2ZXJPYnNlcnZlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudE9ic2VydmVycy5oYXMoc2VydmVyT2JzZXJ2ZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvYnNlcnZlci5hZGRFbGVtZW50KGVsZW1lbnQsIG9ic2VydmVyT3B0aW9uLm9wdGlvbik7XG4gICAgICBvYnNlcnZlci5jYWxsKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgIGNvbnN0IG9ic2VydmVyTm9kZXMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbb11cIikpO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICBsZXQgdXBkYXRlMiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9O1xuICAgICAgdmFyIHVwZGF0ZSA9IHVwZGF0ZTI7XG4gICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9cIik7XG4gICAgICBjb25zdCBzdWJqZWN0ID0gc3RhdGVNYW5hZ2VyLmdldChzdWJqZWN0SWQpO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIERFVl9CVUlMRDogZXJyb3JPdXQoXCJGYWlsZWQgdG8gZmluZCBzdWJqZWN0IHdpdGggaWQgXCIgKyBzdWJqZWN0SWQgKyBcIiBmb3Igb2JzZXJ2ZXJOb2RlLlwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YmplY3QudmFsdWUpO1xuICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgIHN1YmplY3Qub2JzZXJ2ZShpZCwgdXBkYXRlMik7XG4gICAgICB1cGRhdGUyKHN1YmplY3QudmFsdWUpO1xuICAgICAgbm9kZS5yZXBsYWNlV2l0aCh0ZXh0Tm9kZSk7XG4gICAgfVxuICB9XG59O1xudmFyIExvYWRIb29rTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzID0gW107XG4gIH1cbiAgbG9hZFZhbHVlcyhsb2FkSG9va3MpIHtcbiAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuICAgICAgaWYgKHRoaXMuYWN0aXZlTG9hZEhvb2tzLmluY2x1ZGVzKGxvYWRIb29rLmlkKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzLnB1c2gobG9hZEhvb2suaWQpO1xuICAgICAgY29uc3QgY2xlYW51cEZ1bmN0aW9uID0gbG9hZEhvb2suY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgIGlmIChjbGVhbnVwRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgIGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICBwYXRobmFtZTogbG9hZEhvb2sucGF0aG5hbWUsXG4gICAgICAgICAgbG9hZEhvb2tJZHg6IHRoaXMuYWN0aXZlTG9hZEhvb2tzLmxlbmd0aCAtIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxDbGVhbnVwRnVuY3Rpb25zKCkge1xuICAgIGxldCByZW1haW5pbmdQcm9jZWR1cmVzID0gW107XG4gICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IDAgLyogTEFZT1VUX0xPQURIT09LICovKSB7XG4gICAgICAgIGNvbnN0IGlzSW5TY29wZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKS5zdGFydHNXaXRoKGNsZWFudXBQcm9jZWR1cmUucGF0aG5hbWUpO1xuICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgcmVtYWluaW5nUHJvY2VkdXJlcy5wdXNoKGNsZWFudXBQcm9jZWR1cmUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3Muc3BsaWNlKGNsZWFudXBQcm9jZWR1cmUubG9hZEhvb2tJZHgsIDEpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgfVxufTtcbnZhciBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG52YXIgZXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbnZhciBzdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKCk7XG52YXIgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xudmFyIHBhZ2VTdHJpbmdDYWNoZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xudmFyIHhtbFNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xudmFyIGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkwpID0+IHtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgIHJldHVybiBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBhZ2VTdHJpbmdDYWNoZS5nZXQocGF0aG5hbWUpLCBcInRleHQvaHRtbFwiKTtcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICB7XG4gICAgY29uc3QgZGF0YVNjcmlwdHMgPSBuZXdBcnJheShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgY29uc3QgY3VycmVudFNjcmlwdHMgPSBuZXdBcnJheShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLXBhY2thZ2U9XCJ0cnVlXCJdJykpO1xuICAgIGZvciAoY29uc3QgZGF0YVNjcmlwdCBvZiBkYXRhU2NyaXB0cykge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50U2NyaXB0cy5maW5kKChzKSA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChkYXRhU2NyaXB0KTtcbiAgICB9XG4gIH1cbiAge1xuICAgIGNvbnN0IHBhZ2VEYXRhU2NyaXB0ID0gbmV3RE9NLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLWhvb2s9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIGNvbnN0IHRleHQgPSBwYWdlRGF0YVNjcmlwdC50ZXh0Q29udGVudDtcbiAgICBwYWdlRGF0YVNjcmlwdC5yZW1vdmUoKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6IFwidGV4dC9qYXZhc2NyaXB0XCIgfSk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgc2NyaXB0LnR5cGUgPSBcIm1vZHVsZVwiO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhZ2VcIiwgXCJ0cnVlXCIpO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgIG5ld0RPTS5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH1cbiAgcGFnZVN0cmluZ0NhY2hlLnNldChwYXRobmFtZSwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcbiAgcmV0dXJuIG5ld0RPTTtcbn07XG52YXIgbmF2aWdhdGlvbkNhbGxiYWNrcyA9IFtdO1xuZnVuY3Rpb24gb25OYXZpZ2F0ZShjYWxsYmFjaykge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gbmF2aWdhdGlvbkNhbGxiYWNrcy5sZW5ndGggLSAxO1xufVxuZnVuY3Rpb24gcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrKGlkeCkge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnNwbGljZShpZHgsIDEpO1xufVxudmFyIG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQsIHB1c2hTdGF0ZSA9IHRydWUpID0+IHtcbiAgY29uc3QgdGFyZ2V0VVJMID0gbmV3IFVSTCh0YXJnZXQpO1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgaWYgKHBhdGhuYW1lID09PSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkpIHtcbiAgICBpZiAodGFyZ2V0VVJMLmhhc2gpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBuZXdQYWdlID0gYXdhaXQgZmV0Y2hQYWdlKHRhcmdldFVSTCk7XG4gIGlmICghbmV3UGFnZSkgcmV0dXJuO1xuICBsZXQgb2xkUGFnZUxhdGVzdCA9IGRvY3VtZW50LmJvZHk7XG4gIGxldCBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZS5ib2R5O1xuICB7XG4gICAgY29uc3QgbmV3UGFnZUxheW91dHMgPSBuZXdBcnJheShuZXdQYWdlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKTtcbiAgICBjb25zdCBvbGRQYWdlTGF5b3V0cyA9IG5ld0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKTtcbiAgICBjb25zdCBzaXplID0gTWF0aC5taW4obmV3UGFnZUxheW91dHMubGVuZ3RoLCBvbGRQYWdlTGF5b3V0cy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCBuZXdQYWdlTGF5b3V0ID0gbmV3UGFnZUxheW91dHNbaV07XG4gICAgICBjb25zdCBvbGRQYWdlTGF5b3V0ID0gb2xkUGFnZUxheW91dHNbaV07XG4gICAgICBjb25zdCBuZXdMYXlvdXRJZCA9IG5ld1BhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgY29uc3Qgb2xkTGF5b3V0SWQgPSBvbGRQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgIGlmIChuZXdMYXlvdXRJZCAhPT0gb2xkTGF5b3V0SWQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBvbGRQYWdlTGF0ZXN0ID0gb2xkUGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICB9XG4gIGNvbnN0IGhlYWQgPSBkb2N1bWVudC5oZWFkO1xuICBjb25zdCBuZXdIZWFkID0gbmV3UGFnZS5oZWFkO1xuICBvbGRQYWdlTGF0ZXN0LnJlcGxhY2VXaXRoKG5ld1BhZ2VMYXRlc3QpO1xuICB7XG4gICAgZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIik/LnJlcGxhY2VXaXRoKFxuICAgICAgbmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKSA/PyBcIlwiXG4gICAgKTtcbiAgICBjb25zdCB1cGRhdGUgPSAodGFyZ2V0TGlzdCwgbWF0Y2hBZ2FpbnN0LCBhY3Rpb24pID0+IHtcbiAgICAgIGZvciAoY29uc3QgdGFyZ2V0MiBvZiB0YXJnZXRMaXN0KSB7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nID0gbWF0Y2hBZ2FpbnN0LmZpbmQoKG4pID0+IG4uaXNFcXVhbE5vZGUodGFyZ2V0MikpO1xuICAgICAgICBpZiAobWF0Y2hpbmcpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb24odGFyZ2V0Mik7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBvbGRUYWdzID0gW1xuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKVxuICAgIF07XG4gICAgY29uc3QgbmV3VGFncyA9IFtcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSlcbiAgICBdO1xuICAgIHVwZGF0ZShuZXdUYWdzLCBvbGRUYWdzLCAobm9kZSkgPT4gZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChub2RlKSk7XG4gICAgdXBkYXRlKG9sZFRhZ3MsIG5ld1RhZ3MsIChub2RlKSA9PiBub2RlLnJlbW92ZSgpKTtcbiAgfVxuICBpZiAocHVzaFN0YXRlKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXRVUkwuaHJlZik7XG4gIGxvYWRIb29rTWFuYWdlci5jYWxsQ2xlYW51cEZ1bmN0aW9ucygpO1xuICB7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBuYXZpZ2F0aW9uQ2FsbGJhY2tzKSB7XG4gICAgICBjYWxsYmFjayhwYXRobmFtZSk7XG4gICAgfVxuICB9XG4gIGF3YWl0IGxvYWRQYWdlKCk7XG4gIGlmICh0YXJnZXRVUkwuaGFzaCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHNhZmVQZXJjZW50RGVjb2RlKGlucHV0KSB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKFxuICAgIC8lWzAtOUEtRmEtZl17Mn0vZyxcbiAgICAobSkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChtLnNsaWNlKDEpLCAxNikpXG4gICk7XG59XG5mdW5jdGlvbiBzYW5pdGl6ZVBhdGhuYW1lKHBhdGhuYW1lID0gXCJcIikge1xuICBpZiAoIXBhdGhuYW1lKSByZXR1cm4gXCIvXCI7XG4gIHBhdGhuYW1lID0gc2FmZVBlcmNlbnREZWNvZGUocGF0aG5hbWUpO1xuICBwYXRobmFtZSA9IFwiL1wiICsgcGF0aG5hbWU7XG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKy9nLCBcIi9cIik7XG4gIGNvbnN0IHNlZ21lbnRzID0gcGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuICBjb25zdCByZXNvbHZlZCA9IFtdO1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICBpZiAoIXNlZ21lbnQgfHwgc2VnbWVudCA9PT0gXCIuXCIpIGNvbnRpbnVlO1xuICAgIGlmIChzZWdtZW50ID09PSBcIi4uXCIpIHtcbiAgICAgIHJlc29sdmVkLnBvcCgpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJlc29sdmVkLnB1c2goc2VnbWVudCk7XG4gIH1cbiAgY29uc3QgZW5jb2RlZCA9IHJlc29sdmVkLm1hcCgocykgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHMpKTtcbiAgcmV0dXJuIFwiL1wiICsgZW5jb2RlZC5qb2luKFwiL1wiKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGdldFBhZ2VEYXRhKHBhdGhuYW1lKSB7XG4gIGNvbnN0IGRhdGFTY3JpcHRUYWcgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICBpZiAoIWRhdGFTY3JpcHRUYWcpIHtcbiAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYEZhaWxlZCB0byBmaW5kIHNjcmlwdCB0YWcgZm9yIHF1ZXJ5OnNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGltcG9ydChkYXRhU2NyaXB0VGFnLnNyYyk7XG4gIGNvbnN0IHtcbiAgICBzdWJqZWN0cyxcbiAgICBldmVudExpc3RlbmVycyxcbiAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICBvYnNlcnZlcnMsXG4gICAgb2JzZXJ2ZXJPcHRpb25zXG4gIH0gPSBkYXRhO1xuICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgREVWX0JVSUxEICYmIGVycm9yT3V0KGBQb3NzaWJseSBtYWxmb3JtZWQgcGFnZSBkYXRhICR7ZGF0YX1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59XG5mdW5jdGlvbiBlcnJvck91dChtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQYWdlKCkge1xuICB3aW5kb3cub25wb3BzdGF0ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIGF3YWl0IG5hdmlnYXRlTG9jYWxseSh0YXJnZXQubG9jYXRpb24uaHJlZiwgZmFsc2UpO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIHRhcmdldC5sb2NhdGlvbi5ocmVmKTtcbiAgfTtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gIGNvbnN0IHtcbiAgICBzdWJqZWN0cyxcbiAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICBldmVudExpc3RlbmVycyxcbiAgICBvYnNlcnZlcnMsXG4gICAgb2JzZXJ2ZXJPcHRpb25zLFxuICAgIGxvYWRIb29rc1xuICB9ID0gYXdhaXQgZ2V0UGFnZURhdGEocGF0aG5hbWUpO1xuICBERVZfQlVJTEQ6IHtcbiAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgcGFnZURhdGE6IHtcbiAgICAgICAgc3ViamVjdHMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgICAgIGxvYWRIb29rc1xuICAgICAgfSxcbiAgICAgIHN0YXRlTWFuYWdlcixcbiAgICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICAgICAgb2JzZXJ2ZXJNYW5hZ2VyLFxuICAgICAgbG9hZEhvb2tNYW5hZ2VyXG4gICAgfTtcbiAgfVxuICBnbG9iYWxUaGlzLmVsZWdhbmNlQ2xpZW50ID0ge1xuICAgIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQsXG4gICAgZmV0Y2hQYWdlLFxuICAgIG5hdmlnYXRlTG9jYWxseSxcbiAgICBvbk5hdmlnYXRlLFxuICAgIHJlbW92ZU5hdmlnYXRpb25DYWxsYmFja1xuICB9O1xuICBzdGF0ZU1hbmFnZXIubG9hZFZhbHVlcyhzdWJqZWN0cyk7XG4gIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmxvYWRWYWx1ZXMoZXZlbnRMaXN0ZW5lcnMpO1xuICBldmVudExpc3RlbmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLmxvYWRWYWx1ZXMob2JzZXJ2ZXJzKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLnRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCk7XG4gIGxvYWRIb29rTWFuYWdlci5sb2FkVmFsdWVzKGxvYWRIb29rcyk7XG59XG5sb2FkUGFnZSgpO1xuZXhwb3J0IHtcbiAgQ2xpZW50U3ViamVjdCxcbiAgRXZlbnRMaXN0ZW5lck1hbmFnZXIsXG4gIExvYWRIb29rTWFuYWdlcixcbiAgT2JzZXJ2ZXJNYW5hZ2VyLFxuICBTdGF0ZU1hbmFnZXJcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFDQSxNQUFJLHVCQUF1QixNQUFNO0FBQUEsRUFDakM7QUFDQSxXQUFTLFlBQVksT0FBTztBQUMxQixRQUFJLFVBQVUsUUFBUSxVQUFVLFdBQVcsT0FBTyxVQUFVLFlBQVksTUFBTSxRQUFRLEtBQUssS0FBSyxpQkFBaUIsaUJBQWtCLFFBQU87QUFDMUksV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLGtCQUFrQixNQUFNO0FBQUEsSUFDMUIsWUFBWSxLQUFLLFVBQVUsQ0FBQyxHQUFHLFdBQVcsTUFBTTtBQUM5QyxXQUFLLE1BQU07QUFDWCxVQUFJLFlBQVksT0FBTyxHQUFHO0FBQ3hCLFlBQUksS0FBSyxnQkFBZ0IsTUFBTSxPQUFPO0FBQ3BDLGtCQUFRLE1BQU0sZ0JBQWdCLE1BQU0sZ0NBQWdDO0FBQ3BFLGdCQUFNO0FBQUEsUUFDUjtBQUNBLGFBQUssV0FBVyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsQ0FBQztBQUMzQyxhQUFLLFVBQVUsQ0FBQztBQUFBLE1BQ2xCLE9BQU87QUFDTCxhQUFLLFVBQVU7QUFDZixhQUFLLFdBQVc7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGtCQUFrQjtBQUNoQixhQUFPLEtBQUssYUFBYTtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUdBLE1BQUksOEJBQThCO0FBQUEsSUFDaEM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNBLE1BQUksa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLDZCQUE2QjtBQUFBLElBQy9CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNBLE1BQUksaUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNBLE1BQUksZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLG9CQUFvQjtBQUFBLElBQ3RCO0FB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
