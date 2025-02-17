// src/client/client.ts
console.log("Elegance.JS is loading..");
var domParser = new DOMParser();
var xmlSerializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var loc = window.location;
var doc = document;
var cleanupFunctions = [];
var makeArray = Array.from;
var sanitizePathname = (pn) => {
  if (!pn.endsWith("/") || pn === "/") return pn;
  return pn.slice(0, -1);
};
var currentPage = sanitizePathname(loc.pathname);
var loadPage = (deprecatedKeys = []) => {
  const fixedUrl = new URL(loc.href);
  fixedUrl.pathname = sanitizePathname(fixedUrl.pathname);
  const pathname = fixedUrl.pathname;
  history.replaceState(null, "", fixedUrl.href);
  let pageData = pd[pathname];
  if (!pageData) {
    console.error(`Failed to load! "page_data.js" is not present for the pathname: ${pathname}`);
    return;
  }
  ;
  console.log(`Loading ${pathname}:`, pageData);
  let state = pageData.stateManager;
  if (!state) {
    state = {
      subjects: Object.fromEntries(
        Object.entries(pageData.state).map(([subjectName, value]) => [
          subjectName,
          {
            ...value,
            observers: [],
            pathname
          }
        ])
      ),
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
    pageData.stateManager = state;
  }
  for (const observer of pageData.ooa || []) {
    if (observer.key in deprecatedKeys) {
      continue;
    }
    const el = doc.querySelector(`[key="${observer.key}"]`);
    let values = {};
    for (const id of observer.ids) {
      const subject = state.get(id);
      values[subject.id] = subject.value;
      const updateFunction = (value) => {
        values[id] = value;
        const newValue2 = observer.update(...Object.values(values));
        let attribute2 = observer.attribute === "class" ? "className" : observer.attribute;
        el[attribute2] = newValue2;
      };
      state.observe(subject, updateFunction);
    }
    const newValue = observer.update(...Object.values(values));
    let attribute = observer.attribute === "class" ? "className" : observer.attribute;
    el[attribute] = newValue;
    console.info(`Registered Observer.`, observer);
  }
  for (const soa of pageData.soa || []) {
    if (soa.key in deprecatedKeys) {
      continue;
    }
    const el = doc.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id);
    if (typeof subject.value === "function") {
      el[soa.attribute] = (event) => subject.value(state, event);
    } else {
      el[soa.attribute] = subject.value;
    }
    console.info(`Processed SOA.`, soa);
  }
  for (const pageLoadHook of pageData.plh || []) {
    const cleanupFunction = pageLoadHook(state);
    if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
  }
  pageStringCache.set(
    currentPage,
    xmlSerializer.serializeToString(doc)
  );
};
var fetchPage = async (targetURL) => {
  const pathname = sanitizePathname(targetURL.pathname);
  if (pageStringCache.has(pathname)) {
    return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
  }
  console.log(`Fetching ${pathname}`);
  const res = await fetch(targetURL);
  if (!res.ok) return;
  const newDOM = domParser.parseFromString(await res.text(), "text/html");
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
  let newPage = await fetchPage(targetURL);
  if (!newPage) return;
  for (const func of cleanupFunctions) {
    func();
  }
  cleanupFunctions = [];
  const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
  const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));
  let lastBreakPairMatch = {
    currentPage: doc.body,
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
  getDeprecatedKeysRecursively(doc.body);
  lastBreakPairMatch.currentPage.replaceWith(lastBreakPairMatch.newPage);
  doc.head.replaceChildren(...makeArray(newPage.head.children));
  if (pushState) history.pushState(null, "", targetURL.href);
  currentPage = pathname;
  if (targetURL.hash) {
    doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
  }
  loadPage(deprecatedKeys);
};
window.onpopstate = async (event) => {
  event.preventDefault();
  const target = event.target;
  if (sanitizePathname(target.location.pathname) === loc.pathname) return;
  await navigateLocally(target.location.href, false);
  history.replaceState(null, "", target.location.href);
};
globalThis.__ELEGANCE_CLIENT__ = {
  navigateLocally,
  fetchPage,
  currentPage,
  sanitizePathname
};
loadPage();
