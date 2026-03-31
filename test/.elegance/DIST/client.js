"use strict";
(() => {
  // ../dist/elements/element.js
  var SpecialElementOption = class {
  };
  function isAnElement(value) {
    if (value !== null && value !== void 0 && (typeof value !== "object" || Array.isArray(value) || value instanceof EleganceElement))
      return true;
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

  // ../dist/elements/element_list.js
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
  for (const tag of htmlElementTags)
    elements[tag] = createElementBuilder(tag);
  for (const tag of svgElementTags)
    elements[tag] = createElementBuilder(tag);
  for (const tag of mathmlElementTags)
    elements[tag] = createElementBuilder(tag);
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

  // ../dist/client/runtime.js
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
      const url = new URL("/elegance-hot-reload", window.location.origin);
      url.port = "4000";
      const es = new EventSource(url);
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
        if (this.subjects.has(value.id) && doOverwrite === false)
          continue;
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
        if (this.eventListeners.has(serverEventListener.id) && doOverride === false)
          continue;
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
        if (this.clientObservers.has(serverObserver.id) && doOverride === false)
          continue;
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
  var LoadHookKind;
  (function(LoadHookKind2) {
    LoadHookKind2[LoadHookKind2["LAYOUT_LOADHOOK"] = 0] = "LAYOUT_LOADHOOK";
    LoadHookKind2[LoadHookKind2["PAGE_LOADHOOK"] = 1] = "PAGE_LOADHOOK";
  })(LoadHookKind || (LoadHookKind = {}));
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
        if (cleanupProcedure.kind === LoadHookKind.LAYOUT_LOADHOOK) {
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
    if (pageStringCache.has(targetURL.href)) {
      return domParser.parseFromString(pageStringCache.get(targetURL.href), "text/html");
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
      if (pageDataScript) {
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
    }
    pageStringCache.set(targetURL.href, xmlSerializer.serializeToString(newDOM));
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
      if (pushState)
        history.pushState(null, "", targetURL.href);
      return;
    }
    let newPage = await fetchPage(targetURL);
    if (!newPage)
      return;
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
      document.head.querySelector("title")?.replaceWith(newPage.head.querySelector("title") ?? "");
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
    if (pushState)
      history.pushState(null, "", targetURL.href);
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
    return input.replace(/%[0-9A-Fa-f]{2}/g, (m) => String.fromCharCode(parseInt(m.slice(1), 16)));
  }
  function sanitizePathname(pathname = "") {
    if (!pathname)
      return "/";
    pathname = safePercentDecode(pathname);
    pathname = "/" + pathname;
    pathname = pathname.replace(/\/+/g, "/");
    const segments = pathname.split("/");
    const resolved = [];
    for (const segment of segments) {
      if (!segment || segment === ".")
        continue;
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
    const { subjects, eventListeners, eventListenerOptions, observers, observerOptions, effects } = data;
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
    const { subjects, eventListenerOptions, eventListeners, observers, observerOptions, loadHooks, effects } = await getPageData(pathname);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9lbGVtZW50cy9lbGVtZW50LmpzIiwgIi4uLy4uLy4uL2Rpc3QvZWxlbWVudHMvZWxlbWVudF9saXN0LmpzIiwgIi4uLy4uLy4uL2Rpc3QvY2xpZW50L3J1bnRpbWUuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQW4gb3B0aW9uIHRoYXQgc2hvdWxkIGJlIHRyZWF0ZWQgZGlmZmVyZW50bHkgYnkgdGhlIGNvbXBpbGVyLlxuICovXG5jbGFzcyBTcGVjaWFsRWxlbWVudE9wdGlvbiB7XG59XG5mdW5jdGlvbiBpc0FuRWxlbWVudCh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5jbGFzcyBFbGVnYW5jZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRhZywgb3B0aW9ucyA9IHt9LCBjaGlsZHJlbiA9IG51bGwpIHtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgIGlmIChpc0FuRWxlbWVudChvcHRpb25zKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FuSGF2ZUNoaWxkcmVuKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIlRoZSBvcHRpb25zIG9mIGFuIGVsZW1lbnQgbWF5IG5vdCBiZSBhbiBlbGVtZW50LCBpZiB0aGUgZWxlbWVudCBjYW5ub3QgaGF2ZSBjaGlsZHJlbi5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbb3B0aW9ucywgLi4uKGNoaWxkcmVuID8/IFtdKV07XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FuSGF2ZUNoaWxkcmVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbiAhPT0gbnVsbDtcbiAgICB9XG59XG5leHBvcnQgeyBFbGVnYW5jZUVsZW1lbnQsIFNwZWNpYWxFbGVtZW50T3B0aW9uLCBpc0FuRWxlbWVudCwgfTtcbiIsICJpbXBvcnQgeyBFbGVnYW5jZUVsZW1lbnQsIH0gZnJvbSBcIi4vZWxlbWVudC5qc1wiO1xuY29uc3QgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICAgIFwiYXJlYVwiLCBcImJhc2VcIiwgXCJiclwiLCBcImNvbFwiLCBcImVtYmVkXCIsIFwiaHJcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLFxuICAgIFwibGlua1wiLCBcIm1ldGFcIiwgXCJwYXJhbVwiLCBcInNvdXJjZVwiLCBcInRyYWNrXCIsIFwid2JyXCIsXG5dO1xuY29uc3QgaHRtbEVsZW1lbnRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJ0aWNsZVwiLCBcImFzaWRlXCIsIFwiYXVkaW9cIiwgXCJiXCIsIFwiYmRpXCIsIFwiYmRvXCIsXG4gICAgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJ1dHRvblwiLCBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLFxuICAgIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIixcbiAgICBcImRpdlwiLCBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLFxuICAgIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIiwgXCJoZWFkZXJcIiwgXCJoZ3JvdXBcIixcbiAgICBcImh0bWxcIiwgXCJpXCIsIFwiaWZyYW1lXCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcIm1haW5cIixcbiAgICBcIm1hcFwiLCBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsXG4gICAgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsIFwicHJvZ3Jlc3NcIixcbiAgICBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLFxuICAgIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic3BhblwiLCBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLFxuICAgIFwic3VwXCIsIFwidGFibGVcIiwgXCJ0Ym9keVwiLCBcInRkXCIsIFwidGVtcGxhdGVcIiwgXCJ0ZXh0YXJlYVwiLCBcInRmb290XCIsIFwidGhcIixcbiAgICBcInRoZWFkXCIsIFwidGltZVwiLCBcInRpdGxlXCIsIFwidHJcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJFbGVtZW50XCIsIFwidmlkZW9cIixcbl07XG5jb25zdCBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9IFtcbiAgICBcInBhdGhcIiwgXCJjaXJjbGVcIiwgXCJlbGxpcHNlXCIsIFwibGluZVwiLCBcInBvbHlnb25cIiwgXCJwb2x5bGluZVwiLCBcInN0b3BcIixcbl07XG5jb25zdCBzdmdFbGVtZW50VGFncyA9IFtcbiAgICBcInN2Z1wiLCBcImdcIiwgXCJ0ZXh0XCIsIFwidHNwYW5cIiwgXCJ0ZXh0UGF0aFwiLCBcImRlZnNcIiwgXCJzeW1ib2xcIiwgXCJ1c2VcIixcbiAgICBcImltYWdlXCIsIFwiY2xpcFBhdGhcIiwgXCJtYXNrXCIsIFwicGF0dGVyblwiLCBcImxpbmVhckdyYWRpZW50XCIsIFwicmFkaWFsR3JhZGllbnRcIixcbiAgICBcImZpbHRlclwiLCBcIm1hcmtlclwiLCBcInZpZXdcIixcbiAgICBcImZlQmxlbmRcIiwgXCJmZUNvbG9yTWF0cml4XCIsIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLCBcImZlQ29tcG9zaXRlXCIsXG4gICAgXCJmZUNvbnZvbHZlTWF0cml4XCIsIFwiZmVEaWZmdXNlTGlnaHRpbmdcIiwgXCJmZURpc3BsYWNlbWVudE1hcFwiLCBcImZlRGlzdGFudExpZ2h0XCIsXG4gICAgXCJmZUZsb29kXCIsIFwiZmVGdW5jQVwiLCBcImZlRnVuY0JcIiwgXCJmZUZ1bmNHXCIsIFwiZmVGdW5jUlwiLCBcImZlR2F1c3NpYW5CbHVyXCIsXG4gICAgXCJmZUltYWdlXCIsIFwiZmVNZXJnZVwiLCBcImZlTWVyZ2VOb2RlXCIsIFwiZmVNb3JwaG9sb2d5XCIsIFwiZmVPZmZzZXRcIixcbiAgICBcImZlUG9pbnRMaWdodFwiLCBcImZlU3BlY3VsYXJMaWdodGluZ1wiLCBcImZlU3BvdExpZ2h0XCIsIFwiZmVUaWxlXCIsIFwiZmVUdXJidWxlbmNlXCIsXG5dO1xuY29uc3QgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gICAgXCJtaVwiLCBcIm1uXCIsIFwibW9cIixcbl07XG5jb25zdCBtYXRobWxFbGVtZW50VGFncyA9IFtcbiAgICBcIm1hdGhcIiwgXCJtc1wiLCBcIm10ZXh0XCIsIFwibXJvd1wiLCBcIm1mZW5jZWRcIiwgXCJtc3VwXCIsIFwibXN1YlwiLCBcIm1zdWJzdXBcIixcbiAgICBcIm1mcmFjXCIsIFwibXNxcnRcIiwgXCJtcm9vdFwiLCBcIm10YWJsZVwiLCBcIm10clwiLCBcIm10ZFwiLCBcIm1zdHlsZVwiLFxuICAgIFwibWVuY2xvc2VcIiwgXCJtbXVsdGlzY3JpcHRzXCIsXG5dO1xuY29uc3QgZWxlbWVudHMgPSB7fTtcbmNvbnN0IGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgICByZXR1cm4gKChvcHRpb25zLCAuLi5jaGlsZHJlbikgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIGNoaWxkcmVuKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgICByZXR1cm4gKChvcHRpb25zKSA9PiBuZXcgRWxlZ2FuY2VFbGVtZW50KHRhZywgb3B0aW9ucywgbnVsbCkpO1xufVxuZm9yIChjb25zdCB0YWcgb2YgaHRtbEVsZW1lbnRUYWdzKVxuICAgIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpXG4gICAgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncylcbiAgICBlbGVtZW50c1t0YWddID0gY3JlYXRlRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIGh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncylcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHNbdGFnXSA9IGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyKHRhZyk7XG5jb25zdCBhbGxFbGVtZW50cyA9IHtcbiAgICAuLi5lbGVtZW50cyxcbiAgICAuLi5jaGlsZHJlbmxlc3NFbGVtZW50cyxcbn07XG5leHBvcnQgeyBlbGVtZW50cywgY2hpbGRyZW5sZXNzRWxlbWVudHMsIGFsbEVsZW1lbnRzLCB9O1xuIiwgImltcG9ydCB7IGFsbEVsZW1lbnRzIH0gZnJvbSBcIi4uL2VsZW1lbnRzL2VsZW1lbnRfbGlzdC5qc1wiO1xuaW1wb3J0IHsgU3BlY2lhbEVsZW1lbnRPcHRpb24sIEVsZWdhbmNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9lbGVtZW50LmpzXCI7XG5PYmplY3QuYXNzaWduKHdpbmRvdywgYWxsRWxlbWVudHMpO1xuY29uc3QgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xubGV0IGlkQ291bnRlciA9IDA7XG4vKipcbiAqIEdlbmVyYXRlIGEgbm9uLWRldGVybWluaXN0aWMgdW5pcXVlIGlkIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGJyb3dzZXIgc3BlY2lmaWMgdGhpbmdzIGxpa2UgY3VzdG9tIGNsaWVudCBvYnNlcnZlcnMuXG4gKiBVbmlxdWUsIGJ1dCBtYXkgY2hhbmdlIGJldHdlZW4gYnVpbGRzOyBkZXBlbmRzIG9uIG9yZGVyIG9mIGNyZWF0aW9uLlxuICogQHJldHVybnMgQSB1bmlxdWUgaWRcbiAqL1xuZnVuY3Rpb24gZ2VuTG9jYWxJRCgpIHtcbiAgICBpZENvdW50ZXIrKztcbiAgICByZXR1cm4gaWRDb3VudGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zID0gW107XG4gICAgY29uc3QgZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50YWcpO1xuICAgIC8vIFByb2Nlc3Mgb3B0aW9ucy5cbiAgICB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlbGVtZW50Lm9wdGlvbnMpO1xuICAgICAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZS5tdXRhdGUoZWxlbWVudCwgb3B0aW9uTmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZWxlbWVudC5rZXkpIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICAgIH1cbiAgICAvLyBQcm9jZXNzIGNoaWxkcmVuLlxuICAgIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICAgICAgICAgIGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gICAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4geyByb290OiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSwgfTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgRWxlZ2FuY2VFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBBbHNvIG5vdGUgdGhhdCBjdXJyZW50bHkgaW4gY2xpZW50IGNvbXBvbmVudHMgbGlrZSByZWFjdGl2ZU1hcCwgc3RhdGUgc3ViamVjdCByZWZlcmVuY2VzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uYCk7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICAgIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICAgIGxldCBpc0Vycm9yZWQgPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChcIi9lbGVnYW5jZS1ob3QtcmVsb2FkXCIsIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgICAgICB1cmwucG9ydCA9IFwiNDAwMFwiO1xuICAgICAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZSh1cmwpO1xuICAgICAgICBlcy5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICBlcy5jbG9zZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChjb25uZWN0LCAxMDAwKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xufSkoKTtcbi8qKlxuICogQSBTZXJ2ZXJTdWJqZWN0IHRoYXQgaGFzIGJlZW4gc2VyaWFsaXplZCwgc2hpcHBlZCB0byB0aGUgYnJvd3NlciwgYW5kIHJlLWNyZWF0ZWQgYXMgaXQncyBmaW5hbCBmb3JtLlxuICpcbiAqIFNldHRpbmcgdGhlIGB2YWx1ZWAgb2YgdGhpcyBDbGllbnRTdWJqZWN0IHdpbGwgdHJpZ2dlciBpdCdzIG9ic2VydmVycyBjYWxsYmFja3MuXG4gKlxuICogVG8gbGlzdGVuIGZvciBjaGFuZ2VzIGluIGB2YWx1ZWAsIHlvdSBtYXkgY2FsbCB0aGUgYG9ic2VydmUoKWAgbWV0aG9kLlxuICovXG5jbGFzcyBDbGllbnRTdWJqZWN0IHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfVxuICAgIHNldCB2YWx1ZShuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAgICovXG4gICAgdHJpZ2dlck9ic2VydmVycygpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICAgKlxuICAgICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAgICpcbiAgICAgKiBOb3RlOiB0aGlzIHRyaWdnZXJzIGBjYWxsYmFja2Agd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIHN1YmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGlzIG9ic2VydmVyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAgICovXG4gICAgb2JzZXJ2ZShpZCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmRlbGV0ZShpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYnNlcnZlcnMuc2V0KGlkLCBjYWxsYmFjayk7XG4gICAgICAgIGNhbGxiYWNrKHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gb2JzZXJ2ZXIgZnJvbSB0aGlzIHN1YmplY3QuXG4gICAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgICAqL1xuICAgIHVub2JzZXJ2ZShpZCkge1xuICAgICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbn1cbmNsYXNzIFN0YXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGxvYWRWYWx1ZXModmFsdWVzLCBkb092ZXJ3cml0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdWJqZWN0cy5oYXModmFsdWUuaWQpICYmIGRvT3ZlcndyaXRlID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpO1xuICAgIH1cbiAgICBnZXRBbGwoaWRzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmdldChpZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbn1cbi8qKlxuICogQW4gZXZlbnQgbGlzdGVuZXIgYWZ0ZXIgaXQgaGFzIGJlZW4gZ2VuZXJhdGVkIG9uIHRoZSBzZXJ2ZXIsIHByb2Nlc3NlZCBpbnRvIHBhZ2VkYXRhLCBhbmQgcmVjb25zdHJ1Y3RlZCBvbiB0aGUgY2xpZW50LlxuICovXG5jbGFzcyBDbGllbnRFdmVudExpc3RlbmVyIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgfVxuICAgIGNhbGwoZXYpIHtcbiAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZXYsIC4uLmRlcGVuZGVuY2llcyk7XG4gICAgfVxufVxuY2xhc3MgRXZlbnRMaXN0ZW5lck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBsb2FkVmFsdWVzKHNlcnZlckV2ZW50TGlzdGVuZXJzLCBkb092ZXJyaWRlID0gZmFsc2UpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRFdmVudExpc3RlbmVyID0gbmV3IENsaWVudEV2ZW50TGlzdGVuZXIoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCwgc2VydmVyRXZlbnRMaXN0ZW5lci5jYWxsYmFjaywgc2VydmVyRXZlbnRMaXN0ZW5lci5kZXBlbmRlbmNpZXMpO1xuICAgICAgICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQoY2xpZW50RXZlbnRMaXN0ZW5lci5pZCwgY2xpZW50RXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50TGlzdGVuZXJPcHRpb24gb2YgZXZlbnRMaXN0ZW5lck9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtldmVudExpc3RlbmVyT3B0aW9uLmtleX1cIl1gKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgICAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgRXZlbnRMaXN0ZW5lck9wdGlvbjogRXZlbnQgbGlzdGVuZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyLmNhbGwoZXYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGlkKTtcbiAgICB9XG59XG5jbGFzcyBDbGllbnRPYnNlcnZlciB7XG4gICAgY29uc3RydWN0b3IoaWQsIGNhbGxiYWNrLCBkZXBlbmNlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgICAgICBjb25zdCBpbml0aWFsVmFsdWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzW2lkeF0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAgICovXG4gICAgYWRkRWxlbWVudChlbGVtZW50LCBvcHRpb25OYW1lKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaCh7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSk7XG4gICAgfVxuICAgIHNldFByb3AoZWxlbWVudCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcInN0eWxlXCIgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkuc3RhcnRzV2l0aChcIm9uXCIpICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5IGluIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzVHJ1dGh5ID0gdmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCI7XG4gICAgICAgICAgICBpZiAoaXNUcnV0aHkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBCb29sZWFuKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCB7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBnZXRTZWxmID0gZnVuY3Rpb24gZ2V0U2VsZigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMuY2FsbGJhY2suY2FsbChlbGVtZW50LCAuLi50aGlzLnN1YmplY3RWYWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5zZXRQcm9wKGVsZW1lbnQsIG9wdGlvbk5hbWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIE9ic2VydmVyTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VydmVyT2JzZXJ2ZXIgb2Ygc2VydmVyT2JzZXJ2ZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jbGllbnRPYnNlcnZlcnMuaGFzKHNlcnZlck9ic2VydmVyLmlkKSAmJiBkb092ZXJyaWRlID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBvYnNlcnZlck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gdGhpcy5jbGllbnRPYnNlcnZlcnMuZ2V0KG9ic2VydmVyT3B0aW9uLmlkKTtcbiAgICAgICAgICAgIGlmICghb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcXHUyMDFEXCIgKyBvYnNlcnZlck9wdGlvbi5pZCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZXIuYWRkRWxlbWVudChlbGVtZW50LCBvYnNlcnZlck9wdGlvbi5vcHRpb24pO1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY2FsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRha2UgdGhlIHJlc3VsdHMgb2YgU2VydmVyU3ViamVjdC5nZW5lcmF0ZU9ic2VydmVyTm9kZSgpLCByZXBsYWNlIHRoZWlyIEhUTUwgcGxhY2VpbnMgZm9yIHRleHQgbm9kZXMsIGFuZCB0dXJuIHRob3NlIGludG8gb2JzZXJ2ZXJzLlxuICAgICAqL1xuICAgIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgICAgICBjb25zdCBvYnNlcnZlck5vZGVzID0gbmV3QXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW29dXCIpKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIG9ic2VydmVyTm9kZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1YmplY3RJZCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwib1wiKTtcbiAgICAgICAgICAgIGNvbnN0IHN1YmplY3QgPSBzdGF0ZU1hbmFnZXIuZ2V0KHN1YmplY3RJZCk7XG4gICAgICAgICAgICBpZiAoIXN1YmplY3QpIHtcbiAgICAgICAgICAgICAgICBERVZfQlVJTEQ6IGVycm9yT3V0KFwiRmFpbGVkIHRvIGZpbmQgc3ViamVjdCB3aXRoIGlkIFwiICsgc3ViamVjdElkICsgXCIgZm9yIG9ic2VydmVyTm9kZS5cIik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YmplY3QudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJqZWN0Lm9ic2VydmUoaWQsIHVwZGF0ZSk7XG4gICAgICAgICAgICB1cGRhdGUoc3ViamVjdC52YWx1ZSk7XG4gICAgICAgICAgICBub2RlLnJlcGxhY2VXaXRoKHRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbnZhciBMb2FkSG9va0tpbmQ7XG4oZnVuY3Rpb24gKExvYWRIb29rS2luZCkge1xuICAgIExvYWRIb29rS2luZFtMb2FkSG9va0tpbmRbXCJMQVlPVVRfTE9BREhPT0tcIl0gPSAwXSA9IFwiTEFZT1VUX0xPQURIT09LXCI7XG4gICAgTG9hZEhvb2tLaW5kW0xvYWRIb29rS2luZFtcIlBBR0VfTE9BREhPT0tcIl0gPSAxXSA9IFwiUEFHRV9MT0FESE9PS1wiO1xufSkoTG9hZEhvb2tLaW5kIHx8IChMb2FkSG9va0tpbmQgPSB7fSkpO1xuO1xuY2xhc3MgRWZmZWN0TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlRWZmZWN0cyA9IFtdO1xuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBsb2FkVmFsdWVzKGVmZmVjdHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBlZmZlY3Qgb2YgZWZmZWN0cykge1xuICAgICAgICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChlZmZlY3QuZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUVmZmVjdHMuaW5jbHVkZXMoZWZmZWN0LmlkKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVFZmZlY3RzLnB1c2goZWZmZWN0LmlkKTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5oYXMoZWZmZWN0LmlkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzLmdldChlZmZlY3QuaWQpKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVmZmVjdC5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGVwZW5kZW5jeSBvZiBkZXBlbmNlbmNpZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3kub2JzZXJ2ZShpZCwgdXBkYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIExvYWRIb29rTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMgPSBbXTtcbiAgICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3MgPSBbXTtcbiAgICB9XG4gICAgbG9hZFZhbHVlcyhsb2FkSG9va3MpIHtcbiAgICAgICAgZm9yIChjb25zdCBsb2FkSG9vayBvZiBsb2FkSG9va3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuY2VuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwobG9hZEhvb2suZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUxvYWRIb29rcy5pbmNsdWRlcyhsb2FkSG9vay5pZCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzLnB1c2gobG9hZEhvb2suaWQpO1xuICAgICAgICAgICAgY29uc3QgY2xlYW51cEZ1bmN0aW9uID0gbG9hZEhvb2suY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgICAgICAgIGlmIChjbGVhbnVwRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwRnVuY3Rpb246IGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcGF0aG5hbWU6IGxvYWRIb29rLnBhdGhuYW1lLFxuICAgICAgICAgICAgICAgICAgICBsb2FkSG9va0lkeDogdGhpcy5hY3RpdmVMb2FkSG9va3MubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWxsQ2xlYW51cEZ1bmN0aW9ucygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgICAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IExvYWRIb29rS2luZC5MQVlPVVRfTE9BREhPT0spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0luU2NvcGUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkuc3RhcnRzV2l0aChjbGVhbnVwUHJvY2VkdXJlLnBhdGhuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ1Byb2NlZHVyZXMucHVzaChjbGVhbnVwUHJvY2VkdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYW51cFByb2NlZHVyZS5jbGVhbnVwRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzLnNwbGljZShjbGVhbnVwUHJvY2VkdXJlLmxvYWRIb29rSWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgICB9XG59XG5jb25zdCBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG5jb25zdCBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xuY29uc3Qgc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcigpO1xuY29uc3QgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xuY29uc3QgZWZmZWN0TWFuYWdlciA9IG5ldyBFZmZlY3RNYW5hZ2VyKCk7XG5jb25zdCBwYWdlU3RyaW5nQ2FjaGUgPSBuZXcgTWFwKCk7XG5jb25zdCBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5jb25zdCB4bWxTZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbmNvbnN0IGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkwpID0+IHtcbiAgICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgICBpZiAocGFnZVN0cmluZ0NhY2hlLmhhcyh0YXJnZXRVUkwuaHJlZikpIHtcbiAgICAgICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcocGFnZVN0cmluZ0NhY2hlLmdldCh0YXJnZXRVUkwuaHJlZiksIFwidGV4dC9odG1sXCIpO1xuICAgIH1cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuICAgIGNvbnN0IG5ld0RPTSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoYXdhaXQgcmVzLnRleHQoKSwgXCJ0ZXh0L2h0bWxcIik7XG4gICAge1xuICAgICAgICBjb25zdCBkYXRhU2NyaXB0cyA9IG5ld0FycmF5KG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKTtcbiAgICAgICAgY29uc3QgY3VycmVudFNjcmlwdHMgPSBuZXdBcnJheShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLXBhY2thZ2U9XCJ0cnVlXCJdJykpO1xuICAgICAgICBmb3IgKGNvbnN0IGRhdGFTY3JpcHQgb2YgZGF0YVNjcmlwdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gY3VycmVudFNjcmlwdHMuZmluZChzID0+IHMuc3JjID09PSBkYXRhU2NyaXB0LnNyYyk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZGF0YVNjcmlwdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZ2V0IHBhZ2Ugc2NyaXB0XG4gICAge1xuICAgICAgICBjb25zdCBwYWdlRGF0YVNjcmlwdCA9IG5ld0RPTS5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS1ob29rPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgICAgICAgaWYgKHBhZ2VEYXRhU2NyaXB0KSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcGFnZURhdGFTY3JpcHQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICBwYWdlRGF0YVNjcmlwdC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICAgICAgICBzY3JpcHQudHlwZSA9IFwibW9kdWxlXCI7XG4gICAgICAgICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS1wYWdlXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgICAgICAgICAgbmV3RE9NLmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYWdlU3RyaW5nQ2FjaGUuc2V0KHRhcmdldFVSTC5ocmVmLCB4bWxTZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKG5ld0RPTSkpO1xuICAgIHJldHVybiBuZXdET007XG59O1xubGV0IG5hdmlnYXRpb25DYWxsYmFja3MgPSBbXTtcbmZ1bmN0aW9uIG9uTmF2aWdhdGUoY2FsbGJhY2spIHtcbiAgICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBuYXZpZ2F0aW9uQ2FsbGJhY2tzLmxlbmd0aCAtIDE7XG59XG5mdW5jdGlvbiByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2soaWR4KSB7XG4gICAgbmF2aWdhdGlvbkNhbGxiYWNrcy5zcGxpY2UoaWR4LCAxKTtcbn1cbmNvbnN0IG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQsIHB1c2hTdGF0ZSA9IHRydWUsIGlzUG9wU3RhdGUgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldFVSTCA9IG5ldyBVUkwodGFyZ2V0KTtcbiAgICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgICBpZiAoIWlzUG9wU3RhdGUgJiYgcGF0aG5hbWUgPT09IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSkge1xuICAgICAgICBpZiAodGFyZ2V0VVJMLmhhc2gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHVzaFN0YXRlKVxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0VVJMLmhyZWYpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBuZXdQYWdlID0gYXdhaXQgZmV0Y2hQYWdlKHRhcmdldFVSTCk7XG4gICAgaWYgKCFuZXdQYWdlKVxuICAgICAgICByZXR1cm47XG4gICAgbGV0IG9sZFBhZ2VMYXRlc3QgPSBkb2N1bWVudC5ib2R5O1xuICAgIGxldCBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZS5ib2R5O1xuICAgIHtcbiAgICAgICAgY29uc3QgbmV3UGFnZUxheW91dHMgPSBuZXdBcnJheShuZXdQYWdlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKTtcbiAgICAgICAgY29uc3Qgb2xkUGFnZUxheW91dHMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihuZXdQYWdlTGF5b3V0cy5sZW5ndGgsIG9sZFBhZ2VMYXlvdXRzLmxlbmd0aCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdQYWdlTGF5b3V0ID0gbmV3UGFnZUxheW91dHNbaV07XG4gICAgICAgICAgICBjb25zdCBvbGRQYWdlTGF5b3V0ID0gb2xkUGFnZUxheW91dHNbaV07XG4gICAgICAgICAgICBjb25zdCBuZXdMYXlvdXRJZCA9IG5ld1BhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgICAgICAgY29uc3Qgb2xkTGF5b3V0SWQgPSBvbGRQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgICAgICAgIGlmIChuZXdMYXlvdXRJZCAhPT0gb2xkTGF5b3V0SWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9sZFBhZ2VMYXRlc3QgPSBvbGRQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkID0gZG9jdW1lbnQuaGVhZDtcbiAgICBjb25zdCBuZXdIZWFkID0gbmV3UGFnZS5oZWFkO1xuICAgIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gICAgLy8gR3JhY2VmdWxseSByZXBsYWNlIGhlYWQuXG4gICAgLy8gZG9jdW1lbnQuaGVhZC5yZXBsYWNlV2l0aCgpOyBjYXVzZXMgRk9VQyBvbiBDaHJvbWl1bSBicm93c2Vycy5cbiAgICB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpPy5yZXBsYWNlV2l0aChuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpID8/IFwiXCIpO1xuICAgICAgICBjb25zdCB1cGRhdGUgPSAodGFyZ2V0TGlzdCwgbWF0Y2hBZ2FpbnN0LCBhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldExpc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGluZyA9IG1hdGNoQWdhaW5zdC5maW5kKG4gPT4gbi5pc0VxdWFsTm9kZSh0YXJnZXQpKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFjdGlvbih0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBhZGQgbmV3IHRhZ3MgYW5kIHJlb212ZSBvbGQgb25lc1xuICAgICAgICBjb25zdCBvbGRUYWdzID0gW1xuICAgICAgICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKSxcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgbmV3VGFncyA9IFtcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSksXG4gICAgICAgIF07XG4gICAgICAgIHVwZGF0ZShuZXdUYWdzLCBvbGRUYWdzLCAobm9kZSkgPT4gZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChub2RlKSk7XG4gICAgICAgIHVwZGF0ZShvbGRUYWdzLCBuZXdUYWdzLCAobm9kZSkgPT4gbm9kZS5yZW1vdmUoKSk7XG4gICAgfVxuICAgIGlmIChwdXNoU3RhdGUpXG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgICBsb2FkSG9va01hbmFnZXIuY2FsbENsZWFudXBGdW5jdGlvbnMoKTtcbiAgICB7XG4gICAgICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgbmF2aWdhdGlvbkNhbGxiYWNrcykge1xuICAgICAgICAgICAgY2FsbGJhY2socGF0aG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IGxvYWRQYWdlKCk7XG4gICAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG59O1xuLyoqIGEgc2ltcGxlIHBhdGggc2FuaXRpemVyIHRoYXQganVzdCBlbnN1cmVzIG5vIHJlcGVhdC1zbGFzaGVzIGFuZCBubyB0cmFpbGluZyBzbGFzaCAqL1xuZnVuY3Rpb24gc2FmZVBlcmNlbnREZWNvZGUoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvJVswLTlBLUZhLWZdezJ9L2csIChtKSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG0uc2xpY2UoMSksIDE2KSkpO1xufVxuZnVuY3Rpb24gc2FuaXRpemVQYXRobmFtZShwYXRobmFtZSA9IFwiXCIpIHtcbiAgICBpZiAoIXBhdGhuYW1lKVxuICAgICAgICByZXR1cm4gXCIvXCI7XG4gICAgcGF0aG5hbWUgPSBzYWZlUGVyY2VudERlY29kZShwYXRobmFtZSk7XG4gICAgcGF0aG5hbWUgPSBcIi9cIiArIHBhdGhuYW1lO1xuICAgIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKy9nLCBcIi9cIik7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRobmFtZS5zcGxpdChcIi9cIik7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICAgICAgaWYgKCFzZWdtZW50IHx8IHNlZ21lbnQgPT09IFwiLlwiKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGlmIChzZWdtZW50ID09PSBcIi4uXCIpIHtcbiAgICAgICAgICAgIHJlc29sdmVkLnBvcCgpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZWQucHVzaChzZWdtZW50KTtcbiAgICB9XG4gICAgY29uc3QgZW5jb2RlZCA9IHJlc29sdmVkLm1hcCgocykgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHMpKTtcbiAgICByZXR1cm4gXCIvXCIgKyBlbmNvZGVkLmpvaW4oXCIvXCIpO1xufVxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZURhdGEocGF0aG5hbWUpIHtcbiAgICAvKiogRmluZCB0aGUgY29ycmVjdCBzY3JpcHQgdGFnIGluIGhlYWQuICovXG4gICAgY29uc3QgZGF0YVNjcmlwdFRhZyA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgaWYgKCFkYXRhU2NyaXB0VGFnKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkZhaWxlZCB0byBmaW5kIHNjcmlwdCB0YWcgZm9yIHF1ZXJ5OlwiICsgYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaW1wb3J0KGRhdGFTY3JpcHRUYWcuc3JjKTtcbiAgICBjb25zdCB7IHN1YmplY3RzLCBldmVudExpc3RlbmVycywgZXZlbnRMaXN0ZW5lck9wdGlvbnMsIG9ic2VydmVycywgb2JzZXJ2ZXJPcHRpb25zLCBlZmZlY3RzLCB9ID0gZGF0YTtcbiAgICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zIHx8ICFlZmZlY3RzKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgUG9zc2libHkgbWFsZm9ybWVkIHBhZ2UgZGF0YSAke2RhdGF9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG59XG5mdW5jdGlvbiBlcnJvck91dChtZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBhZ2UoKSB7XG4gICAgd2luZG93Lm9ucG9wc3RhdGUgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBhd2FpdCBuYXZpZ2F0ZUxvY2FsbHkodGFyZ2V0LmxvY2F0aW9uLmhyZWYsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0LmxvY2F0aW9uLmhyZWYpO1xuICAgIH07XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgY29uc3QgeyBzdWJqZWN0cywgZXZlbnRMaXN0ZW5lck9wdGlvbnMsIGV2ZW50TGlzdGVuZXJzLCBvYnNlcnZlcnMsIG9ic2VydmVyT3B0aW9ucywgbG9hZEhvb2tzLCBlZmZlY3RzLCB9ID0gYXdhaXQgZ2V0UGFnZURhdGEocGF0aG5hbWUpO1xuICAgIERFVl9CVUlMRDoge1xuICAgICAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgICAgICAgcGFnZURhdGE6IHtcbiAgICAgICAgICAgICAgICBzdWJqZWN0cyxcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMsXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJPcHRpb25zLFxuICAgICAgICAgICAgICAgIGxvYWRIb29rcyxcbiAgICAgICAgICAgICAgICBlZmZlY3RzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRlTWFuYWdlcixcbiAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICAgICAgICAgICAgb2JzZXJ2ZXJNYW5hZ2VyLFxuICAgICAgICAgICAgbG9hZEhvb2tNYW5hZ2VyLFxuICAgICAgICAgICAgZWZmZWN0TWFuYWdlcixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZ2xvYmFsVGhpcy5lbGVnYW5jZUNsaWVudCA9IHtcbiAgICAgICAgY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudCxcbiAgICAgICAgZmV0Y2hQYWdlLFxuICAgICAgICBuYXZpZ2F0ZUxvY2FsbHksXG4gICAgICAgIG9uTmF2aWdhdGUsXG4gICAgICAgIHJlbW92ZU5hdmlnYXRpb25DYWxsYmFjayxcbiAgICAgICAgZ2VuTG9jYWxJRCxcbiAgICB9O1xuICAgIHN0YXRlTWFuYWdlci5sb2FkVmFsdWVzKHN1YmplY3RzKTtcbiAgICBldmVudExpc3RlbmVyTWFuYWdlci5sb2FkVmFsdWVzKGV2ZW50TGlzdGVuZXJzKTtcbiAgICBldmVudExpc3RlbmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgICBvYnNlcnZlck1hbmFnZXIubG9hZFZhbHVlcyhvYnNlcnZlcnMpO1xuICAgIG9ic2VydmVyTWFuYWdlci5ob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucyk7XG4gICAgb2JzZXJ2ZXJNYW5hZ2VyLnRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCk7XG4gICAgbG9hZEhvb2tNYW5hZ2VyLmxvYWRWYWx1ZXMobG9hZEhvb2tzKTtcbiAgICBlZmZlY3RNYW5hZ2VyLmxvYWRWYWx1ZXMoZWZmZWN0cyk7XG59XG5sb2FkUGFnZSgpO1xuZXhwb3J0IHsgQ2xpZW50U3ViamVjdCwgU3RhdGVNYW5hZ2VyLCBPYnNlcnZlck1hbmFnZXIsIExvYWRIb29rTWFuYWdlciwgRXZlbnRMaXN0ZW5lck1hbmFnZXIsIEVmZmVjdE1hbmFnZXIsIH07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFHQSxNQUFNLHVCQUFOLE1BQTJCO0FBQUEsRUFDM0I7QUFDQSxXQUFTLFlBQVksT0FBTztBQUN4QixRQUFJLFVBQVUsUUFDVixVQUFVLFdBQ1QsT0FBTyxVQUFVLFlBQVksTUFBTSxRQUFRLEtBQUssS0FBSyxpQkFBaUI7QUFDdkUsYUFBTztBQUNYLFdBQU87QUFBQSxFQUNYO0FBQ0EsTUFBTSxrQkFBTixNQUFzQjtBQUFBLElBQ2xCLFlBQVksS0FBSyxVQUFVLENBQUMsR0FBRyxXQUFXLE1BQU07QUFDNUMsV0FBSyxNQUFNO0FBQ1gsVUFBSSxZQUFZLE9BQU8sR0FBRztBQUN0QixZQUFJLEtBQUssZ0JBQWdCLE1BQU0sT0FBTztBQUNsQyxrQkFBUSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUNwRSxnQkFBTTtBQUFBLFFBQ1Y7QUFDQSxhQUFLLFdBQVcsQ0FBQyxTQUFTLEdBQUksWUFBWSxDQUFDLENBQUU7QUFDN0MsYUFBSyxVQUFVLENBQUM7QUFBQSxNQUNwQixPQUNLO0FBQ0QsYUFBSyxVQUFVO0FBQ2YsYUFBSyxXQUFXO0FBQUEsTUFDcEI7QUFBQSxJQUNKO0FBQUEsSUFDQSxrQkFBa0I7QUFDZCxhQUFPLEtBQUssYUFBYTtBQUFBLElBQzdCO0FBQUEsRUFDSjs7O0FDOUJBLE1BQU0sOEJBQThCO0FBQUEsSUFDaEM7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFDbkQ7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFVO0FBQUEsSUFBUztBQUFBLEVBQ2hEO0FBQ0EsTUFBTSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBVztBQUFBLElBQVc7QUFBQSxJQUFTO0FBQUEsSUFBUztBQUFBLElBQUs7QUFBQSxJQUFPO0FBQUEsSUFDakU7QUFBQSxJQUFjO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBVztBQUFBLElBQVE7QUFBQSxJQUM3RDtBQUFBLElBQVk7QUFBQSxJQUFRO0FBQUEsSUFBWTtBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFBVztBQUFBLElBQU87QUFBQSxJQUMvRDtBQUFBLElBQU87QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFZO0FBQUEsSUFBYztBQUFBLElBQVU7QUFBQSxJQUM3RDtBQUFBLElBQVE7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQzlEO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFVO0FBQUEsSUFBTztBQUFBLElBQU87QUFBQSxJQUFTO0FBQUEsSUFBVTtBQUFBLElBQU07QUFBQSxJQUM5RDtBQUFBLElBQU87QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUM3RDtBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQUs7QUFBQSxJQUFXO0FBQUEsSUFBTztBQUFBLElBQ3ZEO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUMxRDtBQUFBLElBQVU7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBUztBQUFBLElBQU87QUFBQSxJQUM3RDtBQUFBLElBQU87QUFBQSxJQUFTO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFZO0FBQUEsSUFBWTtBQUFBLElBQVM7QUFBQSxJQUNoRTtBQUFBLElBQVM7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFLO0FBQUEsSUFBTTtBQUFBLElBQWM7QUFBQSxFQUM3RDtBQUNBLE1BQU0sNkJBQTZCO0FBQUEsSUFDL0I7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFBVztBQUFBLElBQVk7QUFBQSxFQUNoRTtBQUNBLE1BQU0saUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxJQUFPO0FBQUEsSUFBSztBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBWTtBQUFBLElBQVE7QUFBQSxJQUFVO0FB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LFVBQU0sRUFBRSxVQUFVLHNCQUFzQixnQkFBZ0IsV0FBVyxpQkFBaUIsV0FBVyxRQUFTLElBQUksTUFBTSxZQUFZLFFBQVE7QUFDdEksZUFBVztBQUNQLGlCQUFXLFdBQVc7QUFBQSxRQUNsQixVQUFVO0FBQUEsVUFDTjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0o7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsZUFBVyxpQkFBaUI7QUFBQSxNQUN4QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUNBLGlCQUFhLFdBQVcsUUFBUTtBQUNoQyx5QkFBcUIsV0FBVyxjQUFjO0FBQzlDLHlCQUFxQixjQUFjLG9CQUFvQjtBQUN2RCxvQkFBZ0IsV0FBVyxTQUFTO0FBQ3BDLG9CQUFnQixjQUFjLGVBQWU7QUFDN0Msb0JBQWdCLDhCQUE4QjtBQUM5QyxvQkFBZ0IsV0FBVyxTQUFTO0FBQ3BDLGtCQUFjLFdBQVcsT0FBTztBQUFBLEVBQ3BDO0FBQ0EsV0FBUzsiLAogICJuYW1lcyI6IFsiZ2V0U2VsZiIsICJ1cGRhdGUiLCAiTG9hZEhvb2tLaW5kIiwgInRhcmdldCJdCn0K
