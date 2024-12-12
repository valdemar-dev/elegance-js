export declare const serverSideRenderPage: (page: Page) => Promise<{
    bodyHTML: string;
    storedEventListeners: {
        eleganceID: number;
        eventListeners: string[];
    }[];
}>;
