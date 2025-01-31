import "../shared/bindBrowserElements";
export declare const serverSideRenderPage: (page: Page, pathname: string) => Promise<{
    bodyHTML: string;
    storedEventListeners: never[];
    storedState: import("./state").Subject<any>[];
    storedObservers: {
        [key: string]: "local" | "global";
    }[];
    onHydrateFinish: undefined;
}>;
