// src/helpers/getPageInfo.ts
var unmimizePageInfo = (minimized) => {
  return {
    pathname: minimized.a,
    storedEventListeners: minimized.b?.map((selection) => ({
      eleganceID: selection.id,
      eventListeners: selection.els.map((element) => ({
        attributeName: element.an,
        eventListener: element.el
      }))
    })),
    storedState: minimized.c?.map((state) => ({
      id: state.id,
      value: state.v,
      enforceRuntimeTypes: state.ert,
      scope: state.s,
      debounce: state.db ?? 0,
      resetOnPageLeave: state.ropl
    })),
    onHydrateFinish: minimized.d,
    storedObservers: minimized.e
  };
};
var getPageInfo = (pathname) => {
  const minimizedPageInfos = globalThis.__PAGE_INFOS__;
  if (!minimizedPageInfos) {
    alert("Misconfigured Elegance.JS server, check console.");
    throw `globalThis.__PAGE_INFOS__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.`;
  }
  const minimized = minimizedPageInfos.find((p) => p.a === pathname);
  if (!minimized) {
    throw `Page with pathname not found.`;
  }
  return unmimizePageInfo(minimized);
};
export {
  getPageInfo
};
