declare const domParser: DOMParser;
declare const xmlSerializer: XMLSerializer;
declare const pageStringCache: Map<any, any>;
declare let currentPage: string;
declare let cleanupFunctions: Array<() => void>;
declare const sanitizePathname: (pn: string) => string;
declare const loadObserverObjectAttributes: (pageData: any, deprecatedKeys: string[], state: State<any>) => void;
declare const loadStateObjectAttributes: (pageData: any, deprecatedKeys: string[], state: State<any>) => void;
declare const loadPage: (deprecatedKeys?: string[]) => void;
declare const fetchPage: (targetURL: URL) => Promise<Document | void>;
declare const getDeprecatedKeys: ({ breakpointKey, document }: {
    breakpointKey: string;
    document: Document;
}) => string[];
declare const navigateLocally: (target: string, pushState?: boolean) => Promise<void>;
