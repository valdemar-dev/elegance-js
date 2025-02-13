"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // src/client/client.ts
  console.log("Elegance.JS is loading..");
  var parser = new DOMParser();
  var serializer = new XMLSerializer();
  var pageStringCache = /* @__PURE__ */ new Map();
  var cleanupFunctions = [];
  var evtSource = null;
  var currentPage = window.location.pathname;
  var sanitizePathname = /* @__PURE__ */ __name((pn) => {
    if (!pn.endsWith("/")) return pn;
    if (pn === "/") return pn;
    return pn.slice(0, -1);
  }, "sanitizePathname");
  var fetchPage = /* @__PURE__ */ __name(async (targetURL) => {
    const pathname = sanitizePathname(targetURL.pathname);
    if (pageStringCache.has(pathname)) return pageStringCache.get(pathname);
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
    console.log(pageDataScriptSrc);
    if (!pd[pathname]) {
      await import(pageDataScriptSrc);
    }
    pageStringCache.set(pathname, serializer.serializeToString(newDOM));
    return newDOM;
  }, "fetchPage");
  var navigateLocally = /* @__PURE__ */ __name(async (target, pushState = true) => {
    console.log(`Naving to: ${target} from ${currentPage}`);
    for (const func of cleanupFunctions) {
      func();
    }
    cleanupFunctions = [];
    pageStringCache.set(currentPage, serializer.serializeToString(document));
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);
    console.log("san: ", targetURL);
    const isPageCached = pageStringCache.has(pathname);
    if (isPageCached) {
      console.log(`Found cached page for ${pathname}.`);
      const cachedDOM = pageStringCache.get(pathname);
      const parsedDOM = parser.parseFromString(cachedDOM, "text/html");
      document.head.replaceChildren(...Array.from(parsedDOM.head.children));
      document.body = parsedDOM.body;
    } else {
      const fetchedDOM = await fetchPage(targetURL);
      if (!fetchedDOM) return;
      document.head.replaceChildren(...Array.from(fetchedDOM.head.children));
      document.body = fetchedDOM.body;
    }
    if (pushState) history.pushState(null, "", target);
    load();
    currentPage = pathname;
  }, "navigateLocally");
  window.onpopstate = async (event) => {
    event.preventDefault();
    const target = event.target;
    await navigateLocally(target.location.href, false);
    history.replaceState(null, "", sanitizePathname(target.location.pathname));
  };
  var load = /* @__PURE__ */ __name(() => {
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
      get: /* @__PURE__ */ __name((id) => Object.values(state.subjects).find((s) => s.id === id), "get"),
      set: /* @__PURE__ */ __name((subject, value) => {
        subject.value = value;
        state.subjects[Object.keys(subject)[0]] = subject;
      }, "set"),
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
        observers: []
      };
    }
    pageData.sm = state;
    for (const observer of serverObservers || []) {
      const el = document.querySelector(`[key="${observer.key}"]`);
      let values = {};
      for (const id of observer.ids) {
        const subject = state.get(id);
        if (!subject) {
          console.error(`OOA watching an illegal ID: ${id}`);
          return;
        }
        values[subject.id] = subject.value;
        const updateFunction = /* @__PURE__ */ __name((value) => {
          values[id] = value;
          const newValue = observer.update(...Object.values(values));
          let attribute = observer.attribute;
          switch (attribute) {
            case "class":
              attribute = "className";
              break;
          }
          el[attribute] = newValue;
        }, "updateFunction");
        state.observe(subject, updateFunction);
      }
      console.info(`Registered observer for key ${observer.key}`);
    }
    for (const soa of stateObjectAttributes || []) {
      const el = document.querySelector(`[key="${soa.key}"]`);
      const subject = state.get(soa.id);
      if (!subject) {
        console.error(`An SOA is watching an illegal ID: ${soa.id}.`);
        return;
      }
      el[soa.attribute] = (event) => subject.value(state, event);
      console.info(`Registered SOA ${soa.attribute} for key ${soa.key}`, subject.value);
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
          document.body = new DOMParser().parseFromString(await newHTML.text(), "text/html").body;
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
  }, "load");
  globalThis.__ELEGANCE_CLIENT__ = {
    navigateLocally,
    fetchPage
  };
  load();
})();
