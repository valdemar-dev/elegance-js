import { relative } from "path";
import { CompilerOptions } from "../compilation/compiler";
import { AnyElement } from "../elements/element";
import { LayoutInformation, LayoutProps } from "./layout";

type PageParams = Record<any, unknown>;
type PageConstructor = ((params: PageParams) => AnyElement) | ((params: PageParams) => Promise<AnyElement>);
type PageMetadataConstructor = ((params: PageParams) => AnyElement) | ((params: PageParams) => Promise<AnyElement>);

/**
 * Described the formatted supported exports of a given page.
 */
type PageExports = {
    isDynamic: boolean,
    pageConstructor: PageConstructor,
    pageMetadataConstructor: PageMetadataConstructor,
    enumerateRoutes: (() => string[]) | null,
};

/** 
 * Holds information about a given user-defined page within the project. 
 */
type PageInformation = {
    /** The absolute path to the .ts file containing the module for this page. */
    modulePath: string,

    /** The pathname of this page relative to pagesDirectory */
    pathname: string,

    exports: PageExports,

    /** This is just the result of pathname.split("/") */
    pathnameParts: string[],

    /** An in-order list of the layouts that apply to this page. */
    applicableLayouts: LayoutInformation[],
};

function invalidPageError(compilerOptions: CompilerOptions, modulePath: string, reason: string) {
    const relativePath = relative(compilerOptions.pagesDirectory, modulePath);

    return new Error(`The page at path: "${relativePath}" is invalid.\n${reason}`);
}

export {
    invalidPageError,
}

export type {
    PageInformation,
    PageExports,

    PageParams,

    PageConstructor,
    PageMetadataConstructor,
}