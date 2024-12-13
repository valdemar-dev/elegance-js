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
export {
  Hydrator
};
