(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  console.log("Elegance.JS is loading..");
  const domParser = new DOMParser();
  const xmlSerializer = new XMLSerializer();
  const pageStringCache = /* @__PURE__ */ new Map();
  let cleanupFunctions = [];
  const makeArray = Array.from;
  const sanitizePathname = /* @__PURE__ */ __name((pn) => {
    if (!pn.endsWith("/") || pn === "/") return pn;
    return pn.slice(0, -1);
  }, "sanitizePathname");
  let currentPage = sanitizePathname(window.location.pathname);
  const loadPage = /* @__PURE__ */ __name((deprecatedKeys = []) => {
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
    let state = pageData.stateManager;
    if (!state) {
      state = {
        subjects: {},
        get: /* @__PURE__ */ __name((id) => Object.values(state.subjects).find((s) => s.id === id), "get"),
        getKey: /* @__PURE__ */ __name((value) => Object.keys(state.subjects).find((k) => state.subjects[k] === value), "getKey"),
        signal: /* @__PURE__ */ __name((subject) => {
          const observers = subject.observers;
          for (const observer of observers) {
            observer(subject.value);
          }
        }, "signal"),
        observe: /* @__PURE__ */ __name((subject, observer) => {
          subject.observers.push(observer);
        }, "observe")
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
      pageData.stateManager = state;
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
        const updateFunction = /* @__PURE__ */ __name((value) => {
          values[id] = value;
          const newValue = observer.update(...Object.values(values));
          let attribute = observer.attribute === "class" ? "className" : observer.attribute;
          el[attribute] = newValue;
        }, "updateFunction");
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
  }, "loadPage");
  const fetchPage = /* @__PURE__ */ __name(async (targetURL) => {
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
  }, "fetchPage");
  const navigateLocally = /* @__PURE__ */ __name(async (target, pushState = true) => {
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
    const getDeprecatedKeysRecursively = /* @__PURE__ */ __name((element) => {
      const key = element.getAttribute("key");
      if (key) {
        deprecatedKeys.push(key);
      }
      if (key === breakpointKey) return;
      for (const child of makeArray(element.children)) {
        getDeprecatedKeysRecursively(child);
      }
    }, "getDeprecatedKeysRecursively");
    getDeprecatedKeysRecursively(document.body);
    lastBreakPairMatch.currentPage.replaceWith(lastBreakPairMatch.newPage);
    document.head.replaceChildren(...makeArray(newPage.head.children));
    if (pushState) history.pushState(null, "", target);
    currentPage = pathname;
    loadPage(deprecatedKeys);
  }, "navigateLocally");
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
  if (Object.values(pd)[0]?.w) {
    const source = new EventSource("http://localhost:3001/events");
    source.onmessage = async (event) => {
      console.log(`hot-reload, command received: ${event.data}`);
      if (event.data === "reload") {
        const newHTML = await fetch(window.location.href);
        const newDOM = domParser.parseFromString(
          await newHTML.text(),
          "text/html"
        );
        document.body = newDOM.body;
        document.head.replaceWith(newDOM.head);
        const link = document.querySelector("[rel=stylesheet]");
        if (!link) return;
        const href = link.getAttribute("href");
        link.setAttribute("href", href.split("?")[0] + "?" + (/* @__PURE__ */ new Date()).getTime());
      } else if (event.data === "hard-reload") {
        window.location.reload();
      }
    };
  }
})();
