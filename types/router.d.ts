export class Router {
    private savedPages: Map<string, Page>;
    private pageStates: Map<string, PageState>;
    private onNavigateCallbacks: Array<() => void>;

    constructor();
    private log(content: string): void;
    private async performPageCleanup(pageState?: PageState): Promise<void>;
    private sleep(ms: number): Promise<void>;
    public async navigate(pathname: string, pushState?: boolean): Promise<void>;
    private async getPage(pathname: string): Promise<Page | void>;
    public addPage(pathname: string, page: Page): void;
    public prefetch(pathname: string): void;
    public onNavigate(callback: () => void): void;
    public setPopState(): void;
}

export const getRouter: () => Router;
