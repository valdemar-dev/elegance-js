import { CompilerOptions } from "../compilation/compiler";
import { AnyElement } from "../elements/element";
import { LayoutInformation, LayoutProps } from "./layout";
type PageData = {
    props: LayoutProps;
};
type PageConstructor = ((pageData: PageData) => AnyElement) | ((pageData: PageData) => Promise<AnyElement>);
type PageMetadataConstructor = ((pageData: PageData) => AnyElement) | ((pageData: PageData) => Promise<AnyElement>);
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
    /** An in-order list of the layouts that apply to this page. */
    applicableLayouts: LayoutInformation[];
};
declare function invalidPageError(compilerOptions: CompilerOptions, modulePath: string, reason: string): Error;
export { invalidPageError, };
export type { PageInformation, PageExports, PageConstructor, PageMetadataConstructor, };
