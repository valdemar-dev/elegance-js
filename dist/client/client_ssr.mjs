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

// src/client/hydrator.ts
var Hydrator = class {
  constructor() {
    console.log("%cElegance hydrator is loading..", "font-size: 30px; color: #ffffaa");
  }
  log(content) {
    console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
  }
  hydratePage(pageInfo) {
    const storedEventListeners = pageInfo.storedEventListeners;
    const start = performance.now();
    for (const storedEventListener of storedEventListeners) {
      const correspondingElement = document.querySelector(`[e-id="${storedEventListener.eleganceID}"]`);
      if (!correspondingElement) {
        throw `No element with e-id: ${storedEventListener.eleganceID} found when trying to hydrate page.`;
      }
      if (!(correspondingElement instanceof HTMLElement)) {
        throw `Only HTML Elements may be hydrated.`;
      }
      for (const listener of storedEventListener.eventListeners) {
        const attributeName = listener.attributeName.toLowerCase();
        correspondingElement[attributeName] = listener.eventListener;
      }
    }
    this.log(`Finished hydrating in ${Math.round(performance.now() - start)}ms.`);
  }
};

// src/client/client_ssr.ts
(async () => {
  const unminimizePageInfo = (minimized) => {
    return {
      renderingMethod: minimized.rm,
      storedEventListeners: minimized.sels.map((selection) => ({
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
  if (pageInfo.renderingMethod !== 1 /* SERVER_SIDE_RENDERING */) {
    throw `The SERVER_SIDE_RENDERING client may only be used if the page has been rendered via the SERVER_SIDE_RENDERING renderingMethod.`;
  }
  const hydrator = new Hydrator();
  const router = new Router();
  globalThis.eleganceHydrator = hydrator;
  hydrator.hydratePage(pageInfo);
  return;
})();
