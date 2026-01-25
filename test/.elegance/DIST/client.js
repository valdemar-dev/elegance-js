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
    /**
     * Take the results of ServerSubject.generateObserverNode(), replace their HTML placeins for text nodes, and turn those into observers.
     */
    transformSubjectObserverNodes() {
      const observerNodes = newArray(document.querySelectorAll("div[observer-for]"));
      for (const node of observerNodes) {
        let update2 = function(value) {
          textNode.textContent = value;
        };
        var update = update2;
        const subjectId = node.getAttribute("observer-for");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4pIHtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQob3B0aW9ucyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gIH1cbiAgY2FuSGF2ZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuICE9PSBudWxsO1xuICB9XG59O1xuXG4vLyBzcmMvZWxlbWVudHMvZWxlbWVudF9saXN0LnRzXG52YXIgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcImFyZWFcIixcbiAgXCJiYXNlXCIsXG4gIFwiYnJcIixcbiAgXCJjb2xcIixcbiAgXCJlbWJlZFwiLFxuICBcImhyXCIsXG4gIFwiaW1nXCIsXG4gIFwiaW5wdXRcIixcbiAgXCJsaW5rXCIsXG4gIFwibWV0YVwiLFxuICBcInBhcmFtXCIsXG4gIFwic291cmNlXCIsXG4gIFwidHJhY2tcIixcbiAgXCJ3YnJcIlxuXTtcbnZhciBodG1sRWxlbWVudFRhZ3MgPSBbXG4gIFwiYVwiLFxuICBcImFiYnJcIixcbiAgXCJhZGRyZXNzXCIsXG4gIFwiYXJ0aWNsZVwiLFxuICBcImFzaWRlXCIsXG4gIFwiYXVkaW9cIixcbiAgXCJiXCIsXG4gIFwiYmRpXCIsXG4gIFwiYmRvXCIsXG4gIFwiYmxvY2txdW90ZVwiLFxuICBcImJvZHlcIixcbiAgXCJidXR0b25cIixcbiAgXCJjYW52YXNcIixcbiAgXCJjYXB0aW9uXCIsXG4gIFwiY2l0ZVwiLFxuICBcImNvZGVcIixcbiAgXCJjb2xncm91cFwiLFxuICBcImRhdGFcIixcbiAgXCJkYXRhbGlzdFwiLFxuICBcImRkXCIsXG4gIFwiZGVsXCIsXG4gIFwiZGV0YWlsc1wiLFxuICBcImRmblwiLFxuICBcImRpYWxvZ1wiLFxuICBcImRpdlwiLFxuICBcImRsXCIsXG4gIFwiZHRcIixcbiAgXCJlbVwiLFxuICBcImZpZWxkc2V0XCIsXG4gIFwiZmlnY2FwdGlvblwiLFxuICBcImZpZ3VyZVwiLFxuICBcImZvb3RlclwiLFxuICBcImZvcm1cIixcbiAgXCJoMVwiLFxuICBcImgyXCIsXG4gIFwiaDNcIixcbiAgXCJoNFwiLFxuICBcImg1XCIsXG4gIFwiaDZcIixcbiAgXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXG4gIFwiaGdyb3VwXCIsXG4gIFwiaHRtbFwiLFxuICBcImlcIixcbiAgXCJpZnJhbWVcIixcbiAgXCJpbnNcIixcbiAgXCJrYmRcIixcbiAgXCJsYWJlbFwiLFxuICBcImxlZ2VuZFwiLFxuICBcImxpXCIsXG4gIFwibWFpblwiLFxuICBcIm1hcFwiLFxuICBcIm1hcmtcIixcbiAgXCJtZW51XCIsXG4gIFwibWV0ZXJcIixcbiAgXCJuYXZcIixcbiAgXCJub3NjcmlwdFwiLFxuICBcIm9iamVjdFwiLFxuICBcIm9sXCIsXG4gIFwib3B0Z3JvdXBcIixcbiAgXCJvcHRpb25cIixcbiAgXCJvdXRwdXRcIixcbiAgXCJwXCIsXG4gIFwicGljdHVyZVwiLFxuICBcInByZVwiLFxuICBcInByb2dyZXNzXCIsXG4gIFwicVwiLFxuICBcInJwXCIsXG4gIFwicnRcIixcbiAgXCJydWJ5XCIsXG4gIFwic1wiLFxuICBcInNhbXBcIixcbiAgXCJzY3JpcHRcIixcbiAgXCJzZWFyY2hcIixcbiAgXCJzZWN0aW9uXCIsXG4gIFwic2VsZWN0XCIsXG4gIFwic2xvdFwiLFxuICBcInNtYWxsXCIsXG4gIFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFxuICBcInN0eWxlXCIsXG4gIFwic3ViXCIsXG4gIFwic3VtbWFyeVwiLFxuICBcInN1cFwiLFxuICBcInRhYmxlXCIsXG4gIFwidGJvZHlcIixcbiAgXCJ0ZFwiLFxuICBcInRlbXBsYXRlXCIsXG4gIFwidGV4dGFyZWFcIixcbiAgXCJ0Zm9vdFwiLFxuICBcInRoXCIsXG4gIFwidGhlYWRcIixcbiAgXCJ0aW1lXCIsXG4gIFwidGl0bGVcIixcbiAgXCJ0clwiLFxuICBcInVcIixcbiAgXCJ1bFwiLFxuICBcInZhclwiLFxuICBcInZpZGVvXCJcbl07XG52YXIgc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwicGF0aFwiLFxuICBcImNpcmNsZVwiLFxuICBcImVsbGlwc2VcIixcbiAgXCJsaW5lXCIsXG4gIFwicG9seWdvblwiLFxuICBcInBvbHlsaW5lXCIsXG4gIFwic3RvcFwiXG5dO1xudmFyIHN2Z0VsZW1lbnRUYWdzID0gW1xuICBcInN2Z1wiLFxuICBcImdcIixcbiAgXCJ0ZXh0XCIsXG4gIFwidHNwYW5cIixcbiAgXCJ0ZXh0UGF0aFwiLFxuICBcImRlZnNcIixcbiAgXCJzeW1ib2xcIixcbiAgXCJ1c2VcIixcbiAgXCJpbWFnZVwiLFxuICBcImNsaXBQYXRoXCIsXG4gIFwibWFza1wiLFxuICBcInBhdHRlcm5cIixcbiAgXCJsaW5lYXJHcmFkaWVudFwiLFxuICBcInJhZGlhbEdyYWRpZW50XCIsXG4gIFwiZmlsdGVyXCIsXG4gIFwibWFya2VyXCIsXG4gIFwidmlld1wiLFxuICBcImZlQmxlbmRcIixcbiAgXCJmZUNvbG9yTWF0cml4XCIsXG4gIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLFxuICBcImZlQ29tcG9zaXRlXCIsXG4gIFwiZmVDb252b2x2ZU1hdHJpeFwiLFxuICBcImZlRGlmZnVzZUxpZ2h0aW5nXCIsXG4gIFwiZmVEaXNwbGFjZW1lbnRNYXBcIixcbiAgXCJmZURpc3RhbnRMaWdodFwiLFxuICBcImZlRmxvb2RcIixcbiAgXCJmZUZ1bmNBXCIsXG4gIFwiZmVGdW5jQlwiLFxuICBcImZlRnVuY0dcIixcbiAgXCJmZUZ1bmNSXCIsXG4gIFwiZmVHYXVzc2lhbkJsdXJcIixcbiAgXCJmZUltYWdlXCIsXG4gIFwiZmVNZXJnZVwiLFxuICBcImZlTWVyZ2VOb2RlXCIsXG4gIFwiZmVNb3JwaG9sb2d5XCIsXG4gIFwiZmVPZmZzZXRcIixcbiAgXCJmZVBvaW50TGlnaHRcIixcbiAgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIixcbiAgXCJmZVNwb3RMaWdodFwiLFxuICBcImZlVGlsZVwiLFxuICBcImZlVHVyYnVsZW5jZVwiXG5dO1xudmFyIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcIm1pXCIsXG4gIFwibW5cIixcbiAgXCJtb1wiXG5dO1xudmFyIG1hdGhtbEVsZW1lbnRUYWdzID0gW1xuICBcIm1hdGhcIixcbiAgXCJtc1wiLFxuICBcIm10ZXh0XCIsXG4gIFwibXJvd1wiLFxuICBcIm1mZW5jZWRcIixcbiAgXCJtc3VwXCIsXG4gIFwibXN1YlwiLFxuICBcIm1zdWJzdXBcIixcbiAgXCJtZnJhY1wiLFxuICBcIm1zcXJ0XCIsXG4gIFwibXJvb3RcIixcbiAgXCJtdGFibGVcIixcbiAgXCJtdHJcIixcbiAgXCJtdGRcIixcbiAgXCJtc3R5bGVcIixcbiAgXCJtZW5jbG9zZVwiLFxuICBcIm1tdWx0aXNjcmlwdHNcIlxuXTtcbnZhciBlbGVtZW50cyA9IHt9O1xudmFyIGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucywgLi4uY2hpbGRyZW4pID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBjaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKSB7XG4gIHJldHVybiAoKG9wdGlvbnMpID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBudWxsKSk7XG59XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbnZhciBhbGxFbGVtZW50cyA9IHtcbiAgLi4uZWxlbWVudHMsXG4gIC4uLmNoaWxkcmVubGVzc0VsZW1lbnRzXG59O1xuXG4vLyBzcmMvY2xpZW50L3J1bnRpbWUudHNcbk9iamVjdC5hc3NpZ24od2luZG93LCBhbGxFbGVtZW50cyk7XG52YXIgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xudmFyIGlkQ291bnRlciA9IDA7XG5mdW5jdGlvbiBnZW5Mb2NhbElEKCkge1xuICBpZENvdW50ZXIrKztcbiAgcmV0dXJuIGlkQ291bnRlcjtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgY29uc3QgZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50YWcpO1xuICB7XG4gICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGVsZW1lbnQub3B0aW9ucyk7XG4gICAgZm9yIChjb25zdCBbb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgIGlmIChvcHRpb25WYWx1ZSBpbnN0YW5jZW9mIFNwZWNpYWxFbGVtZW50T3B0aW9uKSB7XG4gICAgICAgIG9wdGlvblZhbHVlLm11dGF0ZShlbGVtZW50LCBvcHRpb25OYW1lKTtcbiAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCh7IGVsZW1lbnRLZXksIG9wdGlvbk5hbWUsIG9wdGlvblZhbHVlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUob3B0aW9uTmFtZSwgYCR7b3B0aW9uVmFsdWV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChlbGVtZW50LmtleSkge1xuICAgIGRvbUVsZW1lbnQuc2V0QXR0cmlidXRlKFwia2V5XCIsIGVsZW1lbnQua2V5KTtcbiAgfVxuICB7XG4gICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgICAgZG9tRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKC4uLnJlc3VsdC5zcGVjaWFsRWxlbWVudE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4geyByb290OiBkb21FbGVtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICBsZXQgc3BlY2lhbEVsZW1lbnRPcHRpb25zID0gW107XG4gIGlmIChlbGVtZW50ID09PSB2b2lkIDAgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5kZWZpbmVkIGFuZCBudWxsIGFyZSBub3QgYWxsb3dlZCBhcyBlbGVtZW50cy5gKTtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiBlbGVtZW50KSB7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIGZvciAoY29uc3Qgc3ViRWxlbWVudCBvZiBlbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChzdWJFbGVtZW50KTtcbiAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcm9vdDogZnJhZ21lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVnYW5jZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LmApO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIGNvbnN0IHRleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiA/IGVsZW1lbnQgOiBlbGVtZW50LnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICAgICAgcmV0dXJuIHsgcm9vdDogdGV4dE5vZGUsIHNwZWNpYWxFbGVtZW50T3B0aW9uczogW10gfTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICB9XG59XG5ERVZfQlVJTEQgJiYgKCgpID0+IHtcbiAgbGV0IGlzRXJyb3JlZCA9IGZhbHNlO1xuICAoZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZShcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9lbGVnYW5jZS1ob3QtcmVsb2FkXCIpO1xuICAgIGVzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIGlmIChpc0Vycm9yZWQpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJob3QtcmVsb2FkXCIpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXMub25lcnJvciA9ICgpID0+IHtcbiAgICAgIGlzRXJyb3JlZCA9IHRydWU7XG4gICAgICBlcy5jbG9zZSgpO1xuICAgICAgc2V0VGltZW91dChjb25uZWN0LCAxZTMpO1xuICAgIH07XG4gIH0pKCk7XG59KSgpO1xudmFyIENsaWVudFN1YmplY3QgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCB2YWx1ZSkge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgfVxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZShuZXdWYWx1ZSkge1xuICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogTWFudWFsbHkgdHJpZ2dlciBlYWNoIG9mIHRoaXMgc3ViamVjdCdzIG9ic2VydmVycywgd2l0aCB0aGUgc3ViamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAqIFxuICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAqL1xuICB0cmlnZ2VyT2JzZXJ2ZXJzKCkge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5vYnNlcnZlcnMudmFsdWVzKCkpIHtcbiAgICAgIG9ic2VydmVyKHRoaXMuX3ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIG5ldyBvYnNlcnZlciB0byB0aGlzIHN1YmplY3QsIGBjYWxsYmFja2AgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBzZXR0ZXIgaXMgY2FsbGVkIG9uIHRoaXMgc3ViamVjdC5cbiAgICogXG4gICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAqIFxuICAgKiBOb3RlOiB0aGlzIHRyaWdnZXJzIGBjYWxsYmFja2Agd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGlzIHN1YmplY3QuXG4gICAqIFxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGlzIG9ic2VydmVyXG4gICAqIEBwYXJhbSBjYWxsYmFjayBDYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoaXMgc3ViamVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgb2JzZXJ2ZShpZCwgY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5vYnNlcnZlcnMuaGFzKGlkKSkge1xuICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICB9XG4gICAgdGhpcy5vYnNlcnZlcnMuc2V0KGlkLCBjYWxsYmFjayk7XG4gICAgY2FsbGJhY2sodGhpcy52YWx1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYnNlcnZlciBmcm9tIHRoaXMgc3ViamVjdC5cbiAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhlIG9ic2VydmVyLlxuICAgKi9cbiAgdW5vYnNlcnZlKGlkKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgfVxufTtcbnZhciBTdGF0ZU1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3ViamVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXModmFsdWVzLCBkb092ZXJ3cml0ZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh0aGlzLnN1YmplY3RzLmhhcyh2YWx1ZS5pZCkgJiYgZG9PdmVyd3JpdGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpO1xuICB9XG4gIGdldEFsbChpZHMpIHtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmdldChpZCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufTtcbnZhciBDbGllbnRFdmVudExpc3RlbmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gIH1cbiAgY2FsbChldikge1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIHRoaXMuY2FsbGJhY2soZXYsIC4uLmRlcGVuZGVuY2llcyk7XG4gIH1cbn07XG52YXIgRXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoc2VydmVyRXZlbnRMaXN0ZW5lcnMsIGRvT3ZlcnJpZGUgPSBmYWxzZSkge1xuICAgIGZvciAoY29uc3Qgc2VydmVyRXZlbnRMaXN0ZW5lciBvZiBzZXJ2ZXJFdmVudExpc3RlbmVycykge1xuICAgICAgaWYgKHRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudEV2ZW50TGlzdGVuZXIgPSBuZXcgQ2xpZW50RXZlbnRMaXN0ZW5lcihzZXJ2ZXJFdmVudExpc3RlbmVyLmlkLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmNhbGxiYWNrLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldChjbGllbnRFdmVudExpc3RlbmVyLmlkLCBjbGllbnRFdmVudExpc3RlbmVyKTtcbiAgICB9XG4gIH1cbiAgaG9va0NhbGxiYWNrcyhldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3QgZXZlbnRMaXN0ZW5lck9wdGlvbiBvZiBldmVudExpc3RlbmVyT3B0aW9ucykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtrZXk9XCIke2V2ZW50TGlzdGVuZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBldmVudExpc3RlbmVyID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCk7XG4gICAgICBpZiAoIWV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBFdmVudExpc3RlbmVyT3B0aW9uOiBFdmVudCBsaXN0ZW5lciB3aXRoIGlkIFxcdTIwMURcIiArIGV2ZW50TGlzdGVuZXJPcHRpb24uaWQgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRbZXZlbnRMaXN0ZW5lck9wdGlvbi5vcHRpb25dID0gKGV2KSA9PiB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIuY2FsbChldik7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBnZXQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoaWQpO1xuICB9XG59O1xudmFyIENsaWVudE9ic2VydmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpZCwgY2FsbGJhY2ssIGRlcGVuY2VuY2llcykge1xuICAgIHRoaXMuc3ViamVjdFZhbHVlcyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5jZW5jaWVzO1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKHRoaXMuZGVwZW5kZW5jaWVzKTtcbiAgICBmb3IgKGNvbnN0IGluaXRpYWxWYWx1ZSBvZiBpbml0aWFsVmFsdWVzKSB7XG4gICAgICBjb25zdCBpZHggPSB0aGlzLnN1YmplY3RWYWx1ZXMubGVuZ3RoO1xuICAgICAgdGhpcy5zdWJqZWN0VmFsdWVzLnB1c2goaW5pdGlhbFZhbHVlLnZhbHVlKTtcbiAgICAgIGluaXRpYWxWYWx1ZS5vYnNlcnZlKHRoaXMuaWQsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnN1YmplY3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmNhbGwoKTtcbiAgfVxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdXBkYXRlIHdoZW4gdGhpcyBvYnNlcnZlciB1cGRhdGVzLlxuICAgKi9cbiAgYWRkRWxlbWVudChlbGVtZW50LCBvcHRpb25OYW1lKSB7XG4gICAgdGhpcy5lbGVtZW50cy5wdXNoKHsgZWxlbWVudCwgb3B0aW9uTmFtZSB9KTtcbiAgfVxuICBjYWxsKCkge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jYWxsYmFjayguLi50aGlzLnN1YmplY3RWYWx1ZXMpO1xuICAgIGZvciAoY29uc3QgeyBlbGVtZW50LCBvcHRpb25OYW1lIH0gb2YgdGhpcy5lbGVtZW50cykge1xuICAgICAgZWxlbWVudFtvcHRpb25OYW1lXSA9IG5ld1ZhbHVlO1xuICAgIH1cbiAgfVxufTtcbnZhciBPYnNlcnZlck1hbmFnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgfVxuICBsb2FkVmFsdWVzKHNlcnZlck9ic2VydmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJPYnNlcnZlciBvZiBzZXJ2ZXJPYnNlcnZlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudE9ic2VydmVycy5oYXMoc2VydmVyT2JzZXJ2ZXIuaWQpICYmIGRvT3ZlcnJpZGUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKG9ic2VydmVyT3B0aW9ucykge1xuICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXJPcHRpb24gb2Ygb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7b2JzZXJ2ZXJPcHRpb24ua2V5fVwiXWApO1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgb2JzZXJ2ZXJPcHRpb24ua2V5ICsgXCIgZm9yIGV2ZW50IGxpc3RlbmVyLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNsaWVudE9ic2VydmVycy5nZXQob2JzZXJ2ZXJPcHRpb24uaWQpO1xuICAgICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIE9ic2VydmVyT3B0aW9uOiBPYnNlcnZlciB3aXRoIGlkIFxcdTIwMURcIiArIG9ic2VydmVyT3B0aW9uLmlkICsgJ1wiIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvYnNlcnZlci5hZGRFbGVtZW50KGVsZW1lbnQsIG9ic2VydmVyT3B0aW9uLm9wdGlvbik7XG4gICAgICBvYnNlcnZlci5jYWxsKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUYWtlIHRoZSByZXN1bHRzIG9mIFNlcnZlclN1YmplY3QuZ2VuZXJhdGVPYnNlcnZlck5vZGUoKSwgcmVwbGFjZSB0aGVpciBIVE1MIHBsYWNlaW5zIGZvciB0ZXh0IG5vZGVzLCBhbmQgdHVybiB0aG9zZSBpbnRvIG9ic2VydmVycy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YmplY3RPYnNlcnZlck5vZGVzKCkge1xuICAgIGNvbnN0IG9ic2VydmVyTm9kZXMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W29ic2VydmVyLWZvcl1cIikpO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBvYnNlcnZlck5vZGVzKSB7XG4gICAgICBsZXQgdXBkYXRlMiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9O1xuICAgICAgdmFyIHVwZGF0ZSA9IHVwZGF0ZTI7XG4gICAgICBjb25zdCBzdWJqZWN0SWQgPSBub2RlLmdldEF0dHJpYnV0ZShcIm9ic2VydmVyLWZvclwiKTtcbiAgICAgIGNvbnN0IHN1YmplY3QgPSBzdGF0ZU1hbmFnZXIuZ2V0KHN1YmplY3RJZCk7XG4gICAgICBpZiAoIXN1YmplY3QpIHtcbiAgICAgICAgREVWX0JVSUxEOiBlcnJvck91dChcIkZhaWxlZCB0byBmaW5kIHN1YmplY3Qgd2l0aCBpZCBcIiArIHN1YmplY3RJZCArIFwiIGZvciBvYnNlcnZlck5vZGUuXCIpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3ViamVjdC52YWx1ZSk7XG4gICAgICBjb25zdCBpZCA9IGdlbkxvY2FsSUQoKS50b1N0cmluZygpO1xuICAgICAgc3ViamVjdC5vYnNlcnZlKGlkLCB1cGRhdGUyKTtcbiAgICAgIHVwZGF0ZTIoc3ViamVjdC52YWx1ZSk7XG4gICAgICBub2RlLnJlcGxhY2VXaXRoKHRleHROb2RlKTtcbiAgICB9XG4gIH1cbn07XG52YXIgTG9hZEhvb2tNYW5hZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gW107XG4gICAgdGhpcy5hY3RpdmVMb2FkSG9va3MgPSBbXTtcbiAgfVxuICBsb2FkVmFsdWVzKGxvYWRIb29rcykge1xuICAgIGZvciAoY29uc3QgbG9hZEhvb2sgb2YgbG9hZEhvb2tzKSB7XG4gICAgICBjb25zdCBkZXBlbmNlbmNpZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKGxvYWRIb29rLmRlcGVuZGVuY2llcyk7XG4gICAgICBpZiAodGhpcy5hY3RpdmVMb2FkSG9va3MuaW5jbHVkZXMobG9hZEhvb2suaWQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmVMb2FkSG9va3MucHVzaChsb2FkSG9vay5pZCk7XG4gICAgICBjb25zdCBjbGVhbnVwRnVuY3Rpb24gPSBsb2FkSG9vay5jYWxsYmFjayguLi5kZXBlbmNlbmNpZXMpO1xuICAgICAgaWYgKGNsZWFudXBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzLnB1c2goe1xuICAgICAgICAgIGtpbmQ6IGxvYWRIb29rLmtpbmQsXG4gICAgICAgICAgY2xlYW51cEZ1bmN0aW9uLFxuICAgICAgICAgIHBhdGhuYW1lOiBsb2FkSG9vay5wYXRobmFtZSxcbiAgICAgICAgICBsb2FkSG9va0lkeDogdGhpcy5hY3RpdmVMb2FkSG9va3MubGVuZ3RoIC0gMVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2FsbENsZWFudXBGdW5jdGlvbnMoKSB7XG4gICAgbGV0IHJlbWFpbmluZ1Byb2NlZHVyZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsZWFudXBQcm9jZWR1cmUgb2YgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcykge1xuICAgICAgaWYgKGNsZWFudXBQcm9jZWR1cmUua2luZCA9PT0gMCAvKiBMQVlPVVRfTE9BREhPT0sgKi8pIHtcbiAgICAgICAgY29uc3QgaXNJblNjb3BlID0gc2FuaXRpemVQYXRobmFtZSh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpLnN0YXJ0c1dpdGgoY2xlYW51cFByb2NlZHVyZS5wYXRobmFtZSk7XG4gICAgICAgIGlmIChpc0luU2NvcGUpIHtcbiAgICAgICAgICByZW1haW5pbmdQcm9jZWR1cmVzLnB1c2goY2xlYW51cFByb2NlZHVyZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNsZWFudXBQcm9jZWR1cmUuY2xlYW51cEZ1bmN0aW9uKCk7XG4gICAgICB0aGlzLmFjdGl2ZUxvYWRIb29rcy5zcGxpY2UoY2xlYW51cFByb2NlZHVyZS5sb2FkSG9va0lkeCwgMSk7XG4gICAgfVxuICAgIHRoaXMuY2xlYW51cFByb2NlZHVyZXMgPSByZW1haW5pbmdQcm9jZWR1cmVzO1xuICB9XG59O1xudmFyIG9ic2VydmVyTWFuYWdlciA9IG5ldyBPYnNlcnZlck1hbmFnZXIoKTtcbnZhciBldmVudExpc3RlbmVyTWFuYWdlciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xudmFyIHN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXIoKTtcbnZhciBsb2FkSG9va01hbmFnZXIgPSBuZXcgTG9hZEhvb2tNYW5hZ2VyKCk7XG52YXIgcGFnZVN0cmluZ0NhY2hlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG52YXIgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG52YXIgZmV0Y2hQYWdlID0gYXN5bmMgKHRhcmdldFVSTCkgPT4ge1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgaWYgKHBhZ2VTdHJpbmdDYWNoZS5oYXMocGF0aG5hbWUpKSB7XG4gICAgcmV0dXJuIGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcocGFnZVN0cmluZ0NhY2hlLmdldChwYXRobmFtZSksIFwidGV4dC9odG1sXCIpO1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVSTCk7XG4gIGNvbnN0IG5ld0RPTSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoYXdhaXQgcmVzLnRleHQoKSwgXCJ0ZXh0L2h0bWxcIik7XG4gIHtcbiAgICBjb25zdCBkYXRhU2NyaXB0cyA9IG5ld0FycmF5KG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKTtcbiAgICBjb25zdCBjdXJyZW50U2NyaXB0cyA9IG5ld0FycmF5KGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgZm9yIChjb25zdCBkYXRhU2NyaXB0IG9mIGRhdGFTY3JpcHRzKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnRTY3JpcHRzLmZpbmQoKHMpID0+IHMuc3JjID09PSBkYXRhU2NyaXB0LnNyYyk7XG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGRhdGFTY3JpcHQpO1xuICAgIH1cbiAgfVxuICB7XG4gICAgY29uc3QgcGFnZURhdGFTY3JpcHQgPSBuZXdET00ucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtaG9vaz1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgY29uc3QgdGV4dCA9IHBhZ2VEYXRhU2NyaXB0LnRleHRDb250ZW50O1xuICAgIHBhZ2VEYXRhU2NyaXB0LnJlbW92ZSgpO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBzY3JpcHQudHlwZSA9IFwibW9kdWxlXCI7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGFnZVwiLCBcInRydWVcIik7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGF0aG5hbWVcIiwgYCR7cGF0aG5hbWV9YCk7XG4gICAgbmV3RE9NLmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfVxuICBwYWdlU3RyaW5nQ2FjaGUuc2V0KHBhdGhuYW1lLCB4bWxTZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKG5ld0RPTSkpO1xuICByZXR1cm4gbmV3RE9NO1xufTtcbnZhciBuYXZpZ2F0aW9uQ2FsbGJhY2tzID0gW107XG5mdW5jdGlvbiBvbk5hdmlnYXRlKGNhbGxiYWNrKSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiBuYXZpZ2F0aW9uQ2FsbGJhY2tzLmxlbmd0aCAtIDE7XG59XG5mdW5jdGlvbiByZW1vdmVOYXZpZ2F0aW9uQ2FsbGJhY2soaWR4KSB7XG4gIG5hdmlnYXRpb25DYWxsYmFja3Muc3BsaWNlKGlkeCwgMSk7XG59XG52YXIgbmF2aWdhdGVMb2NhbGx5ID0gYXN5bmMgKHRhcmdldCwgcHVzaFN0YXRlID0gdHJ1ZSkgPT4ge1xuICBjb25zdCB0YXJnZXRVUkwgPSBuZXcgVVJMKHRhcmdldCk7XG4gIGNvbnN0IHBhdGhuYW1lID0gc2FuaXRpemVQYXRobmFtZSh0YXJnZXRVUkwucGF0aG5hbWUpO1xuICBsZXQgbmV3UGFnZSA9IGF3YWl0IGZldGNoUGFnZSh0YXJnZXRVUkwpO1xuICBpZiAoIW5ld1BhZ2UpIHJldHVybjtcbiAgbGV0IG9sZFBhZ2VMYXRlc3QgPSBkb2N1bWVudC5ib2R5O1xuICBsZXQgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2UuYm9keTtcbiAge1xuICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXRzID0gbmV3QXJyYXkobmV3UGFnZS5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgY29uc3Qgb2xkUGFnZUxheW91dHMgPSBuZXdBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSk7XG4gICAgY29uc3Qgc2l6ZSA9IE1hdGgubWluKG5ld1BhZ2VMYXlvdXRzLmxlbmd0aCwgb2xkUGFnZUxheW91dHMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgY29uc3QgbmV3UGFnZUxheW91dCA9IG5ld1BhZ2VMYXlvdXRzW2ldO1xuICAgICAgY29uc3Qgb2xkUGFnZUxheW91dCA9IG9sZFBhZ2VMYXlvdXRzW2ldO1xuICAgICAgY29uc3QgbmV3TGF5b3V0SWQgPSBuZXdQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKTtcbiAgICAgIGNvbnN0IG9sZExheW91dElkID0gb2xkUGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICBpZiAobmV3TGF5b3V0SWQgIT09IG9sZExheW91dElkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgb2xkUGFnZUxhdGVzdCA9IG9sZFBhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgfVxuICBjb25zdCBoZWFkID0gZG9jdW1lbnQuaGVhZDtcbiAgY29uc3QgbmV3SGVhZCA9IG5ld1BhZ2UuaGVhZDtcbiAgb2xkUGFnZUxhdGVzdC5yZXBsYWNlV2l0aChuZXdQYWdlTGF0ZXN0KTtcbiAge1xuICAgIGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpPy5yZXBsYWNlV2l0aChcbiAgICAgIG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIikgPz8gXCJcIlxuICAgICk7XG4gICAgY29uc3QgdXBkYXRlID0gKHRhcmdldExpc3QsIG1hdGNoQWdhaW5zdCwgYWN0aW9uKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHRhcmdldDIgb2YgdGFyZ2V0TGlzdCkge1xuICAgICAgICBjb25zdCBtYXRjaGluZyA9IG1hdGNoQWdhaW5zdC5maW5kKChuKSA9PiBuLmlzRXF1YWxOb2RlKHRhcmdldDIpKTtcbiAgICAgICAgaWYgKG1hdGNoaW5nKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9uKHRhcmdldDIpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb2xkVGFncyA9IFtcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSlcbiAgICBdO1xuICAgIGNvbnN0IG5ld1RhZ3MgPSBbXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpXG4gICAgXTtcbiAgICB1cGRhdGUobmV3VGFncywgb2xkVGFncywgKG5vZGUpID0+IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobm9kZSkpO1xuICAgIHVwZGF0ZShvbGRUYWdzLCBuZXdUYWdzLCAobm9kZSkgPT4gbm9kZS5yZW1vdmUoKSk7XG4gIH1cbiAgaWYgKHB1c2hTdGF0ZSkgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0VVJMLmhyZWYpO1xuICBsb2FkSG9va01hbmFnZXIuY2FsbENsZWFudXBGdW5jdGlvbnMoKTtcbiAge1xuICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgbmF2aWdhdGlvbkNhbGxiYWNrcykge1xuICAgICAgY2FsbGJhY2socGF0aG5hbWUpO1xuICAgIH1cbiAgfVxuICBhd2FpdCBsb2FkUGFnZSgpO1xuICBpZiAodGFyZ2V0VVJMLmhhc2gpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRVUkwuaGFzaC5zbGljZSgxKSk/LnNjcm9sbEludG9WaWV3KCk7XG4gIH1cbn07XG5mdW5jdGlvbiBzYW5pdGl6ZVBhdGhuYW1lKHBhdGhuYW1lID0gXCJcIikge1xuICBpZiAoIXBhdGhuYW1lKSByZXR1cm4gXCIvXCI7XG4gIHBhdGhuYW1lID0gXCIvXCIgKyBwYXRobmFtZTtcbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9cXC8rL2csIFwiL1wiKTtcbiAgaWYgKHBhdGhuYW1lLmxlbmd0aCA+IDEgJiYgcGF0aG5hbWUuZW5kc1dpdGgoXCIvXCIpKSB7XG4gICAgcGF0aG5hbWUgPSBwYXRobmFtZS5zbGljZSgwLCAtMSk7XG4gIH1cbiAgcmV0dXJuIHBhdGhuYW1lO1xufVxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZURhdGEocGF0aG5hbWUpIHtcbiAgY29uc3QgZGF0YVNjcmlwdFRhZyA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gIGlmICghZGF0YVNjcmlwdFRhZykge1xuICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgRmFpbGVkIHRvIGZpbmQgc2NyaXB0IHRhZyBmb3IgcXVlcnk6c2NyaXB0W2RhdGEtcGFnZT1cInRydWVcIl1bZGF0YS1wYXRobmFtZT1cIiR7cGF0aG5hbWV9XCJdYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgaW1wb3J0KGRhdGFTY3JpcHRUYWcuc3JjKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnNcbiAgfSA9IGRhdGE7XG4gIGlmICghZXZlbnRMaXN0ZW5lck9wdGlvbnMgfHwgIWV2ZW50TGlzdGVuZXJzIHx8ICFvYnNlcnZlcnMgfHwgIXN1YmplY3RzIHx8ICFvYnNlcnZlck9wdGlvbnMpIHtcbiAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoYFBvc3NpYmx5IG1hbGZvcm1lZCBwYWdlIGRhdGEgJHtkYXRhfWApO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn1cbmZ1bmN0aW9uIGVycm9yT3V0KG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBhZ2UoKSB7XG4gIHdpbmRvdy5vbnBvcHN0YXRlID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgYXdhaXQgbmF2aWdhdGVMb2NhbGx5KHRhcmdldC5sb2NhdGlvbi5ocmVmLCBmYWxzZSk7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgdGFyZ2V0LmxvY2F0aW9uLmhyZWYpO1xuICB9O1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgY29uc3Qge1xuICAgIHN1YmplY3RzLFxuICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgIG9ic2VydmVycyxcbiAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgbG9hZEhvb2tzXG4gIH0gPSBhd2FpdCBnZXRQYWdlRGF0YShwYXRobmFtZSk7XG4gIERFVl9CVUlMRDoge1xuICAgIGdsb2JhbFRoaXMuZGV2dG9vbHMgPSB7XG4gICAgICBwYWdlRGF0YToge1xuICAgICAgICBzdWJqZWN0cyxcbiAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJzLFxuICAgICAgICBvYnNlcnZlcnMsXG4gICAgICAgIG9ic2VydmVyT3B0aW9ucyxcbiAgICAgICAgbG9hZEhvb2tzXG4gICAgICB9LFxuICAgICAgc3RhdGVNYW5hZ2VyLFxuICAgICAgZXZlbnRMaXN0ZW5lck1hbmFnZXIsXG4gICAgICBvYnNlcnZlck1hbmFnZXIsXG4gICAgICBsb2FkSG9va01hbmFnZXJcbiAgICB9O1xuICB9XG4gIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudCxcbiAgICBmZXRjaFBhZ2UsXG4gICAgbmF2aWdhdGVMb2NhbGx5LFxuICAgIG9uTmF2aWdhdGUsXG4gICAgcmVtb3ZlTmF2aWdhdGlvbkNhbGxiYWNrXG4gIH07XG4gIHN0YXRlTWFuYWdlci5sb2FkVmFsdWVzKHN1YmplY3RzKTtcbiAgZXZlbnRMaXN0ZW5lck1hbmFnZXIubG9hZFZhbHVlcyhldmVudExpc3RlbmVycyk7XG4gIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3MoZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICBvYnNlcnZlck1hbmFnZXIubG9hZFZhbHVlcyhvYnNlcnZlcnMpO1xuICBvYnNlcnZlck1hbmFnZXIuaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnMpO1xuICBvYnNlcnZlck1hbmFnZXIudHJhbnNmb3JtU3ViamVjdE9ic2VydmVyTm9kZXMoKTtcbiAgbG9hZEhvb2tNYW5hZ2VyLmxvYWRWYWx1ZXMobG9hZEhvb2tzKTtcbn1cbmxvYWRQYWdlKCk7XG5leHBvcnQge1xuICBDbGllbnRTdWJqZWN0LFxuICBFdmVudExpc3RlbmVyTWFuYWdlcixcbiAgTG9hZEhvb2tNYW5hZ2VyLFxuICBPYnNlcnZlck1hbmFnZXIsXG4gIFN0YXRlTWFuYWdlclxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUNBLE1BQUksdUJBQXVCLE1BQU07QUFBQSxFQUNqQztBQUNBLFdBQVMsWUFBWSxPQUFPO0FBQzFCLFFBQUksVUFBVSxRQUFRLFVBQVUsV0FBVyxPQUFPLFVBQVUsWUFBWSxNQUFNLFFBQVEsS0FBSyxLQUFLLGlCQUFpQixpQkFBa0IsUUFBTztBQUMxSSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksa0JBQWtCLE1BQU07QUFBQSxJQUMxQixZQUFZLEtBQUssVUFBVSxDQUFDLEdBQUcsVUFBVTtBQUN2QyxXQUFLLE1BQU07QUFDWCxXQUFLLFdBQVc7QUFDaEIsVUFBSSxZQUFZLE9BQU8sR0FBRztBQUN4QixZQUFJLEtBQUssZ0JBQWdCLE1BQU0sT0FBTztBQUNwQyxrQkFBUSxNQUFNLGdCQUFnQixNQUFNLGdDQUFnQztBQUNwRSxnQkFBTTtBQUFBLFFBQ1I7QUFDQSxhQUFLLFNBQVMsUUFBUSxPQUFPO0FBQzdCLGFBQUssVUFBVSxDQUFDO0FBQUEsTUFDbEIsT0FBTztBQUNMLGFBQUssVUFBVTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLElBQ0Esa0JBQWtCO0FBQ2hCLGFBQU8sS0FBSyxhQUFhO0FBQUEsSUFDM0I7QUFBQSxFQUNGO0FBR0EsTUFBSSw4QkFBOEI7QUFBQSxJQUNoQztBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNBLE1BQUksNkJBQTZCO0FBQUEsSUFDL0I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNB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
