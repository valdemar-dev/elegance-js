import { ServerRenderer } from "./renderer";
import { ServerRouter } from "./router";
import { ServerStateController } from "./state";
import "../shared/bindBrowserElements";

type SSRPage = {
    returnHTML: string,
}

export const serverSideRenderPage = async (page: Page) => {
    if (!page) {
        throw `No Page Provided.`;
    }

    if (typeof page !== "function") {
        throw `Page must be a function.`;
    }

    const state = new ServerStateController();
    const router = new ServerRouter();
    const renderer = new ServerRenderer(router, state);

    await renderer.renderPage(page); 

    return {
        bodyHTML: renderer.HTMLString,
        storedEventListeners: renderer.eventListenerStore,
    };
};
