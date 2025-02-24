import "../shared/bindServerElements";
export declare const renderRecursively: (element: Child) => string;
export declare const serverSideRenderPage: (page: Page, pathname: string) => Promise<{
    bodyHTML: string;
}>;
