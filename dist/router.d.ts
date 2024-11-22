declare class Router {
    savedPages: Map<string, Page>;
    onNavigateCallbacks: Array<() => void>;
    currentPage: string;
    constructor();
    log(content: any): void;
    sleep(ms: number): Promise<unknown>;
    navigate(pathname: string, pushState?: boolean): Promise<void>;
    getPage(pathname: string): Promise<any>;
    addPage(pathname: string, page: Page): void;
    prefetch(pathname: string): void;
    onNavigate(callback: () => void): void;
    setPopState(): void;
}
declare const getRouter: () => Router;
export { getRouter, Router, };
