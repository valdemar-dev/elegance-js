export declare const serverSideRenderPage: (page: Page) => Promise<{
    bodyHTML: string;
    storedEventListeners: Record<string, {
        [key: string]: string;
    }>;
}>;
