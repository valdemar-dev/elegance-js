import "../bindElements";
import { Router } from "../router";
import { Renderer } from "../renderer";
import { RenderingMethod } from "../types/Metadata";
import { StateController } from "../state";
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
  if (pageInfo.renderingMethod !== RenderingMethod.CLIENT_SIDE_RENDERING) {
    throw `The CLIENT_SIDE_RENDERING client may only be used if the page has been rendered via the CLIENT_SIDE_RENDERING renderingMethod.`;
  }
  const scripts = document.querySelectorAll('script[type="module"]');
  const pageScript = Array.from(scripts).find((script) => {
    const htmlScript = script;
    return htmlScript.src.includes("/page.js");
  });
  if (!pageScript) {
    throw new Error("Failed to mount elegance. No page script found.");
  }
  const module = await import(pageScript.src);
  if (!module.page) throw new Error("Page script does not export page function.");
  const renderer = new Renderer();
  const stateController = new StateController();
  const router = new Router();
  globalThis.eleganceRouter = router;
  globalThis.eleganceStateController = stateController;
  globalThis.eleganceRenderer = renderer;
  router.addPage(window.location.pathname, module.page);
  renderer.renderPage(module.page);
})();
