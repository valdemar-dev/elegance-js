import { relative } from "node:path";
import { AnyElement } from "../elements/element";
import { CompilerOptions } from "../compilation/compiler";

/**
 * These become page({ props: <your_props> }) within page.ts
 */
type LayoutProps = Record<string, unknown>;

type LayoutConstructorParameters = { 
    child: (props: LayoutProps) => AnyElement,
};

type LayoutConstructor = ((params: LayoutConstructorParameters) => AnyElement) | ((params: LayoutConstructorParameters) => Promise<AnyElement>);
type LayoutMetadataConstructor = (() => AnyElement[]) | (() => Promise<AnyElement[]>);

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

function invalidLayoutError(compilerOptions: CompilerOptions, modulePath: string, reason: string) {
    const relativePath = relative(compilerOptions.pagesDirectory, modulePath);

    return new Error(`The layout at path: "${relativePath}" is invalid.\n${reason}`);
}

export type {
    LayoutInformation,
    LayoutExports,
    LayoutConstructor,
    LayoutMetadataConstructor,
    LayoutConstructorParameters,
    LayoutProps,
}

export {
    invalidLayoutError,
}