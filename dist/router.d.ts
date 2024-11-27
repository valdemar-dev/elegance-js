import { StateController } from "./state";
declare class Router {
    savedPages: Map<string, Page>;
    onNavigateCallbacks: Array<() => void>;
    currentPage: string;
    stateController: StateController;
    constructor();
    log(content: any): void;
    sleep(ms: number): Promise<unknown>;
    navigate(pathname: string, pushState?: boolean): Promise<void>;
    getPage(pathname: string): Promise<any>;
    addPage(pathname: string, page: Page): void;
    prefetch(pathname: string): Promise<void>;
    onNavigate(callback: () => void): void;
    setPopState(): void;
}
declare const getRouter: () => Router;
export { getRouter, Router, };
