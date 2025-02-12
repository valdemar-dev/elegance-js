declare const parser: DOMParser;
declare const serializer: XMLSerializer;
declare const pageStringCache: Map<any, any>;
declare let cleanupFunctions: Array<() => void>;
declare let evtSource: EventSource | null;
declare let currentPage: string;
declare const fetchLocalPage: (targetURL: URL) => Promise<Document | undefined>;
declare const unload: () => void;
declare const load: () => void;
