/**
 * Make an HTML string not be escaped by the Elegance compiler.
 *
 * A wrapped string from process A cannot be unwrapped in process B.
 *
 * **IMPORTANT:** Do not use this in client components. This functions exists for the *server* to prevent HTML injection.
 * For most needs element({ innerHTML: "<p>Hello, World!</p>", }); should be enough.
 * NOTE: Does not return suitable HTML, must be sent to the compiler for processing.
 * @param html Any HTML string.
 * @returns HTML string that will not be escaped by the compiler.
 */
declare function raw(html: string): string;
declare function unwrapAllRaw(input: string): string;
export { raw, unwrapAllRaw, };
