


export class Hydrator {
    constructor() {
         console.log("%cElegance hydrator is loading..", "font-size: 30px; color: #ffffaa");
    }

    log(content: any) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
    }

    hydratePage(pageInfo: PageInfo) {
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
                const attributeName = listener.attributeName.toLowerCase() as keyof GlobalEventHandlers;

                correspondingElement[attributeName] = listener.eventListener;
            }
        }

        this.log(`Finished hydrating in ${Math.round(performance.now() - start)}ms.`);
    }
}
