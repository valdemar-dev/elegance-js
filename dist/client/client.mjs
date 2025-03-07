// src/client/client.ts
console.log("Elegance.JS is loading..");
var domParser = new DOMParser();
var xmlSerializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var loc = window.location;
var doc = document;
var cleanupProcedures = [];
var makeArray = Array.from;
var sanitizePathname = (pn) => {
  if (!pn.endsWith("/") || pn === "/") return pn;
  return pn.slice(0, -1);
};
var currentPage = sanitizePathname(loc.pathname);
var createStateManager = (subjects) => {
  const state = {
    subjects: subjects.map((subject) => {
      const s = {
        ...subject,
        observers: /* @__PURE__ */ new Map()
      };
      s.signal = () => {
        for (const observer of s.observers.values()) {
          observer(s.value);
        }
      };
      return s;
    }),
    get: (id, bind) => {
      if (bind) {
        return pd[bind].get(id);
      }
      return state.subjects.find((s) => s.id === id);
    },
    getAll: (refs) => refs?.map((ref) => {
      if (ref.bind) {
        return pd[ref.bind].get(ref.id);
      }
      return state.get(ref.id);
    }),
    observe: (subject, observer, key) => {
      subject.observers.delete(key);
      subject.observers.set(key, observer);
    }
  };
  return state;
};
var loadPage = (deprecatedKeys = [], newBreakpoints) => {
  const fixedUrl = new URL(loc.href);
  fixedUrl.pathname = sanitizePathname(fixedUrl.pathname);
  const pathname = fixedUrl.pathname;
  history.replaceState(null, "", fixedUrl.href);
  let pageData = pd[pathname];
  if (!pageData) {
    console.error(`%cFailed to load! Missing "page_data.js" for page ${pathname}`, "font-size: 20px; font-weight: 600;");
    return;
  }
  ;
  console.info(`Loading ${pathname}. Page info follows:`, {
    "Deprecated Keys": deprecatedKeys,
    "New Breakpoints:": newBreakpoints || "(none, initial load)",
    "State": pageData.state,
    "OOA": pageData.ooa,
    "SOA": pageData.soa,
    "Load Hooks": pageData.lh
  });
  for (const [bind, subjects] of Object.entries(pageData.binds || {})) {
    if (!pd[bind]) {
      pd[bind] = createStateManager(subjects);
      continue;
    }
    const stateManager = pd[bind];
    const newSubjects = subjects;
    for (const subject of newSubjects) {
      if (stateManager.get(subject.id)) continue;
      pd[bind].subjects.push(subject);
    }
  }
  let state = pageData.stateManager;
  if (!state) {
    state = createStateManager(pageData.state);
    pageData.stateManager = state;
  }
  for (const subject of state.subjects) {
    subject.observers = /* @__PURE__ */ new Map();
  }
  for (const ooa of pageData.ooa || []) {
    const el = doc.querySelector(`[key="${ooa.key}"]`);
    let values = {};
    for (const { id, bind } of ooa.refs) {
      const subject = state.get(id, bind);
      values[subject.id] = subject.value;
      const updateFunction = (value) => {
        values[id] = value;
        const newValue = ooa.update(...Object.values(values));
        let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;
        el[attribute] = newValue;
      };
      updateFunction(subject.value);
      state.observe(subject, updateFunction, ooa.key);
    }
  }
  for (const soa of pageData.soa || []) {
    const el = doc.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id, soa.bind);
    if (typeof subject.value === "function") {
      el[soa.attribute] = (event) => subject.value(state, event);
    } else {
      el[soa.attribute] = subject.value;
    }
  }
  const loadHooks = pageData.lh;
  for (const loadHook of loadHooks || []) {
    const bind = loadHook.bind;
    if (bind !== void 0 && newBreakpoints && !newBreakpoints.includes(`${bind}`)) {
      continue;
    }
    const fn = loadHook.fn;
    const cleanupFunction = fn(state);
    if (cleanupFunction) {
      cleanupProcedures.push({
        cleanupFunction,
        bind: `${bind}`
      });
    }
  }
  pageStringCache.set(
    currentPage,
    xmlSerializer.serializeToString(doc)
  );
  console.info(
    `Loading finished, registered these cleanupProcedures`,
    cleanupProcedures
  );
};
var fetchPage = async (targetURL) => {
  const pathname = sanitizePathname(targetURL.pathname);
  if (pageStringCache.has(pathname)) {
    return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
  }
  console.info(`Fetching ${pathname}`);
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
  const targetURL = new URL(target);
  const pathname = sanitizePathname(targetURL.pathname);
  console.log(
    `%c${currentPage} -> ${targetURL.pathname}`,
    "font-size: 18px; font-weight: 600; color: lightgreen;"
  );
  let newPage = await fetchPage(targetURL);
  if (!newPage) return;
  if (pathname === currentPage) return;
  const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
  const curBpTags = curBreaks.map((bp) => bp.getAttribute("bp"));
  const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));
  const newBpTags = newBreaks.map((bp) => bp.getAttribute("bp"));
  const latestMatchingBreakpoints = (arr1, arr2) => {
    let i = 0;
    const len = Math.min(arr1.length, arr2.length);
    while (i < len && arr1[i].getAttribute("bp") === arr2[i].getAttribute("bp")) i++;
    return i > 0 ? [arr1[i - 1], arr2[i - 1]] : [document.body, newPage.body];
  };
  const [oldPageLatest, newPageLatest] = latestMatchingBreakpoints(curBreaks, newBreaks);
  const deprecatedKeys = [];
  const breakpointKey = oldPageLatest.getAttribute("key");
  const getDeprecatedKeysRecursively = (element) => {
    const key = element.getAttribute("key");
    if (key) {
      deprecatedKeys.push(key);
    }
    if (key === breakpointKey || !breakpointKey) return;
    for (const child of makeArray(element.children)) {
      getDeprecatedKeysRecursively(child);
    }
  };
  getDeprecatedKeysRecursively(doc.body);
  const deprecatedBreakpoints = curBpTags.filter(
    (item) => !newBpTags.includes(item)
  );
  const newBreakpoints = newBpTags.filter(
    (item) => !curBpTags.includes(item)
  );
  for (const cleanupProcedure of [...cleanupProcedures]) {
    const bind = cleanupProcedure.bind;
    if (bind.length < 1 || deprecatedBreakpoints.includes(bind)) {
      cleanupProcedure.cleanupFunction();
      cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure), 1);
    }
  }
  oldPageLatest.replaceWith(newPageLatest);
  doc.head.replaceWith(newPage.head);
  if (pushState) history.pushState(null, "", targetURL.href);
  currentPage = pathname;
  if (targetURL.hash) {
    doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
  }
  loadPage(deprecatedKeys, newBreakpoints);
};
window.onpopstate = async (event) => {
  event.preventDefault();
  const target = event.target;
  await navigateLocally(target.location.href, false);
  history.replaceState(null, "", target.location.href);
};
globalThis.client = {
  navigateLocally,
  fetchPage,
  currentPage,
  sanitizePathname,
  getReference: (id) => document.querySelector(`[ref="${id}"]`)
};
loadPage();
