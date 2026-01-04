import { IncomingMessage, ServerResponse } from "http";
/** Populate layout and page map for the server, so it knows what pages exist within the project. */
declare function populateServerMaps(pageMap: Map<any, any>, layoutMap: Map<any, any>): void;
/** Render a page that has been deemed dynamic. */
declare function buildDynamicPage(DIST_DIR: string, directory: string, pageInfo: PageInformation, req: IncomingMessage, res: ServerResponse, middlewareData: MiddlewareData): Promise<false | {
    resultHTML: any;
}>;
/** Check if a given pathname was found during the original compilation process. */
declare function doesPageExist(pathname: string): boolean;
/** Retrieve a given pathname from the page map. */
declare function getPage(pathname: string): any;
export { populateServerMaps, doesPageExist, getPage, buildDynamicPage, };
