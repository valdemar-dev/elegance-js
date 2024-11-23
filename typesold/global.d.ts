declare class Router {
    private savedPages: Map<string, Page>;
    private onNavigateCallbacks: Array<() => void>;

    constructor();
    private log(content: string): void;
    private sleep(ms: number): Promise<void>;
    public navigate(pathname: string, pushState?: boolean): Promise<void>;
    private getPage(pathname: string): Promise<Page | void>;
    public addPage(pathname: string, page: Page): void;
    public prefetch(pathname: string): void;
    public onNavigate(callback: () => void): void;
    public setPopState(): void;
}

declare class Subject<T> {
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

declare class StateController {
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


declare class Renderer {
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

declare global {
    type BuiltElement<T> = {
        tag: T;
        children: Array<BuildableElement<string> | OptionlessBuildableElement<string>>;
        getOptions: () => Record<string, any>;
        onMount?: (builtElement: BuiltElement<T>, elementInDocument: HTMLElement) => void;
    };

    type OptionlessBuiltElement<T> = {
        tag: T;
        children: Array<BuildableElement<string> | OptionlessBuildableElement<string>>;
        onMount?: (builtElement: BuiltElement<T>, elementInDocument: HTMLElement) => void;
    };

    type AllowedElementChildren = Array<
        (() => BuiltElement<string>) | 
        (() => OptionlessBuiltElement<string>) |
        string
    >

    type BuildableElement<T> = (
        options: Record<string, any>, 
        ...children: AllowedElementChildren 
    ) => () => BuiltElement<T>;

    type OptionlessBuildableElement<T> = (
        ...children: AllowedElementChildren
    ) => () =>  OptionlessBuiltElement<T>;

    type Page = (
        args: { router: Router; state: StateController; renderer: Renderer }
    ) => () => BuiltElement<string>;

    var abbr: BuildableElement<"abbr">;
    var a: BuildableElement<"a">;
    var article: BuildableElement<"article">;
    var aside: BuildableElement<"aside">;
    var audio: BuildableElement<"audio">;
    var b: OptionlessBuildableElement<"b">;
    var base: BuildableElement<"base">;
    var bdi: BuildableElement<"bdi">;
    var bdo: BuildableElement<"bdo">;
    var blockquote: BuildableElement<"blockquote">;
    var body: BuildableElement<"body">;
    var br: OptionlessBuildableElement<"br">;
    var button: BuildableElement<"button">;
    var canvas: BuildableElement<"canvas">;
    var caption: BuildableElement<"caption">;
    var cite: BuildableElement<"cite">;
    var code: BuildableElement<"code">;
    var col: BuildableElement<"col">;
    var colgroup: BuildableElement<"colgroup">;
    var data: BuildableElement<"data">;
    var datalist: BuildableElement<"datalist">;
    var dd: BuildableElement<"dd">;
    var del: BuildableElement<"del">;
    var details: BuildableElement<"details">;
    var dfn: BuildableElement<"dfn">;
    var div: BuildableElement<"div">;
    var dl: BuildableElement<"dl">;
    var dt: BuildableElement<"dt">;
    var em: BuildableElement<"em">;
    var fieldset: BuildableElement<"fieldset">;
    var figcaption: BuildableElement<"figcaption">;
    var figure: BuildableElement<"figure">;
    var footer: BuildableElement<"footer">;
    var form: BuildableElement<"form">;
    var h1: BuildableElement<"h1">;
    var h2: BuildableElement<"h2">;
    var h3: BuildableElement<"h3">;
    var h4: BuildableElement<"h4">;
    var h5: BuildableElement<"h5">;
    var h6: BuildableElement<"h6">;
    var head: BuildableElement<"head">;
    var header: BuildableElement<"header">;
    var hr: BuildableElement<"hr">;
    var html: BuildableElement<"html">;
    var i: OptionlessBuildableElement<"i">;
    var iframe: BuildableElement<"iframe">;
    var img: BuildableElement<"img">;
    var input: BuildableElement<"input">;
    var ins: BuildableElement<"ins">;
    var kbd: BuildableElement<"kbd">;
    var label: BuildableElement<"label">;
    var legend: BuildableElement<"legend">;
    var li: BuildableElement<"li">;
    var link: BuildableElement<"link">;
    var main: BuildableElement<"main">;
    var map: BuildableElement<"map">;
    var mark: BuildableElement<"mark">;
    var meta: BuildableElement<"meta">;
    var meter: BuildableElement<"meter">;
    var nav: BuildableElement<"nav">;
    var noscript: BuildableElement<"noscript">;
    var object: BuildableElement<"object">;
    var ol: BuildableElement<"ol">;
    var optgroup: BuildableElement<"optgroup">;
    var option: BuildableElement<"option">;
    var output: BuildableElement<"output">;
    var p: BuildableElement<"p">;
    var param: BuildableElement<"param">;
    var picture: BuildableElement<"picture">;
    var pre: BuildableElement<"pre">;
    var progress: BuildableElement<"progress">;
    var q: BuildableElement<"q">;
    var rp: BuildableElement<"rp">;
    var rt: BuildableElement<"rt">;
    var ruby: BuildableElement<"ruby">;
    var s: BuildableElement<"s">;
    var samp: BuildableElement<"samp">;
    var script: BuildableElement<"script">;
    var section: BuildableElement<"section">;
    var select: BuildableElement<"select">;
    var small: BuildableElement<"small">;
    var source: BuildableElement<"source">;
    var span: BuildableElement<"span">;
    var strong: BuildableElement<"strong">;
    var style: BuildableElement<"style">;
    var sub: BuildableElement<"sub">;
    var summary: BuildableElement<"summary">;
    var sup: BuildableElement<"sup">;
    var svg: BuildableElement<"svg">;
    var table: BuildableElement<"table">;
    var tbody: BuildableElement<"tbody">;
    var td: BuildableElement<"td">;
    var template: BuildableElement<"template">;
    var textarea: BuildableElement<"textarea">;
    var tfoot: BuildableElement<"tfoot">;
    var th: BuildableElement<"th">;
    var thead: BuildableElement<"thead">;
    var time: BuildableElement<"time">;
    var title: BuildableElement<"title">;
    var tr: BuildableElement<"tr">;
    var track: BuildableElement<"track">;
    var u: BuildableElement<"u">;
    var ul: BuildableElement<"ul">;
    var varEl: BuildableElement<"var">;
    var video: BuildableElement<"video">;
    var wbr: BuildableElement<"wbr">;
}

export {};
