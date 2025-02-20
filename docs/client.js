(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  console.log("Elegance.JS is loading..");
  const domParser = new DOMParser();
  const xmlSerializer = new XMLSerializer();
  const pageStringCache = /* @__PURE__ */ new Map();
  const loc = window.location;
  const doc = document;
  let cleanupFunctions = [];
  const makeArray = Array.from;
  const sanitizePathname = /* @__PURE__ */ __name((pn) => {
    if (!pn.endsWith("/") || pn === "/") return pn;
    return pn.slice(0, -1);
  }, "sanitizePathname");
  let currentPage = sanitizePathname(loc.pathname);
  const loadPage = /* @__PURE__ */ __name((deprecatedKeys = []) => {
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
        subjects: pageData.state.map((subject) => {
          const s = {
            ...subject,
            observers: /* @__PURE__ */ new Map(),
            pathname
          };
          s.signal = () => {
            for (const observer of s.observers.values()) {
              observer(s.value);
            }
          };
          return s;
        }),
        get: /* @__PURE__ */ __name((id) => state.subjects.find((s) => s.id === id), "get"),
        getAll: /* @__PURE__ */ __name((ids) => ids?.map((id) => state.get(id)), "getAll"),
        observe: /* @__PURE__ */ __name((subject, observer, key) => {
          subject.observers.delete(key);
          subject.observers.set(key, observer);
        }, "observe")
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
        const updateFunction = /* @__PURE__ */ __name((value) => {
          values[id] = value;
          const newValue2 = observer.update(...Object.values(values));
          let attribute2 = observer.attribute === "class" ? "className" : observer.attribute;
          el[attribute2] = newValue2;
        }, "updateFunction");
        state.observe(subject, updateFunction, observer.key);
      }
      const newValue = observer.update(...Object.values(values));
      let attribute = observer.attribute === "class" ? "className" : observer.attribute;
      el[attribute] = newValue;
      console.info(`Registered Observer.`, observer);
    }
    for (const soa of pageData.soa || []) {
      if (soa.key in deprecatedKeys) {
        console.info(`not setting ${soa.key}`);
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
      console.log(pageLoadHook.toString());
      const cleanupFunction = pageLoadHook(state);
      if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
    }
    pageStringCache.set(
      currentPage,
      xmlSerializer.serializeToString(doc)
    );
  }, "loadPage");
  const fetchPage = /* @__PURE__ */ __name(async (targetURL) => {
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
  }, "fetchPage");
  const navigateLocally = /* @__PURE__ */ __name(async (target, pushState = true) => {
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
    getDeprecatedKeysRecursively(doc.body);
    lastBreakPairMatch.currentPage.replaceWith(lastBreakPairMatch.newPage);
    doc.head.replaceChildren(...makeArray(newPage.head.children));
    if (pushState) history.pushState(null, "", targetURL.href);
    currentPage = pathname;
    if (targetURL.hash) {
      doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }
    loadPage(deprecatedKeys);
  }, "navigateLocally");
  window.onpopstate = async (event) => {
    event.preventDefault();
    const target = event.target;
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
  if (Object.values(pd)[0]?.w) {
    const source = new EventSource("http://localhost:3001/events");
    source.onmessage = async (event) => {
      console.log(`hot-reload, command received: ${event.data}`);
      if (event.data === "reload") {
        for (const func of cleanupFunctions) {
          func();
        }
        cleanupFunctions = [];
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
        loadPage();
      } else if (event.data === "hard-reload") {
        window.location.reload();
      }
    };
  }
})();
