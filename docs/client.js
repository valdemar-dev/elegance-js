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
    let state2 = pageData.stateManager;
    if (!state2) {
      state2 = {
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
        get: /* @__PURE__ */ __name((id) => state2.subjects.find((s) => s.id === id), "get"),
        getAll: /* @__PURE__ */ __name((ids) => ids?.map((id) => state2.get(id)), "getAll"),
        observe: /* @__PURE__ */ __name((subject, observer, key) => {
          subject.observers.delete(key);
          subject.observers.set(key, observer);
        }, "observe")
      };
      pageData.stateManager = state2;
    }
    for (const ooa of pageData.ooa || []) {
      if (ooa.key in deprecatedKeys) {
        continue;
      }
      const el = doc.querySelector(`[key="${ooa.key}"]`);
      let values = {};
      for (const id of ooa.ids) {
        const subject = state2.get(id);
        values[subject.id] = subject.value;
        const updateFunction = /* @__PURE__ */ __name((value) => {
          values[id] = value;
          const newValue2 = ooa.update(...Object.values(values));
          let attribute2 = ooa.attribute === "class" ? "className" : ooa.attribute;
          el[attribute2] = newValue2;
        }, "updateFunction");
        state2.observe(subject, updateFunction, ooa.key);
      }
      const newValue = ooa.update(...Object.values(values));
      let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;
      el[attribute] = newValue;
    }
    for (const soa of pageData.soa || []) {
      if (soa.key in deprecatedKeys) {
        continue;
      }
      const el = doc.querySelector(`[key="${soa.key}"]`);
      const subject = state2.get(soa.id);
      if (typeof subject.value === "function") {
        el[soa.attribute] = (event) => subject.value(state2, event);
      } else {
        el[soa.attribute] = subject.value;
      }
    }
    const loadHooks = pageData.lh;
    for (const loadHook of loadHooks || []) {
      const bind = loadHook.bind;
      if (bind.length > 0 && newBreakpoints && !newBreakpoints.includes(bind)) {
        continue;
      }
      const fn = loadHook.fn;
      const cleanupFunction = fn(state2);
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
    const latestMatchingBreakpoints = /* @__PURE__ */ __name((arr1, arr2) => {
      let i = 0;
      const len = Math.min(arr1.length, arr2.length);
      while (i < len && arr1[i].getAttribute("bp") === arr2[i].getAttribute("bp")) i++;
      return i > 0 ? [arr1[i - 1], arr2[i - 1]] : [document.body, newPage.body];
    }, "latestMatchingBreakpoints");
    const [oldPageLatest, newPageLatest] = latestMatchingBreakpoints(curBreaks, newBreaks);
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
  }, "navigateLocally");
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
    getReference: /* @__PURE__ */ __name((id) => document.querySelector(`[ref="${id}"]`), "getReference")
  };
  loadPage();
  const watchServerPort = 3001;
  const eventSource = new EventSource(`http://localhost:${watchServerPort}/events`);
  eventSource.onmessage = async (event) => {
    console.log(`hot-reload, command received: ${event.data}`);
    if (event.data === "reload") {
      for (const cleanupProcedure of cleanupProcedures) {
        cleanupProcedure.cleanupFunction();
        cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure));
      }
      state.subjects.map((subj) => ({ ...subj, observers: [] }));
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
})();
