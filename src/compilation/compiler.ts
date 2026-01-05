/**
 * This file contains the functions used by compiler_process to compile pages.
 */


import path from "path";
import { AnyElement, EleganceElement, ElementOptions, invalidElementError, SpecialElementOption } from "../elements/element";


/** Context of a page that will / is being compiled. */
type PageCompilationContext = {
    /** The absolute path to the .ts file containing the module for this page. */
    modulePath: string,
    
    /** The slash starting relative pathname (relative to pagesDirectory) of this page. */
    pathname: string,

    /** 
     * An id counter starting from 0, that is incremented once per generateID() call, 
     * and is used in conjunction with the pathname to generate unique static IDs (order-dependent) 
     */
    idCounter: number,
};

type CompilerOptions = {
    pagesDirectory: string;
};

let compilerOptions: CompilerOptions;

function setCompilerOptions(newOptions: CompilerOptions) {
    compilerOptions = newOptions;
}

function generateID(compilationContext: PageCompilationContext) {
    compilationContext.idCounter += 1;
}

function generatePageCompilationContext(pathname: string): PageCompilationContext {
    const modulePath = path.join(compilerOptions.pagesDirectory, pathname);

    return {
        pathname: pathname,
        modulePath: modulePath,
        idCounter: 0,
    };
}

/** The result of turning an element into a string and extracting any special options from it. */
type SerializationResult = { serializedElement: string, specialOptions: SpecialElementOption[] };

function serializeEleganceElement(element: EleganceElement<any>): SerializationResult {
    let serializedElement = "";
    let specialOptions: SpecialElementOption[] = [];

    serializedElement += `<${element.tag}`;
    
    // Process options.
    {
        const options = Object.entries(element.options);

        if (options.length > 0) {
            for (const [optionName, optionValue] of options) {
                serializedElement += ` ${optionName}="${optionValue}"`;
            }
        }
    }

    serializedElement += ">";
    
    // Process children.
    {
        if (element.children === null) {

            return { serializedElement, specialOptions, };
        }

        if (element.children.length > 0) {
            for (const child of element.children) {
                const result = serializeElement(child);

                serializedElement += result.serializedElement;
                specialOptions.push(...result.specialOptions);
            }
        }
    }

    serializedElement += `</${element.tag}>`;

    return { serializedElement, specialOptions, };
}

function serializeElement(element: AnyElement): SerializationResult {
    let specialOptions: SpecialElementOption[] = [];
    let serializedElement: string;

    switch (typeof element) {
    case "object":
        if (Array.isArray(element)) {
            serializedElement = element.join(", ");

            break;
        }

        if (element instanceof EleganceElement) {
            const entries = Object.entries(element.options);

            for (const [optionName, optionValue] of entries) {
                if (optionValue instanceof SpecialElementOption) {
                    const { clientToken } = optionValue.serialize(element, optionName);

                }
            }

            const result = serializeEleganceElement(element);

            serializedElement = result.serializedElement;
            specialOptions = result.specialOptions;

            break;
        }

        throw invalidElementError(element, "Arbitrary objects are not valid children.")
    case "boolean":
        serializedElement = `${element}`;
        break;
    case "number":
        serializedElement = element.toString();
        break;
    case "string":
        serializedElement = element;
        break;
    default:
        throw invalidElementError(element, "The typeof of this element as not one of EleganceElement, boolean, number, string or Array. Please convert it into one of these types.");
    }

    return { serializedElement, specialOptions, };
}

export {
    setCompilerOptions,
    serializeElement,
}