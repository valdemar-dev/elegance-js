// src/client/client.ts
console.log("Elegance.JS is loading..");
var parser = new DOMParser();
var serializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var cleanupFunctions = [];
var evtSource = null;
var currentPage = window.location.pathname;
var sanitizePathname = (pn) => {
  if (!pn.endsWith("/")) return pn;
  if (pn === "/") return pn;
  return pn.slice(0, -1);
};
var fetchPage = async (targetURL) => {
  const pathname = sanitizePathname(targetURL.pathname);
  if (pageStringCache.has(pathname)) {
    return parser.parseFromString(pageStringCache.get(pathname), "text/html");
  }
  console.log(`Fetching ${pathname}`);
  if (targetURL.hostname !== window.location.hostname) {
    console.error(`Client-side navigation may only occur on local URL's`);
    return;
  }
  const res = await fetch(targetURL);
  const resText = await res.text();
  if (!res.ok && res.status >= 500) {
    console.error(`Server error whilst navigating to ${pathname}: ${resText}`);
    return;
  }
  const newDOM = parser.parseFromString(resText, "text/html");
  const pageDataScriptSrc = pathname === "/" ? pathname + "page_data.js" : pathname + "/page_data.js";
  if (!pd[pathname]) {
    await import(pageDataScriptSrc);
  }
  pageStringCache.set(pathname, serializer.serializeToString(newDOM));
  return newDOM;
};
var getDeprecatedKeys = ({
  breakpointKey
}) => {
  const deprecatedKeys = [];
  const getRecursively = (element) => {
    const key = element.getAttribute("key");
    if (key) {
      deprecatedKeys.push(key);
    }
    if (element.children) {
      if (key === breakpointKey) {
        return;
      }
      for (const child of Array.from(element.children)) {
        getRecursively(child);
      }
    }
  };
  getRecursively(document.body);
  return deprecatedKeys;
};
var navigateLocally = async (target, pushState = true) => {
  console.log(`Naving to: ${target} from ${currentPage}`);
  for (const func of cleanupFunctions) {
    func();
  }
  cleanupFunctions = [];
  pageStringCache.set(currentPage, serializer.serializeToString(document));
  const targetURL = new URL(target);
  const pathname = sanitizePathname(targetURL.pathname);
  let newPage = pageStringCache.get(pathname) ?? await fetchPage(targetURL);
  if (!newPage) return;
  if (typeof newPage === "string") {
    newPage = parser.parseFromString(newPage, "text/html");
  }
  const currentPageBreakpoints = Array.from(document.querySelectorAll("div[bp]"));
  const newPageBreakpoints = Array.from(newPage.querySelectorAll("div[bp]"));
  let lastMatchingBreakpoint = document.body;
  let lastMatchingNewPageBreakpoint = newPage.body;
  for (let i = 0; i < currentPageBreakpoints.length; i++) {
    if (i > newPageBreakpoints.length - 1) break;
    const currentPageBreakpoint = currentPageBreakpoints[i];
    const newPageBreakpoint = newPageBreakpoints[i];
    const currentPageBreakpointName = currentPageBreakpoint.getAttribute("bp");
    const newPageBreakpointName = newPageBreakpoint.getAttribute("bp");
    if (currentPageBreakpointName !== newPageBreakpointName) {
      break;
    }
    lastMatchingBreakpoint = currentPageBreakpoint;
    lastMatchingNewPageBreakpoint = newPageBreakpoint;
  }
  console.log(`Replacing ${lastMatchingBreakpoint} with ${lastMatchingNewPageBreakpoint}`);
  const deprecatedKeys = getDeprecatedKeys({
    breakpointKey: lastMatchingBreakpoint.getAttribute("key")
  });
  const parent = lastMatchingBreakpoint.parentElement;
  parent?.replaceChild(lastMatchingNewPageBreakpoint, lastMatchingBreakpoint);
  document.head.replaceChildren(...Array.from(newPage.head.children));
  if (pushState) history.pushState(null, "", target);
  load(deprecatedKeys);
  currentPage = pathname;
};
window.onpopstate = async (event) => {
  event.preventDefault();
  const target = event.target;
  await navigateLocally(target.location.href, false);
  history.replaceState(null, "", sanitizePathname(target.location.pathname));
};
var load = (deprecatedKeys = []) => {
  let pathname = sanitizePathname(window.location.pathname);
  let pageData = pd[pathname];
  if (!pageData) {
    console.error(`Invalid Elegance Configuration. Page.JS is not properly sent to the client. Pathname: ${window.location.pathname}`);
    return;
  }
  ;
  console.log(`Loading ${pathname}:`, pageData);
  const serverState = pageData.state;
  const serverObservers = pageData.ooa;
  const stateObjectAttributes = pageData.soa;
  const isInWatchMode = pageData.w;
  const pageLoadHooks = pageData.plh;
  const state = {
    subjects: {},
    get: (id) => Object.values(state.subjects).find((s) => s.id === id),
    set: (subject, value) => {
      subject.value = value;
      pd[subject.pathname].sm.subjects[Object.keys(subject)[0]] = subject;
    },
    signal: (subject) => {
      const observers = subject.observers;
      for (const observer of observers) {
        observer(subject.value);
      }
    },
    observe: (subject, observer) => {
      subject.observers.push(observer);
    }
  };
  for (const [subjectName, value] of Object.entries(serverState)) {
    const subject = value;
    state.subjects[subjectName] = {
      id: subject.id,
      value: subject.value,
      observers: [],
      pathname
    };
  }
  pageData.sm = state;
  for (const observer of serverObservers || []) {
    if (observer.key in deprecatedKeys) {
      continue;
    }
    const el = document.querySelector(`[key="${observer.key}"]`);
    let values = {};
    for (const id of observer.ids) {
      const subject = state.get(id);
      if (!subject) {
        console.error(`OOA watching an illegal ID: ${id}`);
        return;
      }
      values[subject.id] = subject.value;
      const updateFunction = (value) => {
        values[id] = value;
        const newValue = observer.update(...Object.values(values));
        let attribute = observer.attribute;
        switch (attribute) {
          case "class":
            attribute = "className";
            break;
        }
        el[attribute] = newValue;
      };
      state.observe(subject, updateFunction);
    }
    console.info(`Registered observer for key ${observer.key}`);
  }
  for (const soa of stateObjectAttributes || []) {
    if (soa.key in deprecatedKeys) {
      continue;
    }
    const el = document.querySelector(`[key="${soa.key}"]`);
    if (!el) {
      console.warn(`Couldn't find el for key=${soa.key}. Page: ${pathname}. Ref:`, pageData);
      console.log(soa);
      return;
    }
    const subject = state.get(soa.id);
    if (!subject) {
      console.error(`An SOA is watching an illegal ID: ${soa.id}.`);
      return;
    }
    el[soa.attribute] = (event) => subject.value(state, event);
    console.info(`Registered SOA ${soa.attribute} for key ${soa.key}, with id ${soa.id}, to the element:`, el);
  }
  for (const pageLoadHook of pageLoadHooks || []) {
    const cleanupFunction = pageLoadHook(state);
    if (!cleanupFunction) continue;
    cleanupFunctions.push(cleanupFunction);
  }
  if (isInWatchMode && !evtSource) {
    evtSource = new EventSource("http://localhost:3001/events");
    evtSource.onmessage = async (event) => {
      console.log(`Message: ${event.data}`);
      if (event.data === "reload") {
        const newHTML = await fetch(window.location.href);
        for (const func of cleanupFunctions) {
          func();
        }
        cleanupFunctions = [];
        const newDOM = parser.parseFromString(
          await newHTML.text(),
          "text/html"
        );
        document.body = newDOM.body;
        document.head.replaceWith(newDOM.head);
        const link = document.querySelector("[rel=stylesheet]");
        if (!link) return;
        const href = link.getAttribute("href");
        link.setAttribute("href", href.split("?")[0] + "?" + (/* @__PURE__ */ new Date()).getTime());
        load();
      } else if (event.data === "hard-reload") {
        window.location.reload();
      }
    };
  }
};
globalThis.__ELEGANCE_CLIENT__ = {
  navigateLocally,
  fetchPage
};
load();
