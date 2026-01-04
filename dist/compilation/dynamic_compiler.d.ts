import { IncomingMessage, ServerResponse } from "http";
/** Render a page that has been deemed dynamic. */
declare function buildDynamicPage(DIST_DIR: string, directory: string, pageInfo: PageInformation, req: IncomingMessage, res: ServerResponse, middlewareData: MiddlewareData): Promise<false | {
    resultHTML: any;
}>;
/** Check if a given pathname was found during the original compilation process. */
declare function doesPageExist(pathname: string): boolean;
/** Retrieve a given pathname from the page map. */
declare function getPage(pathname: string): PageInformation | undefined;
export { doesPageExist, getPage, buildDynamicPage, };
