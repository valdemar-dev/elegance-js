type IPCRequest = {
    /** Send this back using process.send() and a reply in order to resolve a request. */
    id: number;
    /** What the parent process wants us to do. */
    action: string;
    /** Arbitrary data set by the parent process. */
    content: any;
};
declare const PAGE_MAP: Map<any, any>;
declare const LAYOUT_MAP: Map<any, any>;
declare function gatherPages(requestId: number): Promise<void>;
declare function compileStaticPages(requestId: number): Promise<void>;
declare function compileDynamicPage(requestId: number, pathname: string): Promise<void>;
declare function resolveRequest(requestId: number, content: any): void;
