(() => {
  window.__name = (func) => func;
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
  Object.assign(globalThis, elements);
  Object.assign(globalThis, childrenlessElements);
  console.log("Elegance.JS is loading..");
  if (!globalThis.pd) globalThis.pd = {};
  if (!globalThis.ld) globalThis.ld = {};
  Object.assign(window, {
    observe: (subjects, updateCallback) => {
      return {
        subjects,
        updateCallback,
        isAttribute: true,
        type: 2
        /* OBSERVER */
      };
    },
    eventListener: (subjects, eventListener) => {
      return {
        subjects,
        eventListener,
        isAttribute: true,
        type: 1
        /* STATE */
      };
    }
  });
  var domParser = new DOMParser();
  var xmlSerializer = new XMLSerializer();
  var pageStringCache = /* @__PURE__ */ new Map();
  var loc = window.location;
  var doc = document;
  var cleanupProcedures = [];
  var sanitizePathname = (pn) => {
    if (!pn.endsWith("/") || pn === "/") return pn;
    return pn.slice(0, -1);
  };
  var currentPage = sanitizePathname(loc.pathname);
  var createStateManager = (subjects, bindLevel) => {
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
      get: (id) => {
        const subject = state.subjects.find((s) => s.id === id);
        if (subject) return subject;
        if (bindLevel === 2) return void 0;
        const parts = window.location.pathname.split("/").filter(Boolean);
        const paths = [
          ...parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/")),
          "/"
        ].reverse();
        for (const item of paths) {
          const sanitized = sanitizePathname(item);
          const data = ld[sanitized];
          if (!data) continue;
          const entry = data.stateManager.get(id);
          if (entry) return entry;
        }
        return void 0;
      },
      /**
          Bind is deprecated, but kept as a paramater to not upset legacy code.
      */
      getAll: (refs) => refs?.map((ref) => {
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
  var initPageData = (data, currentPage2, previousPage, bindLevel) => {
    if (!data) {
      console.error("Data for page " + currentPage2 + " is null.");
      return;
    }
    let state = data?.stateManager;
    if (!state) {
      state = createStateManager(data.state || [], bindLevel);
      data.stateManager = state;
    }
    for (const subject of state.subjects) {
      if (!subject.observers) subject.observers = /* @__PURE__ */ new Map();
    }
    for (const ooa of data.ooa || []) {
      const els = doc.querySelectorAll(`[key="${ooa.key}"]`);
      let values = {};
      for (const { id } of ooa.refs) {
        const subject = state.get(id);
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
    for (const soa of data.soa || []) {
      const el = doc.querySelector(`[key="${soa.key}"]`);
      if (!el) {
        console.error("Could not find SOA element for SOA:", soa);
        continue;
      }
      const subject = state.get(soa.id);
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
    const loadHooks = data.lh;
    for (const loadHook of loadHooks || []) {
      const wasInScope = previousPage ? previousPage.startsWith(currentPage2) : false;
      if (wasInScope && bindLevel !== 1) {
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
                page: `${currentPage2}`,
                loadHook,
                bindLevel
              });
            }
          });
        } else {
          cleanupFunction = fn(state);
          if (cleanupFunction) {
            cleanupProcedures.push({
              cleanupFunction,
              page: `${currentPage2}`,
              loadHook,
              bindLevel
            });
          }
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }
  };
  var loadPage = (previousPage = null) => {
    const fixedUrl = new URL(loc.href);
    fixedUrl.pathname = sanitizePathname(fixedUrl.pathname);
    const pathname = fixedUrl.pathname;
    currentPage = pathname;
    pageStringCache.set(
      currentPage,
      xmlSerializer.serializeToString(doc)
    );
    history.replaceState(null, "", fixedUrl.href);
    {
      let pageData = pd[pathname];
      if (!pd) {
        console.error(`%cFailed to load! Missing page data!`, "font-size: 20px; font-weight: 600;");
        return;
      }
      ;
      initPageData(
        pageData,
        currentPage,
        previousPage,
        1
        /* STRICT */
      );
    }
    {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const paths = [
        ...parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/")),
        "/"
      ];
      for (const path of paths) {
        const data = ld[path];
        if (!data) {
          continue;
        }
        initPageData(
          data,
          path,
          previousPage,
          2
          /* SCOPED */
        );
      }
    }
    console.info(
      `Loading finished, cleanupProcedures are currently:`,
      cleanupProcedures
    );
  };
  var fetchPage = async (targetURL) => {
    const pathname = sanitizePathname(targetURL.pathname);
    if (pageStringCache.has(pathname)) {
      return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
    }
    const res = await fetch(targetURL);
    const newDOM = domParser.parseFromString(await res.text(), "text/html");
    {
      const dataScripts = Array.from(newDOM.querySelectorAll('script[data-module="true"]'));
      const currentScripts = Array.from(document.head.querySelectorAll('script[data-module="true"]'));
      for (const dataScript of dataScripts) {
        const existing = currentScripts.find((s) => s.src === dataScript.src);
        if (existing) {
          continue;
        }
        document.head.appendChild(dataScript);
      }
    }
    {
      const pageDataScript = newDOM.querySelector('script[data-page="true"]');
      if (!pageDataScript) {
        return;
      }
      if (!pd[pathname]) {
        await import(pageDataScript.src);
      }
    }
    {
      const layoutDataScripts = Array.from(newDOM.querySelectorAll('script[data-layout="true"]'));
      for (const script of layoutDataScripts) {
        const url = new URL(script.src, window.location.origin);
        const dir = url.pathname.substring(0, url.pathname.lastIndexOf("/")) || "/";
        const pathname2 = sanitizePathname(dir);
        if (!ld[pathname2]) {
          await import(script.src);
        }
      }
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
    for (const cleanupProcedure of [...cleanupProcedures]) {
      const isInScope = pathname.startsWith(cleanupProcedure.page);
      if (!isInScope || cleanupProcedure.bindLevel === 1) {
        try {
          cleanupProcedure.cleanupFunction();
        } catch (e) {
          console.error(e);
          return;
        }
        cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure), 1);
      }
    }
    let oldPageLatest = doc.body;
    let newPageLatest = newPage.body;
    {
      const newPageLayouts = Array.from(newPage.querySelectorAll("template[layout-id]"));
      const oldPageLayouts = Array.from(doc.querySelectorAll("template[layout-id]"));
      const size = Math.min(newPageLayouts.length, oldPageLayouts.length);
      for (let i = 0; i < size; i++) {
        const newPageLayout = newPageLayouts[i];
        const oldPageLayout = oldPageLayouts[i];
        const newLayoutId = newPageLayout.getAttribute("layout-id");
        const oldLayoutId = oldPageLayout.getAttribute("layout-id");
        if (newLayoutId !== oldLayoutId) {
          break;
        }
        oldPageLatest = oldPageLayout.nextElementSibling;
        newPageLatest = newPageLayout.nextElementSibling;
      }
    }
    oldPageLatest.replaceWith(newPageLatest);
    {
      doc.head.querySelector("title")?.replaceWith(
        newPage.head.querySelector("title") ?? ""
      );
      const update = (targetList, matchAgainst, action) => {
        for (const target2 of targetList) {
          const matching = matchAgainst.find((n) => n.isEqualNode(target2));
          if (matching) {
            continue;
          }
          action(target2);
        }
      };
      const oldTags = Array.from([
        ...Array.from(document.head.querySelectorAll("link")),
        ...Array.from(document.head.querySelectorAll("meta")),
        ...Array.from(document.head.querySelectorAll("script")),
        ...Array.from(document.head.querySelectorAll("base")),
        ...Array.from(document.head.querySelectorAll("style"))
      ]);
      const newTags = Array.from([
        ...Array.from(newPage.head.querySelectorAll("link")),
        ...Array.from(newPage.head.querySelectorAll("meta")),
        ...Array.from(newPage.head.querySelectorAll("script")),
        ...Array.from(newPage.head.querySelectorAll("base")),
        ...Array.from(newPage.head.querySelectorAll("style"))
      ]);
      update(newTags, oldTags, (node) => document.head.appendChild(node));
      update(oldTags, newTags, (node) => node.remove());
    }
    if (pushState) history.pushState(null, "", targetURL.href);
    loadPage(currentPage);
    currentPage = pathname;
    if (targetURL.hash) {
      doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }
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
    if (typeof element.options !== "object" && element.options !== void 0) {
      const childNode = renderRecursively(element.options, attributes);
      if (childNode) domElement.appendChild(childNode);
    } else if (typeof element.options === "object") {
      const { tag, options, children } = element.options;
      if (tag !== void 0 || options !== void 0 || children !== void 0) {
        const childNode = renderRecursively(element.options, attributes);
        if (childNode) domElement.appendChild(childNode);
      } else {
        for (const [attrName, attrValue] of Object.entries(element.options)) {
          if (typeof attrValue === "object") {
            const { isAttribute } = attrValue;
            if (isAttribute === void 0 || isAttribute === false) {
              console.error("Objects are not valid option property values.");
              throw "";
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
  const watchServerPort = 3001;
  var eventSource = new EventSource(`http://localhost:${watchServerPort}/events`);
  eventSource.onerror = async () => {
  };
  eventSource.onmessage = async (event) => {
    if (event.data === "reload") {
      for (const cleanupProcedure of cleanupProcedures) {
        cleanupProcedure.cleanupFunction();
      }
      cleanupProcedures = [];
      pd[sanitizePathname(loc.pathname)].stateManager.subjects.map((subj) => ({ ...subj, observers: [] }));
      const newHTML = await fetch(window.location.href);
      const newDOM = domParser.parseFromString(
        await newHTML.text(),
        "text/html"
      );
      document.body.replaceWith(newDOM.body);
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
