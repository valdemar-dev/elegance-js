import { allElements } from "../elements/element_list";
import { SpecialElementOption, EleganceElement } from "../elements/element";
Object.assign(window, allElements);
const newArray = Array.from;
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
DEV_BUILD && (() => {
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
class ClientSubject {
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
}
class StateManager {
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
}
class ClientEventListener {
  constructor(id, callback, depencencies) {
    this.id = id;
    this.callback = callback;
    this.dependencies = depencencies;
  }
  call(ev) {
    const dependencies = stateManager.getAll(this.dependencies);
    this.callback(ev, ...dependencies);
  }
}
class EventListenerManager {
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
        DEV_BUILD && errorOut("Possibly corrupted HTML, failed to find element with key " + eventListenerOption.key + " for event listener.");
        return;
      }
      const eventListener = this.eventListeners.get(eventListenerOption.id);
      if (!eventListener) {
        DEV_BUILD && errorOut("Invalid EventListenerOption: Event listener with id \u201D" + eventListenerOption.id + '" does not exist.');
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
}
class ClientObserver {
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
}
class ObserverManager {
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
        DEV_BUILD && errorOut("Possibly corrupted HTML, failed to find element with key " + observerOption.key + " for event listener.");
        return;
      }
      const observer = this.clientObservers.get(observerOption.id);
      if (!observer) {
        DEV_BUILD && errorOut("Invalid ObserverOption: Observer with id \u201D" + observerOption.id + '" does not exist.');
        return;
      }
      observer.addElement(element, observerOption.option);
      observer.call();
    }
  }
}
var LoadHookKind = /* @__PURE__ */ ((LoadHookKind2) => {
  LoadHookKind2[LoadHookKind2["LAYOUT_LOADHOOK"] = 0] = "LAYOUT_LOADHOOK";
  LoadHookKind2[LoadHookKind2["PAGE_LOADHOOK"] = 1] = "PAGE_LOADHOOK";
  return LoadHookKind2;
})(LoadHookKind || {});
;
class LoadHookManager {
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
}
const observerManager = new ObserverManager();
const eventListenerManager = new EventListenerManager();
const stateManager = new StateManager();
const loadHookManager = new LoadHookManager();
const pageStringCache = /* @__PURE__ */ new Map();
const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const fetchPage = async (targetURL) => {
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
let navigationCallbacks = [];
function onNavigate(callback) {
  navigationCallbacks.push(callback);
}
const navigateLocally = async (target, pushState = true) => {
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
    DEV_BUILD && `Failed to find script tag for query:script[data-page="true"][data-pathname="${pathname}"]`;
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
    DEV_BUILD && errorOut(`Possibly malformed page data ${data}`);
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
export {
  ClientSubject,
  EventListenerManager,
  LoadHookManager,
  ObserverManager,
  StateManager
};
