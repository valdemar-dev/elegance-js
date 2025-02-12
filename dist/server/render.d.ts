import "../shared/bindBrowserElements";
export declare const renderRecursively: (element: Child) => string;
export declare const serverSideRenderPage: (page: Page, pathname: string) => Promise<{
    bodyHTML: string;
}>;
