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
  var EffectManager = class {
    constructor() {
      this.activeEffects = [];
      this.cleanupProcedures = /* @__PURE__ */ new Map();
    }
    loadValues(effects) {
      for (const effect of effects) {
        const depencencies = stateManager.getAll(effect.dependencies);
        if (this.activeEffects.includes(effect.id)) {
          continue;
        }
        this.activeEffects.push(effect.id);
        const update = () => {
          if (this.cleanupProcedures.has(effect.id)) {
            this.cleanupProcedures.get(effect.id)();
          }
          effect.callback(...depencencies);
        };
        for (const dependency of depencencies) {
          const id = genLocalID().toString();
          dependency.observe(id, update);
        }
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
  var effectManager = new EffectManager();
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
      observerOptions,
      effects
    } = data;
    if (!eventListenerOptions || !eventListeners || !observers || !subjects || !observerOptions || !effects) {
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
      loadHooks,
      effects
    } = await getPageData(pathname);
    DEV_BUILD: {
      globalThis.devtools = {
        pageData: {
          subjects,
          eventListenerOptions,
          eventListeners,
          observers,
          observerOptions,
          loadHooks,
          effects
        },
        stateManager,
        eventListenerManager,
        observerManager,
        loadHookManager,
        effectManager
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
    effectManager.loadValues(effects);
  }
  loadPage();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4gPSBudWxsKSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW29wdGlvbnMsIC4uLmNoaWxkcmVuID8/IFtdXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgfVxuICBjYW5IYXZlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gIH1cbn07XG5cbi8vIHNyYy9lbGVtZW50cy9lbGVtZW50X2xpc3QudHNcbnZhciBodG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwiYXJlYVwiLFxuICBcImJhc2VcIixcbiAgXCJiclwiLFxuICBcImNvbFwiLFxuICBcImVtYmVkXCIsXG4gIFwiaHJcIixcbiAgXCJpbWdcIixcbiAgXCJpbnB1dFwiLFxuICBcImxpbmtcIixcbiAgXCJtZXRhXCIsXG4gIFwicGFyYW1cIixcbiAgXCJzb3VyY2VcIixcbiAgXCJ0cmFja1wiLFxuICBcIndiclwiXG5dO1xudmFyIGh0bWxFbGVtZW50VGFncyA9IFtcbiAgXCJhXCIsXG4gIFwiYWJiclwiLFxuICBcImFkZHJlc3NcIixcbiAgXCJhcnRpY2xlXCIsXG4gIFwiYXNpZGVcIixcbiAgXCJhdWRpb1wiLFxuICBcImJcIixcbiAgXCJiZGlcIixcbiAgXCJiZG9cIixcbiAgXCJibG9ja3F1b3RlXCIsXG4gIFwiYm9keVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNhbnZhc1wiLFxuICBcImNhcHRpb25cIixcbiAgXCJjaXRlXCIsXG4gIFwiY29kZVwiLFxuICBcImNvbGdyb3VwXCIsXG4gIFwiZGF0YVwiLFxuICBcImRhdGFsaXN0XCIsXG4gIFwiZGRcIixcbiAgXCJkZWxcIixcbiAgXCJkZXRhaWxzXCIsXG4gIFwiZGZuXCIsXG4gIFwiZGlhbG9nXCIsXG4gIFwiZGl2XCIsXG4gIFwiZGxcIixcbiAgXCJkdFwiLFxuICBcImVtXCIsXG4gIFwiZmllbGRzZXRcIixcbiAgXCJmaWdjYXB0aW9uXCIsXG4gIFwiZmlndXJlXCIsXG4gIFwiZm9vdGVyXCIsXG4gIFwiZm9ybVwiLFxuICBcImgxXCIsXG4gIFwiaDJcIixcbiAgXCJoM1wiLFxuICBcImg0XCIsXG4gIFwiaDVcIixcbiAgXCJoNlwiLFxuICBcImhlYWRcIixcbiAgXCJoZWFkZXJcIixcbiAgXCJoZ3JvdXBcIixcbiAgXCJodG1sXCIsXG4gIFwiaVwiLFxuICBcImlmcmFtZVwiLFxuICBcImluc1wiLFxuICBcImtiZFwiLFxuICBcImxhYmVsXCIsXG4gIFwibGVnZW5kXCIsXG4gIFwibGlcIixcbiAgXCJtYWluXCIsXG4gIFwibWFwXCIsXG4gIFwibWFya1wiLFxuICBcIm1lbnVcIixcbiAgXCJtZXRlclwiLFxuICBcIm5hdlwiLFxuICBcIm5vc2NyaXB0XCIsXG4gIFwib2JqZWN0XCIsXG4gIFwib2xcIixcbiAgXCJvcHRncm91cFwiLFxuICBcIm9wdGlvblwiLFxuICBcIm91dHB1dFwiLFxuICBcInBcIixcbiAgXCJwaWN0dXJlXCIsXG4gIFwicHJlXCIsXG4gIFwicHJvZ3Jlc3NcIixcbiAgXCJxXCIsXG4gIFwicnBcIixcbiAgXCJydFwiLFxuICBcInJ1YnlcIixcbiAgXCJzXCIsXG4gIFwic2FtcFwiLFxuICBcInNjcmlwdFwiLFxuICBcInNlYXJjaFwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJzZWxlY3RcIixcbiAgXCJzbG90XCIsXG4gIFwic21hbGxcIixcbiAgXCJzcGFuXCIsXG4gIFwic3Ryb25nXCIsXG4gIFwic3R5bGVcIixcbiAgXCJzdWJcIixcbiAgXCJzdW1tYXJ5XCIsXG4gIFwic3VwXCIsXG4gIFwidGFibGVcIixcbiAgXCJ0Ym9keVwiLFxuICBcInRkXCIsXG4gIFwidGVtcGxhdGVcIixcbiAgXCJ0ZXh0YXJlYVwiLFxuICBcInRmb290XCIsXG4gIFwidGhcIixcbiAgXCJ0aGVhZFwiLFxuICBcInRpbWVcIixcbiAgXCJ0aXRsZVwiLFxuICBcInRyXCIsXG4gIFwidVwiLFxuICBcInVsXCIsXG4gIFwidmFyRWxlbWVudFwiLFxuICBcInZpZGVvXCJcbl07XG52YXIgc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwicGF0aFwiLFxuICBcImNpcmNsZVwiLFxuICBcImVsbGlwc2VcIixcbiAgXCJsaW5lXCIsXG4gIFwicG9seWdvblwiLFxuICBcInBvbHlsaW5lXCIsXG4gIFwic3RvcFwiXG5dO1xudmFyIHN2Z0VsZW1lbnRUYWdzID0gW1xuICBcInN2Z1wiLFxuICBcImdcIixcbiAgXCJ0ZXh0XCIsXG4gIFwidHNwYW5cIixcbiAgXCJ0ZXh0UGF0aFwiLFxuICBcImRlZnNcIixcbiAgXCJzeW1ib2xcIixcbiAgXCJ1c2VcIixcbiAgXCJpbWFnZVwiLFxuICBcImNsaXBQYXRoXCIsXG4gIFwibWFza1wiLFxuICBcInBhdHRlcm5cIixcbiAgXCJsaW5lYXJHcmFkaWVudFwiLFxuICBcInJhZGlhbEdyYWRpZW50XCIsXG4gIFwiZmlsdGVyXCIsXG4gIFwibWFya2VyXCIsXG4gIFwidmlld1wiLFxuICBcImZlQmxlbmRcIixcbiAgXCJmZUNvbG9yTWF0cml4XCIsXG4gIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLFxuICBcImZlQ29tcG9zaXRlXCIsXG4gIFwiZmVDb252b2x2ZU1hdHJpeFwiLFxuICBcImZlRGlmZnVzZUxpZ2h0aW5nXCIsXG4gIFwiZmVEaXNwbGFjZW1lbnRNYXBcIixcbiAgXCJmZURpc3RhbnRMaWdodFwiLFxuICBcImZlRmxvb2RcIixcbiAgXCJmZUZ1bmNBXCIsXG4gIFwiZmVGdW5jQlwiLFxuICBcImZlRnVuY0dcIixcbiAgXCJmZUZ1bmNSXCIsXG4gIFwiZmVHYXVzc2lhbkJsdXJcIixcbiAgXCJmZUltYWdlXCIsXG4gIFwiZmVNZXJnZVwiLFxuICBcImZlTWVyZ2VOb2RlXCIsXG4gIFwiZmVNb3JwaG9sb2d5XCIsXG4gIFwiZmVPZmZzZXRcIixcbiAgXCJmZVBvaW50TGlnaHRcIixcbiAgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIixcbiAgXCJmZVNwb3RMaWdodFwiLFxuICBcImZlVGlsZVwiLFxuICBcImZlVHVyYnVsZW5jZVwiXG5dO1xudmFyIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcIm1pXCIsXG4gIFwibW5cIixcbiAgXCJtb1wiXG5dO1xudmFyIG1hdGhtbEVsZW1lbnRUYWdzID0gW1xuICBcIm1hdGhcIixcbiAgXCJtc1wiLFxuICBcIm10ZXh0XCIsXG4gIFwibXJvd1wiLFxuICBcIm1mZW5jZWRcIixcbiAgXCJtc3VwXCIsXG4gIFwibXN1YlwiLFxuICBcIm1zdWJzdXBcIixcbiAgXCJtZnJhY1wiLFxuICBcIm1zcXJ0XCIsXG4gIFwibXJvb3RcIixcbiAgXCJtdGFibGVcIixcbiAgXCJtdHJcIixcbiAgXCJtdGRcIixcbiAgXCJtc3R5bGVcIixcbiAgXCJtZW5jbG9zZVwiLFxuICBcIm1tdWx0aXNjcmlwdHNcIlxuXTtcbnZhciBlbGVtZW50cyA9IHt9O1xudmFyIGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucywgLi4uY2hpbGRyZW4pID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBjaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKSB7XG4gIHJldHVybiAoKG9wdGlvbnMpID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBudWxsKSk7XG59XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbnZhciBhbGxFbGVtZW50cyA9IHtcbiAgLi4uZWxlbWVudHMsXG4gIC4uLmNoaWxkcmVubGVzc0VsZW1lbnRzXG59O1xuXG4vLyBzcmMvY2xpZW50L3J1bnRpbWUudHNcbk9iamVjdC5hc3NpZ24od2luZG93LCBhbGxFbGVtZW50cyk7XG52YXIgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xudmFyIGlkQ291bnRlciA9IDA7XG5mdW5jdGlvbiBnZW5Mb2NhbElEKCkge1xuICBpZENvdW50ZXIrKztcbiAgcmV0dXJuIGlkQ291bnRlcjtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgY29uc3QgZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50YWcpO1xuICB7XG4gICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGVsZW1lbnQub3B0aW9ucyk7XG4gICAgZm9yIChjb25zdCBbb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgIGlmIChvcHRpb25WYWx1ZSBpbnN0YW5jZW9mIFNwZWNpYWxFbGVtZW50T3B0aW9uKSB7XG4gICAgICAgIG9wdGlvblZhbHVlLm11dGF0ZShlbGVtZW50LCBvcHRpb25OYW1lKTtcbiAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCh7IGVsZW1lbnRLZXksIG9wdGlvbk5hbWUsIG9wdGlvblZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUob3B0aW9uTmFtZSwgYCR7b3B0aW9uVmFsdWV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChlbGVtZW50LmtleSkge1xuICAgIGRvbUVsZW1lbnQuc2V0QXR0cmlidXRlKFwia2V5XCIsIGVsZW1lbnQua2V5KTtcbiAgfVxuICB7XG4gICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgICAgZG9tRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4geyByb290OiBkb21FbGVtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zID0gW107XG4gIGlmIChlbGVtZW50ID09PSB2b2lkIDAgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgIHJldHVybiB7IHJvb3Q6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpLCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IFtdIH07XG4gIH1cbiAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGVsZW1lbnQpKSB7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHN1YkVsZW1lbnQgb2YgZWxlbWVudCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgRWxlZ2FuY2VFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVnYW5jZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoaXMgZWxlbWVudCBpcyBhbiBhcmJpdHJhcnkgb2JqZWN0LCBhbmQgYXJiaXRyYXJ5IG9iamVjdHMgYXJlIG5vdCB2YWxpZCBjaGlsZHJlbi4gUGxlYXNlIG1ha2Ugc3VyZSBhbGwgZWxlbWVudHMgYXJlIG9uZSBvZjogRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gQWxzbyBub3RlIHRoYXQgY3VycmVudGx5IGluIGNsaWVudCBjb21wb25lbnRzIGxpa2UgcmVhY3RpdmVNYXAsIHN0YXRlIHN1YmplY3QgcmVmZXJlbmNlcyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLmApO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIGNvbnN0IHRleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiA/IGVsZW1lbnQgOiBlbGVtZW50LnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgICAgcmV0dXJuIHsgcm9vdDogdGV4dE5vZGUsIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICB9XG59XG5ERVZfQlVJTEQgJiYgKCgpID0+IHtcbiAgbGV0IGlzRXJyb3JlZCA9IGZhbHNlO1xuICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZShcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9lbGVnYW5jZS1ob3QtcmVsb2FkXCIpO1xuICAgIGVzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIGlmIChpc0Vycm9yZWQpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJob3QtcmVsb2FkXCIpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICBlcy5jbG9zZSgpO1xuICAgICAgc2V0VGltZW91dChjb25uZWN0LCAxZTMpO1xuICAgIH07XG4gIH0pKCk7XG59KSgpO1xudmFyIENsaWVudFN1YmplY3QgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCB2YWx1ZSkge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgfVxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZShuZXdWYWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAqIFxuICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAqL1xuICB0cmlnZ2VyT2JzZXJ2ZXJzKCkge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgIG9ic2VydmVyKHRoaXMuX3ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAqIFxuICAgKiBOb3RlOiB0aGlzIHRyaWdnZXJzIGBjYWxsYmFja2Agd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIHN1YmplY3QuXG4gICAqIFxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGlzIG9ic2VydmVyXG4gICAqIEBwYXJhbSBjYWxsYmFjayBDYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoaXMgc3ViamVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgb2JzZXJ2ZShpZCwgY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5vYnNlcnZlcnMuaGFzKGlkKSkge1xuICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICB9XG4gICAgdGhpcy5vYnNlcnZlcnMuc2V0KGlkLCBjYWxsYmFjayk7XG4gICAgY2FsbGJhY2sodGhpcy52YWx1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYnNlcnZlciBmcm9tIHRoaXMgc3ViamVjdC5cbiAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgKi9cbiAgdW5vYnNlcnZlKGlkKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgfVxufTtcbnZhciBTdGF0ZU1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3ViamVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXModmFsdWVzLCBkb092ZXJ3cml0ZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh0aGlzLnN1YmplY3RzLmhhcyh2YWx1ZS5pZCkgJiYgZG9PdmVyd3JpdGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpO1xuICB9XG4gIGdldEFsbChpZHMpIHtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmdldChpZCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufTtcbnZhciBDbGllbnRFdmVudExpc3RlbmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gIH1cbiAgY2FsbChldikge1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIHRoaXMuY2FsbGJhY2soZXYsIC4uLmRlcGVuZGVuY2llcyk7XG4gIH1cbn07XG52YXIgRXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoc2VydmVyRXZlbnRMaXN0ZW5lcnMsIGRvT3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgIGZvciAoY29uc3Qgc2VydmVyRXZlbnRMaXN0ZW5lciBvZiBzZXJ2ZXJFdmVudExpc3RlbmVycykge1xuICAgICAgaWYgKHRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudEV2ZW50TGlzdGVuZXIgPSBuZXcgQ2xpZW50RXZlbnRMaXN0ZW5lcihzZXJ2ZXJFdmVudExpc3RlbmVyLmlkLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmNhbGxiYWNrLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldChjbGllbnRFdmVudExpc3RlbmVyLmlkLCBjbGllbnRFdmVudExpc3RlbmVyKTtcbiAgICB9XG4gIH1cbiAgaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3QgZXZlbnRMaXN0ZW5lck9wdGlvbiBvZiBldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtrZXk9XCIke2V2ZW50TGlzdGVuZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBldmVudExpc3RlbmVyID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCk7XG4gICAgICBpZiAoIWV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBFdmVudExpc3RlbmVyT3B0aW9uOiBFdmVudCBsaXN0ZW5lciB3aXRoIGlkIFxcdTIwMURcIiArIGV2ZW50TGlzdGVuZXJPcHRpb24uaWQgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRbZXZlbnRMaXN0ZW5lck9wdGlvbi5vcHRpb25dID0gKGV2KSA9PiB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIuY2FsbChldik7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoaWQpO1xuICB9XG59O1xudmFyIENsaWVudE9ic2VydmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuc3ViamVjdFZhbHVlcyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKHRoaXMuZGVwZW5kZW5jaWVzKTtcbiAgICBmb3IgKGNvbnN0IGluaXRpYWxWYWx1ZSBvZiBpbml0aWFsVmFsdWVzKSB7XG4gICAgICBjb25zdCBpZHggPSB0aGlzLnN1YmplY3RWYWx1ZXMubGVuZ3RoO1xuICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzLnB1c2goaW5pdGlhbFZhbHVlLnZhbHVlKTtcbiAgICAgIGluaXRpYWxWYWx1ZS5vYnNlcnZlKHRoaXMuaWQsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmNhbGwoKTtcbiAgfVxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdXBkYXRlIHdoZW4gdGhpcyBvYnNlcnZlciB1cGRhdGVzLlxuICAgKi9cbiAgYWRkRWxlbWVudChlbGVtZW50LCBvcHRpb25OYW1lKSB7XG4gICAgdGhpcy5lbGVtZW50cy5wdXNoKHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9KTtcbiAgfVxuICBzZXRQcm9wKGVsZW1lbnQsIGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoa2V5LnN0YXJ0c1dpdGgoXCJvblwiKSAmJiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGtleS5zbGljZSgyKSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoa2V5IGluIGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGlzVHJ1dGh5ID0gdmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCI7XG4gICAgICBpZiAoaXNUcnV0aHkpIHtcbiAgICAgICAgZWxlbWVudFtrZXldID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGNhbGwoKSB7XG4gICAgZm9yIChjb25zdCB7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBjb25zdCBnZXRTZWxmID0gZnVuY3Rpb24gZ2V0U2VsZjIoKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjay5jYWxsKGVsZW1lbnQsIC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG4gICAgICB0aGlzLnNldFByb3AoZWxlbWVudCwgb3B0aW9uTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxufTtcbnZhciBPYnNlcnZlck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgfVxuICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJPYnNlcnZlciBvZiBzZXJ2ZXJPYnNlcnZlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudE9ic2VydmVycy5oYXMoc2VydmVyT2JzZXJ2ZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvYnNlcnZlci5hZGRFbGVtZW50KGVsZW1lbnQsIG9ic2VydmVyT3B0aW9uLm9wdGlvbik7XG4gICAgICBvYnNlcnZlci5jYWxsKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgIGNvbnN0IG9ic2VydmVyTm9kZXMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbb11cIikpO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICBsZXQgdXBkYXRlMiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9O1xuICAgICAgdmFyIHVwZGF0ZSA9IHVwZGF0ZTI7XG4gICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9cIik7XG4gICAgICBjb25zdCBzdWJqZWN0ID0gc3RhdGVNYW5hZ2VyLmdldChzdWJqZWN0SWQpO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIERFVl9CVUlMRDogZXJyb3JPdXQoXCJGYWlsZWQgdG8gZmluZCBzdWJqZWN0IHdpdGggaWQgXCIgKyBzdWJqZWN0SWQgKyBcIiBmb3Igb2JzZXJ2ZXJOb2RlLlwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YmplY3QudmFsdWUpO1xuICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgIHN1YmplY3Qub2JzZXJ2ZShpZCwgdXBkYXRlMik7XG4gICAgICB1cGRhdGUyKHN1YmplY3QudmFsdWUpO1xuICAgICAgbm9kZS5yZXBsYWNlV2l0aCh0ZXh0Tm9kZSk7XG4gICAgfVxuICB9XG59O1xudmFyIEVmZmVjdE1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWN0aXZlRWZmZWN0cyA9IFtdO1xuICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoZWZmZWN0cykge1xuICAgIGZvciAoY29uc3QgZWZmZWN0IG9mIGVmZmVjdHMpIHtcbiAgICAgIGNvbnN0IGRlcGVuY2VuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwoZWZmZWN0LmRlcGVuZGVuY2llcyk7XG4gICAgICBpZiAodGhpcy5hY3RpdmVFZmZlY3RzLmluY2x1ZGVzKGVmZmVjdC5pZCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmFjdGl2ZUVmZmVjdHMucHVzaChlZmZlY3QuaWQpO1xuICAgICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5oYXMoZWZmZWN0LmlkKSkge1xuICAgICAgICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMuZ2V0KGVmZmVjdC5pZCkoKTtcbiAgICAgICAgfVxuICAgICAgICBlZmZlY3QuY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgIH07XG4gICAgICBmb3IgKGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5jZW5jaWVzKSB7XG4gICAgICAgIGNvbnN0IGlkID0gZ2VuTG9jYWxJRCgpLnRvU3RyaW5nKCk7XG4gICAgICAgIGRlcGVuZGVuY3kub2JzZXJ2ZShpZCwgdXBkYXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG52YXIgTG9hZEhvb2tNYW5hZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gW107XG4gICAgdGhpcy5hY3RpdmVMb2FkSG9va3MgPSBbXTtcbiAgfVxuICBsb2FkVmFsdWVzKGxvYWRIb29rcykge1xuICAgIGZvciAoY29uc3QgbG9hZEhvb2sgb2YgbG9hZEhvb2tzKSB7XG4gICAgICBjb25zdCBkZXBlbmNlbmNpZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKGxvYWRIb29rLmRlcGVuZGVuY2llcyk7XG4gICAgICBpZiAodGhpcy5hY3RpdmVMb2FkSG9va3MuaW5jbHVkZXMobG9hZEhvb2suaWQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3MucHVzaChsb2FkSG9vay5pZCk7XG4gICAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb24gPSBsb2FkSG9vay5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgaWYgKGNsZWFudXBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzLnB1c2goe1xuICAgICAgICAgIGtpbmQ6IGxvYWRIb29rLmtpbmQsXG4gICAgICAgICAgY2xlYW51cEZ1bmN0aW9uLFxuICAgICAgICAgIHBhdGhuYW1lOiBsb2FkSG9vay5wYXRobmFtZSxcbiAgICAgICAgICBsb2FkSG9va0lkeDogdGhpcy5hY3RpdmVMb2FkSG9va3MubGVuZ3RoIC0gMVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2FsbENsZWFudXBGdW5jdGlvbnMoKSB7XG4gICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsZWFudXBQcm9jZWR1cmUgb2YgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcykge1xuICAgICAgaWYgKGNsZWFudXBQcm9jZWR1cmUua2luZCA9PT0gMCAvKiBMQVlPVVRfTE9BREhPT0sgKi8pIHtcbiAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSk7XG4gICAgICAgIGlmIChpc0luU2NvcGUpIHtcbiAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNsZWFudXBQcm9jZWR1cmUuY2xlYW51cEZ1bmN0aW9uKCk7XG4gICAgICB0aGlzLmFjdGl2ZUxvYWRIb29rcy5zcGxpY2UoY2xlYW51cFByb2NlZHVyZS5sb2FkSG9va0lkeCwgMSk7XG4gICAgfVxuICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMgPSByZW1haW5pbmdQcm9jZWR1cmVzO1xuICB9XG59O1xudmFyIG9ic2VydmVyTWFuYWdlciA9IG5ldyBPYnNlcnZlck1hbmFnZXIoKTtcbnZhciBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xudmFyIHN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIoKTtcbnZhciBsb2FkSG9va01hbmFnZXIgPSBuZXcgTG9hZEhvb2tNYW5hZ2VyKCk7XG52YXIgZWZmZWN0TWFuYWdlciA9IG5ldyBFZmZlY3RNYW5hZ2VyKCk7XG52YXIgcGFnZVN0cmluZ0NhY2hlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG52YXIgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG52YXIgZmV0Y2hQYWdlID0gYXN5bmMgKHRhcmdldFVSTCkgPT4ge1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgaWYgKHBhZ2VTdHJpbmdDYWNoZS5oYXMocGF0aG5hbWUpKSB7XG4gICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcocGFnZVN0cmluZ0NhY2hlLmdldChwYXRobmFtZSksIFwidGV4dC9odG1sXCIpO1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVSTCk7XG4gIGNvbnN0IG5ld0RPTSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoYXdhaXQgcmVzLnRleHQoKSwgXCJ0ZXh0L2h0bWxcIik7XG4gIHtcbiAgICBjb25zdCBkYXRhU2NyaXB0cyA9IG5ld0FycmF5KG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKTtcbiAgICBjb25zdCBjdXJyZW50U2NyaXB0cyA9IG5ld0FycmF5KGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgZm9yIChjb25zdCBkYXRhU2NyaXB0IG9mIGRhdGFTY3JpcHRzKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnRTY3JpcHRzLmZpbmQoKHMpID0+IHMuc3JjID09PSBkYXRhU2NyaXB0LnNyYyk7XG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGRhdGFTY3JpcHQpO1xuICAgIH1cbiAgfVxuICB7XG4gICAgY29uc3QgcGFnZURhdGFTY3JpcHQgPSBuZXdET00ucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtaG9vaz1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgY29uc3QgdGV4dCA9IHBhZ2VEYXRhU2NyaXB0LnRleHRDb250ZW50O1xuICAgIHBhZ2VEYXRhU2NyaXB0LnJlbW92ZSgpO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBzY3JpcHQudHlwZSA9IFwibW9kdWxlXCI7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGFnZVwiLCBcInRydWVcIik7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGF0aG5hbWVcIiwgYCR7cGF0aG5hbWV9YCk7XG4gICAgbmV3RE9NLmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfVxuICBwYWdlU3RyaW5nQ2FjaGUuc2V0KHBhdGhuYW1lLCB4bWxTZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKG5ld0RPTSkpO1xuICByZXR1cm4gbmV3RE9NO1xufTtcbnZhciBuYXZpZ2F0aW9uQ2FsbGJhY2tzID0gW107XG5mdW5jdGlvbiBvbk5hdmlnYXRlKGNhbGxiYWNrKSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiBuYXZpZ2F0aW9uQ2FsbGJhY2tzLmxlbmd0aCAtIDE7XG59XG5mdW5jdGlvbiByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2soaWR4KSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3Muc3BsaWNlKGlkeCwgMSk7XG59XG52YXIgbmF2aWdhdGVMb2NhbGx5ID0gYXN5bmMgKHRhcmdldCwgcHVzaFN0YXRlID0gdHJ1ZSwgaXNQb3BTdGF0ZSA9IGZhbHNlKSA9PiB7XG4gIGNvbnN0IHRhcmdldFVSTCA9IG5ldyBVUkwodGFyZ2V0KTtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gIGlmICghaXNQb3BTdGF0ZSAmJiBwYXRobmFtZSA9PT0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpKSB7XG4gICAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRVUkwuaGFzaC5zbGljZSgxKSk/LnNjcm9sbEludG9WaWV3KCk7XG4gICAgfVxuICAgIGlmIChwdXNoU3RhdGUpIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IG5ld1BhZ2UgPSBhd2FpdCBmZXRjaFBhZ2UodGFyZ2V0VVJMKTtcbiAgaWYgKCFuZXdQYWdlKSByZXR1cm47XG4gIGxldCBvbGRQYWdlTGF0ZXN0ID0gZG9jdW1lbnQuYm9keTtcbiAgbGV0IG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlLmJvZHk7XG4gIHtcbiAgICBjb25zdCBuZXdQYWdlTGF5b3V0cyA9IG5ld0FycmF5KG5ld1BhZ2UucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXRzID0gbmV3QXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihuZXdQYWdlTGF5b3V0cy5sZW5ndGgsIG9sZFBhZ2VMYXlvdXRzLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXQgPSBuZXdQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXQgPSBvbGRQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG5ld0xheW91dElkID0gbmV3UGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICBjb25zdCBvbGRMYXlvdXRJZCA9IG9sZFBhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgaWYgKG5ld0xheW91dElkICE9PSBvbGRMYXlvdXRJZCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG9sZFBhZ2VMYXRlc3QgPSBvbGRQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gIH1cbiAgY29uc3QgaGVhZCA9IGRvY3VtZW50LmhlYWQ7XG4gIGNvbnN0IG5ld0hlYWQgPSBuZXdQYWdlLmhlYWQ7XG4gIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gIHtcbiAgICBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKT8ucmVwbGFjZVdpdGgoXG4gICAgICBuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpID8/IFwiXCJcbiAgICApO1xuICAgIGNvbnN0IHVwZGF0ZSA9ICh0YXJnZXRMaXN0LCBtYXRjaEFnYWluc3QsIGFjdGlvbikgPT4ge1xuICAgICAgZm9yIChjb25zdCB0YXJnZXQyIG9mIHRhcmdldExpc3QpIHtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmcgPSBtYXRjaEFnYWluc3QuZmluZCgobikgPT4gbi5pc0VxdWFsTm9kZSh0YXJnZXQyKSk7XG4gICAgICAgIGlmIChtYXRjaGluZykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbih0YXJnZXQyKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG9sZFRhZ3MgPSBbXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpXG4gICAgXTtcbiAgICBjb25zdCBuZXdUYWdzID0gW1xuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKVxuICAgIF07XG4gICAgdXBkYXRlKG5ld1RhZ3MsIG9sZFRhZ3MsIChub2RlKSA9PiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICB1cGRhdGUob2xkVGFncywgbmV3VGFncywgKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICB9XG4gIGlmIChwdXNoU3RhdGUpIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgbG9hZEhvb2tNYW5hZ2VyLmNhbGxDbGVhbnVwRnVuY3Rpb25zKCk7XG4gIHtcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIG5hdmlnYXRpb25DYWxsYmFja3MpIHtcbiAgICAgIGNhbGxiYWNrKHBhdGhuYW1lKTtcbiAgICB9XG4gIH1cbiAgYXdhaXQgbG9hZFBhZ2UoKTtcbiAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0VVJMLmhhc2guc2xpY2UoMSkpPy5zY3JvbGxJbnRvVmlldygpO1xuICB9XG59O1xuZnVuY3Rpb24gc2FmZVBlcmNlbnREZWNvZGUoaW5wdXQpIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoXG4gICAgLyVbMC05QS1GYS1mXXsyfS9nLFxuICAgIChtKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG0uc2xpY2UoMSksIDE2KSlcbiAgKTtcbn1cbmZ1bmN0aW9uIHNhbml0aXplUGF0aG5hbWUocGF0aG5hbWUgPSBcIlwiKSB7XG4gIGlmICghcGF0aG5hbWUpIHJldHVybiBcIi9cIjtcbiAgcGF0aG5hbWUgPSBzYWZlUGVyY2VudERlY29kZShwYXRobmFtZSk7XG4gIHBhdGhuYW1lID0gXCIvXCIgKyBwYXRobmFtZTtcbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9cXC8rL2csIFwiL1wiKTtcbiAgY29uc3Qgc2VnbWVudHMgPSBwYXRobmFtZS5zcGxpdChcIi9cIik7XG4gIGNvbnN0IHJlc29sdmVkID0gW107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIGlmICghc2VnbWVudCB8fCBzZWdtZW50ID09PSBcIi5cIikgY29udGludWU7XG4gICAgaWYgKHNlZ21lbnQgPT09IFwiLi5cIikge1xuICAgICAgcmVzb2x2ZWQucG9wKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmVzb2x2ZWQucHVzaChzZWdtZW50KTtcbiAgfVxuICBjb25zdCBlbmNvZGVkID0gcmVzb2x2ZWQubWFwKChzKSA9PiBlbmNvZGVVUklDb21wb25lbnQocykpO1xuICByZXR1cm4gXCIvXCIgKyBlbmNvZGVkLmpvaW4oXCIvXCIpO1xufVxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZURhdGEocGF0aG5hbWUpIHtcbiAgY29uc3QgZGF0YVNjcmlwdFRhZyA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gIGlmICghZGF0YVNjcmlwdFRhZykge1xuICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgRmFpbGVkIHRvIGZpbmQgc2NyaXB0IHRhZyBmb3IgcXVlcnk6c2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaW1wb3J0KGRhdGFTY3JpcHRUYWcuc3JjKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgZWZmZWN0c1xuICB9ID0gZGF0YTtcbiAgaWYgKCFldmVudExpc3RlbmVyT3B0aW9ucyB8fCAhZXZlbnRMaXN0ZW5lcnMgfHwgIW9ic2VydmVycyB8fCAhc3ViamVjdHMgfHwgIW9ic2VydmVyT3B0aW9ucyB8fCAhZWZmZWN0cykge1xuICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgUG9zc2libHkgbWFsZm9ybWVkIHBhZ2UgZGF0YSAke2RhdGF9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuZnVuY3Rpb24gZXJyb3JPdXQobWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUGFnZSgpIHtcbiAgd2luZG93Lm9ucG9wc3RhdGUgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICBhd2FpdCBuYXZpZ2F0ZUxvY2FsbHkodGFyZ2V0LmxvY2F0aW9uLmhyZWYsIGZhbHNlLCB0cnVlKTtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXQubG9jYXRpb24uaHJlZik7XG4gIH07XG4gIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICBjb25zdCB7XG4gICAgc3ViamVjdHMsXG4gICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgb2JzZXJ2ZXJzLFxuICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICBsb2FkSG9va3MsXG4gICAgZWZmZWN0c1xuICB9ID0gYXdhaXQgZ2V0UGFnZURhdGEocGF0aG5hbWUpO1xuICBERVZfQlVJTEQ6IHtcbiAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgcGFnZURhdGE6IHtcbiAgICAgICAgc3ViamVjdHMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgICAgIGxvYWRIb29rcyxcbiAgICAgICAgZWZmZWN0c1xuICAgICAgfSxcbiAgICAgIHN0YXRlTWFuYWdlcixcbiAgICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICAgICAgb2JzZXJ2ZXJNYW5hZ2VyLFxuICAgICAgbG9hZEhvb2tNYW5hZ2VyLFxuICAgICAgZWZmZWN0TWFuYWdlclxuICAgIH07XG4gIH1cbiAgZ2xvYmFsVGhpcy5lbGVnYW5jZUNsaWVudCA9IHtcbiAgICBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50LFxuICAgIGZldGNoUGFnZSxcbiAgICBuYXZpZ2F0ZUxvY2FsbHksXG4gICAgb25OYXZpZ2F0ZSxcbiAgICByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2ssXG4gICAgZ2VuTG9jYWxJRFxuICB9O1xuICBzdGF0ZU1hbmFnZXIubG9hZFZhbHVlcyhzdWJqZWN0cyk7XG4gIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmxvYWRWYWx1ZXMoZXZlbnRMaXN0ZW5lcnMpO1xuICBldmVudExpc3RlbmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLmxvYWRWYWx1ZXMob2JzZXJ2ZXJzKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKTtcbiAgb2JzZXJ2ZXJNYW5hZ2VyLnRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCk7XG4gIGxvYWRIb29rTWFuYWdlci5sb2FkVmFsdWVzKGxvYWRIb29rcyk7XG4gIGVmZmVjdE1hbmFnZXIubG9hZFZhbHVlcyhlZmZlY3RzKTtcbn1cbmxvYWRQYWdlKCk7XG5leHBvcnQge1xuICBDbGllbnRTdWJqZWN0LFxuICBFZmZlY3RNYW5hZ2VyLFxuICBFdmVudExpc3RlbmVyTWFuYWdlcixcbiAgTG9hZEhvb2tNYW5hZ2VyLFxuICBPYnNlcnZlck1hbmFnZXIsXG4gIFN0YXRlTWFuYWdlclxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUNBLE1BQUksdUJBQXVCLE1BQU07QUFBQSxFQUNqQztBQUNBLFdBQVMsWUFBWSxPQUFPO0FBQzFCLFFBQUksVUFBVSxRQUFRLFVBQVUsV0FBVyxPQUFPLFVBQVUsWUFBWSxNQUFNLFFBQVEsS0FBSyxLQUFLLGlCQUFpQixpQkFBa0IsUUFBTztBQUMxSSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksa0JBQWtCLE1BQU07QUFBQSxJQUMxQixZQUFZLEtBQUssVUFBVSxDQUFDLEdBQUcsV0FBVyxNQUFNO0FBQzlDLFdBQUssTUFBTTtBQUNYLFVBQUksWUFBWSxPQUFPLEdBQUc7QUFDeEIsWUFBSSxLQUFLLGdCQUFnQixNQUFNLE9BQU87QUFDcEMsa0JBQVEsTUFBTSxnQkFBZ0IsTUFBTSxnQ0FBZ0M7QUFDcEUsZ0JBQU07QUFBQSxRQUNSO0FBQ0EsYUFBSyxXQUFXLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGFBQUssVUFBVSxDQUFDO0FBQUEsTUFDbEIsT0FBTztBQUNMLGFBQUssVUFBVTtBQUNmLGFBQUssV0FBVztBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0Esa0JBQWtCO0FBQ2hCLGFBQU8sS0FBSyxhQUFhO0FBQUEsSUFDM0I7QUFBQSxFQUNGO0FBR0EsTUFBSSw4QkFBOEI7QUFBQSxJQUNoQztBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNBLE1BQUksNkJBQTZCO0FBQUEsSUFDL0I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFB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QUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0YsSUFBSTtBQUNKLFFBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFNBQVM7QUFDdkcsTUFBYSxTQUFTLGdDQUFnQyxJQUFJLEVBQUU7QUFDNUQ7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLFNBQVMsU0FBUztBQUN6QixVQUFNLElBQUksTUFBTSxPQUFPO0FBQUEsRUFDekI7QUFDQSxpQkFBZSxXQUFXO0FBQ3hCLFdBQU8sYUFBYSxPQUFPLFVBQVU7QUFDbkMsWUFBTSxlQUFlO0FBQ3JCLFlBQU0sU0FBUyxNQUFNO0FBQ3JCLFlBQU0sZ0JBQWdCLE9BQU8sU0FBUyxNQUFNLE9BQU8sSUFBSTtBQUN2RCxjQUFRLGFBQWEsTUFBTSxJQUFJLE9BQU8sU0FBUyxJQUFJO0FBQUEsSUFDckQ7QUFDQSxVQUFNLFdBQVcsaUJBQWlCLE9BQU8sU0FBUyxRQUFRO0FBQzFELFVBQU07QUFBQSxNQUNKO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRixJQUFJLE1BQU0sWUFBWSxRQUFRO0FBQzlCLGVBQVc7QUFDVCxpQkFBVyxXQUFXO0FBQUEsUUFDcEIsVUFBVTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLGVBQVcsaUJBQWlCO0FBQUEsTUFDMUI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFDQSxpQkFBYSxXQUFXLFFBQVE7QUFDaEMseUJBQXFCLFdBQVcsY0FBYztBQUM5Qyx5QkFBcUIsY0FBYyxvQkFBb0I7QUFDdkQsb0JBQWdCLFdBQVcsU0FBUztBQUNwQyxvQkFBZ0IsY0FBYyxlQUFlO0FBQzdDLG9CQUFnQiw4QkFBOEI7QUFDOUMsb0JBQWdCLFdBQVcsU0FBUztBQUNwQyxrQkFBYyxXQUFXLE9BQU87QUFBQSxFQUNsQztBQUNBLFdBQVM7IiwKICAibmFtZXMiOiBbXQp9Cg==
