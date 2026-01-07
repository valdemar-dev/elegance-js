import { AnyElement } from "../elements/element";

type LayoutConstructor = (() => AnyElement) | (() => Promise<AnyElement>);
type LayoutMetadataConstructor = (() => AnyElement) | (() => Promise<AnyElement>);

/**
 * Described the formatted supported exports of a given page.
 */
type LayoutExports = {
    isDynamic: boolean,
    layoutConstructor: LayoutConstructor,
    layoutMetadataConstructor: LayoutMetadataConstructor,
};

/**
 * Holds information about a given user-defined layout within the project.
 */
type LayoutInformation = {
    /** The absolute path to the .ts file containing the module for this page. */
    modulePath: string,

    /** The pathname of this page relative to pagesDirectory */
    pathname: string,

    exports: LayoutExports,
};

export {
    LayoutInformation,
    LayoutExports,
    LayoutConstructor,
    LayoutMetadataConstructor
}