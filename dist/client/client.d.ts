declare const parser: DOMParser;
declare const serializer: XMLSerializer;
declare const pageStringCache: Map<any, any>;
declare let cleanupFunctions: Array<() => void>;
declare let evtSource: EventSource | null;
declare let currentPage: string;
declare const sanitizePathname: (pn: string) => string;
declare const fetchPage: (targetURL: URL) => Promise<Document | void>;
declare const getDeprecatedKeys: ({ breakpointKey, }: {
    breakpointKey: string;
}) => string[];
declare const navigateLocally: (target: string, pushState?: boolean) => Promise<void>;
declare const load: (deprecatedKeys?: string[]) => void;
