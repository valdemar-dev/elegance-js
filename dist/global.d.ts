import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
declare global {
    var __ELEGANCE_SERVER_DATA__: any;
    var __PAGE_INFOS__: MinimizedPageInfo[];
    var pd: Record<string, any>;
    type AnyBuiltElement = BuiltElement<ElementTags> | BuiltElement<OptionlessElementTags> | BuiltElement<ChildrenlessElementTags>;
    type OnHydrateOptions = {
        builtElement: AnyBuiltElement;
        elementInDocument: HTMLElement;
    };
    type BuiltElement<T> = {
        tag: T;
        children: ElementChildren;
        options: Record<string, any>;
        onHydrate?: (options: OnHydrateOptions) => void;
    };
    type ServerData = {
        data: any;
    };
    type ExecuteOnServer = (...args: any[]) => Promise<ServerData | void>;
    type NonVoid<T> = T extends void ? never : T;
    type ReturnTypeStrict<T extends ExecuteOnServer> = NonVoid<Awaited<ReturnType<T>>>;
    type Page = AnyBuiltElement;
    type PageOld<T extends ExecuteOnServer = never> = [
        T
    ] extends [never] ? ({}: {
        abort: () => void;
    }) => Child : ({ serverData }: {
        abort: () => void;
        serverData: ReturnTypeStrict<T>["data"];
    }) => Child;
    type ObjectAttribute<T> = T extends ObjectAttributeType.STATE ? {
        type: ObjectAttributeType;
        id: string | number;
        value: any;
    } : T extends ObjectAttributeType.OBSERVER ? {
        type: ObjectAttributeType;
        id: number;
        initialValue: any;
        update: (value: any) => void;
    } : {
        type: ObjectAttributeType;
    };
    type ElementOptions = {
        [key: string]: string | number | ObjectAttribute<any>;
    };
    type EleganceElement<T> = (options: ElementOptions, ...children: ElementChildren) => BuiltElement<T>;
    type EleganceOptionlessElement<T> = (...children: ElementChildren) => BuiltElement<T>;
    type EleganceChildrenlessElement<T> = (options: ElementOptions) => BuiltElement<T>;
    type Child = BuiltElement<ElementTags> | BuiltElement<OptionlessElementTags> | BuiltElement<ChildrenlessElementTags> | string | boolean | Array<number | string | boolean>;
    type ElementChildren = Array<Child>;
    type MinimizedPageInfo = {
        a: string;
        b: Array<{
            id: number;
            els: Array<{
                an: string;
                el: (...args: any) => any;
            }>;
        }>;
        c: Array<{
            id: any;
            v: any;
            ert: boolean;
            s: string;
            db?: number;
            ropl: boolean;
        }>;
        d?: () => void;
        e: [{
            [key: string]: "local" | "global";
        }];
    };
    type PageInfo = {
        pathname: string;
        storedEventListeners: Array<{
            eleganceID: number;
            eventListeners: Array<{
                attributeName: string;
                eventListener: (...args: any) => any;
            }>;
        }>;
        storedState: Array<{
            id: any;
            value: any;
            enforceRuntimeTypes: boolean;
            scope: string;
            debounce: number;
            resetOnPageLeave: boolean;
        }>;
        onHydrateFinish?: () => void;
        storedObservers: [{
            [key: string]: "local" | "global";
        }];
    };
    type OmitSomething<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
    type AllowedHTMLElements = OmitSomething<HTMLElementTagNameMap, "var">;
    type OptionlessElementTags = "abbr" | "b" | "bdi" | "bdo" | "cite" | "code" | "dfn" | "em" | "i" | "kbd" | "mark" | "rp" | "rt" | "ruby" | "s" | "samp" | "small" | "strong" | "sub" | "sup" | "u" | "wbr";
    type ChildrenlessElementTags = "area" | "base" | "br" | "col" | "embed" | "hr" | "img" | "input" | "link" | "meta" | "source" | "track";
    type ElementTags = "a" | "address" | "article" | "aside" | "audio" | "blockquote" | "body" | "button" | "canvas" | "caption" | "colgroup" | "data" | "span" | "datalist" | "dd" | "del" | "details" | "dialog" | "div" | "dl" | "dt" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "html" | "iframe" | "ins" | "label" | "legend" | "li" | "main" | "map" | "meter" | "menu" | "nav" | "noscript" | "object" | "ol" | "optgroup" | "option" | "output" | "p" | "picture" | "pre" | "progress" | "q" | "script" | "search" | "section" | "select" | "slot" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "ul" | "video";
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
    var abbr: EleganceOptionlessElement<"abbr">;
    var b: EleganceOptionlessElement<"b">;
    var bdi: EleganceOptionlessElement<"bdi">;
    var bdo: EleganceOptionlessElement<"bdo">;
    var cite: EleganceOptionlessElement<"cite">;
    var code: EleganceOptionlessElement<"code">;
    var dfn: EleganceOptionlessElement<"dfn">;
    var em: EleganceOptionlessElement<"em">;
    var i: EleganceOptionlessElement<"i">;
    var kbd: EleganceOptionlessElement<"kbd">;
    var mark: EleganceOptionlessElement<"mark">;
    var rp: EleganceOptionlessElement<"rp">;
    var rt: EleganceOptionlessElement<"rt">;
    var ruby: EleganceOptionlessElement<"ruby">;
    var s: EleganceOptionlessElement<"s">;
    var samp: EleganceOptionlessElement<"samp">;
    var small: EleganceOptionlessElement<"small">;
    var span: EleganceElement<"span">;
    var strong: EleganceOptionlessElement<"strong">;
    var sub: EleganceOptionlessElement<"sub">;
    var sup: EleganceOptionlessElement<"sup">;
    var u: EleganceOptionlessElement<"u">;
    var wbr: EleganceOptionlessElement<"wbr">;
    var title: EleganceOptionlessElement<"title">;
}
export {};
