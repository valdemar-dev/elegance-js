import { ServerStateController } from "./state";
import { renderRecursively } from "./renderer";
import "../shared/bindBrowserElements";

export const serverSideRenderPage = async (page: Page, pathname: string) => {
    if (!page) {
        throw `No Page Provided.`;
    }

    const state = new ServerStateController(pathname);

    const bodyHTML = renderRecursively(page, 0);

    return {
        bodyHTML,
        storedEventListeners: [],
        storedState: state.subjectStore,
        storedObservers: state.observerStore,
        onHydrateFinish: undefined,
    };
};
