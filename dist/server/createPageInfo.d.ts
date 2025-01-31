import { ServerStateController } from "./state";
export declare const createPageInfo: ({ storedEventListeners, storedState, storedObservers, pathname, onHydrateFinish, }: {
    storedEventListeners: Array<{
        eleganceID: number;
        eventListeners: string[];
    }>;
    onHydrateFinish?: () => void;
    storedState: ServerStateController["subjectStore"];
    storedObservers: ServerStateController["observerStore"];
    pathname: string;
}) => string;
