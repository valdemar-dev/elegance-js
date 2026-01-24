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
        if (cleanupProcedure.kind === 0) {
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
      navigationCallbacks = [];
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
      onNavigate
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZGlzdC9jbGllbnQvcnVudGltZS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIHNyYy9lbGVtZW50cy9lbGVtZW50LnRzXG52YXIgU3BlY2lhbEVsZW1lbnRPcHRpb24gPSBjbGFzcyB7XG59O1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDAgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG52YXIgRWxlZ2FuY2VFbGVtZW50ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0YWcsIG9wdGlvbnMgPSB7fSwgY2hpbGRyZW4pIHtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgaWYgKGlzQW5FbGVtZW50KG9wdGlvbnMpKSB7XG4gICAgICBpZiAodGhpcy5jYW5IYXZlQ2hpbGRyZW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKTtcbiAgICAgICAgdGhyb3cgXCJUaGUgb3B0aW9ucyBvZiBhbiBlbGVtZW50IG1heSBub3QgYmUgYW4gZWxlbWVudCwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGhhdmUgY2hpbGRyZW4uXCI7XG4gICAgICB9XG4gICAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQob3B0aW9ucyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gIH1cbiAgY2FuSGF2ZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuICE9PSBudWxsO1xuICB9XG59O1xuXG4vLyBzcmMvZWxlbWVudHMvZWxlbWVudF9saXN0LnRzXG52YXIgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcImFyZWFcIixcbiAgXCJiYXNlXCIsXG4gIFwiYnJcIixcbiAgXCJjb2xcIixcbiAgXCJlbWJlZFwiLFxuICBcImhyXCIsXG4gIFwiaW1nXCIsXG4gIFwiaW5wdXRcIixcbiAgXCJsaW5rXCIsXG4gIFwibWV0YVwiLFxuICBcInBhcmFtXCIsXG4gIFwic291cmNlXCIsXG4gIFwidHJhY2tcIixcbiAgXCJ3YnJcIlxuXTtcbnZhciBodG1sRWxlbWVudFRhZ3MgPSBbXG4gIFwiYVwiLFxuICBcImFiYnJcIixcbiAgXCJhZGRyZXNzXCIsXG4gIFwiYXJ0aWNsZVwiLFxuICBcImFzaWRlXCIsXG4gIFwiYXVkaW9cIixcbiAgXCJiXCIsXG4gIFwiYmRpXCIsXG4gIFwiYmRvXCIsXG4gIFwiYmxvY2txdW90ZVwiLFxuICBcImJvZHlcIixcbiAgXCJidXR0b25cIixcbiAgXCJjYW52YXNcIixcbiAgXCJjYXB0aW9uXCIsXG4gIFwiY2l0ZVwiLFxuICBcImNvZGVcIixcbiAgXCJjb2xncm91cFwiLFxuICBcImRhdGFcIixcbiAgXCJkYXRhbGlzdFwiLFxuICBcImRkXCIsXG4gIFwiZGVsXCIsXG4gIFwiZGV0YWlsc1wiLFxuICBcImRmblwiLFxuICBcImRpYWxvZ1wiLFxuICBcImRpdlwiLFxuICBcImRsXCIsXG4gIFwiZHRcIixcbiAgXCJlbVwiLFxuICBcImZpZWxkc2V0XCIsXG4gIFwiZmlnY2FwdGlvblwiLFxuICBcImZpZ3VyZVwiLFxuICBcImZvb3RlclwiLFxuICBcImZvcm1cIixcbiAgXCJoMVwiLFxuICBcImgyXCIsXG4gIFwiaDNcIixcbiAgXCJoNFwiLFxuICBcImg1XCIsXG4gIFwiaDZcIixcbiAgXCJoZWFkXCIsXG4gIFwiaGVhZGVyXCIsXG4gIFwiaGdyb3VwXCIsXG4gIFwiaHRtbFwiLFxuICBcImlcIixcbiAgXCJpZnJhbWVcIixcbiAgXCJpbnNcIixcbiAgXCJrYmRcIixcbiAgXCJsYWJlbFwiLFxuICBcImxlZ2VuZFwiLFxuICBcImxpXCIsXG4gIFwibWFpblwiLFxuICBcIm1hcFwiLFxuICBcIm1hcmtcIixcbiAgXCJtZW51XCIsXG4gIFwibWV0ZXJcIixcbiAgXCJuYXZcIixcbiAgXCJub3NjcmlwdFwiLFxuICBcIm9iamVjdFwiLFxuICBcIm9sXCIsXG4gIFwib3B0Z3JvdXBcIixcbiAgXCJvcHRpb25cIixcbiAgXCJvdXRwdXRcIixcbiAgXCJwXCIsXG4gIFwicGljdHVyZVwiLFxuICBcInByZVwiLFxuICBcInByb2dyZXNzXCIsXG4gIFwicVwiLFxuICBcInJwXCIsXG4gIFwicnRcIixcbiAgXCJydWJ5XCIsXG4gIFwic1wiLFxuICBcInNhbXBcIixcbiAgXCJzY3JpcHRcIixcbiAgXCJzZWFyY2hcIixcbiAgXCJzZWN0aW9uXCIsXG4gIFwic2VsZWN0XCIsXG4gIFwic2xvdFwiLFxuICBcInNtYWxsXCIsXG4gIFwic3BhblwiLFxuICBcInN0cm9uZ1wiLFxuICBcInN0eWxlXCIsXG4gIFwic3ViXCIsXG4gIFwic3VtbWFyeVwiLFxuICBcInN1cFwiLFxuICBcInRhYmxlXCIsXG4gIFwidGJvZHlcIixcbiAgXCJ0ZFwiLFxuICBcInRlbXBsYXRlXCIsXG4gIFwidGV4dGFyZWFcIixcbiAgXCJ0Zm9vdFwiLFxuICBcInRoXCIsXG4gIFwidGhlYWRcIixcbiAgXCJ0aW1lXCIsXG4gIFwidGl0bGVcIixcbiAgXCJ0clwiLFxuICBcInVcIixcbiAgXCJ1bFwiLFxuICBcInZhclwiLFxuICBcInZpZGVvXCJcbl07XG52YXIgc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPSBbXG4gIFwicGF0aFwiLFxuICBcImNpcmNsZVwiLFxuICBcImVsbGlwc2VcIixcbiAgXCJsaW5lXCIsXG4gIFwicG9seWdvblwiLFxuICBcInBvbHlsaW5lXCIsXG4gIFwic3RvcFwiXG5dO1xudmFyIHN2Z0VsZW1lbnRUYWdzID0gW1xuICBcInN2Z1wiLFxuICBcImdcIixcbiAgXCJ0ZXh0XCIsXG4gIFwidHNwYW5cIixcbiAgXCJ0ZXh0UGF0aFwiLFxuICBcImRlZnNcIixcbiAgXCJzeW1ib2xcIixcbiAgXCJ1c2VcIixcbiAgXCJpbWFnZVwiLFxuICBcImNsaXBQYXRoXCIsXG4gIFwibWFza1wiLFxuICBcInBhdHRlcm5cIixcbiAgXCJsaW5lYXJHcmFkaWVudFwiLFxuICBcInJhZGlhbEdyYWRpZW50XCIsXG4gIFwiZmlsdGVyXCIsXG4gIFwibWFya2VyXCIsXG4gIFwidmlld1wiLFxuICBcImZlQmxlbmRcIixcbiAgXCJmZUNvbG9yTWF0cml4XCIsXG4gIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLFxuICBcImZlQ29tcG9zaXRlXCIsXG4gIFwiZmVDb252b2x2ZU1hdHJpeFwiLFxuICBcImZlRGlmZnVzZUxpZ2h0aW5nXCIsXG4gIFwiZmVEaXNwbGFjZW1lbnRNYXBcIixcbiAgXCJmZURpc3RhbnRMaWdodFwiLFxuICBcImZlRmxvb2RcIixcbiAgXCJmZUZ1bmNBXCIsXG4gIFwiZmVGdW5jQlwiLFxuICBcImZlRnVuY0dcIixcbiAgXCJmZUZ1bmNSXCIsXG4gIFwiZmVHYXVzc2lhbkJsdXJcIixcbiAgXCJmZUltYWdlXCIsXG4gIFwiZmVNZXJnZVwiLFxuICBcImZlTWVyZ2VOb2RlXCIsXG4gIFwiZmVNb3JwaG9sb2d5XCIsXG4gIFwiZmVPZmZzZXRcIixcbiAgXCJmZVBvaW50TGlnaHRcIixcbiAgXCJmZVNwZWN1bGFyTGlnaHRpbmdcIixcbiAgXCJmZVNwb3RMaWdodFwiLFxuICBcImZlVGlsZVwiLFxuICBcImZlVHVyYnVsZW5jZVwiXG5dO1xudmFyIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzID0gW1xuICBcIm1pXCIsXG4gIFwibW5cIixcbiAgXCJtb1wiXG5dO1xudmFyIG1hdGhtbEVsZW1lbnRUYWdzID0gW1xuICBcIm1hdGhcIixcbiAgXCJtc1wiLFxuICBcIm10ZXh0XCIsXG4gIFwibXJvd1wiLFxuICBcIm1mZW5jZWRcIixcbiAgXCJtc3VwXCIsXG4gIFwibXN1YlwiLFxuICBcIm1zdWJzdXBcIixcbiAgXCJtZnJhY1wiLFxuICBcIm1zcXJ0XCIsXG4gIFwibXJvb3RcIixcbiAgXCJtdGFibGVcIixcbiAgXCJtdHJcIixcbiAgXCJtdGRcIixcbiAgXCJtc3R5bGVcIixcbiAgXCJtZW5jbG9zZVwiLFxuICBcIm1tdWx0aXNjcmlwdHNcIlxuXTtcbnZhciBlbGVtZW50cyA9IHt9O1xudmFyIGNoaWxkcmVubGVzc0VsZW1lbnRzID0ge307XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpIHtcbiAgcmV0dXJuICgob3B0aW9ucywgLi4uY2hpbGRyZW4pID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBjaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKSB7XG4gIHJldHVybiAoKG9wdGlvbnMpID0+IG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnLCBvcHRpb25zLCBudWxsKSk7XG59XG5mb3IgKGNvbnN0IHRhZyBvZiBodG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2Ygc3ZnRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgbWF0aG1sRWxlbWVudFRhZ3MpIGVsZW1lbnRzW3RhZ10gPSBjcmVhdGVFbGVtZW50QnVpbGRlcih0YWcpO1xuZm9yIChjb25zdCB0YWcgb2YgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIHN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcbnZhciBhbGxFbGVtZW50cyA9IHtcbiAgLi4uZWxlbWVudHMsXG4gIC4uLmNoaWxkcmVubGVzc0VsZW1lbnRzXG59O1xuXG4vLyBzcmMvY2xpZW50L3J1bnRpbWUudHNcbk9iamVjdC5hc3NpZ24od2luZG93LCBhbGxFbGVtZW50cyk7XG52YXIgbmV3QXJyYXkgPSBBcnJheS5mcm9tO1xuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9ucyA9IFtdO1xuICBjb25zdCBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50LnRhZyk7XG4gIHtcbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZWxlbWVudC5vcHRpb25zKTtcbiAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgb3B0aW9uVmFsdWUubXV0YXRlKGVsZW1lbnQsIG9wdGlvbk5hbWUpO1xuICAgICAgICBjb25zdCBlbGVtZW50S2V5ID0gKE1hdGgucmFuZG9tKCkgKiAxZTQpLnRvU3RyaW5nKCk7XG4gICAgICAgIHNwZWNpYWxFbGVtZW50T3B0aW9ucy5wdXNoKHsgZWxlbWVudEtleSwgb3B0aW9uTmFtZSwgb3B0aW9uVmFsdWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGVsZW1lbnQua2V5KSB7XG4gICAgZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgZWxlbWVudC5rZXkpO1xuICB9XG4gIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoY2hpbGQpO1xuICAgICAgICBkb21FbGVtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHJvb3Q6IGRvbUVsZW1lbnQsIHNwZWNpYWxFbGVtZW50T3B0aW9ucyB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgPSBbXTtcbiAgaWYgKGVsZW1lbnQgPT09IHZvaWQgMCB8fCBlbGVtZW50ID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgYW5kIG51bGwgYXJlIG5vdCBhbGxvd2VkIGFzIGVsZW1lbnRzLmApO1xuICB9XG4gIHN3aXRjaCAodHlwZW9mIGVsZW1lbnQpIHtcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50KSkge1xuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgZm9yIChjb25zdCBzdWJFbGVtZW50IG9mIGVsZW1lbnQpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KHN1YkVsZW1lbnQpO1xuICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHJlc3VsdC5yb290KTtcbiAgICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCguLi5yZXN1bHQuc3BlY2lhbEVsZW1lbnRPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyByb290OiBmcmFnbWVudCwgc3BlY2lhbEVsZW1lbnRPcHRpb25zIH07XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGlzIGVsZW1lbnQgaXMgYW4gYXJiaXRyYXJ5IG9iamVjdCwgYW5kIGFyYml0cmFyeSBvYmplY3RzIGFyZSBub3QgdmFsaWQgY2hpbGRyZW4uIFBsZWFzZSBtYWtlIHN1cmUgYWxsIGVsZW1lbnRzIGFyZSBvbmUgb2Y6IEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuYCk7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICByZXR1cm4geyByb290OiB0ZXh0Tm9kZSwgc3BlY2lhbEVsZW1lbnRPcHRpb25zOiBbXSB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0eXBlb2Ygb2YgdGhpcyBlbGVtZW50IGlzIG5vdCBvbmUgb2YgRWxlZ2FuY2VFbGVtZW50LCBib29sZWFuLCBudW1iZXIsIHN0cmluZyBvciBBcnJheS4gUGxlYXNlIGNvbnZlcnQgaXQgaW50byBvbmUgb2YgdGhlc2UgdHlwZXMuYCk7XG4gIH1cbn1cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICBsZXQgaXNFcnJvcmVkID0gZmFsc2U7XG4gIChmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgIGNvbnN0IGVzID0gbmV3IEV2ZW50U291cmNlKFwiaHR0cDovL2xvY2FsaG9zdDo0MDAwL2VsZWdhbmNlLWhvdC1yZWxvYWRcIik7XG4gICAgZXMub25vcGVuID0gKCkgPT4ge1xuICAgICAgaWYgKGlzRXJyb3JlZCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBlcy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgaXNFcnJvcmVkID0gdHJ1ZTtcbiAgICAgIGVzLmNsb3NlKCk7XG4gICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDFlMyk7XG4gICAgfTtcbiAgfSkoKTtcbn0pKCk7XG52YXIgQ2xpZW50U3ViamVjdCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoaWQsIHZhbHVlKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pZCA9IGlkO1xuICB9XG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBNYW51YWxseSB0cmlnZ2VyIGVhY2ggb2YgdGhpcyBzdWJqZWN0J3Mgb2JzZXJ2ZXJzLCB3aXRoIHRoZSBzdWJqZWN0J3MgY3VycmVudCB2YWx1ZS5cbiAgICogXG4gICAqIFVzZWZ1bCBpZiB5b3UncmUgbXV0YXRpbmcgZm9yIGV4YW1wbGUgZmllbGRzIG9mIGFuIG9iamVjdCwgb3IgcHVzaGluZyB0byBhbiBhcnJheS5cbiAgICovXG4gIHRyaWdnZXJPYnNlcnZlcnMoKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQWRkIGEgbmV3IG9ic2VydmVyIHRvIHRoaXMgc3ViamVjdCwgYGNhbGxiYWNrYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIHNldHRlciBpcyBjYWxsZWQgb24gdGhpcyBzdWJqZWN0LlxuICAgKiBcbiAgICogTm90ZTogaWYgYW4gSUQgaXMgYWxyZWFkeSBpbiB1c2UgaXQncyBjYWxsYmFjayB3aWxsIGp1c3QgYmUgb3ZlcndyaXR0ZW4gd2l0aCB3aGF0ZXZlciB5b3UgZ2l2ZSBpdC5cbiAgICogXG4gICAqIEBwYXJhbSBpZCBUaGUgdW5pcXVlIGlkIG9mIHRoaXMgb2JzZXJ2ZXJcbiAgICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhpcyBzdWJqZWN0IGNoYW5nZXMuXG4gICAqL1xuICBvYnNlcnZlKGlkLCBjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLm9ic2VydmVycy5oYXMoaWQpKSB7XG4gICAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmVycy5zZXQoaWQsIGNhbGxiYWNrKTtcbiAgfVxuICAvKipcbiAgICogUmVtb3ZlIGFuIG9ic2VydmVyIGZyb20gdGhpcyBzdWJqZWN0LlxuICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGUgb2JzZXJ2ZXIuXG4gICAqL1xuICB1bm9ic2VydmUoaWQpIHtcbiAgICB0aGlzLm9ic2VydmVycy5kZWxldGUoaWQpO1xuICB9XG59O1xudmFyIFN0YXRlTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJqZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyh2YWx1ZXMsIGRvT3ZlcndyaXRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHRoaXMuc3ViamVjdHMuaGFzKHZhbHVlLmlkKSAmJiBkb092ZXJ3cml0ZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50U3ViamVjdCA9IG5ldyBDbGllbnRTdWJqZWN0KHZhbHVlLmlkLCB2YWx1ZS52YWx1ZSk7XG4gICAgICB0aGlzLnN1YmplY3RzLnNldCh2YWx1ZS5pZCwgY2xpZW50U3ViamVjdCk7XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3RzLmdldChpZCk7XG4gIH1cbiAgZ2V0QWxsKGlkcykge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZ2V0KGlkKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59O1xudmFyIENsaWVudEV2ZW50TGlzdGVuZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuY2VuY2llcztcbiAgfVxuICBjYWxsKGV2KSB7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgdGhpcy5jYWxsYmFjayhldiwgLi4uZGVwZW5kZW5jaWVzKTtcbiAgfVxufTtcbnZhciBFdmVudExpc3RlbmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIH1cbiAgbG9hZFZhbHVlcyhzZXJ2ZXJFdmVudExpc3RlbmVycywgZG9PdmVycmlkZSA9IGZhbHNlKSB7XG4gICAgZm9yIChjb25zdCBzZXJ2ZXJFdmVudExpc3RlbmVyIG9mIHNlcnZlckV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBpZiAodGhpcy5ldmVudExpc3RlbmVycy5oYXMoc2VydmVyRXZlbnRMaXN0ZW5lci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50RXZlbnRMaXN0ZW5lciA9IG5ldyBDbGllbnRFdmVudExpc3RlbmVyKHNlcnZlckV2ZW50TGlzdGVuZXIuaWQsIHNlcnZlckV2ZW50TGlzdGVuZXIuY2FsbGJhY2ssIHNlcnZlckV2ZW50TGlzdGVuZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KGNsaWVudEV2ZW50TGlzdGVuZXIuaWQsIGNsaWVudEV2ZW50TGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuICBob29rQ2FsbGJhY2tzKGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBldmVudExpc3RlbmVyT3B0aW9uIG9mIGV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2tleT1cIiR7ZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBldmVudExpc3RlbmVyT3B0aW9uLmtleSArIFwiIGZvciBldmVudCBsaXN0ZW5lci5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudExpc3RlbmVyT3B0aW9uLmlkKTtcbiAgICAgIGlmICghZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJJbnZhbGlkIEV2ZW50TGlzdGVuZXJPcHRpb246IEV2ZW50IGxpc3RlbmVyIHdpdGggaWQgXFx1MjAxRFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5pZCArICdcIiBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZWxlbWVudFtldmVudExpc3RlbmVyT3B0aW9uLm9wdGlvbl0gPSAoZXYpID0+IHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lci5jYWxsKGV2KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIGdldChpZCkge1xuICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChpZCk7XG4gIH1cbn07XG52YXIgQ2xpZW50T2JzZXJ2ZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGlkLCBjYWxsYmFjaywgZGVwZW5jZW5jaWVzKSB7XG4gICAgdGhpcy5zdWJqZWN0VmFsdWVzID0gW107XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IHN0YXRlTWFuYWdlci5nZXRBbGwodGhpcy5kZXBlbmRlbmNpZXMpO1xuICAgIGZvciAoY29uc3QgaW5pdGlhbFZhbHVlIG9mIGluaXRpYWxWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc3ViamVjdFZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN1YmplY3RWYWx1ZXMucHVzaChpbml0aWFsVmFsdWUudmFsdWUpO1xuICAgICAgaW5pdGlhbFZhbHVlLm9ic2VydmUodGhpcy5pZCwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc3ViamVjdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICAgIHRoaXMuY2FsbCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY2FsbCgpO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYW4gZWxlbWVudCB0byB1cGRhdGUgd2hlbiB0aGlzIG9ic2VydmVyIHVwZGF0ZXMuXG4gICAqL1xuICBhZGRFbGVtZW50KGVsZW1lbnQsIG9wdGlvbk5hbWUpIHtcbiAgICB0aGlzLmVsZW1lbnRzLnB1c2goeyBlbGVtZW50LCBvcHRpb25OYW1lIH0pO1xuICB9XG4gIGNhbGwoKSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmNhbGxiYWNrKC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG4gICAgZm9yIChjb25zdCB7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBlbGVtZW50W29wdGlvbk5hbWVdID0gbmV3VmFsdWU7XG4gICAgfVxuICB9XG59O1xudmFyIE9ic2VydmVyTWFuYWdlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGllbnRPYnNlcnZlcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGxvYWRWYWx1ZXMoc2VydmVyT2JzZXJ2ZXJzLCBkb092ZXJyaWRlID0gZmFsc2UpIHtcbiAgICBmb3IgKGNvbnN0IHNlcnZlck9ic2VydmVyIG9mIHNlcnZlck9ic2VydmVycykge1xuICAgICAgaWYgKHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmhhcyhzZXJ2ZXJPYnNlcnZlci5pZCkgJiYgZG9PdmVycmlkZSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY2xpZW50T2JzZXJ2ZXIgPSBuZXcgQ2xpZW50T2JzZXJ2ZXIoc2VydmVyT2JzZXJ2ZXIuaWQsIHNlcnZlck9ic2VydmVyLmNhbGxiYWNrLCBzZXJ2ZXJPYnNlcnZlci5kZXBlbmRlbmNpZXMpO1xuICAgICAgdGhpcy5jbGllbnRPYnNlcnZlcnMuc2V0KGNsaWVudE9ic2VydmVyLmlkLCBjbGllbnRPYnNlcnZlcik7XG4gICAgfVxuICB9XG4gIGhvb2tDYWxsYmFja3Mob2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBvYnNlcnZlck9wdGlvbiBvZiBvYnNlcnZlck9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtvYnNlcnZlck9wdGlvbi5rZXl9XCJdYCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiUG9zc2libHkgY29ycnVwdGVkIEhUTUwsIGZhaWxlZCB0byBmaW5kIGVsZW1lbnQgd2l0aCBrZXkgXCIgKyBvYnNlcnZlck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBvYnNlcnZlciA9IHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmdldChvYnNlcnZlck9wdGlvbi5pZCk7XG4gICAgICBpZiAoIW9ic2VydmVyKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIkludmFsaWQgT2JzZXJ2ZXJPcHRpb246IE9ic2VydmVyIHdpdGggaWQgXFx1MjAxRFwiICsgb2JzZXJ2ZXJPcHRpb24uaWQgKyAnXCIgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG9ic2VydmVyLmFkZEVsZW1lbnQoZWxlbWVudCwgb2JzZXJ2ZXJPcHRpb24ub3B0aW9uKTtcbiAgICAgIG9ic2VydmVyLmNhbGwoKTtcbiAgICB9XG4gIH1cbn07XG52YXIgTG9hZEhvb2tNYW5hZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gW107XG4gIH1cbiAgbG9hZFZhbHVlcyhsb2FkSG9va3MpIHtcbiAgICBmb3IgKGNvbnN0IGxvYWRIb29rIG9mIGxvYWRIb29rcykge1xuICAgICAgY29uc3QgZGVwZW5jZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbChsb2FkSG9vay5kZXBlbmRlbmNpZXMpO1xuICAgICAgY29uc3QgY2xlYW51cEZ1bmN0aW9uID0gbG9hZEhvb2suY2FsbGJhY2soLi4uZGVwZW5jZW5jaWVzKTtcbiAgICAgIGlmIChjbGVhbnVwRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHtcbiAgICAgICAgICBraW5kOiBsb2FkSG9vay5raW5kLFxuICAgICAgICAgIGNsZWFudXBGdW5jdGlvbixcbiAgICAgICAgICBwYXRobmFtZTogbG9hZEhvb2sucGF0aG5hbWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxDbGVhbnVwRnVuY3Rpb25zKCkge1xuICAgIGxldCByZW1haW5pbmdQcm9jZWR1cmVzID0gW107XG4gICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IDAgLyogTEFZT1VUX0xPQURIT09LICovKSB7XG4gICAgICAgIGNvbnN0IGlzSW5TY29wZSA9IHNhbml0aXplUGF0aG5hbWUod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKS5zdGFydHNXaXRoKGNsZWFudXBQcm9jZWR1cmUucGF0aG5hbWUpO1xuICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgcmVtYWluaW5nUHJvY2VkdXJlcy5wdXNoKGNsZWFudXBQcm9jZWR1cmUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGVhbnVwUHJvY2VkdXJlLmNsZWFudXBGdW5jdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgfVxufTtcbnZhciBvYnNlcnZlck1hbmFnZXIgPSBuZXcgT2JzZXJ2ZXJNYW5hZ2VyKCk7XG52YXIgZXZlbnRMaXN0ZW5lck1hbmFnZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbnZhciBzdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKCk7XG52YXIgbG9hZEhvb2tNYW5hZ2VyID0gbmV3IExvYWRIb29rTWFuYWdlcigpO1xudmFyIHBhZ2VTdHJpbmdDYWNoZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xudmFyIHhtbFNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xudmFyIGZldGNoUGFnZSA9IGFzeW5jICh0YXJnZXRVUkwpID0+IHtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG4gIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgIHJldHVybiBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBhZ2VTdHJpbmdDYWNoZS5nZXQocGF0aG5hbWUpLCBcInRleHQvaHRtbFwiKTtcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0YXJnZXRVUkwpO1xuICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICB7XG4gICAgY29uc3QgZGF0YVNjcmlwdHMgPSBuZXdBcnJheShuZXdET00ucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W2RhdGEtcGFja2FnZT1cInRydWVcIl0nKSk7XG4gICAgY29uc3QgY3VycmVudFNjcmlwdHMgPSBuZXdBcnJheShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtkYXRhLXBhY2thZ2U9XCJ0cnVlXCJdJykpO1xuICAgIGZvciAoY29uc3QgZGF0YVNjcmlwdCBvZiBkYXRhU2NyaXB0cykge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50U2NyaXB0cy5maW5kKChzKSA9PiBzLnNyYyA9PT0gZGF0YVNjcmlwdC5zcmMpO1xuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChkYXRhU2NyaXB0KTtcbiAgICB9XG4gIH1cbiAge1xuICAgIGNvbnN0IHBhZ2VEYXRhU2NyaXB0ID0gbmV3RE9NLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLWhvb2s9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgIGNvbnN0IHRleHQgPSBwYWdlRGF0YVNjcmlwdC50ZXh0Q29udGVudDtcbiAgICBwYWdlRGF0YVNjcmlwdC5yZW1vdmUoKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6IFwidGV4dC9qYXZhc2NyaXB0XCIgfSk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgc2NyaXB0LnR5cGUgPSBcIm1vZHVsZVwiO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhZ2VcIiwgXCJ0cnVlXCIpO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgIG5ld0RPTS5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH1cbiAgcGFnZVN0cmluZ0NhY2hlLnNldChwYXRobmFtZSwgeG1sU2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhuZXdET00pKTtcbiAgcmV0dXJuIG5ld0RPTTtcbn07XG52YXIgbmF2aWdhdGlvbkNhbGxiYWNrcyA9IFtdO1xuZnVuY3Rpb24gb25OYXZpZ2F0ZShjYWxsYmFjaykge1xuICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xufVxudmFyIG5hdmlnYXRlTG9jYWxseSA9IGFzeW5jICh0YXJnZXQsIHB1c2hTdGF0ZSA9IHRydWUpID0+IHtcbiAgY29uc3QgdGFyZ2V0VVJMID0gbmV3IFVSTCh0YXJnZXQpO1xuICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcbiAgbGV0IG5ld1BhZ2UgPSBhd2FpdCBmZXRjaFBhZ2UodGFyZ2V0VVJMKTtcbiAgaWYgKCFuZXdQYWdlKSByZXR1cm47XG4gIGxldCBvbGRQYWdlTGF0ZXN0ID0gZG9jdW1lbnQuYm9keTtcbiAgbGV0IG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlLmJvZHk7XG4gIHtcbiAgICBjb25zdCBuZXdQYWdlTGF5b3V0cyA9IG5ld0FycmF5KG5ld1BhZ2UucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXRzID0gbmV3QXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRlbXBsYXRlW2xheW91dC1pZF1cIikpO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihuZXdQYWdlTGF5b3V0cy5sZW5ndGgsIG9sZFBhZ2VMYXlvdXRzLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXQgPSBuZXdQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXQgPSBvbGRQYWdlTGF5b3V0c1tpXTtcbiAgICAgIGNvbnN0IG5ld0xheW91dElkID0gbmV3UGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIik7XG4gICAgICBjb25zdCBvbGRMYXlvdXRJZCA9IG9sZFBhZ2VMYXlvdXQuZ2V0QXR0cmlidXRlKFwibGF5b3V0LWlkXCIpO1xuICAgICAgaWYgKG5ld0xheW91dElkICE9PSBvbGRMYXlvdXRJZCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG9sZFBhZ2VMYXRlc3QgPSBvbGRQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIG5ld1BhZ2VMYXRlc3QgPSBuZXdQYWdlTGF5b3V0Lm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gIH1cbiAgY29uc3QgaGVhZCA9IGRvY3VtZW50LmhlYWQ7XG4gIGNvbnN0IG5ld0hlYWQgPSBuZXdQYWdlLmhlYWQ7XG4gIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gIHtcbiAgICBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoXCJ0aXRsZVwiKT8ucmVwbGFjZVdpdGgoXG4gICAgICBuZXdQYWdlLmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpID8/IFwiXCJcbiAgICApO1xuICAgIGNvbnN0IHVwZGF0ZSA9ICh0YXJnZXRMaXN0LCBtYXRjaEFnYWluc3QsIGFjdGlvbikgPT4ge1xuICAgICAgZm9yIChjb25zdCB0YXJnZXQyIG9mIHRhcmdldExpc3QpIHtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmcgPSBtYXRjaEFnYWluc3QuZmluZCgobikgPT4gbi5pc0VxdWFsTm9kZSh0YXJnZXQyKSk7XG4gICAgICAgIGlmIChtYXRjaGluZykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbih0YXJnZXQyKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IG9sZFRhZ3MgPSBbXG4gICAgICAuLi5uZXdBcnJheShoZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcIm1ldGFcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KGhlYWQucXVlcnlTZWxlY3RvckFsbChcImJhc2VcIikpLFxuICAgICAgLi4ubmV3QXJyYXkoaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic3R5bGVcIikpXG4gICAgXTtcbiAgICBjb25zdCBuZXdUYWdzID0gW1xuICAgICAgLi4ubmV3QXJyYXkobmV3SGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKSksXG4gICAgICAuLi5uZXdBcnJheShuZXdIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgIC4uLm5ld0FycmF5KG5ld0hlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKVxuICAgIF07XG4gICAgdXBkYXRlKG5ld1RhZ3MsIG9sZFRhZ3MsIChub2RlKSA9PiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICB1cGRhdGUob2xkVGFncywgbmV3VGFncywgKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICB9XG4gIGlmIChwdXNoU3RhdGUpIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIFwiXCIsIHRhcmdldFVSTC5ocmVmKTtcbiAgbG9hZEhvb2tNYW5hZ2VyLmNhbGxDbGVhbnVwRnVuY3Rpb25zKCk7XG4gIHtcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIG5hdmlnYXRpb25DYWxsYmFja3MpIHtcbiAgICAgIGNhbGxiYWNrKHBhdGhuYW1lKTtcbiAgICB9XG4gICAgbmF2aWdhdGlvbkNhbGxiYWNrcyA9IFtdO1xuICB9XG4gIGF3YWl0IGxvYWRQYWdlKCk7XG4gIGlmICh0YXJnZXRVUkwuaGFzaCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHNhbml0aXplUGF0aG5hbWUocGF0aG5hbWUgPSBcIlwiKSB7XG4gIGlmICghcGF0aG5hbWUpIHJldHVybiBcIi9cIjtcbiAgcGF0aG5hbWUgPSBcIi9cIiArIHBhdGhuYW1lO1xuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1xcLysvZywgXCIvXCIpO1xuICBpZiAocGF0aG5hbWUubGVuZ3RoID4gMSAmJiBwYXRobmFtZS5lbmRzV2l0aChcIi9cIikpIHtcbiAgICBwYXRobmFtZSA9IHBhdGhuYW1lLnNsaWNlKDAsIC0xKTtcbiAgfVxuICByZXR1cm4gcGF0aG5hbWU7XG59XG5hc3luYyBmdW5jdGlvbiBnZXRQYWdlRGF0YShwYXRobmFtZSkge1xuICBjb25zdCBkYXRhU2NyaXB0VGFnID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKTtcbiAgaWYgKCFkYXRhU2NyaXB0VGFnKSB7XG4gICAgREVWX0JVSUxEICYmIGBGYWlsZWQgdG8gZmluZCBzY3JpcHQgdGFnIGZvciBxdWVyeTpzY3JpcHRbZGF0YS1wYWdlPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGltcG9ydChkYXRhU2NyaXB0VGFnLnNyYyk7XG4gIGNvbnN0IHtcbiAgICBzdWJqZWN0cyxcbiAgICBldmVudExpc3RlbmVycyxcbiAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICBvYnNlcnZlcnMsXG4gICAgb2JzZXJ2ZXJPcHRpb25zXG4gIH0gPSBkYXRhO1xuICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgREVWX0JVSUxEICYmIGVycm9yT3V0KGBQb3NzaWJseSBtYWxmb3JtZWQgcGFnZSBkYXRhICR7ZGF0YX1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59XG5mdW5jdGlvbiBlcnJvck91dChtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQYWdlKCkge1xuICB3aW5kb3cub25wb3BzdGF0ZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIGF3YWl0IG5hdmlnYXRlTG9jYWxseSh0YXJnZXQubG9jYXRpb24uaHJlZiwgZmFsc2UpO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIHRhcmdldC5sb2NhdGlvbi5ocmVmKTtcbiAgfTtcbiAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gIGNvbnN0IHtcbiAgICBzdWJqZWN0cyxcbiAgICBldmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICBldmVudExpc3RlbmVycyxcbiAgICBvYnNlcnZlcnMsXG4gICAgb2JzZXJ2ZXJPcHRpb25zLFxuICAgIGxvYWRIb29rc1xuICB9ID0gYXdhaXQgZ2V0UGFnZURhdGEocGF0aG5hbWUpO1xuICBERVZfQlVJTEQ6IHtcbiAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgcGFnZURhdGE6IHtcbiAgICAgICAgc3ViamVjdHMsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgICAgIGxvYWRIb29rc1xuICAgICAgfSxcbiAgICAgIHN0YXRlTWFuYWdlcixcbiAgICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICAgICAgb2JzZXJ2ZXJNYW5hZ2VyLFxuICAgICAgbG9hZEhvb2tNYW5hZ2VyXG4gICAgfTtcbiAgfVxuICBnbG9iYWxUaGlzLmVsZWdhbmNlQ2xpZW50ID0ge1xuICAgIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQsXG4gICAgZmV0Y2hQYWdlLFxuICAgIG5hdmlnYXRlTG9jYWxseSxcbiAgICBvbk5hdmlnYXRlXG4gIH07XG4gIHN0YXRlTWFuYWdlci5sb2FkVmFsdWVzKHN1YmplY3RzKTtcbiAgZXZlbnRMaXN0ZW5lck1hbmFnZXIubG9hZFZhbHVlcyhldmVudExpc3RlbmVycyk7XG4gIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3MoZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICBvYnNlcnZlck1hbmFnZXIubG9hZFZhbHVlcyhvYnNlcnZlcnMpO1xuICBvYnNlcnZlck1hbmFnZXIuaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnMpO1xuICBsb2FkSG9va01hbmFnZXIubG9hZFZhbHVlcyhsb2FkSG9va3MpO1xufVxubG9hZFBhZ2UoKTtcbmV4cG9ydCB7XG4gIENsaWVudFN1YmplY3QsXG4gIEV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxuICBMb2FkSG9va01hbmFnZXIsXG4gIE9ic2VydmVyTWFuYWdlcixcbiAgU3RhdGVNYW5hZ2VyXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQ0EsTUFBSSx1QkFBdUIsTUFBTTtBQUFBLEVBQ2pDO0FBQ0EsV0FBUyxZQUFZLE9BQU87QUFDMUIsUUFBSSxVQUFVLFFBQVEsVUFBVSxXQUFXLE9BQU8sVUFBVSxZQUFZLE1BQU0sUUFBUSxLQUFLLEtBQUssaUJBQWlCLGlCQUFrQixRQUFPO0FBQzFJLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxrQkFBa0IsTUFBTTtBQUFBLElBQzFCLFlBQVksS0FBSyxVQUFVLENBQUMsR0FBRyxVQUFVO0FBQ3ZDLFdBQUssTUFBTTtBQUNYLFdBQUssV0FBVztBQUNoQixVQUFJLFlBQVksT0FBTyxHQUFHO0FBQ3hCLFlBQUksS0FBSyxnQkFBZ0IsTUFBTSxPQUFPO0FBQ3BDLGtCQUFRLE1BQU0sZ0JBQWdCLE1BQU0sZ0NBQWdDO0FBQ3BFLGdCQUFNO0FBQUEsUUFDUjtBQUNBLGFBQUssU0FBUyxRQUFRLE9BQU87QUFDN0IsYUFBSyxVQUFVLENBQUM7QUFBQSxNQUNsQixPQUFPO0FBQ0wsYUFBSyxVQUFVO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsSUFDQSxrQkFBa0I7QUFDaEIsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLDhCQUE4QjtBQUFBLElBQ2hDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGtCQUFrQjtBQUFBLElBQ3BCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSw2QkFBNkI7QUFBQSxJQUMvQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFD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
