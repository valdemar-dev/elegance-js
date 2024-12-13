// src/shared/bindBrowserElements.ts
var elementsWithAttributesAndChildren = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "body",
  "blockquote",
  "button",
  "canvas",
  "cite",
  "code",
  "colgroup",
  "data",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
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
  "header",
  "hr",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "pre",
  "progress",
  "q",
  "section",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "u",
  "ul",
  "var",
  "video",
  "details",
  "datalist"
];
var elementsWithAttributesOnly = [
  "audio",
  "base",
  "br",
  "col",
  "embed",
  "link",
  "meta",
  "noscript",
  "source",
  "track",
  "wbr",
  "area",
  "command",
  "picture",
  "progress",
  "html",
  "head"
];
var elementsWithChildrenOnly = [
  "title",
  "template"
];
var define = (tagName, hasAttr, hasChildren) => {
  return (...args) => {
    let options = {};
    let children = [];
    if (hasAttr && args.length > 0 && typeof args[0] === "object") {
      options = args[0];
      if (hasChildren && args.length > 1) {
        children = args.slice(1);
      }
    } else if (hasChildren && args.length > 0) {
      children = args;
    }
    return () => ({
      tag: tagName,
      getOptions: options ? () => {
        const reevaluatedObj = {};
        for (const key of Object.keys(options)) {
          const value = options[key];
          if (typeof value !== "function") {
            reevaluatedObj[key] = value;
            continue;
          }
          if (key.startsWith("on")) {
            reevaluatedObj[key] = value;
            continue;
          }
          reevaluatedObj[key] = value();
        }
        return reevaluatedObj;
      } : () => ({}),
      children
    });
  };
};
globalThis._e = {
  ...elementsWithAttributesAndChildren.reduce((acc, el) => {
    acc[el] = define(el, true, true);
    return acc;
  }, {}),
  ...elementsWithChildrenOnly.reduce((acc, el) => {
    acc[el] = define(el, false, true);
    return acc;
  }, {}),
  ...elementsWithAttributesOnly.reduce((acc, el) => {
    acc[el] = define(el, true, false);
    return acc;
  }, {})
};

// src/shared/router.ts
var Router = class {
  constructor() {
    this.stateController = globalThis.eleganceStateController;
    this.renderer = globalThis.eleganceRenderer;
    console.log("%cElegance router is loading..", "font-size: 30px; color: #aaffaa");
    this.savedPages = /* @__PURE__ */ new Map();
    this.onNavigateCallbacks = [];
    this.currentPage = window.location.pathname;
  }
  log(content) {
    console.log(`%c${content}`, "font-size: 15px; color: #aaffaa");
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async navigate(pathname, pushState = true) {
    if (!pathname.startsWith("/")) {
      throw new Error("Elegance router can only navigate to local pages.");
    }
    this.log("Calling onNavigateCallbacks..");
    for (const onNavigateCallback of this.onNavigateCallbacks) {
      onNavigateCallback();
    }
    this.onNavigateCallbacks = [];
    this.log("Performing state cleanup..");
    this.stateController.resetEphemeralSubjects();
    this.stateController.cleanSubjectObservers();
    this.log(`Navigating to page: ${pathname}`);
    const page = this.savedPages.get(pathname) ?? await this.getPage(pathname);
    if (!page) throw new Error("Failed to fetch page.");
    if (pushState) {
      history.pushState(null, "", pathname);
    }
    this.currentPage = pathname;
    this.renderer.renderPage(page);
  }
  async getPage(pathname) {
    if (this.savedPages.has(pathname)) return;
    if (!pathname.startsWith("/")) {
      throw new Error("Elegance router can only fetch local pages.");
    }
    this.log(`Fetching URL: ${pathname}`);
    const optionalSlash = pathname === "/" ? "" : "/";
    const pageDataRaw = await fetch(pathname);
    if (!pageDataRaw.ok) {
      throw `Could not load page at ${pathname}, received HTTP response status ${pageDataRaw.status}. ${pageDataRaw.statusText}`;
    }
    const pageData = await pageDataRaw.text();
    const parser = new DOMParser();
    const parsedPageData = parser.parseFromString(pageData, "text/html");
    try {
      const { page } = await import(pathname + optionalSlash + "page.js");
      if (!page) {
        throw new Error(`Page at ${pathname} could not be loaded.`);
      }
      this.addPage(pathname, page);
      return page;
    } catch (error) {
      this.log(`Could not load the page at ${pathname}: ${error}`);
      return;
    }
  }
  addPage(pathname, page) {
    this.log(`Saving page with pathname: ${pathname}`);
    this.savedPages.set(pathname, page);
  }
  async prefetch(pathname) {
    await this.getPage(pathname);
  }
  onNavigate(callback) {
    this.log("Adding onNavigateCallback.");
    this.onNavigateCallbacks.push(callback);
  }
  setPopState() {
    window.onpopstate = (event) => {
      event.preventDefault();
      const currentOrigin = window.location.origin;
      const target = event.target;
      const newOrigin = target.origin;
      if (newOrigin !== currentOrigin) return;
      if (this.currentPage === target.location.pathname) return;
      const relativeLocation = window.location.href.replace(window.location.origin, "");
      this.navigate(relativeLocation, false);
    };
  }
};

// src/client/client_ssg.ts
(async () => {
  const unminimizePageInfo = (minimized) => {
    return {
      renderingMethod: minimized.rm,
      storedEventListeners: minimized.sels?.map((selection) => ({
        eleganceID: selection.id,
        eventListeners: selection.els.map((element) => ({
          attributeName: element.an,
          eventListener: element.el
        }))
      }))
    };
  };
  const minimizedPageInfo = globalThis.__ELEGANCE_PAGE_INFO__;
  if (!minimizedPageInfo) {
    alert("Misconfigured Elegance.JS server, check console.");
    throw `globalThis.__ELEGANCE_PAGE_INFO__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.`;
  }
  const pageInfo = unminimizePageInfo(minimizedPageInfo);
  if (pageInfo.renderingMethod !== 2 /* STATIC_GENERATION */) {
    throw `The STATIC_GENERATION client may only be used if the page has been rendered via the STATIC_GENERATION renderingMethod.`;
  }
  throw `STATIC_GENERATION renderingMethod not implemented yet.`;
  const router = new Router();
  return;
})();
