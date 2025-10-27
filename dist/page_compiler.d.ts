import type { IncomingMessage, ServerResponse } from "http";
export declare const PAGE_MAP: Map<string, PageInformation>;
export declare const LAYOUT_MAP: Map<string, LayoutInformation>;
export declare const processPageElements: (element: Child, objectAttributes: Array<any>, recursionLevel: number, stack?: any[]) => Child;
export declare const buildDynamicPage: (DIST_DIR: string, directory: string, pageInfo: PageInformation, req: IncomingMessage, res: ServerResponse) => Promise<false | {
    resultHTML: any;
}>;
