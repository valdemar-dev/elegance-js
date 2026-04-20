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
          element[key] = value === "true";
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
        if (this.activeLoadHooks.includes(loadHook.id)) {
          continue;
        }
        this.activeLoadHooks.push(loadHook.id);
        const cleanupFunction = loadHook.callback(stateManager);
        if (typeof cleanupFunction === "function") {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9lbGVtZW50cy9lbGVtZW50LmpzIiwgIi4uLy4uLy4uL2Rpc3QvZWxlbWVudHMvZWxlbWVudF9saXN0LmpzIiwgIi4uLy4uLy4uL2Rpc3QvY2xpZW50L3J1bnRpbWUuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQW4gb3B0aW9uIHRoYXQgc2hvdWxkIGJlIHRyZWF0ZWQgZGlmZmVyZW50bHkgYnkgdGhlIGNvbXBpbGVyLlxuICovXG5jbGFzcyBTcGVjaWFsRWxlbWVudE9wdGlvbiB7XG59XG5mdW5jdGlvbiBpc0FuRWxlbWVudCh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5jbGFzcyBFbGVnYW5jZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRhZywgb3B0aW9ucyA9IHt9LCBjaGlsZHJlbiA9IG51bGwpIHtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgIGlmIChpc0FuRWxlbWVudChvcHRpb25zKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FuSGF2ZUNoaWxkcmVuKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIlRoZSBvcHRpb25zIG9mIGFuIGVsZW1lbnQgbWF5IG5vdCBiZSBhbiBlbGVtZW50LCBpZiB0aGUgZWxlbWVudCBjYW5ub3QgaGF2ZSBjaGlsZHJlbi5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbb3B0aW9ucywgLi4uKGNoaWxkcmVuID8/IFtdKV07XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FuSGF2ZUNoaWxkcmVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbiAhPT0gbnVsbDtcbiAgICB9XG59XG5leHBvcnQgeyBFbGVnYW5jZUVsZW1lbnQsIFNwZWNpYWxFbGVtZW50T3B0aW9uLCBpc0FuRWxlbWVudCwgfTtcbiIsICJpbXBvcnQgeyBFbGVnYW5jZUVsZW1lbnQsIH0gZnJvbSBcIi4vZWxlbWVudFwiO1xuY29uc3QgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICAgIFwiYXJlYVwiLCBcImJhc2VcIiwgXCJiclwiLCBcImNvbFwiLCBcImVtYmVkXCIsIFwiaHJcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLFxuICAgIFwibGlua1wiLCBcIm1ldGFcIiwgXCJwYXJhbVwiLCBcInNvdXJjZVwiLCBcInRyYWNrXCIsIFwid2JyXCIsXG5dO1xuY29uc3QgaHRtbEVsZW1lbnRUYWdzID0gW1xuICAgIFwiYVwiLCBcImFiYnJcIiwgXCJhZGRyZXNzXCIsIFwiYXJ0aWNsZVwiLCBcImFzaWRlXCIsIFwiYXVkaW9cIiwgXCJiXCIsIFwiYmRpXCIsIFwiYmRvXCIsXG4gICAgXCJibG9ja3F1b3RlXCIsIFwiYm9keVwiLCBcImJ1dHRvblwiLCBcImNhbnZhc1wiLCBcImNhcHRpb25cIiwgXCJjaXRlXCIsIFwiY29kZVwiLFxuICAgIFwiY29sZ3JvdXBcIiwgXCJkYXRhXCIsIFwiZGF0YWxpc3RcIiwgXCJkZFwiLCBcImRlbFwiLCBcImRldGFpbHNcIiwgXCJkZm5cIiwgXCJkaWFsb2dcIixcbiAgICBcImRpdlwiLCBcImRsXCIsIFwiZHRcIiwgXCJlbVwiLCBcImZpZWxkc2V0XCIsIFwiZmlnY2FwdGlvblwiLCBcImZpZ3VyZVwiLCBcImZvb3RlclwiLFxuICAgIFwiZm9ybVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImhlYWRcIiwgXCJoZWFkZXJcIiwgXCJoZ3JvdXBcIixcbiAgICBcImh0bWxcIiwgXCJpXCIsIFwiaWZyYW1lXCIsIFwiaW5zXCIsIFwia2JkXCIsIFwibGFiZWxcIiwgXCJsZWdlbmRcIiwgXCJsaVwiLCBcIm1haW5cIixcbiAgICBcIm1hcFwiLCBcIm1hcmtcIiwgXCJtZW51XCIsIFwibWV0ZXJcIiwgXCJuYXZcIiwgXCJub3NjcmlwdFwiLCBcIm9iamVjdFwiLCBcIm9sXCIsXG4gICAgXCJvcHRncm91cFwiLCBcIm9wdGlvblwiLCBcIm91dHB1dFwiLCBcInBcIiwgXCJwaWN0dXJlXCIsIFwicHJlXCIsIFwicHJvZ3Jlc3NcIixcbiAgICBcInFcIiwgXCJycFwiLCBcInJ0XCIsIFwicnVieVwiLCBcInNcIiwgXCJzYW1wXCIsIFwic2NyaXB0XCIsIFwic2VhcmNoXCIsIFwic2VjdGlvblwiLFxuICAgIFwic2VsZWN0XCIsIFwic2xvdFwiLCBcInNtYWxsXCIsIFwic3BhblwiLCBcInN0cm9uZ1wiLCBcInN0eWxlXCIsIFwic3ViXCIsIFwic3VtbWFyeVwiLFxuICAgIFwic3VwXCIsIFwidGFibGVcIiwgXCJ0Ym9keVwiLCBcInRkXCIsIFwidGVtcGxhdGVcIiwgXCJ0ZXh0YXJlYVwiLCBcInRmb290XCIsIFwidGhcIixcbiAgICBcInRoZWFkXCIsIFwidGltZVwiLCBcInRpdGxlXCIsIFwidHJcIiwgXCJ1XCIsIFwidWxcIiwgXCJ2YXJFbGVtZW50XCIsIFwidmlkZW9cIixcbl07XG5jb25zdCBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyA9IFtcbiAgICBcInBhdGhcIiwgXCJjaXJjbGVcIiwgXCJlbGxpcHNlXCIsIFwibGluZVwiLCBcInBvbHlnb25cIiwgXCJwb2x5bGluZVwiLCBcInN0b3BcIixcbl07XG5jb25zdCBzdmdFbGVtZW50VGFncyA9IFtcbiAgICBcInN2Z1wiLCBcImdcIiwgXCJ0ZXh0XCIsIFwidHNwYW5cIiwgXCJ0ZXh0UGF0aFwiLCBcImRlZnNcIiwgXCJzeW1ib2xcIiwgXCJ1c2VcIixcbiAgICBcImltYWdlXCIsIFwiY2xpcFBhdGhcIiwgXCJtYXNrXCIsIFwicGF0dGVyblwiLCBcImxpbmVhckdyYWRpZW50XCIsIFwicmFkaWFsR3JhZGllbnRcIixcbiAgICBcImZpbHRlclwiLCBcIm1hcmtlclwiLCBcInZpZXdcIixcbiAgICBcImZlQmxlbmRcIiwgXCJmZUNvbG9yTWF0cml4XCIsIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLCBcImZlQ29tcG9zaXRlXCIsXG4gICAgXCJmZUNvbnZvbHZlTWF0cml4XCIsIFwiZmVEaWZmdXNlTGlnaHRpbmdcIiwgXCJmZURpc3BsYWNlbWVudE1hcFwiLCBcImZlRGlzdGFudExpZ2h0XCIsXG4gICAgXCJmZUZsb29kXCIsIFwiZmVGdW5jQVwiLCBcImZlRnVuY0JcIiwgXCJmZUZ1bmNHXCIsIFwiZmVGdW5jUlwiLCBcImZlR2F1c3NpYW5CbHVyXCIsXG4gICAgXCJmZUltYWdlXCIsIFwiZmVNZXJnZVwiLCBcImZlTWVyZ2VOb2RlXCIsIFwiZmVNb3JwaG9sb2d5XCIsIFwiZmVPZmZzZXRcIixcbiAgICBcImZlUG9pbnRMaWdodFwiLCBcImZlU3BlY3VsYXJMaWdodGluZ1wiLCBcImZlU3BvdExpZ2h0XCIsIFwiZmVUaWxlXCIsIFwiZmVUdXJidWxlbmNlXCIsXG5dO1xuY29uc3QgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gICAgXCJtaVwiLCBcIm1uXCIsIFwibW9cIixcbl07XG5jb25zdCBtYXRobWxFbGVtZW50VGFncyA9IFtcbiAgICBcIm1hdGhcIiwgXCJtc1wiLCBcIm10ZXh0XCIsIFwibXJvd1wiLCBcIm1mZW5jZWRcIiwgXCJtc3VwXCIsIFwibXN1YlwiLCBcIm1zdWJzdXBcIixcbiAgICBcIm1mcmFjXCIsIFwibXNxcnRcIiwgXCJtcm9vdFwiLCBcIm10YWJsZVwiLCBcIm10clwiLCBcIm10ZFwiLCBcIm1zdHlsZVwiLFxuICAgIFwibWVuY2xvc2VcIiwgXCJtbXVsdGlzY3JpcHRzXCIsXG5dO1xuY29uc3QgZWxlbWVudHMgPSB7fTtcbmNvbnN0IGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgICByZXR1cm4gKChvcHRpb25zLCAuLi5jaGlsZHJlbikgPT4gbmV3IEVsZWdhbmNlRWxlbWVudCh0YWcsIG9wdGlvbnMsIGNoaWxkcmVuKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgICByZXR1cm4gKChvcHRpb25zKSA9PiBuZXcgRWxlZ2FuY2VFbGVtZW50KHRhZywgb3B0aW9ucywgbnVsbCkpO1xufVxuZm9yIChjb25zdCB0YWcgb2YgaHRtbEVsZW1lbnRUYWdzKVxuICAgIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpXG4gICAgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncylcbiAgICBlbGVtZW50c1t0YWddID0gY3JlYXRlRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIGh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncylcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHNbdGFnXSA9IGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyKHRhZyk7XG5jb25zdCBhbGxFbGVtZW50cyA9IHtcbiAgICAuLi5lbGVtZW50cyxcbiAgICAuLi5jaGlsZHJlbmxlc3NFbGVtZW50cyxcbn07XG5leHBvcnQgeyBlbGVtZW50cywgY2hpbGRyZW5sZXNzRWxlbWVudHMsIGFsbEVsZW1lbnRzLCB9O1xuIiwgImltcG9ydCB7IGFsbEVsZW1lbnRzIH0gZnJvbSBcIi4uL2VsZW1lbnRzL2VsZW1lbnRfbGlzdFwiO1xuaW1wb3J0IHsgU3BlY2lhbEVsZW1lbnRPcHRpb24sIEVsZWdhbmNlRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9lbGVtZW50XCI7XG5PYmplY3QuYXNzaWduKHdpbmRvdywgYWxsRWxlbWVudHMpO1xuY29uc3QgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xubGV0IGlkQ291bnRlciA9IDA7XG4vKipcbiAqIEdlbmVyYXRlIGEgbm9uLWRldGVybWluaXN0aWMgdW5pcXVlIGlkIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGJyb3dzZXIgc3BlY2lmaWMgdGhpbmdzIGxpa2UgY3VzdG9tIGNsaWVudCBvYnNlcnZlcnMuXG4gKiBVbmlxdWUsIGJ1dCBtYXkgY2hhbmdlIGJldHdlZW4gYnVpbGRzOyBkZXBlbmRzIG9uIG9yZGVyIG9mIGNyZWF0aW9uLlxuICogQHJldHVybnMgQSB1bmlxdWUgaWRcbiAqL1xuZnVuY3Rpb24gZ2VuTG9jYWxJRCgpIHtcbiAgICBpZENvdW50ZXIrKztcbiAgICByZXR1cm4gaWRDb3VudGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zID0gW107XG4gICAgY29uc3QgZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50YWcpO1xuICAgIC8vIFByb2Nlc3Mgb3B0aW9ucy5cbiAgICB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlbGVtZW50Lm9wdGlvbnMpO1xuICAgICAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZS5tdXRhdGUoZWxlbWVudCwgb3B0aW9uTmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZWxlbWVudC5rZXkpIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICAgIH1cbiAgICAvLyBQcm9jZXNzIGNoaWxkcmVuLlxuICAgIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICAgICAgICAgIGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0LnJvb3QpO1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gICAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4geyByb290OiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSwgfTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgRWxlZ2FuY2VFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LiBBbHNvIG5vdGUgdGhhdCBjdXJyZW50bHkgaW4gY2xpZW50IGNvbXBvbmVudHMgbGlrZSByZWFjdGl2ZU1hcCwgc3RhdGUgc3ViamVjdCByZWZlcmVuY2VzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uYCk7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICAgICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICAgIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICAgIGxldCBpc0Vycm9yZWQgPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChcIi9lbGVnYW5jZS1ob3QtcmVsb2FkXCIsIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgICAgICB1cmwucG9ydCA9IFwiNDAwMFwiO1xuICAgICAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZSh1cmwpO1xuICAgICAgICBlcy5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICBlcy5jbG9zZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChjb25uZWN0LCAxMDAwKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xufSkoKTtcbi8qKlxuICogQSBTZXJ2ZXJTdWJqZWN0IHRoYXQgaGFzIGJlZW4gc2VyaWFsaXplZCwgc2hpcHBlZCB0byB0aGUgYnJvd3NlciwgYW5kIHJlLWNyZWF0ZWQgYXMgaXQncyBmaW5hbCBmb3JtLlxuICpcbiAqIFNldHRpbmcgdGhlIGB2YWx1ZWAgb2YgdGhpcyBDbGllbnRTdWJqZWN0IHdpbGwgdHJpZ2dlciBpdCdzIG9ic2VydmVycyBjYWxsYmFja3MuXG4gKlxuICogVG8gbGlzdGVuIGZvciBjaGFuZ2VzIGluIGB2YWx1ZWAsIHlvdSBtYXkgY2FsbCB0aGUgYG9ic2VydmUoKWAgbWV0aG9kLlxuICovXG5jbGFzcyBDbGllbnRTdWJqZWN0IHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfVxuICAgIHNldCB2YWx1ZShuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAgICovXG4gICAgdHJpZ2dlck9ic2VydmVycygpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICAgKlxuICAgICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAgICpcbiAgICAgKiBOb3RlOiB0aGlzIHRyaWdnZXJzIGBjYWxsYmFja2Agd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIHN1YmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGlzIG9ic2VydmVyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAgICovXG4gICAgb2JzZXJ2ZShpZCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmRlbGV0ZShpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYnNlcnZlcnMuc2V0KGlkLCBjYWxsYmFjayk7XG4gICAgICAgIGNhbGxiYWNrKHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gb2JzZXJ2ZXIgZnJvbSB0aGlzIHN1YmplY3QuXG4gICAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgICAqL1xuICAgIHVub2JzZXJ2ZShpZCkge1xuICAgICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbn1cbmNsYXNzIFN0YXRlTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGxvYWRWYWx1ZXModmFsdWVzLCBkb092ZXJ3cml0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdWJqZWN0cy5oYXModmFsdWUuaWQpICYmIGRvT3ZlcndyaXRlID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpO1xuICAgIH1cbiAgICBnZXRBbGwoaWRzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmdldChpZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbn1cbi8qKlxuICogQW4gZXZlbnQgbGlzdGVuZXIgYWZ0ZXIgaXQgaGFzIGJlZW4gZ2VuZXJhdGVkIG9uIHRoZSBzZXJ2ZXIsIHByb2Nlc3NlZCBpbnRvIHBhZ2VkYXRhLCBhbmQgcmVjb25zdHJ1Y3RlZCBvbiB0aGUgY2xpZW50LlxuICovXG5jbGFzcyBDbGllbnRFdmVudExpc3RlbmVyIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgfVxuICAgIGNhbGwoZXYpIHtcbiAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZXYsIC4uLmRlcGVuZGVuY2llcyk7XG4gICAgfVxufVxuY2xhc3MgRXZlbnRMaXN0ZW5lck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBsb2FkVmFsdWVzKHNlcnZlckV2ZW50TGlzdGVuZXJzLCBkb092ZXJyaWRlID0gZmFsc2UpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRFdmVudExpc3RlbmVyID0gbmV3IENsaWVudEV2ZW50TGlzdGVuZXIoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCwgc2VydmVyRXZlbnRMaXN0ZW5lci5jYWxsYmFjaywgc2VydmVyRXZlbnRMaXN0ZW5lci5kZXBlbmRlbmNpZXMpO1xuICAgICAgICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQoY2xpZW50RXZlbnRMaXN0ZW5lci5pZCwgY2xpZW50RXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50TGlzdGVuZXJPcHRpb24gb2YgZXZlbnRMaXN0ZW5lck9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtldmVudExpc3RlbmVyT3B0aW9uLmtleX1cIl1gKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgICAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgRXZlbnRMaXN0ZW5lck9wdGlvbjogRXZlbnQgbGlzdGVuZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyLmNhbGwoZXYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGlkKTtcbiAgICB9XG59XG5jbGFzcyBDbGllbnRPYnNlcnZlciB7XG4gICAgY29uc3RydWN0b3IoaWQsIGNhbGxiYWNrLCBkZXBlbmNlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgICAgICBjb25zdCBpbml0aWFsVmFsdWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzW2lkeF0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAgICovXG4gICAgYWRkRWxlbWVudChlbGVtZW50LCBvcHRpb25OYW1lKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaCh7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSk7XG4gICAgfVxuICAgIHNldFByb3AoZWxlbWVudCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBcInN0eWxlXCIgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkuc3RhcnRzV2l0aChcIm9uXCIpICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5IGluIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzVHJ1dGh5ID0gdmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCI7XG4gICAgICAgICAgICBpZiAoaXNUcnV0aHkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSB2YWx1ZSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3QgeyBlbGVtZW50LCBvcHRpb25OYW1lIH0gb2YgdGhpcy5lbGVtZW50cykge1xuICAgICAgICAgICAgY29uc3QgZ2V0U2VsZiA9IGZ1bmN0aW9uIGdldFNlbGYoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmNhbGxiYWNrLmNhbGwoZWxlbWVudCwgLi4udGhpcy5zdWJqZWN0VmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UHJvcChlbGVtZW50LCBvcHRpb25OYW1lLCBuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBPYnNlcnZlck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWVudE9ic2VydmVycyA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgbG9hZFZhbHVlcyhzZXJ2ZXJPYnNlcnZlcnMsIGRvT3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlcnZlck9ic2VydmVyIG9mIHNlcnZlck9ic2VydmVycykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmhhcyhzZXJ2ZXJPYnNlcnZlci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRPYnNlcnZlciA9IG5ldyBDbGllbnRPYnNlcnZlcihzZXJ2ZXJPYnNlcnZlci5pZCwgc2VydmVyT2JzZXJ2ZXIuY2FsbGJhY2ssIHNlcnZlck9ic2VydmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudE9ic2VydmVycy5zZXQoY2xpZW50T2JzZXJ2ZXIuaWQsIGNsaWVudE9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IG9ic2VydmVyT3B0aW9uIG9mIG9ic2VydmVyT3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtrZXk9XCIke29ic2VydmVyT3B0aW9uLmtleX1cIl1gKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmdldChvYnNlcnZlck9wdGlvbi5pZCk7XG4gICAgICAgICAgICBpZiAoIW9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBPYnNlcnZlck9wdGlvbjogT2JzZXJ2ZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgb2JzZXJ2ZXJPcHRpb24uaWQgKyBcIlxcXCIgZG9lcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ic2VydmVyLmFkZEVsZW1lbnQoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb24ub3B0aW9uKTtcbiAgICAgICAgICAgIG9ic2VydmVyLmNhbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm1TdWJqZWN0T2JzZXJ2ZXJOb2RlcygpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXJOb2RlcyA9IG5ld0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtvXVwiKSk7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9cIik7XG4gICAgICAgICAgICBjb25zdCBzdWJqZWN0ID0gc3RhdGVNYW5hZ2VyLmdldChzdWJqZWN0SWQpO1xuICAgICAgICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEOiBlcnJvck91dChcIkZhaWxlZCB0byBmaW5kIHN1YmplY3Qgd2l0aCBpZCBcIiArIHN1YmplY3RJZCArIFwiIGZvciBvYnNlcnZlck5vZGUuXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdWJqZWN0LnZhbHVlKTtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZ2VuTG9jYWxJRCgpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViamVjdC5vYnNlcnZlKGlkLCB1cGRhdGUpO1xuICAgICAgICAgICAgdXBkYXRlKHN1YmplY3QudmFsdWUpO1xuICAgICAgICAgICAgbm9kZS5yZXBsYWNlV2l0aCh0ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG52YXIgTG9hZEhvb2tLaW5kO1xuKGZ1bmN0aW9uIChMb2FkSG9va0tpbmQpIHtcbiAgICBMb2FkSG9va0tpbmRbTG9hZEhvb2tLaW5kW1wiTEFZT1VUX0xPQURIT09LXCJdID0gMF0gPSBcIkxBWU9VVF9MT0FESE9PS1wiO1xuICAgIExvYWRIb29rS2luZFtMb2FkSG9va0tpbmRbXCJQQUdFX0xPQURIT09LXCJdID0gMV0gPSBcIlBBR0VfTE9BREhPT0tcIjtcbn0pKExvYWRIb29rS2luZCB8fCAoTG9hZEhvb2tLaW5kID0ge30pKTtcbjtcbmNsYXNzIEVmZmVjdE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUVmZmVjdHMgPSBbXTtcbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgbG9hZFZhbHVlcyhlZmZlY3RzKSB7XG4gICAgICAgIGZvciAoY29uc3QgZWZmZWN0IG9mIGVmZmVjdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuY2VuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwoZWZmZWN0LmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVFZmZlY3RzLmluY2x1ZGVzKGVmZmVjdC5pZCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRWZmZWN0cy5wdXNoKGVmZmVjdC5pZCk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2xlYW51cFByb2NlZHVyZXMuaGFzKGVmZmVjdC5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5nZXQoZWZmZWN0LmlkKSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlZmZlY3QuY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5jZW5jaWVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBnZW5Mb2NhbElEKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5Lm9ic2VydmUoaWQsIHVwZGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBMb2FkSG9va01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gW107XG4gICAgICAgIHRoaXMuYWN0aXZlTG9hZEhvb2tzID0gW107XG4gICAgfVxuICAgIGxvYWRWYWx1ZXMobG9hZEhvb2tzKSB7XG4gICAgICAgIGZvciAoY29uc3QgbG9hZEhvb2sgb2YgbG9hZEhvb2tzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVMb2FkSG9va3MuaW5jbHVkZXMobG9hZEhvb2suaWQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUxvYWRIb29rcy5wdXNoKGxvYWRIb29rLmlkKTtcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbiA9IGxvYWRIb29rLmNhbGxiYWNrKHN0YXRlTWFuYWdlcik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNsZWFudXBGdW5jdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2luZDogbG9hZEhvb2sua2luZCxcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cEZ1bmN0aW9uOiBjbGVhbnVwRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOiBsb2FkSG9vay5wYXRobmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZEhvb2tJZHg6IHRoaXMuYWN0aXZlTG9hZEhvb2tzLmxlbmd0aCAtIDEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FsbENsZWFudXBGdW5jdGlvbnMoKSB7XG4gICAgICAgIGxldCByZW1haW5pbmdQcm9jZWR1cmVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgY2xlYW51cFByb2NlZHVyZSBvZiB0aGlzLmNsZWFudXBQcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAoY2xlYW51cFByb2NlZHVyZS5raW5kID09PSBMb2FkSG9va0tpbmQuTEFZT1VUX0xPQURIT09LKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzSW5TY29wZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsZWFudXBQcm9jZWR1cmUuY2xlYW51cEZ1bmN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUxvYWRIb29rcy5zcGxpY2UoY2xlYW51cFByb2NlZHVyZS5sb2FkSG9va0lkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcyA9IHJlbWFpbmluZ1Byb2NlZHVyZXM7XG4gICAgfVxufVxuY29uc3Qgb2JzZXJ2ZXJNYW5hZ2VyID0gbmV3IE9ic2VydmVyTWFuYWdlcigpO1xuY29uc3QgZXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbmNvbnN0IHN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIoKTtcbmNvbnN0IGxvYWRIb29rTWFuYWdlciA9IG5ldyBMb2FkSG9va01hbmFnZXIoKTtcbmNvbnN0IGVmZmVjdE1hbmFnZXIgPSBuZXcgRWZmZWN0TWFuYWdlcigpO1xuY29uc3QgcGFnZVN0cmluZ0NhY2hlID0gbmV3IE1hcCgpO1xuY29uc3QgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuY29uc3QgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG5jb25zdCBmZXRjaFBhZ2UgPSBhc3luYyAodGFyZ2V0VVJMKSA9PiB7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gICAgaWYgKHBhZ2VTdHJpbmdDYWNoZS5oYXModGFyZ2V0VVJMLmhyZWYpKSB7XG4gICAgICAgIHJldHVybiBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBhZ2VTdHJpbmdDYWNoZS5nZXQodGFyZ2V0VVJMLmhyZWYpLCBcInRleHQvaHRtbFwiKTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godGFyZ2V0VVJMKTtcbiAgICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICAgIHtcbiAgICAgICAgY29uc3QgZGF0YVNjcmlwdHMgPSBuZXdBcnJheShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTY3JpcHRzID0gbmV3QXJyYXkoZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKTtcbiAgICAgICAgZm9yIChjb25zdCBkYXRhU2NyaXB0IG9mIGRhdGFTY3JpcHRzKSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnRTY3JpcHRzLmZpbmQocyA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGRhdGFTY3JpcHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGdldCBwYWdlIHNjcmlwdFxuICAgIHtcbiAgICAgICAgY29uc3QgcGFnZURhdGFTY3JpcHQgPSBuZXdET00ucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtaG9vaz1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgICAgIGlmIChwYWdlRGF0YVNjcmlwdCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHBhZ2VEYXRhU2NyaXB0LnRleHRDb250ZW50O1xuICAgICAgICAgICAgcGFnZURhdGFTY3JpcHQucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgICAgICAgICAgc2NyaXB0LnR5cGUgPSBcIm1vZHVsZVwiO1xuICAgICAgICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGFnZVwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS1wYXRobmFtZVwiLCBgJHtwYXRobmFtZX1gKTtcbiAgICAgICAgICAgIG5ld0RPTS5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGFnZVN0cmluZ0NhY2hlLnNldCh0YXJnZXRVUkwuaHJlZiwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcbiAgICByZXR1cm4gbmV3RE9NO1xufTtcbmxldCBuYXZpZ2F0aW9uQ2FsbGJhY2tzID0gW107XG5mdW5jdGlvbiBvbk5hdmlnYXRlKGNhbGxiYWNrKSB7XG4gICAgbmF2aWdhdGlvbkNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmF2aWdhdGlvbkNhbGxiYWNrcy5sZW5ndGggLSAxO1xufVxuZnVuY3Rpb24gcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrKGlkeCkge1xuICAgIG5hdmlnYXRpb25DYWxsYmFja3Muc3BsaWNlKGlkeCwgMSk7XG59XG5jb25zdCBuYXZpZ2F0ZUxvY2FsbHkgPSBhc3luYyAodGFyZ2V0LCBwdXNoU3RhdGUgPSB0cnVlLCBpc1BvcFN0YXRlID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCB0YXJnZXRVUkwgPSBuZXcgVVJMKHRhcmdldCk7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gICAgaWYgKCFpc1BvcFN0YXRlICYmIHBhdGhuYW1lID09PSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkpIHtcbiAgICAgICAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRVUkwuaGFzaC5zbGljZSgxKSk/LnNjcm9sbEludG9WaWV3KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHB1c2hTdGF0ZSlcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgbmV3UGFnZSA9IGF3YWl0IGZldGNoUGFnZSh0YXJnZXRVUkwpO1xuICAgIGlmICghbmV3UGFnZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGxldCBvbGRQYWdlTGF0ZXN0ID0gZG9jdW1lbnQuYm9keTtcbiAgICBsZXQgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2UuYm9keTtcbiAgICB7XG4gICAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXRzID0gbmV3QXJyYXkobmV3UGFnZS5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXRzID0gbmV3QXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5taW4obmV3UGFnZUxheW91dHMubGVuZ3RoLCBvbGRQYWdlTGF5b3V0cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbmV3UGFnZUxheW91dCA9IG5ld1BhZ2VMYXlvdXRzW2ldO1xuICAgICAgICAgICAgY29uc3Qgb2xkUGFnZUxheW91dCA9IG9sZFBhZ2VMYXlvdXRzW2ldO1xuICAgICAgICAgICAgY29uc3QgbmV3TGF5b3V0SWQgPSBuZXdQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgICAgICAgIGNvbnN0IG9sZExheW91dElkID0gb2xkUGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICAgICAgICBpZiAobmV3TGF5b3V0SWQgIT09IG9sZExheW91dElkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbGRQYWdlTGF0ZXN0ID0gb2xkUGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBuZXdQYWdlTGF0ZXN0ID0gbmV3UGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZCA9IGRvY3VtZW50LmhlYWQ7XG4gICAgY29uc3QgbmV3SGVhZCA9IG5ld1BhZ2UuaGVhZDtcbiAgICBvbGRQYWdlTGF0ZXN0LnJlcGxhY2VXaXRoKG5ld1BhZ2VMYXRlc3QpO1xuICAgIC8vIEdyYWNlZnVsbHkgcmVwbGFjZSBoZWFkLlxuICAgIC8vIGRvY3VtZW50LmhlYWQucmVwbGFjZVdpdGgoKTsgY2F1c2VzIEZPVUMgb24gQ2hyb21pdW0gYnJvd3NlcnMuXG4gICAge1xuICAgICAgICBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKT8ucmVwbGFjZVdpdGgobmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKSA/PyBcIlwiKTtcbiAgICAgICAgY29uc3QgdXBkYXRlID0gKHRhcmdldExpc3QsIG1hdGNoQWdhaW5zdCwgYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hpbmcgPSBtYXRjaEFnYWluc3QuZmluZChuID0+IG4uaXNFcXVhbE5vZGUodGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhY3Rpb24odGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gYWRkIG5ldyB0YWdzIGFuZCByZW9tdmUgb2xkIG9uZXNcbiAgICAgICAgY29uc3Qgb2xkVGFncyA9IFtcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAgICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSksXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IG5ld1RhZ3MgPSBbXG4gICAgICAgICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgICAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpLFxuICAgICAgICBdO1xuICAgICAgICB1cGRhdGUobmV3VGFncywgb2xkVGFncywgKG5vZGUpID0+IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobm9kZSkpO1xuICAgICAgICB1cGRhdGUob2xkVGFncywgbmV3VGFncywgKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICAgIH1cbiAgICBpZiAocHVzaFN0YXRlKVxuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXRVUkwuaHJlZik7XG4gICAgbG9hZEhvb2tNYW5hZ2VyLmNhbGxDbGVhbnVwRnVuY3Rpb25zKCk7XG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIG5hdmlnYXRpb25DYWxsYmFja3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBhdGhuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBsb2FkUGFnZSgpO1xuICAgIGlmICh0YXJnZXRVUkwuaGFzaCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRVUkwuaGFzaC5zbGljZSgxKSk/LnNjcm9sbEludG9WaWV3KCk7XG4gICAgfVxufTtcbi8qKiBhIHNpbXBsZSBwYXRoIHNhbml0aXplciB0aGF0IGp1c3QgZW5zdXJlcyBubyByZXBlYXQtc2xhc2hlcyBhbmQgbm8gdHJhaWxpbmcgc2xhc2ggKi9cbmZ1bmN0aW9uIHNhZmVQZXJjZW50RGVjb2RlKGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyVbMC05QS1GYS1mXXsyfS9nLCAobSkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChtLnNsaWNlKDEpLCAxNikpKTtcbn1cbmZ1bmN0aW9uIHNhbml0aXplUGF0aG5hbWUocGF0aG5hbWUgPSBcIlwiKSB7XG4gICAgaWYgKCFwYXRobmFtZSlcbiAgICAgICAgcmV0dXJuIFwiL1wiO1xuICAgIHBhdGhuYW1lID0gc2FmZVBlcmNlbnREZWNvZGUocGF0aG5hbWUpO1xuICAgIHBhdGhuYW1lID0gXCIvXCIgKyBwYXRobmFtZTtcbiAgICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1xcLysvZywgXCIvXCIpO1xuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gW107XG4gICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgICAgIGlmICghc2VnbWVudCB8fCBzZWdtZW50ID09PSBcIi5cIilcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBpZiAoc2VnbWVudCA9PT0gXCIuLlwiKSB7XG4gICAgICAgICAgICByZXNvbHZlZC5wb3AoKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmVkLnB1c2goc2VnbWVudCk7XG4gICAgfVxuICAgIGNvbnN0IGVuY29kZWQgPSByZXNvbHZlZC5tYXAoKHMpID0+IGVuY29kZVVSSUNvbXBvbmVudChzKSk7XG4gICAgcmV0dXJuIFwiL1wiICsgZW5jb2RlZC5qb2luKFwiL1wiKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGdldFBhZ2VEYXRhKHBhdGhuYW1lKSB7XG4gICAgLyoqIEZpbmQgdGhlIGNvcnJlY3Qgc2NyaXB0IHRhZyBpbiBoZWFkLiAqL1xuICAgIGNvbnN0IGRhdGFTY3JpcHRUYWcgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIGlmICghZGF0YVNjcmlwdFRhZykge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJGYWlsZWQgdG8gZmluZCBzY3JpcHQgdGFnIGZvciBxdWVyeTpcIiArIGBzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGltcG9ydChkYXRhU2NyaXB0VGFnLnNyYyk7XG4gICAgY29uc3QgeyBzdWJqZWN0cywgZXZlbnRMaXN0ZW5lcnMsIGV2ZW50TGlzdGVuZXJPcHRpb25zLCBvYnNlcnZlcnMsIG9ic2VydmVyT3B0aW9ucywgZWZmZWN0cywgfSA9IGRhdGE7XG4gICAgaWYgKCFldmVudExpc3RlbmVyT3B0aW9ucyB8fCAhZXZlbnRMaXN0ZW5lcnMgfHwgIW9ic2VydmVycyB8fCAhc3ViamVjdHMgfHwgIW9ic2VydmVyT3B0aW9ucyB8fCAhZWZmZWN0cykge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYFBvc3NpYmx5IG1hbGZvcm1lZCBwYWdlIGRhdGEgJHtkYXRhfWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufVxuZnVuY3Rpb24gZXJyb3JPdXQobWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQYWdlKCkge1xuICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgYXdhaXQgbmF2aWdhdGVMb2NhbGx5KHRhcmdldC5sb2NhdGlvbi5ocmVmLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIHRhcmdldC5sb2NhdGlvbi5ocmVmKTtcbiAgICB9O1xuICAgIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICAgIGNvbnN0IHsgc3ViamVjdHMsIGV2ZW50TGlzdGVuZXJPcHRpb25zLCBldmVudExpc3RlbmVycywgb2JzZXJ2ZXJzLCBvYnNlcnZlck9wdGlvbnMsIGxvYWRIb29rcywgZWZmZWN0cywgfSA9IGF3YWl0IGdldFBhZ2VEYXRhKHBhdGhuYW1lKTtcbiAgICBERVZfQlVJTEQ6IHtcbiAgICAgICAgZ2xvYmFsVGhpcy5kZXZ0b29scyA9IHtcbiAgICAgICAgICAgIHBhZ2VEYXRhOiB7XG4gICAgICAgICAgICAgICAgc3ViamVjdHMsXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMsXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICAgICAgICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICAgICAgICAgICAgICBsb2FkSG9va3MsXG4gICAgICAgICAgICAgICAgZWZmZWN0cyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0ZU1hbmFnZXIsXG4gICAgICAgICAgICBldmVudExpc3RlbmVyTWFuYWdlcixcbiAgICAgICAgICAgIG9ic2VydmVyTWFuYWdlcixcbiAgICAgICAgICAgIGxvYWRIb29rTWFuYWdlcixcbiAgICAgICAgICAgIGVmZmVjdE1hbmFnZXIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgICAgIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQsXG4gICAgICAgIGZldGNoUGFnZSxcbiAgICAgICAgbmF2aWdhdGVMb2NhbGx5LFxuICAgICAgICBvbk5hdmlnYXRlLFxuICAgICAgICByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2ssXG4gICAgICAgIGdlbkxvY2FsSUQsXG4gICAgfTtcbiAgICBzdGF0ZU1hbmFnZXIubG9hZFZhbHVlcyhzdWJqZWN0cyk7XG4gICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIubG9hZFZhbHVlcyhldmVudExpc3RlbmVycyk7XG4gICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIuaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgb2JzZXJ2ZXJNYW5hZ2VyLmxvYWRWYWx1ZXMob2JzZXJ2ZXJzKTtcbiAgICBvYnNlcnZlck1hbmFnZXIuaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnMpO1xuICAgIG9ic2VydmVyTWFuYWdlci50cmFuc2Zvcm1TdWJqZWN0T2JzZXJ2ZXJOb2RlcygpO1xuICAgIGxvYWRIb29rTWFuYWdlci5sb2FkVmFsdWVzKGxvYWRIb29rcyk7XG4gICAgZWZmZWN0TWFuYWdlci5sb2FkVmFsdWVzKGVmZmVjdHMpO1xufVxubG9hZFBhZ2UoKTtcbmV4cG9ydCB7IENsaWVudFN1YmplY3QsIFN0YXRlTWFuYWdlciwgT2JzZXJ2ZXJNYW5hZ2VyLCBMb2FkSG9va01hbmFnZXIsIEV2ZW50TGlzdGVuZXJNYW5hZ2VyLCBFZmZlY3RNYW5hZ2VyLCB9O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBR0EsTUFBTSx1QkFBTixNQUEyQjtBQUFBLEVBQzNCO0FBQ0EsV0FBUyxZQUFZLE9BQU87QUFDeEIsUUFBSSxVQUFVLFFBQ1YsVUFBVSxXQUNULE9BQU8sVUFBVSxZQUFZLE1BQU0sUUFBUSxLQUFLLEtBQUssaUJBQWlCO0FBQ3ZFLGFBQU87QUFDWCxXQUFPO0FBQUEsRUFDWDtBQUNBLE1BQU0sa0JBQU4sTUFBc0I7QUFBQSxJQUNsQixZQUFZLEtBQUssVUFBVSxDQUFDLEdBQUcsV0FBVyxNQUFNO0FBQzVDLFdBQUssTUFBTTtBQUNYLFVBQUksWUFBWSxPQUFPLEdBQUc7QUFDdEIsWUFBSSxLQUFLLGdCQUFnQixNQUFNLE9BQU87QUFDbEMsa0JBQVEsTUFBTSxnQkFBZ0IsTUFBTSxnQ0FBZ0M7QUFDcEUsZ0JBQU07QUFBQSxRQUNWO0FBQ0EsYUFBSyxXQUFXLENBQUMsU0FBUyxHQUFJLFlBQVksQ0FBQyxDQUFFO0FBQzdDLGFBQUssVUFBVSxDQUFDO0FBQUEsTUFDcEIsT0FDSztBQUNELGFBQUssVUFBVTtBQUNmLGFBQUssV0FBVztBQUFBLE1BQ3BCO0FBQUEsSUFDSjtBQUFBLElBQ0Esa0JBQWtCO0FBQ2QsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUM3QjtBQUFBLEVBQ0o7OztBQzlCQSxNQUFNLDhCQUE4QjtBQUFBLElBQ2hDO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQ25EO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBVTtBQUFBLElBQVM7QUFBQSxFQUNoRDtBQUNBLE1BQU0sa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFXO0FBQUEsSUFBUztBQUFBLElBQVM7QUFBQSxJQUFLO0FBQUEsSUFBTztBQUFBLElBQ2pFO0FBQUEsSUFBYztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFDN0Q7QUFBQSxJQUFZO0FBQUEsSUFBUTtBQUFBLElBQVk7QUFBQSxJQUFNO0FBQUEsSUFBTztBQUFBLElBQVc7QUFBQSxJQUFPO0FBQUEsSUFDL0Q7QUFBQSxJQUFPO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBWTtBQUFBLElBQWM7QUFBQSxJQUFVO0FBQUEsSUFDN0Q7QUFBQSxJQUFRO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUM5RDtBQUFBLElBQVE7QUFBQSxJQUFLO0FBQUEsSUFBVTtBQUFBLElBQU87QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQVU7QUFBQSxJQUFNO0FBQUEsSUFDOUQ7QUFBQSxJQUFPO0FBQUEsSUFBUTtBQUFBLElBQVE7QUFBQSxJQUFTO0FBQUEsSUFBTztBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFDN0Q7QUFBQSxJQUFZO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUFLO0FBQUEsSUFBVztBQUFBLElBQU87QUFBQSxJQUN2RDtBQUFBLElBQUs7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQVE7QUFBQSxJQUFLO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFDMUQ7QUFBQSxJQUFVO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFDN0Q7QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBWTtBQUFBLElBQVk7QUFBQSxJQUFTO0FBQUEsSUFDaEU7QUFBQSxJQUFTO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFNO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFjO0FBQUEsRUFDN0Q7QUFDQSxNQUFNLDZCQUE2QjtBQUFBLElBQy9CO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFXO0FBQUEsSUFBUTtBQUFBLElBQVc7QUFBQSxJQUFZO0FBQUEsRUFDaEU7QUFDQSxNQUFNLGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsSUFBTztBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQVk7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQzNEO0FBQUEsSUFBUztBQUFBLElBQVk7QUFBQSxJQUFRO0FBQUEsSUFBVztBQUFBLElBQWtCO0FB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O0FBQUEsUUFDbEIsVUFBVTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLGVBQVcsaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQSxpQkFBYSxXQUFXLFFBQVE7QUFDaEMseUJBQXFCLFdBQVcsY0FBYztBQUM5Qyx5QkFBcUIsY0FBYyxvQkFBb0I7QUFDdkQsb0JBQWdCLFdBQVcsU0FBUztBQUNwQyxvQkFBZ0IsY0FBYyxlQUFlO0FBQzdDLG9CQUFnQiw4QkFBOEI7QUFDOUMsb0JBQWdCLFdBQVcsU0FBUztBQUNwQyxrQkFBYyxXQUFXLE9BQU87QUFBQSxFQUNwQztBQUNBLFdBQVM7IiwKICAibmFtZXMiOiBbImdldFNlbGYiLCAidXBkYXRlIiwgIkxvYWRIb29rS2luZCIsICJ0YXJnZXQiXQp9Cg==
