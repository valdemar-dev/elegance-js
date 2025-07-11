import { ObjectAttributeType, } from "./helpers/ObjectAttributeType";
import { CreateEventListenerOptions } from "./server/createState";

declare global {
    type NonVoid<T> = T extends void ? never : T;
    type ReturnTypeStrict<T extends ExecuteOnServer> = NonVoid<Awaited<ReturnType<T>>>;

    /*
     * The below is all magical server stuff.
     * The client won't know of *any* of it!
     */
    var __ELEGANCE_SERVER_DATA__: any;

    var __SERVER_CURRENT_STATE_ID__: number;
    var __SERVER_CURRENT_REF_ID__: number;

    var __SERVER_CURRENT_STATE__: Array<{
        value: unknown;
        type: ObjectAttributeType,
        id: number;
        bind?: number;
    }>

    var __SERVER_CURRENT_LOADHOOKS__: Array<any>

    var __SERVER_CURRENT_LAYOUTS__: Map<string, number>;
    var __SERVER_CURRENT_LAYOUT_ID__: number;

    type AnyBuiltElement = BuiltElement<ElementTags> | ChildrenLessBuiltElement<ChildrenlessElementTags>;

    type BuiltElement<T> = {
        tag: T;
        children: ElementChildren;
        options: Record<string, any> | Child;
    };

    type ChildrenLessBuiltElement<T> = {
        tag: T;
        children: null;
        options: Record<string, any> | Child;
    }

    type ServerData = { data: any };
    type ExecuteOnServer = (...args: any[]) => Promise<ServerData | void>;

    type Page = AnyBuiltElement;

    type ObjectAttribute<T> = T extends ObjectAttributeType.STATE
        ? { type: ObjectAttributeType, id: string | number, value: any, }
        : T extends ObjectAttributeType.OBSERVER
        ? { type: ObjectAttributeType, refs: { id: number, bind?: string, }[], initialValues: any[], update: (...value: any) => any }
        : { type: ObjectAttributeType, };

    type ElementOptions = {
        [key: string]: string | number | boolean |
        { type: ObjectAttributeType, id: string | number, value: any, } |
        { type: ObjectAttributeType, refs: { id: number, bind?: string, }[], initialValues: any[], update: (...value: any) => any } | 
        { type: ObjectAttributeType, }
    } & GlobalAttributes & EventHandlers

    type EleganceElement<T> = (
        options?: ElementOptions | Child,
        ...children: ElementChildren
    ) => BuiltElement<T>;

    type EleganceChildrenlessElement<T> = (
        options?: ElementOptions
    ) => ChildrenLessBuiltElement<T>;

    type Child = 
        | BuiltElement<ElementTags>
        | ChildrenLessBuiltElement<ChildrenlessElementTags>
        | string
        | boolean
        | number
	| Array<number | string | boolean>;

    type ElementChildren = Array<Child>;

    type OmitSomething<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

    type AllowedHTMLElements = OmitSomething<HTMLElementTagNameMap, "var">;

    interface GlobalAttributes {
        [key: `data-${string}`]: string | undefined;
        [key: `aria-${string}`]: string | undefined;
    }

    type ChildrenlessElementTags = | "area" | "base" | "br" | "col" | "embed" | "hr" | "img" |
        "input" | "link" | "meta" | "source" | "track";

    type ElementTags = | "a" | "address" | "article" | "aside" | "audio" | "blockquote" |
        "body" | "button" | "canvas" | "caption" | "colgroup" | "data" |
        "span" | "datalist" | "dd" | "del" | "details" | "dialog" | "div" |
        "dl" | "dt" | "fieldset" | "figcaption" | "figure" | "footer" |
        "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" |
        "hgroup" | "html" | "iframe" | "ins" | "label" | "legend" | "li" |
        "main" | "map" | "meter" | "menu" | "nav" | "noscript" | "object" |
        "ol" | "optgroup" | "option" | "output" | "p" | "picture" | "pre" |
        "progress" | "q" | "script" | "search" | "section" | "select" | "slot" |
        "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" |
        "th" | "thead" | "time" | "tr" | "ul" | "video" | "abbr" | "b" | "bdi" |
        "bdo" | "cite" | "code" | "dfn" | "em" | "i" | "kbd" | "mark" | "rp" |
        "rt" | "ruby" | "s" | "samp" | "small" | "strong" | "sub" | "sup" |
        "title" | "u" | "wbr";

    var area: EleganceChildrenlessElement<"area">;
    var base: EleganceChildrenlessElement<"base">;
    var br: EleganceChildrenlessElement<"br">;
    var col: EleganceChildrenlessElement<"col">;
    var embed: EleganceChildrenlessElement<"embed">;
    var hr: EleganceChildrenlessElement<"hr">;
    var img: EleganceChildrenlessElement<"img">;
    var input: EleganceChildrenlessElement<"input">;
    var link: EleganceChildrenlessElement<"link">;
    var meta: EleganceChildrenlessElement<"meta">;
    var source: EleganceChildrenlessElement<"source">;
    var track: EleganceChildrenlessElement<"track">;

    var a: EleganceElement<"a">;
    var address: EleganceElement<"address">;
    var article: EleganceElement<"article">;
    var aside: EleganceElement<"aside">;
    var audio: EleganceElement<"audio">;
    var blockquote: EleganceElement<"blockquote">;
    var body: EleganceElement<"body">;
    var button: EleganceElement<"button">;
    var canvas: EleganceElement<"canvas">;
    var caption: EleganceElement<"caption">;
    var colgroup: EleganceElement<"colgroup">;
    var data: EleganceElement<"data">;
    var datalist: EleganceElement<"datalist">;
    var dd: EleganceElement<"dd">;
    var del: EleganceElement<"del">;
    var details: EleganceElement<"details">;
    var dialog: EleganceElement<"dialog">;
    var div: EleganceElement<"div">;
    var dl: EleganceElement<"dl">;
    var dt: EleganceElement<"dt">;
    var fieldset: EleganceElement<"fieldset">;
    var figcaption: EleganceElement<"figcaption">;
    var figure: EleganceElement<"figure">;
    var footer: EleganceElement<"footer">;
    var form: EleganceElement<"form">;
    var h1: EleganceElement<"h1">;
    var h2: EleganceElement<"h2">;
    var h3: EleganceElement<"h3">;
    var h4: EleganceElement<"h4">;
    var h5: EleganceElement<"h5">;
    var h6: EleganceElement<"h6">;
    var head: EleganceElement<"head">;
    var header: EleganceElement<"header">;
    var hgroup: EleganceElement<"hgroup">;
    var html: EleganceElement<"html">;
    var iframe: EleganceElement<"iframe">;
    var ins: EleganceElement<"ins">;
    var label: EleganceElement<"label">;
    var legend: EleganceElement<"legend">;
    var li: EleganceElement<"li">;
    var main: EleganceElement<"main">;
    var map: EleganceElement<"map">;
    var meter: EleganceElement<"meter">;
    var menu: EleganceElement<"menu">;
    var nav: EleganceElement<"nav">;
    var noscript: EleganceElement<"noscript">;
    var object: EleganceElement<"object">;
    var ol: EleganceElement<"ol">;
    var optgroup: EleganceElement<"optgroup">;
    var option: EleganceElement<"option">;
    var output: EleganceElement<"output">;
    var p: EleganceElement<"p">;
    var picture: EleganceElement<"picture">;
    var pre: EleganceElement<"pre">;
    var progress: EleganceElement<"progress">;
    var q: EleganceElement<"q">;
    var script: EleganceElement<"script">;
    var search: EleganceElement<"search">;
    var section: EleganceElement<"section">;
    var select: EleganceElement<"select">;
    var slot: EleganceElement<"slot">;
    var style: EleganceElement<"style">;
    var summary: EleganceElement<"summary">;
    var table: EleganceElement<"table">;
    var tbody: EleganceElement<"tbody">;
    var td: EleganceElement<"td">;
    var template: EleganceElement<"template">;
    var textarea: EleganceElement<"textarea">;
    var tfoot: EleganceElement<"tfoot">;
    var th: EleganceElement<"th">;
    var thead: EleganceElement<"thead">;
    var time: EleganceElement<"time">;
    var tr: EleganceElement<"tr">;
    var ul: EleganceElement<"ul">;
    var video: EleganceElement<"video">;
    var abbr: EleganceElement<"abbr">;
    var b: EleganceElement<"b">;
    var bdi: EleganceElement<"bdi">;
    var bdo: EleganceElement<"bdo">;
    var cite: EleganceElement<"cite">;
    var code: EleganceElement<"code">;
    var dfn: EleganceElement<"dfn">;
    var em: EleganceElement<"em">;
    var i: EleganceElement<"i">;
    var kbd: EleganceElement<"kbd">;
    var mark: EleganceElement<"mark">;
    var rp: EleganceElement<"rp">;
    var rt: EleganceElement<"rt">;
    var ruby: EleganceElement<"ruby">;
    var s: EleganceElement<"s">;
    var samp: EleganceElement<"samp">;
    var small: EleganceElement<"small">;
    var span: EleganceElement<"span">;
    var strong: EleganceElement<"strong">;
    var sub: EleganceElement<"sub">;
    var sup: EleganceElement<"sup">;
    var u: EleganceElement<"u">;
    var wbr: EleganceElement<"wbr">;
    var title: EleganceElement<"title">;

    type EleganceEventListener = ObjectAttribute<ObjectAttributeType.STATE>;

    interface EventHandlers {
        onCopy?: EleganceEventListener;
        onCut?: EleganceEventListener;
        onPaste?: EleganceEventListener;
        onCompositionStart?: EleganceEventListener;
        onCompositionUpdate?: EleganceEventListener;
        onCompositionEnd?: EleganceEventListener;
        onKeyDown?: EleganceEventListener;
        onKeyPress?: EleganceEventListener;
        onKeyUp?: EleganceEventListener;
        onFocus?: EleganceEventListener;
        onBlur?: EleganceEventListener;
        onChange?: EleganceEventListener;
        onInput?: EleganceEventListener;
        onInvalid?: EleganceEventListener;
        onSubmit?: EleganceEventListener;
        onClick?: EleganceEventListener;
        onDoubleClick?: EleganceEventListener;
        onMouseDown?: EleganceEventListener;
        onMouseUp?: EleganceEventListener;
        onMouseEnter?: EleganceEventListener;
        onMouseLeave?: EleganceEventListener;
        onMouseMove?: EleganceEventListener;
        onMouseOver?: EleganceEventListener;
        onMouseOut?: EleganceEventListener;
        onContextMenu?: EleganceEventListener;
        onDrag?: EleganceEventListener;
        onDragStart?: EleganceEventListener;
        onDragEnd?: EleganceEventListener;
        onDragEnter?: EleganceEventListener;
        onDragLeave?: EleganceEventListener;
        onDragOver?: EleganceEventListener;
        onDrop?: EleganceEventListener;
        onScroll?: EleganceEventListener;
        onWheel?: EleganceEventListener;
        onTouchStart?: EleganceEventListener;
        onTouchMove?: EleganceEventListener;
        onTouchEnd?: EleganceEventListener;
        onTouchCancel?: EleganceEventListener;
        onPointerDown?: EleganceEventListener;
        onPointerUp?: EleganceEventListener;
        onPointerCancel?: EleganceEventListener;
        onPointerEnter?: EleganceEventListener;
        onPointerLeave?: EleganceEventListener;
        onPointerMove?: EleganceEventListener;
        onPointerOver?: EleganceEventListener;
        onPointerOut?: EleganceEventListener;
        onGotPointerCapture?: EleganceEventListener;
        onLostPointerCapture?: EleganceEventListener;
        onLoad?: EleganceEventListener;
        onError?: EleganceEventListener;
        onAbort?: EleganceEventListener;
        onCanPlay?: EleganceEventListener;
        onCanPlayThrough?: EleganceEventListener;
        onDurationChange?: EleganceEventListener;
        onEmptied?: EleganceEventListener;
        onEnded?: EleganceEventListener;
        onLoadedData?: EleganceEventListener;
        onLoadedMetadata?: EleganceEventListener;
        onLoadStart?: EleganceEventListener;
        onPause?: EleganceEventListener;
        onPlay?: EleganceEventListener;
        onPlaying?: EleganceEventListener;
        onProgress?: EleganceEventListener;
        onRateChange?: EleganceEventListener;
        onSeeked?: EleganceEventListener;
        onSeeking?: EleganceEventListener;
        onStalled?: EleganceEventListener;
        onSuspend?: EleganceEventListener;
        onTimeUpdate?: EleganceEventListener;
        onVolumeChange?: EleganceEventListener;
        onWaiting?: EleganceEventListener;
        onAnimationStart?: EleganceEventListener;
        onAnimationEnd?: EleganceEventListener;
        onAnimationIteration?: EleganceEventListener;
        onTransitionEnd?: EleganceEventListener;
        onToggle?: EleganceEventListener;
    }

    /*
     * The below is al magical client stuff.
     * So, don't use this on the server. It won't be defined!
     */
    var pd: Record<string, any>;

    var client: {
        navigateLocally: (target: string, pushState?: boolean) => any;
        fetchPage: (targetURL: URL) => Promise<Document | void>;
        currentPage: string,
        sanitizePathname: (target: string) => string;
        getReference: (id: number) => HTMLElement | null;
    }

    type ClientSubject = {
        id: number,
        value: any,
        observers: Map<string, (value: any) => any>,
        pathname: string,
        signal: () => void,
    };

    type State = {
        subjects: ClientSubject[],
        get: (id: number) => ClientSubject | undefined;
        observe: (subject: ClientSubject, observer: (value: any) => any) => void;
    };
}

export {};
