// src/client/client.ts
var parser = new DOMParser();
var serializer = new XMLSerializer();
var pageStringCache = /* @__PURE__ */ new Map();
var evtSource = null;
var fetchLocalPage = async (targetURL) => {
  if (targetURL.hostname !== window.location.hostname) {
    throw `Client-side navigation may only occur on local URL's`;
  }
  const res = await fetch(targetURL);
  const resText = await res.text();
  if (!res.ok) {
    throw resText;
  }
  const newDOM = parser.parseFromString(resText, "text/html");
  const pageDataScriptSrc = `${targetURL.pathname}/page_data.js`;
  if (!pd[targetURL.pathname]) {
    console.log("adding, cause doesnt exist");
    await import(pageDataScriptSrc);
  }
  pageStringCache.set(targetURL.pathname, serializer.serializeToString(newDOM));
  return newDOM;
};
var oldPathname = window.location.pathname;
globalThis.navigateLocally = async (target, pushState = true) => {
  console.log(`Naving to: ${target} from ${oldPathname}`);
  pageStringCache.set(oldPathname, serializer.serializeToString(document));
  const url = new URL(target);
  const newDocument = pageStringCache.get(url.pathname) ?? await fetchLocalPage(url);
  if (pushState) history.pushState(null, "", target);
  if (newDocument instanceof Document) {
    console.log("Fetched new page.");
    document.body = newDocument.body;
  } else {
    console.log("Got from page cache.");
    document.body = parser.parseFromString(newDocument, "text/html").body;
  }
  load();
  oldPathname = window.location.pathname;
};
window.onpopstate = async (event) => {
  event.preventDefault();
  const target = event.target;
  await navigateLocally(target.location.href, false);
  history.replaceState(null, "", target.location.pathname);
};
var load = () => {
  let pathname = window.location.pathname;
  if (pathname.endsWith("/") && pathname !== "/") {
    pathname = pathname.slice(0, -1);
  }
  let pageData = pd[pathname];
  if (!pageData) {
    throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}`;
  }
  ;
  console.log(`Loading ${window.location.pathname}:`, pageData);
  const serverState = pageData.state;
  const serverObservers = pageData.ooa;
  const stateObjectAttributes = pageData.soa;
  const isInWatchMode = pageData.w;
  const pageLoadHooks = pageData.plh;
  const state = {
    subjects: {},
    populate: (serverState2) => {
      for (const [subjectName, value] of Object.entries(serverState2)) {
        const subject = value;
        state.subjects[subjectName] = {
          id: subject.id,
          value: subject.value,
          observers: []
        };
      }
    },
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
  state.populate(serverState);
  pageData.sm = state;
  for (const observer of serverObservers || []) {
    const el = document.querySelector(`[key="${observer.key}"]`);
    let values = {};
    for (const id of observer.ids) {
      const subject = state.get(id);
      if (!subject) throw `No subject with id ${id}`;
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
  }
  for (const soa of stateObjectAttributes || []) {
    const el = document.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id);
    if (!subject) throw `SOA, no subject with ID: ${soa.id}`;
    el[soa.attribute] = (event) => subject.value(state, event);
  }
  for (const pageLoadHook of pageLoadHooks || []) {
    pageLoadHook(state);
  }
  if (isInWatchMode && !evtSource) {
    evtSource = new EventSource("http://localhost:3001/events");
    evtSource.onmessage = async (event) => {
      console.log(`Message: ${event.data}`);
      if (event.data === "reload") {
        const newHTML = await fetch(window.location.href);
        document.body = new DOMParser().parseFromString(await newHTML.text(), "text/html").body;
        const link = document.querySelector("[rel=stylesheet]");
        if (!link) {
          return;
        }
        const href = link.getAttribute("href");
        link.setAttribute("href", href.split("?")[0] + "?" + (/* @__PURE__ */ new Date()).getTime());
        load();
      } else if (event.data === "hard-reload") {
        window.location.reload();
      }
    };
  }
};
load();
