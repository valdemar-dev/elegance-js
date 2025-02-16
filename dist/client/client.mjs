// src/client/client.ts
console.log("Elegance.JS is loading..");
var domParser = new DOMParser();
var xmlSerializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var currentPage = window.location.pathname;
var cleanupFunctions = [];
var sanitizePathname = (pn) => {
  if (!pn.endsWith("/")) return pn;
  if (pn === "/") return pn;
  return pn.slice(0, -1);
};
var loadObserverObjectAttributes = (pageData, deprecatedKeys, state) => {
  const observerObjectAttributes = pageData.ooa;
  for (const observer of observerObjectAttributes || []) {
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
    console.info(`Registered Observer.`, observer);
  }
};
var loadStateObjectAttributes = (pageData, deprecatedKeys, state) => {
  const stateObjectAttributes = pageData.soa;
  for (const soa of stateObjectAttributes || []) {
    if (soa.key in deprecatedKeys) {
      continue;
    }
    const el = document.querySelector(`[key="${soa.key}"]`);
    if (!el) {
      console.error(`An SOA is registered to a key which does not exist.`, soa);
      return;
    }
    const subject = state.get(soa.id);
    if (!subject) {
      console.error(`An SOA is registered to a subject which does not exist.`, soa);
      return;
    }
    if (typeof subject.value === "function") {
      el[soa.attribute] = (event) => subject.value(state, event);
    } else {
      el[soa.attribute] = subject.value;
    }
    console.info(`Processed SOA.`, soa);
  }
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
  console.log(pageData.state);
  const state = {
    subjects: {},
    get: (id) => Object.values(state.subjects).find((s) => s.id === id),
    set: (subject, value) => {
      subject.value = value;
      state.subjects[Object.keys(subject)[0]] = subject;
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
  loadObserverObjectAttributes(pageData, deprecatedKeys, state);
  loadStateObjectAttributes(pageData, deprecatedKeys, state);
  for (const pageLoadHook of pageLoadHooks || []) {
    const cleanupFunction = pageLoadHook(state);
    if (!cleanupFunction) continue;
    cleanupFunctions.push(cleanupFunction);
  }
};
var fetchPage = async (targetURL) => {
  const pathname = sanitizePathname(targetURL.pathname);
  if (pageStringCache.has(pathname)) return;
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
  const newDOM = domParser.parseFromString(resText, "text/html");
  const pageDataScriptSrc = pathname === "/" ? pathname + "page_data.js" : pathname + "/page_data.js";
  if (!pd[pathname]) {
    await import(pageDataScriptSrc);
  }
  pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));
  return newDOM;
};
var getDeprecatedKeys = ({
  breakpointKey,
  document: document2
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
  getRecursively(document2.body);
  return deprecatedKeys;
};
var navigateLocally = async (target, pushState = true) => {
  console.log(`Naving to: ${target} from ${currentPage}`);
  for (const func of cleanupFunctions) {
    func();
  }
  cleanupFunctions = [];
  pageStringCache.set(currentPage, xmlSerializer.serializeToString(document));
  const targetURL = new URL(target);
  const pathname = sanitizePathname(targetURL.pathname);
  let newPage = pageStringCache.get(pathname) ?? await fetchPage(targetURL);
  if (!newPage) return;
  if (typeof newPage === "string") {
    newPage = domParser.parseFromString(newPage, "text/html");
  }
  const curBreaks = Array.from(document.querySelectorAll("div[bp]"));
  const newBreaks = Array.from(newPage.querySelectorAll("div[bp]"));
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
  console.log(`Replacing ${lastBreakPairMatch.currentPage} with ${lastBreakPairMatch.newPage}`);
  const deprecatedKeys = getDeprecatedKeys({
    breakpointKey: lastBreakPairMatch.currentPage.getAttribute("key"),
    // Clean out the new page! Not the current one.
    document: newPage
  });
  const parent = lastBreakPairMatch.currentPage.parentElement;
  parent?.replaceChild(lastBreakPairMatch.newPage, lastBreakPairMatch.currentPage);
  document.head.replaceChildren(...Array.from(newPage.head.children));
  if (pushState) history.pushState(null, "", target);
  loadPage(deprecatedKeys);
  currentPage = pathname;
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
