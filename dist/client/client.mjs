// src/client/client.ts
console.log("Elegance.JS is loading..");
var domParser = new DOMParser();
var xmlSerializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var currentPage = window.location.pathname;
var cleanupFunctions = [];
var makeArray = Array.from;
var sanitizePathname = (pn) => {
  if (!pn.endsWith("/") || pn === "/") return pn;
  return pn.slice(0, -1);
};
var loadPage = (deprecatedKeys = []) => {
  let pathname = sanitizePathname(window.location.pathname);
  let pageData = pd[pathname];
  if (!pageData) {
    console.error(`Failed to load! "page_data.js" is not present for the pathname: ${window.location.pathname}`);
    return;
  }
  ;
  console.log(`Loading ${pathname}:`, pageData);
  const serverState = pageData.state;
  const pageLoadHooks = pageData.plh;
  const state = {
    subjects: {},
    get: (id) => Object.values(state.subjects).find((s) => s.id === id),
    getKey: (value) => Object.keys(state.subjects).find((k) => state.subjects[k] === value),
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
  for (const observer of pageData.ooa || []) {
    if (observer.key in deprecatedKeys) {
      continue;
    }
    const el = document.querySelector(`[key="${observer.key}"]`);
    let values = {};
    for (const id of observer.ids) {
      const subject = state.get(id);
      values[subject.id] = subject.value;
      const updateFunction = (value) => {
        values[id] = value;
        const newValue = observer.update(...Object.values(values));
        let attribute = observer.attribute === "class" ? "className" : observer.attribute;
        el[attribute] = newValue;
      };
      state.observe(subject, updateFunction);
    }
    console.info(`Registered Observer.`, observer);
  }
  for (const soa of pageData.soa || []) {
    if (soa.key in deprecatedKeys) {
      continue;
    }
    const el = document.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id);
    if (typeof subject.value === "function") {
      el[soa.attribute] = (event) => subject.value(state, event);
    } else {
      el[soa.attribute] = subject.value;
    }
    console.info(`Processed SOA.`, soa);
  }
  for (const pageLoadHook of pageLoadHooks || []) {
    const cleanupFunction = pageLoadHook(state);
    if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
  }
  pageStringCache.set(
    currentPage,
    xmlSerializer.serializeToString(document)
  );
};
var fetchPage = async (targetURL) => {
  const pathname = sanitizePathname(targetURL.pathname);
  if (pageStringCache.has(pathname)) {
    return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
  }
  console.log(`Fetching ${pathname}`);
  if (targetURL.hostname !== window.location.hostname) {
    console.error(`Client-side navigation may only occur on local URL's`);
    return;
  }
  const res = await fetch(targetURL);
  const resText = await res.text();
  if (!res.ok) return;
  const newDOM = domParser.parseFromString(resText, "text/html");
  const pageDataScriptSrc = pathname === "/" ? pathname + "page_data.js" : pathname + "/page_data.js";
  if (!pd[pathname]) {
    await import(pageDataScriptSrc);
  }
  pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));
  return newDOM;
};
var navigateLocally = async (target, pushState = true) => {
  console.log(`Naving to: ${target} from ${currentPage}`);
  const targetURL = new URL(target);
  const pathname = sanitizePathname(targetURL.pathname);
  if (pathname === currentPage) return;
  let newPage = await fetchPage(targetURL);
  if (!newPage) return;
  for (const func of cleanupFunctions) {
    func();
  }
  cleanupFunctions = [];
  const curBreaks = makeArray(document.querySelectorAll("div[bp]"));
  const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));
  let lastBreakPairMatch = {
    currentPage: document.body,
    newPage: newPage.body
  };
  for (let i = 0; i < curBreaks.length; i++) {
    if (i > newBreaks.length - 1) break;
    const curBreak = curBreaks[i];
    const newBreak = newBreaks[i];
    const curName = curBreak.getAttribute("bp");
    const newName = newBreak.getAttribute("bp");
    if (curName !== newName) break;
    lastBreakPairMatch = {
      currentPage: curBreak,
      newPage: newBreak
    };
  }
  const deprecatedKeys = [];
  const breakpointKey = lastBreakPairMatch.currentPage.getAttribute("key");
  const getDeprecatedKeysRecursively = (element) => {
    const key = element.getAttribute("key");
    if (key) {
      deprecatedKeys.push(key);
    }
    if (key === breakpointKey) return;
    for (const child of makeArray(element.children)) {
      getDeprecatedKeysRecursively(child);
    }
  };
  getDeprecatedKeysRecursively(document.body);
  lastBreakPairMatch.currentPage.replaceWith(lastBreakPairMatch.newPage);
  document.head.replaceChildren(...makeArray(newPage.head.children));
  if (pushState) history.pushState(null, "", target);
  currentPage = pathname;
  loadPage(deprecatedKeys);
};
window.onpopstate = async (event) => {
  event.preventDefault();
  const target = event.target;
  await navigateLocally(target.location.href, false);
  history.replaceState(null, "", sanitizePathname(target.location.pathname));
};
globalThis.__ELEGANCE_CLIENT__ = {
  navigateLocally,
  fetchPage
};
loadPage();
