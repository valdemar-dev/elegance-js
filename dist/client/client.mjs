// src/shared/serverElements.ts
var createBuildableElement = (tag) => {
  return (options, ...children) => ({
    tag,
    options: options || {},
    children
  });
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => ({
    tag,
    options: options || {},
    children: null
  });
};
var childrenlessElementTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "path",
  "rect"
];
var elementTags = [
  "a",
  "address",
  "article",
  "aside",
  "audio",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dialog",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "html",
  "iframe",
  "ins",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "summary",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "video",
  "span",
  "script",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "strong",
  "sub",
  "sup",
  "u",
  "wbr",
  "title",
  "svg"
];
var elements = {};
var childrenlessElements = {};
for (const element of elementTags) {
  elements[element] = createBuildableElement(element);
}
for (const element of childrenlessElementTags) {
  childrenlessElements[element] = createChildrenlessBuildableElement(element);
}
var allElements = {
  ...elements,
  ...childrenlessElements
};

// src/shared/bindServerElements.ts
Object.assign(globalThis, elements);
Object.assign(globalThis, childrenlessElements);

// src/client/client.ts
console.log("Elegance.JS is loading..");
if (!globalThis.pd) globalThis.pd = {};
Object.assign(window, {
  observe: (subjects, updateCallback) => {
    return {
      subjects,
      updateCallback,
      isAttribute: true,
      type: 2 /* OBSERVER */
    };
  },
  /*
  observe: (subjects: ClientSubject[], updateCallback: () => any) => {
      const pageData = pd[currentPage];
      
      const keys = [];
      
      for (const subject of subjects) {
          const key = subject.id + Date.now();
          
          keys.push({
              key: key,
              subject: subject.id,
          });
          
          pageData.stateManager.observe(subject, updateCallback, key);
      }
      
      return { keys }
  },
  */
  eventListener: (subjects, eventListener) => {
    return {
      subjects,
      eventListener,
      isAttribute: true,
      type: 1 /* STATE */
    };
  }
});
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
          try {
            observer(s.value);
          } catch (e) {
            console.error(e);
            continue;
          }
        }
      };
      return s;
    }),
    destroy: (s) => {
      state.subjects.splice(state.subjects.indexOf(s), 1);
    },
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
    },
    unobserve: (subject, key) => {
      subject.observers.delete(key);
    }
  };
  return state;
};
var loadPage = (deprecatedKeys = [], newBreakpoints) => {
  const fixedUrl = new URL(loc.href);
  fixedUrl.pathname = sanitizePathname(fixedUrl.pathname);
  const pathname = fixedUrl.pathname;
  currentPage = pathname;
  history.replaceState(null, "", fixedUrl.href);
  let pageData = pd[pathname];
  if (pd === void 0) {
    console.error(`%cFailed to load! Missing page data!`, "font-size: 20px; font-weight: 600;");
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
    state = createStateManager(pageData.state || []);
    pageData.stateManager = state;
  }
  for (const subject of state.subjects) {
    subject.observers = /* @__PURE__ */ new Map();
  }
  for (const ooa of pageData.ooa || []) {
    const els = doc.querySelectorAll(`[key="${ooa.key}"]`);
    let values = {};
    for (const { id, bind } of ooa.refs) {
      const subject = state.get(id, bind);
      values[subject.id] = subject.value;
      const updateFunction = (value) => {
        values[id] = value;
        try {
          const newValue = ooa.update(...Object.values(values));
          let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;
          for (const el of Array.from(els)) {
            el[attribute] = newValue;
          }
        } catch (e) {
          console.error(e);
          return;
        }
      };
      updateFunction(subject.value);
      try {
        state.observe(subject, updateFunction, ooa.key);
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }
  for (const soa of pageData.soa || []) {
    const el = doc.querySelector(`[key="${soa.key}"]`);
    const subject = state.get(soa.id, soa.bind);
    if (typeof subject.value === "function") {
      try {
        el[soa.attribute] = (event) => subject.value(state, event);
      } catch (e) {
        console.error(e);
        return;
      }
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
    try {
      let cleanupFunction;
      if (fn.constructor.name === "AsyncFunction") {
        const res = fn(state);
        res.then((cleanupFunction2) => {
          if (cleanupFunction2) {
            cleanupProcedures.push({
              cleanupFunction: cleanupFunction2,
              bind: `${bind}`
            });
          }
        });
      } else {
        cleanupFunction = fn(state);
        if (cleanupFunction) {
          cleanupProcedures.push({
            cleanupFunction,
            bind: `${bind}`
          });
        }
      }
    } catch (e) {
      console.error(e);
      return;
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
  const newDOM = domParser.parseFromString(await res.text(), "text/html");
  const pageDataScript = newDOM.querySelector('script[data-tag="true"]');
  if (!pageDataScript) {
    return;
  }
  if (!pd[pathname]) {
    const { data } = await import(pageDataScript.src);
    pd[pathname] = data;
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
      try {
        cleanupProcedure.cleanupFunction();
      } catch (e) {
        console.error(e);
        return;
      }
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
var renderRecursively = (element, attributes) => {
  if (typeof element === "boolean") {
    return null;
  }
  if (typeof element === "number" || typeof element === "string") {
    return document.createTextNode(element.toString());
  }
  if (Array.isArray(element)) {
    const fragment = document.createDocumentFragment();
    element.forEach((item) => {
      const childNode = renderRecursively(item, attributes);
      if (childNode) fragment.appendChild(childNode);
    });
    return fragment;
  }
  const domElement = document.createElement(element.tag);
  if (typeof element.options === "object" && element.options !== null) {
    const { tag, options, children } = element.options;
    if (tag !== void 0 && options !== void 0 && children !== void 0) {
      const childNode = renderRecursively(element.options, attributes);
      if (childNode) domElement.appendChild(childNode);
    } else {
      for (const [attrName, attrValue] of Object.entries(element.options)) {
        if (typeof attrValue === "object") {
          const { isAttribute } = attrValue;
          if (isAttribute === void 0 || isAttribute === false) {
            throw "Objects are not valid option property values.";
          }
          attributes.push({
            ...attrValue,
            field: attrName,
            element: domElement
          });
          continue;
        }
        domElement.setAttribute(attrName.toLowerCase(), attrValue);
      }
    }
  }
  if (element.children !== null) {
    if (Array.isArray(element.children)) {
      element.children.forEach((child) => {
        const childNode = renderRecursively(child, attributes);
        if (childNode) domElement.appendChild(childNode);
      });
    } else {
      const childNode = renderRecursively(element.children, attributes);
      if (childNode) domElement.appendChild(childNode);
    }
  }
  return domElement;
};
globalThis.client = {
  navigateLocally,
  fetchPage,
  currentPage,
  sanitizePathname,
  getReference: (id) => document.querySelector(`[ref="${id}"]`),
  renderRecursively
};
try {
  loadPage();
} catch (e) {
  console.error(e);
}
