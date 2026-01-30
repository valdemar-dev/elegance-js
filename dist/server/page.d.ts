import { CompilerOptions } from "../compilation/compiler";
import { AnyElement } from "../elements/element";
import { LayoutInformation } from "./layout";
type PageParams = Record<any, unknown>;
type PageConstructor = ((params: PageParams) => AnyElement) | ((params: PageParams) => Promise<AnyElement>);
type PageMetadataConstructor = ((params: PageParams) => AnyElement) | ((params: PageParams) => Promise<AnyElement>);
/**
 * Described the formatted supported exports of a given page.
 */
type PageExports = {
    isDynamic: boolean;
    pageConstructor: PageConstructor;
    pageMetadataConstructor: PageMetadataConstructor;
};
/**
 * Holds information about a given user-defined page within the project.
 */
type PageInformation = {
    /** The absolute path to the .ts file containing the module for this page. */
    modulePath: string;
    /** The pathname of this page relative to pagesDirectory */
    pathname: string;
    exports: PageExports;
    /** This is just the result of pathname.split("/") */
    pathnameParts: string[];
    /** Whether or not this page's route has any "slug" parts, like [user] (next-js style) */
    containsCatchAllParts: boolean;
    /** An in-order list of the layouts that apply to this page. */
    applicableLayouts: LayoutInformation[];
};
declare function invalidPageError(compilerOptions: CompilerOptions, modulePath: string, reason: string): Error;
export { invalidPageError, };
export type { PageInformation, PageExports, PageParams, PageConstructor, PageMetadataConstructor, };
