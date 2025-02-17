declare const domParser: DOMParser;
declare const xmlSerializer: XMLSerializer;
declare const pageStringCache: Map<any, any>;
declare const loc: Location;
declare const doc: Document;
declare let cleanupFunctions: Array<() => void>;
declare const makeArray: {
    <T>(arrayLike: ArrayLike<T>): T[];
    <T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
    <T>(iterable: Iterable<T> | ArrayLike<T>): T[];
    <T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
};
declare const sanitizePathname: (pn: string) => string;
declare let currentPage: string;
declare const loadPage: (deprecatedKeys?: string[]) => void;
declare const fetchPage: (targetURL: URL) => Promise<Document | void>;
declare const navigateLocally: (target: string, pushState?: boolean) => Promise<void>;
