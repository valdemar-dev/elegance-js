// src/elements.ts
var createElementOptions = (obj) => {
  return function() {
    const reevaluatedObj = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "function") {
        if (key.startsWith("on")) {
          reevaluatedObj[key] = value;
        } else {
          reevaluatedObj[key] = value();
        }
      } else {
        reevaluatedObj[key] = value;
      }
    }
    return reevaluatedObj;
  };
};
var createBuildableElement = (tag) => {
  return (options, ...children) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children
    });
  };
};
var createOptionlessBuildableElement = (tag) => {
  return (...children) => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children
    });
  };
};
var createChildrenlessBuildableElement = (tag) => {
  return (options) => {
    const getOptions = createElementOptions(options);
    return () => ({
      tag,
      getOptions,
      children: []
    });
  };
};
var createChildrenlessOptionlessBuildableElement = (tag) => {
  return () => {
    return () => ({
      tag,
      getOptions: () => ({}),
      children: []
    });
  };
};
var optionlessElementTags = [
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
  "var",
  "wbr"
];
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
  "param",
  "source",
  "track"
];
var childrenlessOptionlessElementTags = [
  "basefont",
  "isindex",
  "keygen"
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
  "title",
  "tr",
  "ul",
  "video",
  "span"
];
var elements = {};
var optionlessElements = {};
var childrenlessElements = {};
var childrenlessOptionlessElements = {};
for (const element of elementTags) {
  elements[element] = createBuildableElement(element);
}
for (const element of optionlessElementTags) {
  optionlessElements[element] = createOptionlessBuildableElement(element);
}
for (const element of childrenlessElementTags) {
  childrenlessElements[element] = createChildrenlessBuildableElement(element);
}
for (const element of childrenlessOptionlessElementTags) {
  childrenlessOptionlessElements[element] = createChildrenlessOptionlessBuildableElement(element);
}
var allElements = {
  ...elements,
  ...optionlessElements,
  ...childrenlessElements,
  ...childrenlessOptionlessElements
};

// src/bindElements.ts
Object.assign(globalThis, elements);
Object.assign(globalThis, optionlessElements);
Object.assign(globalThis, childrenlessElements);
Object.assign(globalThis, childrenlessOptionlessElements);

// src/router.ts
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

// src/client/ssg_client.ts
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
