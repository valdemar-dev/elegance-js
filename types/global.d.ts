import { Renderer } from "./renderer"
import { Router } from "./router"
import { StateController } from "./state"

declare global {
    type BuiltElement<T> = {
        tag: T;
        children: Array<BuildableElement<string>>;
        getOptions: () => Record<string, any>;
        onMount?: (builtElement: BuiltElement<T>, elementInDocument: HTMLElement) => void;
    };

    type BuildableElement<T> = (
        options: Record<string, any>, 
        ...children: Array<() => BuiltElement<string>> | string[]
    ) => () => BuiltElement<T>;

    type Page = (
        args: { router: Router; state: StateController; renderer: Renderer }
    ) => () => BuiltElement<string>;o


    var div: BuildableElement<"div">;
    var span: BuildableElement<"span">;
    var p: BuildableElement<"p">;
    var a: BuildableElement<"a">;
    var button: BuildableElement<"button">;
    var input: BuildableElement<"input">;
    var img: BuildableElement<"img">;
    var form: BuildableElement<"form">;
    var ul: BuildableElement<"ul">;
    var li: BuildableElement<"li">;
    var ol: BuildableElement<"ol">;
    var h1: BuildableElement<"h1">;
    var h2: BuildableElement<"h2">;
    var h3: BuildableElement<"h3">;
    var h4: BuildableElement<"h4">;
    var h5: BuildableElement<"h5">;
    var h6: BuildableElement<"h6">;
    var nav: BuildableElement<"nav">;
    var header: BuildableElement<"header">;
    var footer: BuildableElement<"footer">;
    var main: BuildableElement<"main">;
    var section: BuildableElement<"section">;
    var article: BuildableElement<"article">;
    var aside: BuildableElement<"aside">;
    var figure: BuildableElement<"figure">;
    var video: BuildableElement<"video">;
    var audio: BuildableElement<"audio">;
    var canvas: BuildableElement<"canvas">;
    var iframe: BuildableElement<"iframe">;
    var table: BuildableElement<"table">;
    var tr: BuildableElement<"tr">;
    var td: BuildableElement<"td">;
    var th: BuildableElement<"th">;
    var head: BuildableElement<"head">;
    var body: BuildableElement<"body">;
    var foot: BuildableElement<"foot">;
    var legend: BuildableElement<"legend">;
    var details: BuildableElement<"details">;
    var summary: BuildableElement<"summary">;
    var base: BuildableElement<"base">;
    var link: BuildableElement<"link">;
    var meta: BuildableElement<"meta">;
    var script: BuildableElement<"script">;
    var style: BuildableElement<"style">;
    var title: BuildableElement<"title">;
    var noscript: BuildableElement<"noscript">;
    var mark: BuildableElement<"mark">;
    var code: BuildableElement<"code">;
    var pre: BuildableElement<"pre">;
    var blockquote: BuildableElement<"blockquote">;
    var hr: BuildableElement<"hr">;
    var cite: BuildableElement<"cite">;
    var b: BuildableElement<"b">;
    var i: BuildableElement<"i">;
    var u: BuildableElement<"u">;
    var s: BuildableElement<"s">;
    var small: BuildableElement<"small">;
    var sub: BuildableElement<"sub">;
    var sup: BuildableElement<"sup">;
    var ins: BuildableElement<"ins">;
    var del: BuildableElement<"del">;
    var em: BuildableElement<"em">;
    var strong: BuildableElement<"strong">;
    var q: BuildableElement<"q">;
    var dfn: BuildableElement<"dfn">;
    var abbr: BuildableElement<"abbr">;
    var kbd: BuildableElement<"kbd">;
    var samp: BuildableElement<"samp">;
    var bdi: BuildableElement<"bdi">;
    var bdo: BuildableElement<"bdo">;
    var ruby: BuildableElement<"ruby">;
    var rt: BuildableElement<"rt">;
    var rp: BuildableElement<"rp">;
    var time: BuildableElement<"time">;
    var span: BuildableElement<"span">;
    var wbr: BuildableElement<"wbr">;
    var iframe: BuildableElement<"iframe">;
    var details: BuildableElement<"details">;
    var summary: BuildableElement<"summary">;
}

export {};
