class Router {
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

class Subject<T> {
    enforceRuntimeTypes: boolean;
    observers: Array<{ callback: (value: T) => void }>;
    value: T;
    initialValue: T;
    id: string;
    debounce?: (callback: () => void) => void;
    signalId: number;

    constructor(initialValue: T, id: string, enforceRuntimeTypes?: boolean, debounceUpdateMs?: number | null);

    observe(callback: (value: T) => void): void;

    signal(): void;

    set(newValue: T): void;

    get(): T;

    getInitialValue(): T;
}

class StateController {
    currentPage: string;
    private globalSubjectCache: Array<Subject<any>>;
    private pageSubjectCaches: Map<string, Array<Subject<any>>>;

    constructor();

    private addSubjectPageCache(pathname: string): void;

    setCurrentPage(pathname: string): void;

    create<T>(
        initialValue: T,
        { id, enforceRuntimeTypes, debounceUpdateMs }: { id: string; enforceRuntimeTypes?: boolean; debounceUpdateMs?: number | null }
    ): Subject<T>;

    createGlobal<T>(
        initialValue: T,
        { id, enforceRuntimeTypes, debounceUpdateMs }: { id: string; enforceRuntimeTypes?: boolean; debounceUpdateMs?: number | null }
    ): Subject<T>;

    getGlobal(id: string): Subject<any>;

    get(id: string): Subject<any>;

    observe(id: string, callback: (value: any) => void): void;
}


class Renderer {
    stateController: StateController;
    log: (content: string) => void;
    router: Router;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;

    constructor();

    getPageRenderTime(): number;

    onRenderFinish(callback: () => void): void;

    generateID(): string;

    renderPage(page: Page): void;

    buildElement(element: BuildableElement): BuiltElement;

    assignPropertyToHTMLElement(
        elementInDocument: HTMLElement,
        propertyName: string,
        propertyValue: any
    ): void;

    processElementOptions(
        builtElement: BuiltElement,
        elementInDocument: HTMLElement,
        skipObservables: boolean
    ): void;

    createElement(
        element: BuildableElement,
        parentInDocument: HTMLElement | undefined,
        doRenderAllChildren: boolean
    ): HTMLElement;

    updateElement(eleganceID: string): void;

    processOptionAsObserver(
        option: ObserverOption,
        elementInDocument: HTMLElement,
        builtElement: { getOptions: () => { [key: string]: any } },
        updateKey: string
    ): void;
}

declare function getRouter(): Router;
declare function getState(): StateController;
declare function getRenderer(): Renderer;

type ObserveOptions = {
    ids: string[],
    scope?: "local" | "global",
    update: (...params: any) => any
}

// just validates what you put in
// also acts as a wrapper
declare function observe(options: ObserveOptions): ObserveOptions;

export { getRouter, getRenderer, getState, observe }
