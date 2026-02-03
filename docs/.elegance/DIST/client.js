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
    "varElement",
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
        const getSelf = function getSelf2() {
          return element;
        };
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
  var navigateLocally = async (target, pushState = true, isPopState = false) => {
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);
    if (!isPopState && pathname === sanitizePathname(window.location.pathname)) {
      if (targetURL.hash) {
        document.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
      }
      if (pushState) history.pushState(null, "", targetURL.href);
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
      const prev = window.location.pathname;
      event.preventDefault();
      const target = event.target;
      await navigateLocally(target.location.href, false, true);
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
      removeNavigationCallback,
      genLocalID
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4gPSBudWxsKSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW29wdGlvbnMsIC4uLmNoaWxkcmVuID8/IFtdXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBjYW5IYXZlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gIH1cbn07XG5cbi8vIHNyYy9lbGVtZW50cy9lbGVtZW50X2xpc3QudHNcbnZhciBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwiYXJlYVwiLFxuICBcImJhc2VcIixcbiAgXCJiclwiLFxuICBcImNvbFwiLFxuICBcImVtYmVkXCIsXG4gIFwiaHJcIixcbiAgXCJpbWdcIixcbiAgXCJpbnB1dFwiLFxuICBcImxpbmtcIixcbiAgXCJtZXRhXCIsXG4gIFwicGFyYW1cIixcbiAgXCJzb3VyY2VcIixcbiAgXCJ0cmFja1wiLFxuICBcIndiclwiXG5dO1xudmFyIGh0bWxFbGVtZW50VGFncyA9IFtcbiAgXCJhXCIsXG4gIFwiYWJiclwiLFxuICBcImFkZHJlc3NcIixcbiAgXCJhcnRpY2xlXCIsXG4gIFwiYXNpZGVcIixcbiAgXCJhdWRpb1wiLFxuICBcImJcIixcbiAgXCJiZGlcIixcbiAgXCJiZG9cIixcbiAgXCJibG9ja3F1b3RlXCIsXG4gIFwiYm9keVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFxuICBcImNhcHRpb25cIixcbiAgXCJjaXRlXCIsXG4gIFwiY29kZVwiLFxuICBcImNvbGdyb3VwXCIsXG4gIFwiZGF0YVwiLFxuICBcImRhdGFsaXN0XCIsXG4gIFwiZGRcIixcbiAgXCJkZWxcIixcbiAgXCJkZXRhaWxzXCIsXG4gIFwiZGZuXCIsXG4gIFwiZGlhbG9nXCIsXG4gIFwiZGl2XCIsXG4gIFwiZGxcIixcbiAgXCJkdFwiLFxuICBcImVtXCIsXG4gIFwiZmllbGRzZXRcIixcbiAgXCJmaWdjYXB0aW9uXCIsXG4gIFwiZmlndXJlXCIsXG4gIFwiZm9vdGVyXCIsXG4gIFwiZm9ybVwiLFxuICBcImgxXCIsXG4gIFwiaDJcIixcbiAgXCJoM1wiLFxuICBcImg0XCIsXG4gIFwiaDVcIixcbiAgXCJoNlwiLFxuICBcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcbiAgXCJoZ3JvdXBcIixcbiAgXCJodG1sXCIsXG4gIFwiaVwiLFxuICBcImlmcmFtZVwiLFxuICBcImluc1wiLFxuICBcImtiZFwiLFxuICBcImxhYmVsXCIsXG4gIFwibGVnZW5kXCIsXG4gIFwibGlcIixcbiAgXCJtYWluXCIsXG4gIFwibWFwXCIsXG4gIFwibWFya1wiLFxuICBcIm1lbnVcIixcbiAgXCJtZXRlclwiLFxuICBcIm5hdlwiLFxuICBcIm5vc2NyaXB0XCIsXG4gIFwib2JqZWN0XCIsXG4gIFwib2xcIixcbiAgXCJvcHRncm91cFwiLFxuICBcIm9wdGlvblwiLFxuICBcIm91dHB1dFwiLFxuICBcInBcIixcbiAgXCJwaWN0dXJlXCIsXG4gIFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcbiAgXCJxXCIsXG4gIFwicnBcIixcbiAgXCJydFwiLFxuICBcInJ1YnlcIixcbiAgXCJzXCIsXG4gIFwic2FtcFwiLFxuICBcInNjcmlwdFwiLFxuICBcInNlYXJjaFwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJzZWxlY3RcIixcbiAgXCJzbG90XCIsXG4gIFwic21hbGxcIixcbiAgXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXG4gIFwic3R5bGVcIixcbiAgXCJzdWJcIixcbiAgXCJzdW1tYXJ5XCIsXG4gIFwic3VwXCIsXG4gIFwidGFibGVcIixcbiAgXCJ0Ym9keVwiLFxuICBcInRkXCIsXG4gIFwidGVtcGxhdGVcIixcbiAgXCJ0ZXh0YXJlYVwiLFxuICBcInRmb290XCIsXG4gIFwidGhcIixcbiAgXCJ0aGVhZFwiLFxuICBcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFxuICBcInRyXCIsXG4gIFwidVwiLFxuICBcInVsXCIsXG4gIFwidmFyRWxlbWVudFwiLFxuICBcInZpZGVvXCJcbl07XG52YXIgc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwicGF0aFwiLFxuICBcImNpcmNsZVwiLFxuICBcImVsbGlwc2VcIixcbiAgXCJsaW5lXCIsXG4gIFwicG9seWdvblwiLFxuICBcInBvbHlsaW5lXCIsXG4gIFwic3RvcFwiXG5dO1xudmFyIHN2Z0VsZW1lbnRUYWdzID0gW1xuICBcInN2Z1wiLFxuICBcImdcIixcbiAgXCJ0ZXh0XCIsXG4gIFwidHNwYW5cIixcbiAgXCJ0ZXh0UGF0aFwiLFxuICBcImRlZnNcIixcbiAgXCJzeW1ib2xcIixcbiAgXCJ1c2VcIixcbiAgXCJpbWFnZVwiLFxuICBcImNsaXBQYXRoXCIsXG4gIFwibWFza1wiLFxuICBcInBhdHRlcm5cIixcbiAgXCJsaW5lYXJHcmFkaWVudFwiLFxuICBcInJhZGlhbEdyYWRpZW50XCIsXG4gIFwiZmlsdGVyXCIsXG4gIFwibWFya2VyXCIsXG4gIFwidmlld1wiLFxuICBcImZlQmxlbmRcIixcbiAgXCJmZUNvbG9yTWF0cml4XCIsXG4gIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLFxuICBcImZlQ29tcG9zaXRlXCIsXG4gIFwiZmVDb252b2x2ZU1hdHJpeFwiLFxuICBcImZlRGlmZnVzZUxpZ2h0aW5nXCIsXG4gIFwiZmVEaXNwbGFjZW1lbnRNYXBcIixcbiAgXCJmZURpc3RhbnRMaWdodFwiLFxuICBcImZlRmxvb2RcIixcbiAgXCJmZUZ1bmNBXCIsXG4gIFwiZmVGdW5jQlwiLFxuICBcImZlRnVuY0dcIixcbiAgXCJmZUZ1bmNSXCIsXG4gIFwiZmVHYXVzc2lhbkJsdXJcIixcbiAgXCJmZUltYWdlXCIsXG4gIFwiZmVNZXJnZVwiLFxuICBcImZlTWVyZ2VOb2RlXCIsXG4gIFwiZmVNb3JwaG9sb2d5XCIsXG4gIFwiZmVPZmZzZXRcIixcbiAgXCJmZVBvaW50TGlnaHRcIixcbiAgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIixcbiAgXCJmZVNwb3RMaWdodFwiLFxuICBcImZlVGlsZVwiLFxuICBcImZlVHVyYnVsZW5jZVwiXG5dO1xudmFyIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcIm1pXCIsXG4gIFwibW5cIixcbiAgXCJtb1wiXG5dO1xudmFyIG1hdGhtbEVsZW1lbnRUYWdzID0gW1xuICBcIm1hdGhcIixcbiAgXCJtc1wiLFxuICBcIm10ZXh0XCIsXG4gIFwibXJvd1wiLFxuICBcIm1mZW5jZWRcIixcbiAgXCJtc3VwXCIsXG4gIFwibXN1YlwiLFxuICBcIm1zdWJzdXBcIixcbiAgXCJtZnJhY1wiLFxuICBcIm1zcXJ0XCIsXG4gIFwibXJvb3RcIixcbiAgXCJtdGFibGVcIixcbiAgXCJtdHJcIixcbiAgXCJtdGRcIixcbiAgXCJtc3R5bGVcIixcbiAgXCJtZW5jbG9zZVwiLFxuICBcIm1tdWx0aXNjcmlwdHNcIlxuXTtcbnZhciBlbGVtZW50cyA9IHt9O1xudmFyIGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucywgLi4uY2hpbGRyZW4pID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBjaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKSB7XG4gIHJldHVybiAoKG9wdGlvbnMpID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBudWxsKSk7XG59XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbnZhciBhbGxFbGVtZW50cyA9IHtcbiAgLi4uZWxlbWVudHMsXG4gIC4uLmNoaWxkcmVubGVzc0VsZW1lbnRzXG59O1xuXG4vLyBzcmMvY2xpZW50L3J1bnRpbWUudHNcbk9iamVjdC5hc3NpZ24od2luZG93LCBhbGxFbGVtZW50cyk7XG52YXIgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xudmFyIGlkQ291bnRlciA9IDA7XG5mdW5jdGlvbiBnZW5Mb2NhbElEKCkge1xuICBpZENvdW50ZXIrKztcbiAgcmV0dXJuIGlkQ291bnRlcjtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgY29uc3QgZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50YWcpO1xuICB7XG4gICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGVsZW1lbnQub3B0aW9ucyk7XG4gICAgZm9yIChjb25zdCBbb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgIGlmIChvcHRpb25WYWx1ZSBpbnN0YW5jZW9mIFNwZWNpYWxFbGVtZW50T3B0aW9uKSB7XG4gICAgICAgIG9wdGlvblZhbHVlLm11dGF0ZShlbGVtZW50LCBvcHRpb25OYW1lKTtcbiAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCh7IGVsZW1lbnRLZXksIG9wdGlvbk5hbWUsIG9wdGlvblZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUob3B0aW9uTmFtZSwgYCR7b3B0aW9uVmFsdWV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChlbGVtZW50LmtleSkge1xuICAgIGRvbUVsZW1lbnQuc2V0QXR0cmlidXRlKFwia2V5XCIsIGVsZW1lbnQua2V5KTtcbiAgfVxuICB7XG4gICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgICAgZG9tRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4geyByb290OiBkb21FbGVtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zID0gW107XG4gIGlmIChlbGVtZW50ID09PSB2b2lkIDAgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgIHJldHVybiB7IHJvb3Q6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpLCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IFtdIH07XG4gIH1cbiAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGVsZW1lbnQpKSB7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHN1YkVsZW1lbnQgb2YgZWxlbWVudCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgRWxlZ2FuY2VFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVnYW5jZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoaXMgZWxlbWVudCBpcyBhbiBhcmJpdHJhcnkgb2JqZWN0LCBhbmQgYXJiaXRyYXJ5IG9iamVjdHMgYXJlIG5vdCB2YWxpZCBjaGlsZHJlbi4gUGxlYXNlIG1ha2Ugc3VyZSBhbGwgZWxlbWVudHMgYXJlIG9uZSBvZjogRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gQWxzbyBub3RlIHRoYXQgY3VycmVudGx5IGluIGNsaWVudCBjb21wb25lbnRzIGxpa2UgcmVhY3RpdmVNYXAsIHN0YXRlIHN1YmplY3QgcmVmZXJlbmNlcyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLmApO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIGNvbnN0IHRleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiA/IGVsZW1lbnQgOiBlbGVtZW50LnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgICAgcmV0dXJuIHsgcm9vdDogdGV4dE5vZGUsIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICB9XG59XG5ERVZfQlVJTEQgJiYgKCgpID0+IHtcbiAgbGV0IGlzRXJyb3JlZCA9IGZhbHNlO1xuICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZShcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9lbGVnYW5jZS1ob3QtcmVsb2FkXCIpO1xuICAgIGVzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIGlmIChpc0Vycm9yZWQpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJob3QtcmVsb2FkXCIpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICBlcy5jbG9zZSgpO1xuICAgICAgc2V0VGltZW91dChjb25uZWN0LCAxZTMpO1xuICAgIH07XG4gIH0pKCk7XG59KSgpO1xudmFyIENsaWVudFN1YmplY3QgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCB2YWx1ZSkge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgfVxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZShuZXdWYWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAqIFxuICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAqL1xuICB0cmlnZ2VyT2JzZXJ2ZXJzKCkge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgIG9ic2VydmVyKHRoaXMuX3ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAqIFxuICAgKiBOb3RlOiB0aGlzIHRyaWdnZXJzIGBjYWxsYmFja2Agd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIHN1YmplY3QuXG4gICAqIFxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGlzIG9ic2VydmVyXG4gICAqIEBwYXJhbSBjYWxsYmFjayBDYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoaXMgc3ViamVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgb2JzZXJ2ZShpZCwgY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5vYnNlcnZlcnMuaGFzKGlkKSkge1xuICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICB9XG4gICAgdGhpcy5vYnNlcnZlcnMuc2V0KGlkLCBjYWxsYmFjayk7XG4gICAgY2FsbGJhY2sodGhpcy52YWx1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYnNlcnZlciBmcm9tIHRoaXMgc3ViamVjdC5cbiAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgKi9cbiAgdW5vYnNlcnZlKGlkKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgfVxufTtcbnZhciBTdGF0ZU1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3ViamVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXModmFsdWVzLCBkb092ZXJ3cml0ZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh0aGlzLnN1YmplY3RzLmhhcyh2YWx1ZS5pZCkgJiYgZG9PdmVyd3JpdGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpO1xuICB9XG4gIGdldEFsbChpZHMpIHtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmdldChpZCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufTtcbnZhciBDbGllbnRFdmVudExpc3RlbmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gIH1cbiAgY2FsbChldikge1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIHRoaXMuY2FsbGJhY2soZXYsIC4uLmRlcGVuZGVuY2llcyk7XG4gIH1cbn07XG52YXIgRXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoc2VydmVyRXZlbnRMaXN0ZW5lcnMsIGRvT3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgIGZvciAoY29uc3Qgc2VydmVyRXZlbnRMaXN0ZW5lciBvZiBzZXJ2ZXJFdmVudExpc3RlbmVycykge1xuICAgICAgaWYgKHRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudEV2ZW50TGlzdGVuZXIgPSBuZXcgQ2xpZW50RXZlbnRMaXN0ZW5lcihzZXJ2ZXJFdmVudExpc3RlbmVyLmlkLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmNhbGxiYWNrLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldChjbGllbnRFdmVudExpc3RlbmVyLmlkLCBjbGllbnRFdmVudExpc3RlbmVyKTtcbiAgICB9XG4gIH1cbiAgaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3QgZXZlbnRMaXN0ZW5lck9wdGlvbiBvZiBldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtrZXk9XCIke2V2ZW50TGlzdGVuZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBldmVudExpc3RlbmVyID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCk7XG4gICAgICBpZiAoIWV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBFdmVudExpc3RlbmVyT3B0aW9uOiBFdmVudCBsaXN0ZW5lciB3aXRoIGlkIFxcdTIwMURcIiArIGV2ZW50TGlzdGVuZXJPcHRpb24uaWQgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRbZXZlbnRMaXN0ZW5lck9wdGlvbi5vcHRpb25dID0gKGV2KSA9PiB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIuY2FsbChldik7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoaWQpO1xuICB9XG59O1xudmFyIENsaWVudE9ic2VydmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuc3ViamVjdFZhbHVlcyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKHRoaXMuZGVwZW5kZW5jaWVzKTtcbiAgICBmb3IgKGNvbnN0IGluaXRpYWxWYWx1ZSBvZiBpbml0aWFsVmFsdWVzKSB7XG4gICAgICBjb25zdCBpZHggPSB0aGlzLnN1YmplY3RWYWx1ZXMubGVuZ3RoO1xuICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzLnB1c2goaW5pdGlhbFZhbHVlLnZhbHVlKTtcbiAgICAgIGluaXRpYWxWYWx1ZS5vYnNlcnZlKHRoaXMuaWQsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmNhbGwoKTtcbiAgfVxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdXBkYXRlIHdoZW4gdGhpcyBvYnNlcnZlciB1cGRhdGVzLlxuICAgKi9cbiAgYWRkRWxlbWVudChlbGVtZW50LCBvcHRpb25OYW1lKSB7XG4gICAgdGhpcy5lbGVtZW50cy5wdXNoKHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9KTtcbiAgfVxuICBzZXRQcm9wKGVsZW1lbnQsIGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoa2V5LnN0YXJ0c1dpdGgoXCJvblwiKSAmJiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGtleS5zbGljZSgyKSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoa2V5IGluIGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGlzVHJ1dGh5ID0gdmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCI7XG4gICAgICBpZiAoaXNUcnV0aHkpIHtcbiAgICAgICAgZWxlbWVudFtrZXldID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGNhbGwoKSB7XG4gICAgZm9yIChjb25zdCB7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBjb25zdCBnZXRTZWxmID0gZnVuY3Rpb24gZ2V0U2VsZjIoKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjay5jYWxsKGVsZW1lbnQsIC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG4gICAgICB0aGlzLnNldFByb3AoZWxlbWVudCwgb3B0aW9uTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxufTtcbnZhciBPYnNlcnZlck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgfVxuICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJPYnNlcnZlciBvZiBzZXJ2ZXJPYnNlcnZlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudE9ic2VydmVycy5oYXMoc2VydmVyT2JzZXJ2ZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvYnNlcnZlci5hZGRFbGVtZW50KGVsZW1lbnQsIG9ic2VydmVyT3B0aW9uLm9wdGlvbik7XG4gICAgICBvYnNlcnZlci5jYWxsKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgIGNvbnN0IG9ic2VydmVyTm9kZXMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbb11cIikpO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICBsZXQgdXBkYXRlMiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9O1xuICAgICAgdmFyIHVwZGF0ZSA9IHVwZGF0ZTI7XG4gICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9cIik7XG4gICAgICBjb25zdCBzdWJqZWN0ID0gc3RhdGVNYW5hZ2VyLmdldChzdWJqZWN0SWQpO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIERFVl9CVUlMRDogZXJyb3JPdXQoXCJGYWlsZWQgdG8gZmluZCBzdWJqZWN0IHdpdGggaWQgXCIgKyBzdWJqZWN0SWQgKyBcIiBmb3Igb2JzZXJ2ZXJOb2RlLlwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YmplY3QudmFsdWUpO1xuICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgIHN1YmplY3Qub2JzZXJ2ZShpZCwgdXBkYXRlMik7XG4gICAgICB1cGRhdGUyKHN1YmplY3QudmFsdWUpO1xuICAgICAgbm9kZS5yZXBsYWNlV2l0aCh0ZXh0Tm9kZSk7XG4gICAgfVxuICB9XG59O1xudmFyIExvYWRIb29rTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzID0gW107XG4gIH1cbiAgbG9hZFZhbHVlcyhsb2FkSG9va3MpIHtcbiAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuICAgICAgaWYgKHRoaXMuYWN0aXZlTG9hZEhvb2tzLmluY2x1ZGVzKGxvYWRIb29rLmlkKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzLnB1c2gobG9hZEhvb2suaWQpO1xuICAgICAgY29uc3QgY2xlYW51cEZ1bmN0aW9uID0gbG9hZEhvb2suY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgIGlmIChjbGVhbnVwRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgIGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICBwYXRobmFtZTogbG9hZEhvb2sucGF0aG5hbWUsXG4gICAgICAgICAgbG9hZEhvb2tJZHg6IHRoaXMuYWN0aXZlTG9hZEhvb2tzLmxlbmd0aCAtIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxDbGVhbnVwRnVuY3Rpb25zKCkge1xuICAgIGxldCByZW1haW5pbmdQcm9jZWR1cmVzID0gW107XG4gICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IDAgLyogTEFZT1VUX0xPQURIT09LICovKSB7XG4gICAgICAgIGNvbnN0IGlzSW5TY29wZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKS5zdGFydHNXaXRoKGNsZWFudXBQcm9jZWR1cmUucGF0aG5hbWUpO1xuICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgcmVtYWluaW5nUHJvY2VkdXJlcy5wdXNoKGNsZWFudXBQcm9jZWR1cmUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3Muc3BsaWNlKGNsZWFudXBQcm9jZWR1cmUubG9hZEhvb2tJZHgsIDEpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgfVxufTtcbnZhciBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG52YXIgZXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbnZhciBzdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKCk7XG52YXIgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xudmFyIHBhZ2VTdHJpbmdDYWNoZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xudmFyIHhtbFNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xudmFyIGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkwpID0+IHtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgIHJldHVybiBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBhZ2VTdHJpbmdDYWNoZS5nZXQocGF0aG5hbWUpLCBcInRleHQvaHRtbFwiKTtcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICB7XG4gICAgY29uc3QgZGF0YVNjcmlwdHMgPSBuZXdBcnJheShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgY29uc3QgY3VycmVudFNjcmlwdHMgPSBuZXdBcnJheShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLXBhY2thZ2U9XCJ0cnVlXCJdJykpO1xuICAgIGZvciAoY29uc3QgZGF0YVNjcmlwdCBvZiBkYXRhU2NyaXB0cykge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50U2NyaXB0cy5maW5kKChzKSA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChkYXRhU2NyaXB0KTtcbiAgICB9XG4gIH1cbiAge1xuICAgIGNvbnN0IHBhZ2VEYXRhU2NyaXB0ID0gbmV3RE9NLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLWhvb2s9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIGNvbnN0IHRleHQgPSBwYWdlRGF0YVNjcmlwdC50ZXh0Q29udGVudDtcbiAgICBwYWdlRGF0YVNjcmlwdC5yZW1vdmUoKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6IFwidGV4dC9qYXZhc2NyaXB0XCIgfSk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgc2NyaXB0LnR5cGUgPSBcIm1vZHVsZVwiO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhZ2VcIiwgXCJ0cnVlXCIpO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgIG5ld0RPTS5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH1cbiAgcGFnZVN0cmluZ0NhY2hlLnNldChwYXRobmFtZSwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcbiAgcmV0dXJuIG5ld0RPTTtcbn07XG52YXIgbmF2aWdhdGlvbkNhbGxiYWNrcyA9IFtdO1xuZnVuY3Rpb24gb25OYXZpZ2F0ZShjYWxsYmFjaykge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gbmF2aWdhdGlvbkNhbGxiYWNrcy5sZW5ndGggLSAxO1xufVxuZnVuY3Rpb24gcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrKGlkeCkge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnNwbGljZShpZHgsIDEpO1xufVxudmFyIG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQsIHB1c2hTdGF0ZSA9IHRydWUsIGlzUG9wU3RhdGUgPSBmYWxzZSkgPT4ge1xuICBjb25zdCB0YXJnZXRVUkwgPSBuZXcgVVJMKHRhcmdldCk7XG4gIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh0YXJnZXRVUkwucGF0aG5hbWUpO1xuICBpZiAoIWlzUG9wU3RhdGUgJiYgcGF0aG5hbWUgPT09IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSkge1xuICAgIGlmICh0YXJnZXRVUkwuaGFzaCkge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0VVJMLmhhc2guc2xpY2UoMSkpPy5zY3JvbGxJbnRvVmlldygpO1xuICAgIH1cbiAgICBpZiAocHVzaFN0YXRlKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXRVUkwuaHJlZik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBuZXdQYWdlID0gYXdhaXQgZmV0Y2hQYWdlKHRhcmdldFVSTCk7XG4gIGlmICghbmV3UGFnZSkgcmV0dXJuO1xuICBsZXQgb2xkUGFnZUxhdGVzdCA9IGRvY3VtZW50LmJvZHk7XG4gIGxldCBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZS5ib2R5O1xuICB7XG4gICAgY29uc3QgbmV3UGFnZUxheW91dHMgPSBuZXdBcnJheShuZXdQYWdlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKTtcbiAgICBjb25zdCBvbGRQYWdlTGF5b3V0cyA9IG5ld0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKTtcbiAgICBjb25zdCBzaXplID0gTWF0aC5taW4obmV3UGFnZUxheW91dHMubGVuZ3RoLCBvbGRQYWdlTGF5b3V0cy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCBuZXdQYWdlTGF5b3V0ID0gbmV3UGFnZUxheW91dHNbaV07XG4gICAgICBjb25zdCBvbGRQYWdlTGF5b3V0ID0gb2xkUGFnZUxheW91dHNbaV07XG4gICAgICBjb25zdCBuZXdMYXlvdXRJZCA9IG5ld1BhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgY29uc3Qgb2xkTGF5b3V0SWQgPSBvbGRQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgIGlmIChuZXdMYXlvdXRJZCAhPT0gb2xkTGF5b3V0SWQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBvbGRQYWdlTGF0ZXN0ID0gb2xkUGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICB9XG4gIGNvbnN0IGhlYWQgPSBkb2N1bWVudC5oZWFkO1xuICBjb25zdCBuZXdIZWFkID0gbmV3UGFnZS5oZWFkO1xuICBvbGRQYWdlTGF0ZXN0LnJlcGxhY2VXaXRoKG5ld1BhZ2VMYXRlc3QpO1xuICB7XG4gICAgZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIik/LnJlcGxhY2VXaXRoKFxuICAgICAgbmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKSA/PyBcIlwiXG4gICAgKTtcbiAgICBjb25zdCB1cGRhdGUgPSAodGFyZ2V0TGlzdCwgbWF0Y2hBZ2FpbnN0LCBhY3Rpb24pID0+IHtcbiAgICAgIGZvciAoY29uc3QgdGFyZ2V0MiBvZiB0YXJnZXRMaXN0KSB7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nID0gbWF0Y2hBZ2FpbnN0LmZpbmQoKG4pID0+IG4uaXNFcXVhbE5vZGUodGFyZ2V0MikpO1xuICAgICAgICBpZiAobWF0Y2hpbmcpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb24odGFyZ2V0Mik7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBvbGRUYWdzID0gW1xuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKVxuICAgIF07XG4gICAgY29uc3QgbmV3VGFncyA9IFtcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSlcbiAgICBdO1xuICAgIHVwZGF0ZShuZXdUYWdzLCBvbGRUYWdzLCAobm9kZSkgPT4gZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChub2RlKSk7XG4gICAgdXBkYXRlKG9sZFRhZ3MsIG5ld1RhZ3MsIChub2RlKSA9PiBub2RlLnJlbW92ZSgpKTtcbiAgfVxuICBpZiAocHVzaFN0YXRlKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXRVUkwuaHJlZik7XG4gIGxvYWRIb29rTWFuYWdlci5jYWxsQ2xlYW51cEZ1bmN0aW9ucygpO1xuICB7XG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBuYXZpZ2F0aW9uQ2FsbGJhY2tzKSB7XG4gICAgICBjYWxsYmFjayhwYXRobmFtZSk7XG4gICAgfVxuICB9XG4gIGF3YWl0IGxvYWRQYWdlKCk7XG4gIGlmICh0YXJnZXRVUkwuaGFzaCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHNhZmVQZXJjZW50RGVjb2RlKGlucHV0KSB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKFxuICAgIC8lWzAtOUEtRmEtZl17Mn0vZyxcbiAgICAobSkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChtLnNsaWNlKDEpLCAxNikpXG4gICk7XG59XG5mdW5jdGlvbiBzYW5pdGl6ZVBhdGhuYW1lKHBhdGhuYW1lID0gXCJcIikge1xuICBpZiAoIXBhdGhuYW1lKSByZXR1cm4gXCIvXCI7XG4gIHBhdGhuYW1lID0gc2FmZVBlcmNlbnREZWNvZGUocGF0aG5hbWUpO1xuICBwYXRobmFtZSA9IFwiL1wiICsgcGF0aG5hbWU7XG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKy9nLCBcIi9cIik7XG4gIGNvbnN0IHNlZ21lbnRzID0gcGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuICBjb25zdCByZXNvbHZlZCA9IFtdO1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICBpZiAoIXNlZ21lbnQgfHwgc2VnbWVudCA9PT0gXCIuXCIpIGNvbnRpbnVlO1xuICAgIGlmIChzZWdtZW50ID09PSBcIi4uXCIpIHtcbiAgICAgIHJlc29sdmVkLnBvcCgpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJlc29sdmVkLnB1c2goc2VnbWVudCk7XG4gIH1cbiAgY29uc3QgZW5jb2RlZCA9IHJlc29sdmVkLm1hcCgocykgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHMpKTtcbiAgcmV0dXJuIFwiL1wiICsgZW5jb2RlZC5qb2luKFwiL1wiKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGdldFBhZ2VEYXRhKHBhdGhuYW1lKSB7XG4gIGNvbnN0IGRhdGFTY3JpcHRUYWcgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICBpZiAoIWRhdGFTY3JpcHRUYWcpIHtcbiAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYEZhaWxlZCB0byBmaW5kIHNjcmlwdCB0YWcgZm9yIHF1ZXJ5OnNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGltcG9ydChkYXRhU2NyaXB0VGFnLnNyYyk7XG4gIGNvbnN0IHtcbiAgICBzdWJqZWN0cyxcbiAgICBldmVudExpc3RlbmVycyxcbiAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICBvYnNlcnZlcnMsXG4gICAgb2JzZXJ2ZXJPcHRpb25zXG4gIH0gPSBkYXRhO1xuICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgREVWX0JVSUxEICYmIGVycm9yT3V0KGBQb3NzaWJseSBtYWxmb3JtZWQgcGFnZSBkYXRhICR7ZGF0YX1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59XG5mdW5jdGlvbiBlcnJvck91dChtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQYWdlKCkge1xuICB3aW5kb3cub25wb3BzdGF0ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHByZXYgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgYXdhaXQgbmF2aWdhdGVMb2NhbGx5KHRhcmdldC5sb2NhdGlvbi5ocmVmLCBmYWxzZSwgdHJ1ZSk7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0LmxvY2F0aW9uLmhyZWYpO1xuICB9O1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgbG9hZEhvb2tzXG4gIH0gPSBhd2FpdCBnZXRQYWdlRGF0YShwYXRobmFtZSk7XG4gIERFVl9CVUlMRDoge1xuICAgIGdsb2JhbFRoaXMuZGV2dG9vbHMgPSB7XG4gICAgICBwYWdlRGF0YToge1xuICAgICAgICBzdWJqZWN0cyxcbiAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgICAgICBvYnNlcnZlcnMsXG4gICAgICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICAgICAgbG9hZEhvb2tzXG4gICAgICB9LFxuICAgICAgc3RhdGVNYW5hZ2VyLFxuICAgICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIsXG4gICAgICBvYnNlcnZlck1hbmFnZXIsXG4gICAgICBsb2FkSG9va01hbmFnZXJcbiAgICB9O1xuICB9XG4gIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudCxcbiAgICBmZXRjaFBhZ2UsXG4gICAgbmF2aWdhdGVMb2NhbGx5LFxuICAgIG9uTmF2aWdhdGUsXG4gICAgcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrLFxuICAgIGdlbkxvY2FsSURcbiAgfTtcbiAgc3RhdGVNYW5hZ2VyLmxvYWRWYWx1ZXMoc3ViamVjdHMpO1xuICBldmVudExpc3RlbmVyTWFuYWdlci5sb2FkVmFsdWVzKGV2ZW50TGlzdGVuZXJzKTtcbiAgZXZlbnRMaXN0ZW5lck1hbmFnZXIuaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gIG9ic2VydmVyTWFuYWdlci5sb2FkVmFsdWVzKG9ic2VydmVycyk7XG4gIG9ic2VydmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucyk7XG4gIG9ic2VydmVyTWFuYWdlci50cmFuc2Zvcm1TdWJqZWN0T2JzZXJ2ZXJOb2RlcygpO1xuICBsb2FkSG9va01hbmFnZXIubG9hZFZhbHVlcyhsb2FkSG9va3MpO1xufVxubG9hZFBhZ2UoKTtcbmV4cG9ydCB7XG4gIENsaWVudFN1YmplY3QsXG4gIEV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICBMb2FkSG9va01hbmFnZXIsXG4gIE9ic2VydmVyTWFuYWdlcixcbiAgU3RhdGVNYW5hZ2VyXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQ0EsTUFBSSx1QkFBdUIsTUFBTTtBQUFBLEVBQ2pDO0FBQ0EsV0FBUyxZQUFZLE9BQU87QUFDMUIsUUFBSSxVQUFVLFFBQVEsVUFBVSxXQUFXLE9BQU8sVUFBVSxZQUFZLE1BQU0sUUFBUSxLQUFLLEtBQUssaUJBQWlCLGlCQUFrQixRQUFPO0FBQzFJLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxrQkFBa0IsTUFBTTtBQUFBLElBQzFCLFlBQVksS0FBSyxVQUFVLENBQUMsR0FBRyxXQUFXLE1BQU07QUFDOUMsV0FBSyxNQUFNO0FBQ1gsVUFBSSxZQUFZLE9BQU8sR0FBRztBQUN4QixZQUFJLEtBQUssZ0JBQWdCLE1BQU0sT0FBTztBQUNwQyxrQkFBUSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUNwRSxnQkFBTTtBQUFBLFFBQ1I7QUFDQSxhQUFLLFdBQVcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUM7QUFDM0MsYUFBSyxVQUFVLENBQUM7QUFBQSxNQUNsQixPQUFPO0FBQ0wsYUFBSyxVQUFVO0FBQ2YsYUFBSyxXQUFXO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxrQkFBa0I7QUFDaEIsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLDhCQUE4QjtBQUFBLElBQ2hDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGtCQUFrQjtBQUFBLElBQ3BCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSw2QkFBNkI7QUFBQSxJQUMvQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FB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
