declare const parser: DOMParser;
declare const serializer: XMLSerializer;
declare const pageStringCache: Map<any, any>;
declare let evtSource: EventSource | null;
declare const fetchLocalPage: (targetURL: URL) => Promise<Document>;
declare let oldPathname: string;
declare const load: () => void;
