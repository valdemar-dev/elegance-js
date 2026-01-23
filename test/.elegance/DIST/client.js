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
      const dataScripts = Array.from(newDOM.querySelectorAll('script[data-package="true"]'));
      const currentScripts = Array.from(document.head.querySelectorAll('script[data-package="true"]'));
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
      console.log(script);
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
      const newPageLayouts = Array.from(newPage.querySelectorAll("template[layout-id]"));
      const oldPageLayouts = Array.from(document.querySelectorAll("template[layout-id]"));
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
    console.log(oldPageLatest, newPageLatest);
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
      const oldTags = Array.from([
        ...Array.from(document.head.querySelectorAll("link")),
        ...Array.from(document.head.querySelectorAll("meta")),
        ...Array.from(document.head.querySelectorAll("script")),
        ...Array.from(document.head.querySelectorAll("base")),
        ...Array.from(document.head.querySelectorAll("style"))
      ]);
      const newTags = Array.from([
        ...Array.from(newPage.head.querySelectorAll("link")),
        ...Array.from(newPage.head.querySelectorAll("meta")),
        ...Array.from(newPage.head.querySelectorAll("script")),
        ...Array.from(newPage.head.querySelectorAll("base")),
        ...Array.from(newPage.head.querySelectorAll("style"))
      ]);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnQudHMiLCAiLi4vLi4vLi4vc3JjL2VsZW1lbnRzL2VsZW1lbnRfbGlzdC50cyIsICIuLi8uLi8uLi9zcmMvY2xpZW50L3J1bnRpbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBBbnkgdmFsaWQgZWxlbWVudCB0aGF0IGhhcyBub3QgYmVlbiBjb25zdHJ1Y3RlZCB2aWEgdGhlIHVzZSBvZiBhbiBlbGVtZW50IGNvbnN0cnVjdG9yIHN1Y2ggYXMgaDEoKSAqL1xudHlwZSBFbGVtZW50TGl0ZXJhbCA9IGJvb2xlYW4gfCBcbiAgICBudW1iZXIgfCBcbiAgICBzdHJpbmcgfCBcbiAgICBBcnJheTxhbnk+O1xuXG50eXBlIEFueUVsZW1lbnQgPSBFbGVnYW5jZUVsZW1lbnQ8YW55PiB8IEVsZW1lbnRMaXRlcmFsO1xuXG50eXBlIEVsZW1lbnRDaGlsZHJlbiA9IEFueUVsZW1lbnRbXTtcblxuLyoqIEVsZW1lbnQgb3B0aW9ucyBvZiB0aGlzIHR5cGUgd2lsbCBiZSBtYWRlIGludG8gZmllbGQ9XCJ2YWx1ZS50b1N0cmluZygpXCIgKi9cbnR5cGUgRWxlbWVudE9wdGlvbkxpdGVyYWwgPSBudW1iZXIgfCBzdHJpbmcgfCBSZWNvcmQ8YW55LCBhbnk+O1xuXG50eXBlIFByb2Nlc3NTcGVjaWFsRWxlbWVudE9wdGlvbiA9IChlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKiogXG4gKiBBbiBvcHRpb24gdGhhdCBzaG91bGQgYmUgdHJlYXRlZCBkaWZmZXJlbnRseSBieSB0aGUgY29tcGlsZXIuXG4gKi9cbmFic3RyYWN0IGNsYXNzIFNwZWNpYWxFbGVtZW50T3B0aW9uIHtcbiAgICAvKipcbiAgICAgKiBNdXRhdGUgdGhpcyBvcHRpb24gaW4gdGhlIGVsZW1lbnQgdG8gaXQncyBzZXJpYWxpemVhYmxlIHN0YXRlLlxuICAgICAqL1xuICAgIGFic3RyYWN0IG11dGF0ZShlbGVtZW50OiBFbGVnYW5jZUVsZW1lbnQ8YW55Piwgb3B0aW9uTmFtZTogc3RyaW5nKTogdm9pZFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCB0aGlzIHNwZWNpYWwgZWxlbWVudCBvcHRpb24gaW50byBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBhYnN0cmFjdCBzZXJpYWxpemUob3B0aW9uTmFtZTogc3RyaW5nLCBlbGVtZW50S2V5OiBzdHJpbmcpOiBzdHJpbmdcbn0gXG5cbnR5cGUgRWxlbWVudE9wdGlvbnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgfCBTcGVjaWFsRWxlbWVudE9wdGlvbj4gfCBFbGVtZW50T3B0aW9uTGl0ZXJhbDtcblxuLyoqIFxuICogUHVyZWx5IGZvciBzeW50YXggcmVhc29ucywgeW91IGNhbiB1c2UgYW4gZWxlbWVudCBhcyB0aGUgb3B0aW9ucyBwYXJhbWV0ZXJcbiAqIHdoZW4gY3JlYXRpbmcgYW4gZWxlbWVudCB1c2luZyBhbiBlbGVtZW50IGJ1aWxkZXIuXG4gKiBUaGlzIGlzIHRoZW4gcHJlcGVuZGVkIGludG8gdGhlIGNoaWxkcmVuIGJ5IHRoZSBlbGVtZW50IGJ1aWxkZXIuXG4gKi9cbnR5cGUgRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCA9IEVsZW1lbnRPcHRpb25zIHwgQW55RWxlbWVudDtcblxudHlwZSBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPVxuICAgIHwgXCJhcmVhXCIgfCBcImJhc2VcIiB8IFwiYnJcIiB8IFwiY29sXCIgfCBcImVtYmVkXCIgfCBcImhyXCIgfCBcImltZ1wiIHwgXCJpbnB1dFwiXG4gICAgfCBcImxpbmtcIiB8IFwibWV0YVwiIHwgXCJwYXJhbVwiIHwgXCJzb3VyY2VcIiB8IFwidHJhY2tcIiB8IFwid2JyXCI7XG5cbnR5cGUgSHRtbEVsZW1lbnRUYWdzID1cbiAgICB8IFwiYVwiIHwgXCJhYmJyXCIgfCBcImFkZHJlc3NcIiB8IFwiYXJ0aWNsZVwiIHwgXCJhc2lkZVwiIHwgXCJhdWRpb1wiIHwgXCJiXCIgfCBcImJkaVwiIHwgXCJiZG9cIlxuICAgIHwgXCJibG9ja3F1b3RlXCIgfCBcImJvZHlcIiB8IFwiYnV0dG9uXCIgfCBcImNhbnZhc1wiIHwgXCJjYXB0aW9uXCIgfCBcImNpdGVcIiB8IFwiY29kZVwiIHwgXCJjb2xncm91cFwiXG4gICAgfCBcImRhdGFcIiB8IFwiZGF0YWxpc3RcIiB8IFwiZGRcIiB8IFwiZGVsXCIgfCBcImRldGFpbHNcIiB8IFwiZGZuXCIgfCBcImRpYWxvZ1wiIHwgXCJkaXZcIiB8IFwiZGxcIiB8IFwiZHRcIlxuICAgIHwgXCJlbVwiIHwgXCJmaWVsZHNldFwiIHwgXCJmaWdjYXB0aW9uXCIgfCBcImZpZ3VyZVwiIHwgXCJmb290ZXJcIiB8IFwiZm9ybVwiIHwgXCJoMVwiIHwgXCJoMlwiIHwgXCJoM1wiXG4gICAgfCBcImg0XCIgfCBcImg1XCIgfCBcImg2XCIgfCBcImhlYWRcIiB8IFwiaGVhZGVyXCIgfCBcImhncm91cFwiIHwgXCJodG1sXCIgfCBcImlcIiB8IFwiaWZyYW1lXCIgfCBcImluc1wiXG4gICAgfCBcImtiZFwiIHwgXCJsYWJlbFwiIHwgXCJsZWdlbmRcIiB8IFwibGlcIiB8IFwibWFpblwiIHwgXCJtYXBcIiB8IFwibWFya1wiIHwgXCJtZW51XCIgfCBcIm1ldGVyXCIgfCBcIm5hdlwiXG4gICAgfCBcIm5vc2NyaXB0XCIgfCBcIm9iamVjdFwiIHwgXCJvbFwiIHwgXCJvcHRncm91cFwiIHwgXCJvcHRpb25cIiB8IFwib3V0cHV0XCIgfCBcInBcIiB8IFwicGljdHVyZVwiXG4gICAgfCBcInByZVwiIHwgXCJwcm9ncmVzc1wiIHwgXCJxXCIgfCBcInJwXCIgfCBcInJ0XCIgfCBcInJ1YnlcIiB8IFwic1wiIHwgXCJzYW1wXCIgfCBcInNjcmlwdFwiIHwgXCJzZWFyY2hcIlxuICAgIHwgXCJzZWN0aW9uXCIgfCBcInNlbGVjdFwiIHwgXCJzbG90XCIgfCBcInNtYWxsXCIgfCBcInNwYW5cIiB8IFwic3Ryb25nXCIgfCBcInN0eWxlXCIgfCBcInN1YlwiIHwgXCJzdW1tYXJ5XCJcbiAgICB8IFwic3VwXCIgfCBcInRhYmxlXCIgfCBcInRib2R5XCIgfCBcInRkXCIgfCBcInRlbXBsYXRlXCIgfCBcInRleHRhcmVhXCIgfCBcInRmb290XCIgfCBcInRoXCIgfCBcInRoZWFkXCJcbiAgICB8IFwidGltZVwiIHwgXCJ0aXRsZVwiIHwgXCJ0clwiIHwgXCJ1XCIgfCBcInVsXCIgfCBcInZhclwiIHwgXCJ2aWRlb1wiO1xuXG50eXBlIFN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzID1cbiAgICB8IFwicGF0aFwiIHwgXCJjaXJjbGVcIiB8IFwiZWxsaXBzZVwiIHwgXCJsaW5lXCIgfCBcInBvbHlnb25cIiB8IFwicG9seWxpbmVcIiB8IFwic3RvcFwiO1xuXG50eXBlIFN2Z0VsZW1lbnRUYWdzID1cbiAgICB8IFwic3ZnXCIgfCBcImdcIiB8IFwidGV4dFwiIHwgXCJ0c3BhblwiIHwgXCJ0ZXh0UGF0aFwiIHwgXCJkZWZzXCIgfCBcInN5bWJvbFwiIHwgXCJ1c2VcIlxuICAgIHwgXCJpbWFnZVwiIHwgXCJjbGlwUGF0aFwiIHwgXCJtYXNrXCIgfCBcInBhdHRlcm5cIiB8IFwibGluZWFyR3JhZGllbnRcIiB8IFwicmFkaWFsR3JhZGllbnRcIlxuICAgIHwgXCJmaWx0ZXJcIiB8IFwibWFya2VyXCIgfCBcInZpZXdcIlxuICAgIHwgXCJmZUJsZW5kXCIgfCBcImZlQ29sb3JNYXRyaXhcIiB8IFwiZmVDb21wb25lbnRUcmFuc2ZlclwiIHwgXCJmZUNvbXBvc2l0ZVwiXG4gICAgfCBcImZlQ29udm9sdmVNYXRyaXhcIiB8IFwiZmVEaWZmdXNlTGlnaHRpbmdcIiB8IFwiZmVEaXNwbGFjZW1lbnRNYXBcIiB8IFwiZmVEaXN0YW50TGlnaHRcIlxuICAgIHwgXCJmZUZsb29kXCIgfCBcImZlRnVuY0FcIiB8IFwiZmVGdW5jQlwiIHwgXCJmZUZ1bmNHXCIgfCBcImZlRnVuY1JcIiB8IFwiZmVHYXVzc2lhbkJsdXJcIlxuICAgIHwgXCJmZUltYWdlXCIgfCBcImZlTWVyZ2VcIiB8IFwiZmVNZXJnZU5vZGVcIiB8IFwiZmVNb3JwaG9sb2d5XCIgfCBcImZlT2Zmc2V0XCIgfCBcImZlUG9pbnRMaWdodFwiXG4gICAgfCBcImZlU3BlY3VsYXJMaWdodGluZ1wiIHwgXCJmZVNwb3RMaWdodFwiIHwgXCJmZVRpbGVcIiB8IFwiZmVUdXJidWxlbmNlXCI7XG5cbnR5cGUgTWF0aE1MQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgPVxuICAgIHwgXCJtaVwiIHwgXCJtblwiIHwgXCJtb1wiO1xuXG50eXBlIE1hdGhNTEVsZW1lbnRUYWdzID1cbiAgICB8IFwibWF0aFwiIHwgXCJtc1wiIHwgXCJtdGV4dFwiIHwgXCJtcm93XCIgfCBcIm1mZW5jZWRcIiB8IFwibXN1cFwiIHwgXCJtc3ViXCIgfCBcIm1zdWJzdXBcIlxuICAgIHwgXCJtZnJhY1wiIHwgXCJtc3FydFwiIHwgXCJtcm9vdFwiIHwgXCJtdGFibGVcIiB8IFwibXRyXCIgfCBcIm10ZFwiIHwgXCJtc3R5bGVcIlxuICAgIHwgXCJtZW5jbG9zZVwiIHwgXCJtbXVsdGlzY3JpcHRzXCI7XG5cbnR5cGUgQWxsRWxlbWVudFRhZ3MgPVxuICAgIHwgSHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gICAgfCBIdG1sRWxlbWVudFRhZ3NcbiAgICB8IFN2Z0NoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gICAgfCBTdmdFbGVtZW50VGFnc1xuICAgIHwgTWF0aE1MQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3NcbiAgICB8IE1hdGhNTEVsZW1lbnRUYWdzO1xuXG50eXBlIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8VGFnIGV4dGVuZHMgQWxsRWxlbWVudFRhZ3M+ID1cbiAgICBUYWcgZXh0ZW5kcyBIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MgfCBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyB8IE1hdGhNTENoaWxkcmVubGVzc0VsZW1lbnRUYWdzXG4gICAgICAgID8gKG9wdGlvbnM/OiBFbGVtZW50T3B0aW9ucykgPT4gRWxlZ2FuY2VFbGVtZW50PGZhbHNlPlxuICAgICAgICA6IChvcHRpb25zPzogRWxlbWVudE9wdGlvbnMsIC4uLmNoaWxkcmVuOiBFbGVtZW50Q2hpbGRyZW4pID0+IEVsZWdhbmNlRWxlbWVudDx0cnVlPjtcblxuLyoqIENoZWNrIGlmIGFueSBnaXZlbiB2YWx1ZSBjYW4gYmUgY2xhc3NpZmllZCBhcyBhbiBlbGVtZW50LiAqL1xuZnVuY3Rpb24gaXNBbkVsZW1lbnQodmFsdWU6IGFueSk6IHZhbHVlIGlzIEFueUVsZW1lbnQge1xuICAgIGlmIChcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICAgICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiIHx8IEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IHZhbHVlIGluc3RhbmNlb2YgRWxlZ2FuY2VFbGVtZW50KVxuICAgICkgcmV0dXJuIHRydWU7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKiBSZXByZXNlbnRzIGFuIGVsZW1lbnQgdGhhdCBoYXMgYmVlbiBjb25zdHJ1Y3RlZCB2aWEgdGhlIHVzZSBvZiBhbiBlbGVtZW50IGNvbnN0cnVjdG9yIHN1Y2ggYXMgaDEoKSAqL1xuY2xhc3MgRWxlZ2FuY2VFbGVtZW50PFxuICAgIENhbkhhdmVDaGlsZHJlbiBleHRlbmRzIGJvb2xlYW4sXG4+IHtcbiAgICByZWFkb25seSB0YWc6IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcDtcbiAgICByZWFkb25seSBvcHRpb25zOiBFbGVtZW50T3B0aW9ucztcblxuICAgIC8qKiBcbiAgICAgKiBUaGUgdW5pcXVlIGtleSBvZiB0aGlzIGVsZW1lbnQuIFxuICAgICAqIFVzZSBnZXRFbGVtZW50S2V5KCkgaW4gZnJvbSB0aGUgY29tcGlsZXIgdG8gcmV0cmlldmUgdGhpcyB2YWx1ZVxuICAgICAqL1xuICAgIGtleT86IHN0cmluZztcblxuICAgIGNoaWxkcmVuOiBDYW5IYXZlQ2hpbGRyZW4gZXh0ZW5kcyB0cnVlXG4gICAgICAgID8gRWxlbWVudENoaWxkcmVuXG4gICAgICAgIDogbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICB0YWc6IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCxcbiAgICAgICAgb3B0aW9uczogRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCA9IHt9LFxuICAgICAgICBjaGlsZHJlbjogRWxlbWVudENoaWxkcmVuIHwgbnVsbCxcbiAgICApIHtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG5cbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuIGFzIENhbkhhdmVDaGlsZHJlbiBleHRlbmRzIHRydWUgPyBFbGVtZW50Q2hpbGRyZW4gOiBudWxsO1xuXG4gICAgICAgIGlmIChpc0FuRWxlbWVudChvcHRpb25zKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FuSGF2ZUNoaWxkcmVuKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBlbGVtZW50OlwiLCB0aGlzLCBcImlzIGFuIGludmFsaWQgZWxlbWVudC4gUmVhc29uOlwiKVxuICAgICAgICAgICAgICAgIHRocm93IFwiVGhlIG9wdGlvbnMgb2YgYW4gZWxlbWVudCBtYXkgbm90IGJlIGFuIGVsZW1lbnQsIGlmIHRoZSBlbGVtZW50IGNhbm5vdCBoYXZlIGNoaWxkcmVuLlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQob3B0aW9ucylcblxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIGFzIEVsZW1lbnRPcHRpb25zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FuSGF2ZUNoaWxkcmVuKCk6IHRoaXMgaXMgRWxlZ2FuY2VFbGVtZW50PHRydWU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4gIT09IG51bGw7XG4gICAgfVxufVxuXG5cbmV4cG9ydCB7XG4gICAgRWxlZ2FuY2VFbGVtZW50LFxuXG4gICAgU3BlY2lhbEVsZW1lbnRPcHRpb24sXG5cbiAgICBpc0FuRWxlbWVudCxcbn1cblxuZXhwb3J0IHR5cGUge1xuICAgIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXIsXG4gICAgXG4gICAgQW55RWxlbWVudCxcbiAgICBFbGVtZW50Q2hpbGRyZW4sXG4gICAgXG4gICAgQWxsRWxlbWVudFRhZ3MsXG4gICAgSHRtbEVsZW1lbnRUYWdzLFxuICAgIEh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcbiAgICBTdmdFbGVtZW50VGFncyxcbiAgICBTdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcbiAgICBNYXRoTUxFbGVtZW50VGFncyxcbiAgICBNYXRoTUxDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcblxuICAgIEVsZW1lbnRPcHRpb25zLFxuICAgIFByb2Nlc3NTcGVjaWFsRWxlbWVudE9wdGlvbixcbiAgICBFbGVtZW50T3B0aW9uc09yQ2hpbGRFbGVtZW50LFxufSIsICJpbXBvcnQge1xuICAgIEh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncyxcbiAgICBIdG1sRWxlbWVudFRhZ3MsXG4gICAgU3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG4gICAgU3ZnRWxlbWVudFRhZ3MsXG4gICAgTWF0aE1MQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MsXG4gICAgTWF0aE1MRWxlbWVudFRhZ3MsXG4gICAgRWxlZ2FuY2VFbGVtZW50LFxuICAgIEVsZWdhbmNlRWxlbWVudEJ1aWxkZXIsXG4gICAgRWxlbWVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRPcHRpb25zLFxuICAgIEFsbEVsZW1lbnRUYWdzLFxuICAgIEVsZW1lbnRPcHRpb25zT3JDaGlsZEVsZW1lbnQsXG59IGZyb20gXCIuL2VsZW1lbnRcIjtcblxuY29uc3QgaHRtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzOiBBcnJheTxIdG1sQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwiYXJlYVwiLCBcImJhc2VcIiwgXCJiclwiLCBcImNvbFwiLCBcImVtYmVkXCIsIFwiaHJcIiwgXCJpbWdcIiwgXCJpbnB1dFwiLFxuICAgIFwibGlua1wiLCBcIm1ldGFcIiwgXCJwYXJhbVwiLCBcInNvdXJjZVwiLCBcInRyYWNrXCIsIFwid2JyXCIsXG5dO1xuXG5jb25zdCBodG1sRWxlbWVudFRhZ3M6IEFycmF5PEh0bWxFbGVtZW50VGFncz4gPSBbXG4gICAgXCJhXCIsIFwiYWJiclwiLCBcImFkZHJlc3NcIiwgXCJhcnRpY2xlXCIsIFwiYXNpZGVcIiwgXCJhdWRpb1wiLCBcImJcIiwgXCJiZGlcIiwgXCJiZG9cIixcbiAgICBcImJsb2NrcXVvdGVcIiwgXCJib2R5XCIsIFwiYnV0dG9uXCIsIFwiY2FudmFzXCIsIFwiY2FwdGlvblwiLCBcImNpdGVcIiwgXCJjb2RlXCIsXG4gICAgXCJjb2xncm91cFwiLCBcImRhdGFcIiwgXCJkYXRhbGlzdFwiLCBcImRkXCIsIFwiZGVsXCIsIFwiZGV0YWlsc1wiLCBcImRmblwiLCBcImRpYWxvZ1wiLFxuICAgIFwiZGl2XCIsIFwiZGxcIiwgXCJkdFwiLCBcImVtXCIsIFwiZmllbGRzZXRcIiwgXCJmaWdjYXB0aW9uXCIsIFwiZmlndXJlXCIsIFwiZm9vdGVyXCIsXG4gICAgXCJmb3JtXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwiaGVhZFwiLCBcImhlYWRlclwiLCBcImhncm91cFwiLFxuICAgIFwiaHRtbFwiLCBcImlcIiwgXCJpZnJhbWVcIiwgXCJpbnNcIiwgXCJrYmRcIiwgXCJsYWJlbFwiLCBcImxlZ2VuZFwiLCBcImxpXCIsIFwibWFpblwiLFxuICAgIFwibWFwXCIsIFwibWFya1wiLCBcIm1lbnVcIiwgXCJtZXRlclwiLCBcIm5hdlwiLCBcIm5vc2NyaXB0XCIsIFwib2JqZWN0XCIsIFwib2xcIixcbiAgICBcIm9wdGdyb3VwXCIsIFwib3B0aW9uXCIsIFwib3V0cHV0XCIsIFwicFwiLCBcInBpY3R1cmVcIiwgXCJwcmVcIiwgXCJwcm9ncmVzc1wiLFxuICAgIFwicVwiLCBcInJwXCIsIFwicnRcIiwgXCJydWJ5XCIsIFwic1wiLCBcInNhbXBcIiwgXCJzY3JpcHRcIiwgXCJzZWFyY2hcIiwgXCJzZWN0aW9uXCIsXG4gICAgXCJzZWxlY3RcIiwgXCJzbG90XCIsIFwic21hbGxcIiwgXCJzcGFuXCIsIFwic3Ryb25nXCIsIFwic3R5bGVcIiwgXCJzdWJcIiwgXCJzdW1tYXJ5XCIsXG4gICAgXCJzdXBcIiwgXCJ0YWJsZVwiLCBcInRib2R5XCIsIFwidGRcIiwgXCJ0ZW1wbGF0ZVwiLCBcInRleHRhcmVhXCIsIFwidGZvb3RcIiwgXCJ0aFwiLFxuICAgIFwidGhlYWRcIiwgXCJ0aW1lXCIsIFwidGl0bGVcIiwgXCJ0clwiLCBcInVcIiwgXCJ1bFwiLCBcInZhclwiLCBcInZpZGVvXCIsXG5dO1xuXG5jb25zdCBzdmdDaGlsZHJlbmxlc3NFbGVtZW50VGFnczogQXJyYXk8U3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwicGF0aFwiLCBcImNpcmNsZVwiLCBcImVsbGlwc2VcIiwgXCJsaW5lXCIsIFwicG9seWdvblwiLCBcInBvbHlsaW5lXCIsIFwic3RvcFwiLFxuXTtcblxuY29uc3Qgc3ZnRWxlbWVudFRhZ3M6IEFycmF5PFN2Z0VsZW1lbnRUYWdzPiA9IFtcbiAgICBcInN2Z1wiLCBcImdcIiwgXCJ0ZXh0XCIsIFwidHNwYW5cIiwgXCJ0ZXh0UGF0aFwiLCBcImRlZnNcIiwgXCJzeW1ib2xcIiwgXCJ1c2VcIixcbiAgICBcImltYWdlXCIsIFwiY2xpcFBhdGhcIiwgXCJtYXNrXCIsIFwicGF0dGVyblwiLCBcImxpbmVhckdyYWRpZW50XCIsIFwicmFkaWFsR3JhZGllbnRcIixcbiAgICBcImZpbHRlclwiLCBcIm1hcmtlclwiLCBcInZpZXdcIixcbiAgICBcImZlQmxlbmRcIiwgXCJmZUNvbG9yTWF0cml4XCIsIFwiZmVDb21wb25lbnRUcmFuc2ZlclwiLCBcImZlQ29tcG9zaXRlXCIsXG4gICAgXCJmZUNvbnZvbHZlTWF0cml4XCIsIFwiZmVEaWZmdXNlTGlnaHRpbmdcIiwgXCJmZURpc3BsYWNlbWVudE1hcFwiLCBcImZlRGlzdGFudExpZ2h0XCIsXG4gICAgXCJmZUZsb29kXCIsIFwiZmVGdW5jQVwiLCBcImZlRnVuY0JcIiwgXCJmZUZ1bmNHXCIsIFwiZmVGdW5jUlwiLCBcImZlR2F1c3NpYW5CbHVyXCIsXG4gICAgXCJmZUltYWdlXCIsIFwiZmVNZXJnZVwiLCBcImZlTWVyZ2VOb2RlXCIsIFwiZmVNb3JwaG9sb2d5XCIsIFwiZmVPZmZzZXRcIixcbiAgICBcImZlUG9pbnRMaWdodFwiLCBcImZlU3BlY3VsYXJMaWdodGluZ1wiLCBcImZlU3BvdExpZ2h0XCIsIFwiZmVUaWxlXCIsIFwiZmVUdXJidWxlbmNlXCIsXG5dO1xuXG5jb25zdCBtYXRobWxDaGlsZHJlbmxlc3NFbGVtZW50VGFnczogQXJyYXk8TWF0aE1MQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwibWlcIiwgXCJtblwiLCBcIm1vXCIsXG5dO1xuXG5jb25zdCBtYXRobWxFbGVtZW50VGFnczogQXJyYXk8TWF0aE1MRWxlbWVudFRhZ3M+ID0gW1xuICAgIFwibWF0aFwiLCBcIm1zXCIsIFwibXRleHRcIiwgXCJtcm93XCIsIFwibWZlbmNlZFwiLCBcIm1zdXBcIiwgXCJtc3ViXCIsIFwibXN1YnN1cFwiLFxuICAgIFwibWZyYWNcIiwgXCJtc3FydFwiLCBcIm1yb290XCIsIFwibXRhYmxlXCIsIFwibXRyXCIsIFwibXRkXCIsIFwibXN0eWxlXCIsXG4gICAgXCJtZW5jbG9zZVwiLCBcIm1tdWx0aXNjcmlwdHNcIixcbl07XG5cbmNvbnN0IGVsZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPGFueT4+ID0ge307XG5jb25zdCBjaGlsZHJlbmxlc3NFbGVtZW50czogUmVjb3JkPHN0cmluZywgRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxhbnk+PiA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QnVpbGRlcjxUYWcgZXh0ZW5kcyBBbGxFbGVtZW50VGFncz4oXG4gICAgdGFnOiBUYWdcbik6IEVsZWdhbmNlRWxlbWVudEJ1aWxkZXI8VGFnPiB7XG4gICAgcmV0dXJuICgob3B0aW9uczogRWxlbWVudE9wdGlvbnNPckNoaWxkRWxlbWVudCwgLi4uY2hpbGRyZW46IEVsZW1lbnRDaGlsZHJlbikgPT4gXG4gICAgICAgIG5ldyBFbGVnYW5jZUVsZW1lbnQodGFnIGFzIGFueSwgb3B0aW9ucywgY2hpbGRyZW4pKSBhcyBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPFRhZz47XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyPFRhZyBleHRlbmRzIEFsbEVsZW1lbnRUYWdzPihcbiAgICB0YWc6IFRhZ1xuKTogRWxlZ2FuY2VFbGVtZW50QnVpbGRlcjxUYWc+IHtcbiAgICByZXR1cm4gKChvcHRpb25zOiBFbGVtZW50T3B0aW9uc09yQ2hpbGRFbGVtZW50KSA9PlxuICAgICAgICBuZXcgRWxlZ2FuY2VFbGVtZW50KHRhZyBhcyBhbnksIG9wdGlvbnMsIG51bGwpKSBhcyBFbGVnYW5jZUVsZW1lbnRCdWlsZGVyPFRhZz47XG59XG5cbmZvciAoY29uc3QgdGFnIG9mIGh0bWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBzdmdFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5mb3IgKGNvbnN0IHRhZyBvZiBtYXRobWxFbGVtZW50VGFncykgZWxlbWVudHNbdGFnXSA9IGNyZWF0ZUVsZW1lbnRCdWlsZGVyKHRhZyk7XG5cbmZvciAoY29uc3QgdGFnIG9mIGh0bWxDaGlsZHJlbmxlc3NFbGVtZW50VGFncylcbiAgICBjaGlsZHJlbmxlc3NFbGVtZW50c1t0YWddID0gY3JlYXRlQ2hpbGRyZW5sZXNzRWxlbWVudEJ1aWxkZXIodGFnKTtcblxuZm9yIChjb25zdCB0YWcgb2Ygc3ZnQ2hpbGRyZW5sZXNzRWxlbWVudFRhZ3MpXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHNbdGFnXSA9IGNyZWF0ZUNoaWxkcmVubGVzc0VsZW1lbnRCdWlsZGVyKHRhZyk7XG5cbmZvciAoY29uc3QgdGFnIG9mIG1hdGhtbENoaWxkcmVubGVzc0VsZW1lbnRUYWdzKVxuICAgIGNoaWxkcmVubGVzc0VsZW1lbnRzW3RhZ10gPSBjcmVhdGVDaGlsZHJlbmxlc3NFbGVtZW50QnVpbGRlcih0YWcpO1xuXG5jb25zdCBhbGxFbGVtZW50cyA9IHtcbiAgICAuLi5lbGVtZW50cyxcbiAgICAuLi5jaGlsZHJlbmxlc3NFbGVtZW50cyxcbn07XG5cbmV4cG9ydCB7XG4gICAgZWxlbWVudHMsXG4gICAgY2hpbGRyZW5sZXNzRWxlbWVudHMsXG4gICAgYWxsRWxlbWVudHMsXG59O1xuIiwgIlxuaW1wb3J0IHR5cGUgeyBFdmVudExpc3RlbmVyLCBFdmVudExpc3RlbmVyQ2FsbGJhY2ssIEV2ZW50TGlzdGVuZXJPcHRpb24gfSBmcm9tIFwiLi9ldmVudExpc3RlbmVyXCI7XG5pbXBvcnQgdHlwZSB7IExvYWRIb29rQ2xlYW51cEZ1bmN0aW9uLCBMb2FkSG9vayB9IGZyb20gXCIuL2xvYWRIb29rXCI7XG5pbXBvcnQgdHlwZSB7IE9ic2VydmVyQ2FsbGJhY2ssIFNlcnZlck9ic2VydmVyIH0gZnJvbSBcIi4vb2JzZXJ2ZXJcIjtcbmltcG9ydCB0eXBlIHsgU2VydmVyU3ViamVjdCB9IGZyb20gXCIuL3N0YXRlXCI7XG5cbmltcG9ydCB7IGFsbEVsZW1lbnRzIH0gZnJvbSBcIi4uL2VsZW1lbnRzL2VsZW1lbnRfbGlzdFwiO1xuaW1wb3J0IHR5cGUgeyBBbnlFbGVtZW50LCB9IGZyb20gXCIuLi9lbGVtZW50cy9lbGVtZW50XCI7XG5pbXBvcnQgeyBTcGVjaWFsRWxlbWVudE9wdGlvbiwgRWxlZ2FuY2VFbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL2VsZW1lbnRcIjtcblxuT2JqZWN0LmFzc2lnbih3aW5kb3csIGFsbEVsZW1lbnRzKTtcblxuLy8gdGhlc2UgYXJlIGJvdGggZGVmaW5lZCBpbiB0aGUgYnVpbGQgb2YgdGhpcyBpbiB0aGUgZXNidWlsZCBidWlsZCBjYWxsXG5kZWNsYXJlIGxldCBERVZfQlVJTEQ6IGJvb2xlYW47XG5kZWNsYXJlIGxldCBQUk9EX0JVSUxEOiBib29sZWFuO1xuXG5pbnRlcmZhY2UgU2VyaWFsaXphdGlvblJlc3VsdCB7XG4gIHJvb3Q6IE5vZGU7XG4gIHNwZWNpYWxFbGVtZW50T3B0aW9uczogeyBlbGVtZW50S2V5OiBzdHJpbmcsIG9wdGlvbk5hbWU6IHN0cmluZywgb3B0aW9uVmFsdWU6IFNwZWNpYWxFbGVtZW50T3B0aW9uIH1bXTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSFRNTEVsZW1lbnRGcm9tRWxlZ2FuY2VFbGVtZW50KFxuICAgIGVsZW1lbnQ6IEVsZWdhbmNlRWxlbWVudDxhbnk+LFxuKTogU2VyaWFsaXphdGlvblJlc3VsdCB7XG4gICAgbGV0IHNwZWNpYWxFbGVtZW50T3B0aW9uczogeyBlbGVtZW50S2V5OiBzdHJpbmcsIG9wdGlvbk5hbWU6IHN0cmluZywgb3B0aW9uVmFsdWU6IFNwZWNpYWxFbGVtZW50T3B0aW9uIH1bXSA9IFtdO1xuICAgIGNvbnN0IGRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQudGFnKTtcblxuICAgIC8vIFByb2Nlc3Mgb3B0aW9ucy5cbiAgICB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlbGVtZW50Lm9wdGlvbnMpO1xuICAgICAgICBmb3IgKGNvbnN0IFtvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlIGluc3RhbmNlb2YgU3BlY2lhbEVsZW1lbnRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZS5tdXRhdGUoZWxlbWVudCwgb3B0aW9uTmFtZSk7XG4gICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRLZXkgPSAoTWF0aC5yYW5kb20oKSAqIDEwMDAwKS50b1N0cmluZygpO1xuICAgICBcbiAgICAgICAgICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCh7IGVsZW1lbnRLZXksIG9wdGlvbk5hbWUsIG9wdGlvblZhbHVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShvcHRpb25OYW1lLCBgJHtvcHRpb25WYWx1ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50LmtleSkge1xuICAgICAgICBkb21FbGVtZW50LnNldEF0dHJpYnV0ZShcImtleVwiLCBlbGVtZW50LmtleSk7XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBjaGlsZHJlbi5cbiAgICB7XG4gICAgICAgIGlmIChlbGVtZW50LmNoaWxkcmVuICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjcmVhdGVIVE1MRWxlbWVudEZyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgXG4gICAgICAgICAgICAgICAgZG9tRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgICAgICAgc3BlY2lhbEVsZW1lbnRPcHRpb25zLnB1c2goLi4ucmVzdWx0LnNwZWNpYWxFbGVtZW50T3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgcmV0dXJuIHsgcm9vdDogZG9tRWxlbWVudCwgc3BlY2lhbEVsZW1lbnRPcHRpb25zIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoXG4gICAgZWxlbWVudDogQW55RWxlbWVudCxcbik6IFNlcmlhbGl6YXRpb25SZXN1bHQge1xuICAgIGxldCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IHsgZWxlbWVudEtleTogc3RyaW5nLCBvcHRpb25OYW1lOiBzdHJpbmcsIG9wdGlvblZhbHVlOiBTcGVjaWFsRWxlbWVudE9wdGlvbiB9W10gPSBbXTtcblxuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQgfHwgZWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBhbmQgbnVsbCBhcmUgbm90IGFsbG93ZWQgYXMgZWxlbWVudHMuYCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlb2YgZWxlbWVudCkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJFbGVtZW50IG9mIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQoc3ViRWxlbWVudCk7XG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyZXN1bHQucm9vdCk7XG4gICAgICAgICAgICBzcGVjaWFsRWxlbWVudE9wdGlvbnMucHVzaCguLi5yZXN1bHQuc3BlY2lhbEVsZW1lbnRPcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHJvb3Q6IGZyYWdtZW50LCBzcGVjaWFsRWxlbWVudE9wdGlvbnMgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEVsZWdhbmNlRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZWdhbmNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBlbGVtZW50IGlzIGFuIGFyYml0cmFyeSBvYmplY3QsIGFuZCBhcmJpdHJhcnkgb2JqZWN0cyBhcmUgbm90IHZhbGlkIGNoaWxkcmVuLiBQbGVhc2UgbWFrZSBzdXJlIGFsbCBlbGVtZW50cyBhcmUgb25lIG9mOiBFbGVnYW5jZUVsZW1lbnQsIGJvb2xlYW4sIG51bWJlciwgc3RyaW5nIG9yIEFycmF5LmApO1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiID8gZWxlbWVudCA6IGVsZW1lbnQudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgXG4gICAgICAgIHJldHVybiB7IHJvb3Q6IHRleHROb2RlLCBzcGVjaWFsRWxlbWVudE9wdGlvbnM6IFtdIH07XG4gICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdHlwZW9mIG9mIHRoaXMgZWxlbWVudCBpcyBub3Qgb25lIG9mIEVsZWdhbmNlRWxlbWVudCwgYm9vbGVhbiwgbnVtYmVyLCBzdHJpbmcgb3IgQXJyYXkuIFBsZWFzZSBjb252ZXJ0IGl0IGludG8gb25lIG9mIHRoZXNlIHR5cGVzLmApO1xuICAgIH1cbn1cblxudHlwZSBDbGllbnRTdWJqZWN0T2JzZXJ2ZXI8VD4gPSAobmV3VmFsdWU6IFQpID0+IHZvaWQ7XG5cbkRFVl9CVUlMRCAmJiAoKCkgPT4ge1xuICAgIGxldCBpc0Vycm9yZWQgPSBmYWxzZTtcblxuICAgIChmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgICAgICBjb25zdCBlcyA9IG5ldyBFdmVudFNvdXJjZShcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9lbGVnYW5jZS1ob3QtcmVsb2FkXCIpO1xuXG4gICAgICAgIGVzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0Vycm9yZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZXMub25tZXNzYWdlID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhID09PSBcImhvdC1yZWxvYWRcIikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBlcy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgaXNFcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVzLmNsb3NlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY29ubmVjdCwgMTAwMCk7XG4gICAgICAgIH07XG4gICAgfSkoKTtcbn0pKCk7XG5cbi8qKlxuICogQSBTZXJ2ZXJTdWJqZWN0IHRoYXQgaGFzIGJlZW4gc2VyaWFsaXplZCwgc2hpcHBlZCB0byB0aGUgYnJvd3NlciwgYW5kIHJlLWNyZWF0ZWQgYXMgaXQncyBmaW5hbCBmb3JtLlxuICogXG4gKiBTZXR0aW5nIHRoZSBgdmFsdWVgIG9mIHRoaXMgQ2xpZW50U3ViamVjdCB3aWxsIHRyaWdnZXIgaXQncyBvYnNlcnZlcnMgY2FsbGJhY2tzLlxuICogXG4gKiBUbyBsaXN0ZW4gZm9yIGNoYW5nZXMgaW4gYHZhbHVlYCwgeW91IG1heSBjYWxsIHRoZSBgb2JzZXJ2ZSgpYCBtZXRob2QuXG4gKi9cbmNsYXNzIENsaWVudFN1YmplY3Q8VD4ge1xuICAgIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfdmFsdWU6IFQ7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IG9ic2VydmVyczogTWFwPHN0cmluZywgQ2xpZW50U3ViamVjdE9ic2VydmVyPFQ+PiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHZhbHVlOiBUKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUobmV3VmFsdWU6IFQpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcblxuICAgICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIHRoaXMub2JzZXJ2ZXJzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBvYnNlcnZlcihuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYW51YWxseSB0cmlnZ2VyIGVhY2ggb2YgdGhpcyBzdWJqZWN0J3Mgb2JzZXJ2ZXJzLCB3aXRoIHRoZSBzdWJqZWN0J3MgY3VycmVudCB2YWx1ZS5cbiAgICAgKiBcbiAgICAgKiBVc2VmdWwgaWYgeW91J3JlIG11dGF0aW5nIGZvciBleGFtcGxlIGZpZWxkcyBvZiBhbiBvYmplY3QsIG9yIHB1c2hpbmcgdG8gYW4gYXJyYXkuXG4gICAgICovXG4gICAgdHJpZ2dlck9ic2VydmVycygpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYnNlcnZlciBvZiB0aGlzLm9ic2VydmVycy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIodGhpcy5fdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IG9ic2VydmVyIHRvIHRoaXMgc3ViamVjdCwgYGNhbGxiYWNrYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIHNldHRlciBpcyBjYWxsZWQgb24gdGhpcyBzdWJqZWN0LlxuICAgICAqIFxuICAgICAqIE5vdGU6IGlmIGFuIElEIGlzIGFscmVhZHkgaW4gdXNlIGl0J3MgY2FsbGJhY2sgd2lsbCBqdXN0IGJlIG92ZXJ3cml0dGVuIHdpdGggd2hhdGV2ZXIgeW91IGdpdmUgaXQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGlkIFRoZSB1bmlxdWUgaWQgb2YgdGhpcyBvYnNlcnZlclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBDYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoaXMgc3ViamVjdCBjaGFuZ2VzLlxuICAgICAqL1xuICAgIG9ic2VydmUoaWQ6IHN0cmluZywgY2FsbGJhY2s6IChuZXdWYWx1ZTogVCkgPT4gdm9pZCkge1xuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcnMuaGFzKGlkKSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzLnNldChpZCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbiBvYnNlcnZlciBmcm9tIHRoaXMgc3ViamVjdC5cbiAgICAgKiBAcGFyYW0gaWQgVGhlIHVuaXF1ZSBpZCBvZiB0aGUgb2JzZXJ2ZXIuXG4gICAgICovXG4gICAgdW5vYnNlcnZlKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMuZGVsZXRlKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFN0YXRlTWFuYWdlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzdWJqZWN0czogTWFwPHN0cmluZywgQ2xpZW50U3ViamVjdDxhbnk+PiA9IG5ldyBNYXAoKVxuXG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgbG9hZFZhbHVlcyh2YWx1ZXM6IFNlcnZlclN1YmplY3Q8YW55PltdLCBkb092ZXJ3cml0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdWJqZWN0cy5oYXModmFsdWUuaWQpICYmIGRvT3ZlcndyaXRlID09PSBmYWxzZSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFN1YmplY3QgPSBuZXcgQ2xpZW50U3ViamVjdCh2YWx1ZS5pZCwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5zdWJqZWN0cy5zZXQodmFsdWUuaWQsIGNsaWVudFN1YmplY3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0KGlkOiBzdHJpbmcpOiBDbGllbnRTdWJqZWN0PGFueT4gfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJqZWN0cy5nZXQoaWQpXG4gICAgfVxuXG4gICAgZ2V0QWxsKGlkczogc3RyaW5nW10pOiBBcnJheTxDbGllbnRTdWJqZWN0PGFueT4+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogQXJyYXk8Q2xpZW50U3ViamVjdDxhbnk+PiA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgaWRzKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5nZXQoaWQpISk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbn1cblxuXG50eXBlIENsaWVudEV2ZW50TGlzdGVuZXJPcHRpb24gPSB7XG4gICAgLyoqIFRoZSBodG1sIGF0dHJpYnV0ZSBuYW1lIHRoaXMgb3B0aW9uIHNob3VsZCBiZSBhdHRhY2hlZCB0byAqL1xuICAgIG9wdGlvbjogc3RyaW5nLFxuICAgIC8qKiBUaGUga2V5IG9mIHRoZSBlbGVtZW50IHRoaXMgb3B0aW9uIHNob3VsZCBiZSBhdHRhY2hlZCB0by4gKi9cbiAgICBrZXk6IHN0cmluZyxcbiAgICAvKiogVGhlIGV2ZW50IGxpc3RlbmVyIGlkIHRoaXMgb3B0aW9uIGlzIHJlZmVyZW5jaW5nLiAqLyBcbiAgICBpZDogc3RyaW5nLFxufVxuXG4vKipcbiAqIEFuIGV2ZW50IGxpc3RlbmVyIGFmdGVyIGl0IGhhcyBiZWVuIGdlbmVyYXRlZCBvbiB0aGUgc2VydmVyLCBwcm9jZXNzZWQgaW50byBwYWdlZGF0YSwgYW5kIHJlY29uc3RydWN0ZWQgb24gdGhlIGNsaWVudC5cbiAqL1xuY2xhc3MgQ2xpZW50RXZlbnRMaXN0ZW5lciB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lckNhbGxiYWNrPGFueT47XG4gICAgZGVwZW5kZW5jaWVzOiBzdHJpbmdbXTtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyQ2FsbGJhY2s8YW55PiwgZGVwZW5jZW5jaWVzOiBzdHJpbmdbXSkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmNlbmNpZXM7XG4gICAgfVxuXG4gICAgY2FsbChldjogRXZlbnQpIHtcbiAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZXYgYXMgYW55LCAuLi5kZXBlbmRlbmNpZXMpO1xuICAgIH1cbn1cblxuY2xhc3MgRXZlbnRMaXN0ZW5lck1hbmFnZXIge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZXZlbnRMaXN0ZW5lcnM6IE1hcDxzdHJpbmcsIENsaWVudEV2ZW50TGlzdGVuZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgbG9hZFZhbHVlcyhzZXJ2ZXJFdmVudExpc3RlbmVyczogRXZlbnRMaXN0ZW5lcjxhbnk+W10sIGRvT3ZlcnJpZGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlcnZlckV2ZW50TGlzdGVuZXIgb2Ygc2VydmVyRXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyhzZXJ2ZXJFdmVudExpc3RlbmVyLmlkKSAmJiBkb092ZXJyaWRlID09PSBmYWxzZSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGNsaWVudEV2ZW50TGlzdGVuZXIgPSBuZXcgQ2xpZW50RXZlbnRMaXN0ZW5lcihzZXJ2ZXJFdmVudExpc3RlbmVyLmlkLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmNhbGxiYWNrLCBzZXJ2ZXJFdmVudExpc3RlbmVyLmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldChjbGllbnRFdmVudExpc3RlbmVyLmlkLCBjbGllbnRFdmVudExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhvb2tDYWxsYmFja3MoZXZlbnRMaXN0ZW5lck9wdGlvbnM6IENsaWVudEV2ZW50TGlzdGVuZXJPcHRpb25bXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50TGlzdGVuZXJPcHRpb24gb2YgZXZlbnRMaXN0ZW5lck9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtldmVudExpc3RlbmVyT3B0aW9uLmtleX1cIl1gKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChcIlBvc3NpYmx5IGNvcnJ1cHRlZCBIVE1MLCBmYWlsZWQgdG8gZmluZCBlbGVtZW50IHdpdGgga2V5IFwiICsgZXZlbnRMaXN0ZW5lck9wdGlvbi5rZXkgKyBcIiBmb3IgZXZlbnQgbGlzdGVuZXIuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXZlbnRMaXN0ZW5lciA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TGlzdGVuZXJPcHRpb24uaWQpO1xuICAgICAgICAgICAgaWYgKCFldmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBFdmVudExpc3RlbmVyT3B0aW9uOiBFdmVudCBsaXN0ZW5lciB3aXRoIGlkIFxcXHUyMDFEXCIgKyBldmVudExpc3RlbmVyT3B0aW9uLmlkICsgXCJcXFwiIGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIChlbGVtZW50IGFzIGFueSlbZXZlbnRMaXN0ZW5lck9wdGlvbi5vcHRpb25dID0gKGV2OiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXIuY2FsbChldik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0KGlkOiBzdHJpbmcpIHsgXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChpZCk7XG4gICAgfVxufVxuXG5cbnR5cGUgQ2xpZW50T2JzZXJ2ZXJPcHRpb24gPSB7XG4gICAgLyoqIFRoZSBodG1sIGF0dHJpYnV0ZSBuYW1lIHRoaXMgb3B0aW9uIHNob3VsZCBiZSBhdHRhY2hlZCB0byAqL1xuICAgIG9wdGlvbjogc3RyaW5nLFxuICAgIC8qKiBUaGUga2V5IG9mIHRoZSBlbGVtZW50IHRoaXMgb3B0aW9uIHNob3VsZCBiZSBhdHRhY2hlZCB0by4gKi9cbiAgICBrZXk6IHN0cmluZyxcbiAgICAvKiogVGhlIGV2ZW50IGxpc3RlbmVyIGlkIHRoaXMgb3B0aW9uIGlzIHJlZmVyZW5jaW5nLiAqLyBcbiAgICBpZDogc3RyaW5nLFxufVxuXG5jbGFzcyBDbGllbnRPYnNlcnZlciB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjYWxsYmFjazogT2JzZXJ2ZXJDYWxsYmFjazxhbnk+O1xuICAgIGRlcGVuZGVuY2llczogc3RyaW5nW107XG4gICAgXG4gICAgc3ViamVjdFZhbHVlczogQ2xpZW50U3ViamVjdDxhbnk+W1widmFsdWVcIl1bXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbGVtZW50czogeyBlbGVtZW50OiBFbGVtZW50LCBvcHRpb25OYW1lOiBzdHJpbmcgfVtdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBjYWxsYmFjazogT2JzZXJ2ZXJDYWxsYmFjazxhbnk+LCBkZXBlbmNlbmNpZXM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcGVuY2VuY2llcztcblxuICAgICAgICBjb25zdCBpbml0aWFsVmFsdWVzID0gc3RhdGVNYW5hZ2VyLmdldEFsbCh0aGlzLmRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBpbml0aWFsVmFsdWUgb2YgaW5pdGlhbFZhbHVlcykge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5zdWJqZWN0VmFsdWVzLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdFZhbHVlcy5wdXNoKGluaXRpYWxWYWx1ZS52YWx1ZSk7XG5cbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZS5vYnNlcnZlKHRoaXMuaWQsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3ViamVjdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFuIGVsZW1lbnQgdG8gdXBkYXRlIHdoZW4gdGhpcyBvYnNlcnZlciB1cGRhdGVzLlxuICAgICAqL1xuICAgIGFkZEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCwgb3B0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaCh7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSk7XG4gICAgfVxuXG4gICAgY2FsbCgpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmNhbGxiYWNrKC4uLnRoaXMuc3ViamVjdFZhbHVlcyk7XG5cbiAgICAgICAgZm9yIChjb25zdCB7IGVsZW1lbnQsIG9wdGlvbk5hbWUgfSBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAoZWxlbWVudCBhcyBhbnkpW29wdGlvbk5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuY2xhc3MgT2JzZXJ2ZXJNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNsaWVudE9ic2VydmVyczogTWFwPHN0cmluZywgQ2xpZW50T2JzZXJ2ZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7fVxuXG4gICAgbG9hZFZhbHVlcyhzZXJ2ZXJPYnNlcnZlcnM6IFNlcnZlck9ic2VydmVyPGFueT5bXSwgZG9PdmVycmlkZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VydmVyT2JzZXJ2ZXIgb2Ygc2VydmVyT2JzZXJ2ZXJzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jbGllbnRPYnNlcnZlcnMuaGFzKHNlcnZlck9ic2VydmVyLmlkKSAmJiBkb092ZXJyaWRlID09PSBmYWxzZSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGNsaWVudE9ic2VydmVyID0gbmV3IENsaWVudE9ic2VydmVyKHNlcnZlck9ic2VydmVyLmlkLCBzZXJ2ZXJPYnNlcnZlci5jYWxsYmFjaywgc2VydmVyT2JzZXJ2ZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50T2JzZXJ2ZXJzLnNldChjbGllbnRPYnNlcnZlci5pZCwgY2xpZW50T2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnM6IENsaWVudE9ic2VydmVyT3B0aW9uW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBvYnNlcnZlck9wdGlvbiBvZiBvYnNlcnZlck9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBba2V5PVwiJHtvYnNlcnZlck9wdGlvbi5rZXl9XCJdYCkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBERVZfQlVJTEQgJiYgZXJyb3JPdXQoXCJQb3NzaWJseSBjb3JydXB0ZWQgSFRNTCwgZmFpbGVkIHRvIGZpbmQgZWxlbWVudCB3aXRoIGtleSBcIiArIG9ic2VydmVyT3B0aW9uLmtleSArIFwiIGZvciBldmVudCBsaXN0ZW5lci5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IHRoaXMuY2xpZW50T2JzZXJ2ZXJzLmdldChvYnNlcnZlck9wdGlvbi5pZCk7XG4gICAgICAgICAgICBpZiAoIW9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgREVWX0JVSUxEICYmIGVycm9yT3V0KFwiSW52YWxpZCBPYnNlcnZlck9wdGlvbjogT2JzZXJ2ZXIgd2l0aCBpZCBcXFx1MjAxRFwiICsgb2JzZXJ2ZXJPcHRpb24uaWQgKyBcIlxcXCIgZG9lcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIuYWRkRWxlbWVudChlbGVtZW50LCBvYnNlcnZlck9wdGlvbi5vcHRpb24pO1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY2FsbCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbnR5cGUgQ2xlYW51cFByb2NlZHVyZSA9IHtcbiAgICBwYXRobmFtZT86IHN0cmluZyxcbiAgICBraW5kOiBMb2FkSG9va0tpbmQsXG4gICAgY2xlYW51cEZ1bmN0aW9uOiBMb2FkSG9va0NsZWFudXBGdW5jdGlvbixcbn07XG5cbmVudW0gTG9hZEhvb2tLaW5kIHtcbiAgICBMQVlPVVRfTE9BREhPT0ssXG4gICAgUEFHRV9MT0FESE9PSyxcbn07XG5cbmNsYXNzIExvYWRIb29rTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBjbGVhbnVwUHJvY2VkdXJlczogQ2xlYW51cFByb2NlZHVyZVtdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBsb2FkVmFsdWVzKGxvYWRIb29rczogTG9hZEhvb2s8YW55PltdKSB7XG4gICAgICAgIGZvciAoY29uc3QgbG9hZEhvb2sgb2YgbG9hZEhvb2tzKSB7XG4gICAgICAgICAgICBjb25zdCBkZXBlbmNlbmNpZXMgPSBzdGF0ZU1hbmFnZXIuZ2V0QWxsKGxvYWRIb29rLmRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXBGdW5jdGlvbiA9IGxvYWRIb29rLmNhbGxiYWNrKC4uLmRlcGVuY2VuY2llcyk7XG4gICAgICAgICAgICBpZiAoY2xlYW51cEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhbnVwUHJvY2VkdXJlcy5wdXNoKHsgXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IGxvYWRIb29rLmtpbmQsXG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXBGdW5jdGlvbjogY2xlYW51cEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBwYXRobmFtZTogbG9hZEhvb2sucGF0aG5hbWUsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGxDbGVhbnVwRnVuY3Rpb25zKCkge1xuICAgICAgICBsZXQgcmVtYWluaW5nUHJvY2VkdXJlczogQ2xlYW51cFByb2NlZHVyZVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBjbGVhbnVwUHJvY2VkdXJlIG9mIHRoaXMuY2xlYW51cFByb2NlZHVyZXMpIHtcbiAgICAgICAgICAgIGlmIChjbGVhbnVwUHJvY2VkdXJlLmtpbmQgPT09IExvYWRIb29rS2luZC5MQVlPVVRfTE9BREhPT0spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0luU2NvcGUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSkuc3RhcnRzV2l0aChjbGVhbnVwUHJvY2VkdXJlLnBhdGhuYW1lISk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNJblNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ1Byb2NlZHVyZXMucHVzaChjbGVhbnVwUHJvY2VkdXJlKTtcblxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsZWFudXBQcm9jZWR1cmUuY2xlYW51cEZ1bmN0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFudXBQcm9jZWR1cmVzID0gcmVtYWluaW5nUHJvY2VkdXJlcztcbiAgICB9XG59XG5cbmNvbnN0IG9ic2VydmVyTWFuYWdlciA9IG5ldyBPYnNlcnZlck1hbmFnZXIoKTtcbmNvbnN0IGV2ZW50TGlzdGVuZXJNYW5hZ2VyID0gbmV3IEV2ZW50TGlzdGVuZXJNYW5hZ2VyKCk7XG5jb25zdCBzdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyKCk7XG5jb25zdCBsb2FkSG9va01hbmFnZXIgPSBuZXcgTG9hZEhvb2tNYW5hZ2VyKCk7XG5cbmNvbnN0IHBhZ2VTdHJpbmdDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5jb25zdCBkb21QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5jb25zdCB4bWxTZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcblxuY29uc3QgZmV0Y2hQYWdlID0gYXN5bmMgKHRhcmdldFVSTDogVVJMKTogUHJvbWlzZTxEb2N1bWVudCB8IHZvaWQ+ID0+IHtcbiAgICBjb25zdCBwYXRobmFtZSA9IHNhbml0aXplUGF0aG5hbWUodGFyZ2V0VVJMLnBhdGhuYW1lKTtcblxuICAgIGlmIChwYWdlU3RyaW5nQ2FjaGUuaGFzKHBhdGhuYW1lKSkge1xuICAgICAgICByZXR1cm4gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwYWdlU3RyaW5nQ2FjaGUuZ2V0KHBhdGhuYW1lKSEsIFwidGV4dC9odG1sXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHRhcmdldFVSTCk7XG5cbiAgICBjb25zdCBuZXdET00gPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGF3YWl0IHJlcy50ZXh0KCksIFwidGV4dC9odG1sXCIpO1xuICAgIFxuICAgIHtcbiAgICAgICAgY29uc3QgZGF0YVNjcmlwdHMgPSBBcnJheS5mcm9tKG5ld0RPTS5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKSBhcyBIVE1MU2NyaXB0RWxlbWVudFtdXG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50U2NyaXB0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbZGF0YS1wYWNrYWdlPVwidHJ1ZVwiXScpKSBhcyBIVE1MU2NyaXB0RWxlbWVudFtdXG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGRhdGFTY3JpcHQgb2YgZGF0YVNjcmlwdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gY3VycmVudFNjcmlwdHMuZmluZChzID0+IHMuc3JjID09PSBkYXRhU2NyaXB0LnNyYyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZGF0YVNjcmlwdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gZ2V0IHBhZ2Ugc2NyaXB0XG4gICAge1xuICAgICAgICBjb25zdCBwYWdlRGF0YVNjcmlwdCA9IG5ld0RPTS5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS1ob29rPVwidHJ1ZVwiXVtkYXRhLXBhdGhuYW1lPVwiJHtwYXRobmFtZX1cIl1gKSBhcyBIVE1MU2NyaXB0RWxlbWVudFxuICAgIFxuICAgICAgICBjb25zdCB0ZXh0ID0gcGFnZURhdGFTY3JpcHQudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgcGFnZURhdGFTY3JpcHQucmVtb3ZlKCk7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdGV4dF0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuXG4gICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICAgIHNjcmlwdC50eXBlID0gXCJtb2R1bGVcIjtcbiAgICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtcGFnZVwiLCBcInRydWVcIik7XG4gICAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXBhdGhuYW1lXCIsIGAke3BhdGhuYW1lfWApO1xuICAgICAgICBcbiAgICAgICAgbmV3RE9NLmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhzY3JpcHQpO1xuICAgIH1cblxuICAgIHBhZ2VTdHJpbmdDYWNoZS5zZXQocGF0aG5hbWUsIHhtbFNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcobmV3RE9NKSk7XG5cbiAgICByZXR1cm4gbmV3RE9NO1xufTtcblxuXG50eXBlIE5hdmlnYXRpb25DYWxsYmFjayA9IChwYXRobmFtZTogc3RyaW5nKSA9PiBhbnk7XG5cbmxldCBuYXZpZ2F0aW9uQ2FsbGJhY2tzOiBOYXZpZ2F0aW9uQ2FsbGJhY2tbXSA9IFtdO1xuXG5mdW5jdGlvbiBvbk5hdmlnYXRlKGNhbGxiYWNrOiBOYXZpZ2F0aW9uQ2FsbGJhY2spIHtcbiAgICBuYXZpZ2F0aW9uQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xufVxuXG5jb25zdCBuYXZpZ2F0ZUxvY2FsbHkgPSBhc3luYyAodGFyZ2V0OiBzdHJpbmcsIHB1c2hTdGF0ZTogYm9vbGVhbiA9IHRydWUpID0+IHtcbiAgICBjb25zdCB0YXJnZXRVUkwgPSBuZXcgVVJMKHRhcmdldCk7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHRhcmdldFVSTC5wYXRobmFtZSk7XG5cbiAgICBsZXQgbmV3UGFnZSA9IGF3YWl0IGZldGNoUGFnZSh0YXJnZXRVUkwpO1xuICAgIGlmICghbmV3UGFnZSkgcmV0dXJuO1xuICAgIFxuICAgIGxldCBvbGRQYWdlTGF0ZXN0ID0gZG9jdW1lbnQuYm9keTtcbiAgICBsZXQgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2UuYm9keTtcbiAgICBcbiAgICB7XG4gICAgICAgIGNvbnN0IG5ld1BhZ2VMYXlvdXRzID0gQXJyYXkuZnJvbShuZXdQYWdlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZW1wbGF0ZVtsYXlvdXQtaWRdXCIpKSBhcyBIVE1MVGVtcGxhdGVFbGVtZW50W107XG4gICAgICAgIGNvbnN0IG9sZFBhZ2VMYXlvdXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGVtcGxhdGVbbGF5b3V0LWlkXVwiKSkgYXMgSFRNTFRlbXBsYXRlRWxlbWVudFtdO1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgc2l6ZSA9IE1hdGgubWluKG5ld1BhZ2VMYXlvdXRzLmxlbmd0aCwgb2xkUGFnZUxheW91dHMubGVuZ3RoKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdQYWdlTGF5b3V0ID0gbmV3UGFnZUxheW91dHNbaV07XG4gICAgICAgICAgICBjb25zdCBvbGRQYWdlTGF5b3V0ID0gb2xkUGFnZUxheW91dHNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IG5ld0xheW91dElkID0gbmV3UGFnZUxheW91dC5nZXRBdHRyaWJ1dGUoXCJsYXlvdXQtaWRcIikhO1xuICAgICAgICAgICAgY29uc3Qgb2xkTGF5b3V0SWQgPSBvbGRQYWdlTGF5b3V0LmdldEF0dHJpYnV0ZShcImxheW91dC1pZFwiKSE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChuZXdMYXlvdXRJZCAhPT0gb2xkTGF5b3V0SWQpIHtcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvbGRQYWdlTGF0ZXN0ID0gb2xkUGFnZUxheW91dC5uZXh0RWxlbWVudFNpYmxpbmchIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgbmV3UGFnZUxhdGVzdCA9IG5ld1BhZ2VMYXlvdXQubmV4dEVsZW1lbnRTaWJsaW5nISBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZyhvbGRQYWdlTGF0ZXN0LCBuZXdQYWdlTGF0ZXN0KVxuICAgIG9sZFBhZ2VMYXRlc3QucmVwbGFjZVdpdGgobmV3UGFnZUxhdGVzdCk7XG4gICAgXG4gICAgLy8gR3JhY2VmdWxseSByZXBsYWNlIGhlYWQuXG4gICAgLy8gZG9jdW1lbnQuaGVhZC5yZXBsYWNlV2l0aCgpOyBjYXVzZXMgRk9VQyBvbiBDaHJvbWl1bSBicm93c2Vycy5cbiAgICB7ICAgXG4gICAgICAgIGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcihcInRpdGxlXCIpPy5yZXBsYWNlV2l0aChcbiAgICAgICAgICAgIG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yKFwidGl0bGVcIikgPz8gXCJcIlxuICAgICAgICApXG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGUgPSAodGFyZ2V0TGlzdDogSFRNTEVsZW1lbnRbXSwgbWF0Y2hBZ2FpbnN0OiBIVE1MRWxlbWVudFtdLCBhY3Rpb246IChub2RlOiBIVE1MRWxlbWVudCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YXJnZXQgb2YgdGFyZ2V0TGlzdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nID0gbWF0Y2hBZ2FpbnN0LmZpbmQobiA9PiBuLmlzRXF1YWxOb2RlKHRhcmdldCkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGluZykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYWN0aW9uKHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBhZGQgbmV3IHRhZ3MgYW5kIHJlb212ZSBvbGQgb25lc1xuICAgICAgICBjb25zdCBvbGRUYWdzID0gQXJyYXkuZnJvbShbXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChcImxpbmtcIikpLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJtZXRhXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20oZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwiYmFzZVwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChcInN0eWxlXCIpKSxcbiAgICAgICAgXSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdUYWdzID0gQXJyYXkuZnJvbShbXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibGlua1wiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwibWV0YVwiKSksXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKG5ld1BhZ2UuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKFwic2NyaXB0XCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20obmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJiYXNlXCIpKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20obmV3UGFnZS5oZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzdHlsZVwiKSksXG4gICAgICAgIF0pO1xuICAgICAgICBcbiAgICAgICAgdXBkYXRlKG5ld1RhZ3MsIG9sZFRhZ3MsIChub2RlKSA9PiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICAgICAgdXBkYXRlKG9sZFRhZ3MsIG5ld1RhZ3MsIChub2RlKSA9PiBub2RlLnJlbW92ZSgpKTtcbiAgICB9XG5cbiAgICBpZiAocHVzaFN0YXRlKSBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCB0YXJnZXRVUkwuaHJlZik7IFxuICAgIFxuICAgIGxvYWRIb29rTWFuYWdlci5jYWxsQ2xlYW51cEZ1bmN0aW9ucygpO1xuXG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIG5hdmlnYXRpb25DYWxsYmFja3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBhdGhuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5hdmlnYXRpb25DYWxsYmFja3MgPSBbXTtcbiAgICB9XG5cbiAgICBhd2FpdCBsb2FkUGFnZSgpO1xuXG4gICAgaWYgKHRhcmdldFVSTC5oYXNoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldFVSTC5oYXNoLnNsaWNlKDEpKT8uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG59O1xuXG4vKiogVGFrZSBhbnkgZGlyZWN0b3J5IHBhdGhuYW1lLCBhbmQgbWFrZSBpdCBpbnRvIHRoaXMgZm9ybWF0OiAvcGF0aCAqL1xuZnVuY3Rpb24gc2FuaXRpemVQYXRobmFtZShwYXRobmFtZTogc3RyaW5nID0gXCJcIik6IHN0cmluZyB7XG4gICAgaWYgKCFwYXRobmFtZSkgcmV0dXJuIFwiL1wiO1xuXG4gICAgcGF0aG5hbWUgPSBcIi9cIiArIHBhdGhuYW1lO1xuICAgIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKy9nLCBcIi9cIik7XG5cbiAgICBpZiAocGF0aG5hbWUubGVuZ3RoID4gMSAmJiBwYXRobmFtZS5lbmRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgcGF0aG5hbWUgPSBwYXRobmFtZS5zbGljZSgwLCAtMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhuYW1lO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRQYWdlRGF0YShwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgLyoqIEZpbmQgdGhlIGNvcnJlY3Qgc2NyaXB0IHRhZyBpbiBoZWFkLiAqL1xuICAgIGNvbnN0IGRhdGFTY3JpcHRUYWcgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApIGFzIEhUTUxTY3JpcHRFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoIWRhdGFTY3JpcHRUYWcpIHtcbiAgICAgICAgREVWX0JVSUxEICYmIChcIkZhaWxlZCB0byBmaW5kIHNjcmlwdCB0YWcgZm9yIHF1ZXJ5OlwiICsgYHNjcmlwdFtkYXRhLXBhZ2U9XCJ0cnVlXCJdW2RhdGEtcGF0aG5hbWU9XCIke3BhdGhuYW1lfVwiXWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBpbXBvcnQoZGF0YVNjcmlwdFRhZy5zcmMpO1xuXG4gICAgY29uc3QgeyBcbiAgICAgICAgc3ViamVjdHMsIFxuICAgICAgICBldmVudExpc3RlbmVycywgXG4gICAgICAgIGV2ZW50TGlzdGVuZXJPcHRpb25zLCBcbiAgICAgICAgb2JzZXJ2ZXJzLCBcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zXG4gICAgfSA9IGRhdGE7XG5cbiAgICBpZiAoIWV2ZW50TGlzdGVuZXJPcHRpb25zIHx8ICFldmVudExpc3RlbmVycyB8fCAhb2JzZXJ2ZXJzIHx8ICFzdWJqZWN0cyB8fCAhb2JzZXJ2ZXJPcHRpb25zKSB7XG4gICAgICAgIERFVl9CVUlMRCAmJiBlcnJvck91dChgUG9zc2libHkgbWFsZm9ybWVkIHBhZ2UgZGF0YSAke2RhdGF9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZXJyb3JPdXQobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufSBcblxuYXN5bmMgZnVuY3Rpb24gbG9hZFBhZ2UoKSB7XG4gICAgd2luZG93Lm9ucG9wc3RhdGUgPSBhc3luYyAoZXZlbnQ6IFBvcFN0YXRlRXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgV2luZG93O1xuXG4gICAgICAgIGF3YWl0IG5hdmlnYXRlTG9jYWxseSh0YXJnZXQubG9jYXRpb24uaHJlZiwgZmFsc2UpO1xuXG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIHRhcmdldC5sb2NhdGlvbi5ocmVmKTtcbiAgICB9O1xuXG4gICAgY29uc3QgcGF0aG5hbWUgPSBzYW5pdGl6ZVBhdGhuYW1lKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG5cbiAgICBjb25zdCBwYWdlRGF0YSA9IGF3YWl0IGdldFBhZ2VEYXRhKHBhdGhuYW1lKTtcblxuICAgIGNvbnN0IHsgXG4gICAgICAgIHN1YmplY3RzLCBcbiAgICAgICAgZXZlbnRMaXN0ZW5lck9wdGlvbnMsIFxuICAgICAgICBldmVudExpc3RlbmVycyxcbiAgICAgICAgb2JzZXJ2ZXJzLFxuICAgICAgICBvYnNlcnZlck9wdGlvbnMsXG4gICAgICAgIGxvYWRIb29rc1xuICAgIH0gPSBwYWdlRGF0YTtcblxuICAgIERFVl9CVUlMRDoge1xuICAgICAgICBnbG9iYWxUaGlzLmRldnRvb2xzID0ge1xuICAgICAgICAgICAgcGFnZURhdGEsXG4gICAgICAgICAgICBzdGF0ZU1hbmFnZXIsXG4gICAgICAgICAgICBldmVudExpc3RlbmVyTWFuYWdlcixcbiAgICAgICAgICAgIG9ic2VydmVyTWFuYWdlcixcbiAgICAgICAgICAgIGxvYWRIb29rTWFuYWdlcixcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdsb2JhbFRoaXMuZWxlZ2FuY2VDbGllbnQgPSB7XG4gICAgICAgIGNyZWF0ZUhUTUxFbGVtZW50RnJvbUVsZW1lbnQsXG4gICAgICAgIGZldGNoUGFnZSxcbiAgICAgICAgbmF2aWdhdGVMb2NhbGx5LFxuICAgICAgICBvbk5hdmlnYXRlLFxuICAgIH1cblxuICAgIHN0YXRlTWFuYWdlci5sb2FkVmFsdWVzKHN1YmplY3RzKTtcblxuICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmxvYWRWYWx1ZXMoZXZlbnRMaXN0ZW5lcnMpO1xuICAgIGV2ZW50TGlzdGVuZXJNYW5hZ2VyLmhvb2tDYWxsYmFja3MoZXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuXG4gICAgb2JzZXJ2ZXJNYW5hZ2VyLmxvYWRWYWx1ZXMob2JzZXJ2ZXJzKTtcbiAgICBvYnNlcnZlck1hbmFnZXIuaG9va0NhbGxiYWNrcyhvYnNlcnZlck9wdGlvbnMpO1xuXG4gICAgbG9hZEhvb2tNYW5hZ2VyLmxvYWRWYWx1ZXMobG9hZEhvb2tzKTtcbn1cblxubG9hZFBhZ2UoKTtcblxuZXhwb3J0IHtcbiAgICBDbGllbnRTdWJqZWN0LFxuICAgIFN0YXRlTWFuYWdlcixcbiAgICBPYnNlcnZlck1hbmFnZXIsXG4gICAgTG9hZEhvb2tNYW5hZ2VyLFxuICAgIEV2ZW50TGlzdGVuZXJNYW5hZ2VyLFxufSJdLAogICJtYXBwaW5ncyI6ICI7OztBQWtCQSxNQUFlLHVCQUFmLE1BQW9DO0FBQUEsRUFVcEM7QUErREEsV0FBUyxZQUFZLE9BQWlDO0FBQ2xELFFBQ0ksVUFBVSxRQUNWLFVBQVUsV0FDVCxPQUFPLFVBQVUsWUFBWSxNQUFNLFFBQVEsS0FBSyxLQUFLLGlCQUFpQixpQkFDekUsUUFBTztBQUVULFdBQU87QUFBQSxFQUNYO0FBR0EsTUFBTSxrQkFBTixNQUVFO0FBQUEsSUFjRSxZQUNJLEtBQ0EsVUFBd0MsQ0FBQyxHQUN6QyxVQUNGO0FBQ0UsV0FBSyxNQUFNO0FBRVgsV0FBSyxXQUFXO0FBRWhCLFVBQUksWUFBWSxPQUFPLEdBQUc7QUFDdEIsWUFBSSxLQUFLLGdCQUFnQixNQUFNLE9BQU87QUFDbEMsa0JBQVEsTUFBTSxnQkFBZ0IsTUFBTSxnQ0FBZ0M7QUFDcEUsZ0JBQU07QUFBQSxRQUNWO0FBRUEsYUFBSyxTQUFTLFFBQVEsT0FBTztBQUU3QixhQUFLLFVBQVUsQ0FBQztBQUFBLE1BQ3BCLE9BQU87QUFDSCxhQUFLLFVBQVU7QUFBQSxNQUNuQjtBQUFBLElBQ0o7QUFBQSxJQUVBLGtCQUFpRDtBQUM3QyxhQUFPLEtBQUssYUFBYTtBQUFBLElBQzdCO0FBQUEsRUFDSjs7O0FDaklBLE1BQU0sOEJBQWtFO0FBQUEsSUFDcEU7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFBUztBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFDbkQ7QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFVO0FBQUEsSUFBUztBQUFBLEVBQ2hEO0FBRUEsTUFBTSxrQkFBMEM7QUFBQSxJQUM1QztBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBVztBQUFBLElBQVc7QUFBQSxJQUFTO0FBQUEsSUFBUztBQUFBLElBQUs7QUFBQSxJQUFPO0FBQUEsSUFDakU7QUFBQSxJQUFjO0FBQUEsSUFBUTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBVztBQUFBLElBQVE7QUFBQSxJQUM3RDtBQUFBLElBQVk7QUFBQSxJQUFRO0FBQUEsSUFBWTtBQUFBLElBQU07QUFBQSxJQUFPO0FBQUEsSUFBVztBQUFBLElBQU87QUFBQSxJQUMvRDtBQUFBLElBQU87QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFZO0FBQUEsSUFBYztBQUFBLElBQVU7QUFBQSxJQUM3RDtBQUFBLElBQVE7QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBTTtBQUFBLElBQU07QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQzlEO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFVO0FBQUEsSUFBTztBQUFBLElBQU87QUFBQSxJQUFTO0FBQUEsSUFBVTtBQUFBLElBQU07QUFBQSxJQUM5RDtBQUFBLElBQU87QUFBQSxJQUFRO0FBQUEsSUFBUTtBQUFBLElBQVM7QUFBQSxJQUFPO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUM3RDtBQUFBLElBQVk7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLElBQUs7QUFBQSxJQUFXO0FBQUEsSUFBTztBQUFBLElBQ3ZEO0FBQUEsSUFBSztBQUFBLElBQU07QUFBQSxJQUFNO0FBQUEsSUFBUTtBQUFBLElBQUs7QUFBQSxJQUFRO0FBQUEsSUFBVTtBQUFBLElBQVU7QUFBQSxJQUMxRDtBQUFBLElBQVU7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQVE7QUFBQSxJQUFVO0FBQUEsSUFBUztBQUFBLElB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
