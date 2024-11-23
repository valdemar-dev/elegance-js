import { Renderer } from "./renderer";
import { Router } from "./router";
import { StateController } from "./state";

declare global {
    type ElementTags = "abbr" | "a" | "article" | "aside" | "audio" | "base" | "bdi" | "bdo" | "blockquote" |
      "body" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" |
      "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "div" | "dl" | "dt" | "em" | 
      "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | 
      "h5" | "h6" | "head" | "header" | "hr" | "html" | "iframe" | "img" | "input" | "ins" | 
      "kbd" | "label" | "legend" | "li" | "link" | "main" | "map" | "mark" | "meta" | "meter" | 
      "nav" | "noscript" | "object" | "ol" | "optgroup" | "option" | "output" | "p" | "param" |
      "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | 
      "section" | "select" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | 
      "sup" | "svg" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | 
      "time" | "title" | "tr" | "track" | "u" | "ul" | "varEl" | "video" | "wbr" | "b" | "i" | "br";

    type AnyBuiltElement = BuiltElement<ElementTags> | OptionlessBuiltElement<ElementTags>;
    type AnyBuildableElement = BuildableElement<ElementTags> | BuildableElement<ElementTags>;

    type BuiltElement<T> = {
        tag: T;
        children: ElementChildren;
        getOptions: () => Record<string, any>;
        onMount?: (builtElement: AnyBuiltElement, elementInDocument: HTMLElement) => void;
    };

    type OptionlessBuiltElement<T> = {
        tag: T;
        children: ElementChildren,
        onMount?: (builtElement: AnyBuiltElement, elementInDocument: HTMLElement) => void;
    };

    type Child = BuildableElement<ElementTags> | OptionlessBuildableElement<ElementTags> | string
    type ElementChildren = Array<Child>

    type BuildableElement<T> = () => BuiltElement<T>;
    type OptionlessBuildableElement<T> = () => OptionlessBuiltElement<T>;

    type EleganceElement<T> = (
        options: { [key: string]: any }, 
        ...children: ElementChildren 
    ) => BuildableElement<T>;

    type EleganceOptionlessElement<T> = (
        ...children: ElementChildren 
    ) => OptionlessBuildableElement<T>;

    type Page = (
        args: { router: Router; state: StateController; renderer: Renderer }
    ) => BuildableElement<ElementTags>;

    var eleganceStateController: StateController;
    var eleganceRouter: Router;
    var eleganceRenderer: Renderer;

    var abbr: EleganceElement<"abbr">;
    var a: EleganceElement<"a">;
    var article: EleganceElement<"article">;
    var aside: EleganceElement<"aside">;
    var audio: EleganceElement<"audio">;
    var b: EleganceOptionlessElement<"b">;
    var base: EleganceElement<"base">;
    var bdi: EleganceElement<"bdi">;
    var bdo: EleganceElement<"bdo">;
    var blockquote: EleganceElement<"blockquote">;
    var body: EleganceElement<"body">;
    var br: EleganceOptionlessElement<"br">;
    var button: EleganceElement<"button">;
    var canvas: EleganceElement<"canvas">;
    var caption: EleganceElement<"caption">;
    var cite: EleganceElement<"cite">;
    var code: EleganceElement<"code">;
    var col: EleganceElement<"col">;
    var colgroup: EleganceElement<"colgroup">;
    var data: EleganceElement<"data">;
    var datalist: EleganceElement<"datalist">;
    var dd: EleganceElement<"dd">;
    var del: EleganceElement<"del">;
    var details: EleganceElement<"details">;
    var dfn: EleganceElement<"dfn">;
    var div: EleganceElement<"div">;
    var dl: EleganceElement<"dl">;
    var dt: EleganceElement<"dt">;
    var em: EleganceElement<"em">;
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
    var hr: EleganceElement<"hr">;
    var html: EleganceElement<"html">;
    var i: EleganceOptionlessElement<"i">;
    var iframe: EleganceElement<"iframe">;
    var img: EleganceElement<"img">;
    var input: EleganceElement<"input">;
    var ins: EleganceElement<"ins">;
    var kbd: EleganceElement<"kbd">;
    var label: EleganceElement<"label">;
    var legend: EleganceElement<"legend">;
    var li: EleganceElement<"li">;
    var link: EleganceElement<"link">;
    var main: EleganceElement<"main">;
    var map: EleganceElement<"map">;
    var mark: EleganceElement<"mark">;
    var meta: EleganceElement<"meta">;
    var meter: EleganceElement<"meter">;
    var nav: EleganceElement<"nav">;
    var noscript: EleganceElement<"noscript">;
    var object: EleganceElement<"object">;
    var ol: EleganceElement<"ol">;
    var optgroup: EleganceElement<"optgroup">;
    var option: EleganceElement<"option">;
    var output: EleganceElement<"output">;
    var p: EleganceElement<"p">;
    var param: EleganceElement<"param">;
    var picture: EleganceElement<"picture">;
    var pre: EleganceElement<"pre">;
    var progress: EleganceElement<"progress">;
    var q: EleganceElement<"q">;
    var rp: EleganceElement<"rp">;
    var rt: EleganceElement<"rt">;
    var ruby: EleganceElement<"ruby">;
    var s: EleganceElement<"s">;
    var samp: EleganceElement<"samp">;
    var script: EleganceElement<"script">;
    var section: EleganceElement<"section">;
    var select: EleganceElement<"select">;
    var small: EleganceElement<"small">;
    var source: EleganceElement<"source">;
    var span: EleganceElement<"span">;
    var strong: EleganceElement<"strong">;
    var style: EleganceElement<"style">;
    var sub: EleganceElement<"sub">;
    var summary: EleganceElement<"summary">;
    var sup: EleganceElement<"sup">;
    var svg: EleganceElement<"svg">;
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
    var track: EleganceElement<"track">;
    var u: EleganceElement<"u">;
    var ul: EleganceElement<"ul">;
    var varEl: EleganceElement<"var">;
    var video: EleganceElement<"video">;
    var wbr: EleganceElement<"wbr">;
}

export {};
