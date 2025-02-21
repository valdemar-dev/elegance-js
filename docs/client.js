(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  console.log("Elegance.JS is loading..");
  const domParser = new DOMParser();
  const xmlSerializer = new XMLSerializer();
  const pageStringCache = /* @__PURE__ */ new Map();
  const loc = window.location;
  const doc = document;
  let cleanupProcedures = [];
  const makeArray = Array.from;
  const sanitizePathname = /* @__PURE__ */ __name((pn) => {
    if (!pn.endsWith("/") || pn === "/") return pn;
    return pn.slice(0, -1);
  }, "sanitizePathname");
  let currentPage = sanitizePathname(loc.pathname);
  const loadPage = /* @__PURE__ */ __name((deprecatedKeys = [], newBreakpoints) => {
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
    console.log("Deprecated Keys:", deprecatedKeys);
    console.log("New Breakpoints:", newBreakpoints);
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
      console.log(`%cObserver for el`, "font-size: 8px;", el);
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
    }
    const loadHooks = pageData.lh;
    for (const loadHook of loadHooks || []) {
      const bind = loadHook.bind;
      if (bind.length > 0 && newBreakpoints && !newBreakpoints.includes(bind)) {
        console.log(`Won't add loadHook with bind ${bind}.`);
        continue;
      }
      const fn = loadHook.fn;
      const cleanupFunction = fn(state);
      console.log(`Calling loadHook ${fn.toString()}, because its bind ${bind} was in`, newBreakpoints);
      if (cleanupFunction) {
        console.info(`Adding cleanup procedure for bind.`);
        cleanupProcedures.push({
          cleanupFunction,
          bind: loadHook.bind
        });
      }
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
  }, "fetchPage");
  const navigateLocally = /* @__PURE__ */ __name(async (target, pushState = true) => {
    console.log(`%cNaving to: ${target} from ${currentPage}`, "font-size: 22px");
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);
    let newPage = await fetchPage(targetURL);
    if (!newPage) return;
    if (pathname === currentPage) return;
    const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
    const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));
    const latestMatchingBreakpoints = /* @__PURE__ */ __name((arr1, arr2) => {
      let i = 0;
      const len = Math.min(arr1.length, arr2.length);
      while (i < len && arr1[i].getAttribute("bp") === arr2[i].getAttribute("bp")) i++;
      return i > 0 ? [arr1[i - 1], arr2[i - 1]] : [document.body, newPage.body];
    }, "latestMatchingBreakpoints");
    const [oldPageLatest, newPageLatest] = latestMatchingBreakpoints(curBreaks, newBreaks);
    console.log(oldPageLatest, newPageLatest);
    const deprecatedKeys = [];
    const breakpointKey = oldPageLatest.getAttribute("key");
    const getDeprecatedKeysRecursively = /* @__PURE__ */ __name((element) => {
      const key = element.getAttribute("key");
      if (key) {
        deprecatedKeys.push(key);
      }
      if (key === breakpointKey || !breakpointKey) return;
      for (const child of makeArray(element.children)) {
        getDeprecatedKeysRecursively(child);
      }
    }, "getDeprecatedKeysRecursively");
    getDeprecatedKeysRecursively(doc.body);
    const deprecatedBreakpoints = curBreaks.filter(
      (item) => !newBreaks.includes(item)
    ).map((br) => br.getAttribute("br"));
    const newBreakpoints = newBreaks.filter(
      (item) => !curBreaks.includes(item)
    ).map((br) => br.getAttribute("br"));
    for (const cleanupProcedure of cleanupProcedures) {
      const bind = cleanupProcedure.bind;
      if (bind.length < 1 || deprecatedBreakpoints.includes(bind)) {
        console.log(`Calling: ${cleanupProcedure.cleanupFunction.toString()} for bind ${bind}`);
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
        for (const cleanupProcedure of cleanupProcedures) {
          if (!cleanupProcedure.bind !== "") continue;
          cleanupProcedure.cleanupFunction();
          cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure));
        }
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
