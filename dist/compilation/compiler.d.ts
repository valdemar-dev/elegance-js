/**
 * This file contains the functions used by compiler_process to compile pages.
 */
import { AnyElement, SpecialElementOption } from "../elements/element";
/** Context of a page that will / is being compiled. */
type PageCompilationContext = {
    /** The absolute path to the .ts file containing the module for this page. */
    modulePath: string;
    /** The slash starting relative pathname (relative to pagesDirectory) of this page. */
    pathname: string;
    /**
     * An id counter starting from 0, that is incremented once per generateID() call,
     * and is used in conjunction with the pathname to generate unique static IDs (order-dependent)
     */
    idCounter: number;
};
type CompilerOptions = {
    pagesDirectory: string;
};
declare function setCompilerOptions(newOptions: CompilerOptions): void;
declare function generatePageCompilationContext(pathname: string): PageCompilationContext;
/** The result of turning an element into a string and extracting any special options from it. */
type SerializationResult = {
    serializedElement: string;
    specialOptions: SpecialElementOption[];
};
declare function serializeElement(compilationContext: PageCompilationContext, element: AnyElement): SerializationResult;
export { setCompilerOptions, generatePageCompilationContext, serializeElement, };
