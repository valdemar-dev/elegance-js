import { Renderer } from "./renderer";
import { Router } from "./router";
import { StateController } from "./state";

declare global {
    type OptionlessElementTags = 
        | "abbr"
        | "b"
        | "bdi"
        | "bdo"
        | "cite"
        | "code"
        | "dfn"
        | "em"
        | "i"
        | "kbd"
        | "mark"
        | "rp"
        | "rt"
        | "ruby"
        | "s"
        | "samp"
        | "small"
        | "strong"
        | "sub"
        | "sup"
        | "u"
        | "var"
        | "wbr";

    type ChildrenlessElementTags = 
        | "area"
        | "base"
        | "br"
        | "col"
        | "embed"
        | "hr"
        | "img"
        | "input"
        | "link"
        | "meta"
        | "param"
        | "source"
        | "track";

    type ChildrenlessOptionlessElementTags = 
        | "basefont"
        | "isindex"
        | "keygen";

    type ElementTags = 
        | "a"
        | "address"
        | "article"
        | "aside"
        | "audio"
        | "blockquote"
        | "body"
        | "button"
        | "canvas"
        | "caption"
        | "colgroup"
        | "data"
        | "span"
        | "datalist"
        | "dd"
        | "del"
        | "details"
        | "dialog"
        | "div"
        | "dl"
        | "dt"
        | "fieldset"
        | "figcaption"
        | "figure"
        | "footer"
        | "form"
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6"
        | "head"
        | "header"
        | "hgroup"
        | "html"
        | "iframe"
        | "ins"
        | "label"
        | "legend"
        | "li"
        | "main"
        | "map"
        | "meter"
        | "nav"
        | "noscript"
        | "object"
        | "ol"
        | "optgroup"
        | "option"
        | "output"
        | "p"
        | "picture"
        | "pre"
        | "progress"
        | "q"
        | "section"
        | "select"
        | "summary"
        | "table"
        | "tbody"
        | "td"
        | "template"
        | "textarea"
        | "tfoot"
        | "th"
        | "thead"
        | "time"
        | "title"
        | "tr"
        | "ul"
        | "video";

    type AnyBuiltElement = BuiltElement<ElementTags> | BuiltElement<OptionlessElementTags> | BuiltElement<ChildrenlessElementTags> | BuiltElement<ChildrenlessOptionlessElementTags>

    type AnyBuildableElement = 
        | BuildableElement<ElementTags>
        | OptionlessBuildableElement<OptionlessElementTags>
        | ChildrenlessBuildableElement<ChildrenlessElementTags>
        | ChildrenlessOptionlessBuildableElement<ChildrenlessOptionlessElementTags>;

    type OnMountOptions = {
        builtElement: AnyBuiltElement,
        elementInDocument: HTMLElement,
        buildableElement: AnyBuildableElement
    };

    type BuiltElement<T> = {
        tag: T;
        children: ElementChildren;
        getOptions: () => Record<string, any>;
        onMount?: (options: OnMountOptions) => void;
    };

    type Page = ({ router, state, renderer }: {
        router: Router,
        state: StateController,
        renderer: Renderer,
        serverData: any
    }) => Child

    type BuildableElement<T> = () => BuiltElement<T>;
    type OptionlessBuildableElement<T> = () => BuiltElement<T>;
    type ChildrenlessBuildableElement<T> = () => BuiltElement<T>;
    type ChildrenlessOptionlessBuildableElement<T> = () => BuiltElement<T>;

    type EleganceElement<T> = (
        options: { [key: string]: any },
        ...children: ElementChildren
    ) => BuildableElement<T>;

    type EleganceOptionlessElement<T> = (
        ...children: ElementChildren
    ) => OptionlessBuildableElement<T>;

    type EleganceChildrenlessElement<T> = (
        options: { [key: string]: any }
    ) => ChildrenlessBuildableElement<T>;

    type EleganceChildrenlessOptionlessElement<T> = () => ChildrenlessOptionlessBuildableElement<T>;

    type Child = 
        | BuildableElement<ElementTags>
        | OptionlessBuildableElement<OptionlessElementTags>
        | ChildrenlessBuildableElement<ChildrenlessElementTags>
        | ChildrenlessOptionlessBuildableElement<ChildrenlessOptionlessElementTags>
        | string
        | boolean;

    type ElementChildren = Array<Child>;

    var eleganceStateController: StateController;
    var eleganceRouter: Router;
    var eleganceRenderer: Renderer;
    var __ELEGANCE_SERVER_DATA__: any;

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
    var section: EleganceElement<"section">;
    var select: EleganceElement<"select">;
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
    var title: EleganceElement<"title">;
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
    var param: EleganceChildrenlessElement<"param">;
    var source: EleganceChildrenlessElement<"source">;
    var track: EleganceChildrenlessElement<"track">;

    var basefont: EleganceOptionlessElement<"basefont">;
    var isindex: EleganceOptionlessElement<"isindex">;
    var keygen: EleganceOptionlessElement<"keygen">;

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
}

export {};
