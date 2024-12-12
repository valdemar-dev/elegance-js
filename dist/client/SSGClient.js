import "../bindElements";
import { Router } from "../router";
import { RenderingMethod } from "../types/Metadata";
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
  if (pageInfo.renderingMethod !== RenderingMethod.STATIC_GENERATION) {
    throw `The STATIC_GENERATION client may only be used if the page has been rendered via the STATIC_GENERATION renderingMethod.`;
  }
  throw `STATIC_GENERATION renderingMethod not implemented yet.`;
  const router = new Router();
  return;
})();
