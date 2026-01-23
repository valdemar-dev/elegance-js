import { AnyElement, EleganceElementBuilder, SpecialElementOption } from "./elements/element";

import {
    StateManager,
    ObserverManager,
    LoadHookManager,
    EventListenerManager,
} from "./client/runtime";

declare global {
    /**
     * **IMPORTANT** These values are only available in the *browser* runtime.
     */
    var eleganceClient: {
        createHTMLElementFromElement: (element: AnyElement) => { root: Node, specialElementOptions: { elementKey: string, optionName: string, optionValue: SpecialElementOption }[]; };
        fetchPage: (targetURL: URL) => Promise<Document | void>;
        navigateLocally: (target: string, pushState: boolean) => Promise<void>;
        onNavigate: (callback: (pathname: string) => any) => void;
    }

    /**
     * **IMPORTANT** These values are only available in the *browser* runtime.
     * **IMPORTANT** These values are only available in dev builds, and are stripped out from production builds for security reasons.
     */
    var devtools: {
        pageData: PageData<any>;

        stateManager: StateManager;
        eventListenerManager: EventListenerManager;
        observerManager: ObserverManager;
        loadHookManager: LoadHookManager;
    }

    var area: EleganceElementBuilder<"area">;
    var base: EleganceElementBuilder<"base">;
    var br: EleganceElementBuilder<"br">;
    var col: EleganceElementBuilder<"col">;
    var embed: EleganceElementBuilder<"embed">;
    var hr: EleganceElementBuilder<"hr">;
    var img: EleganceElementBuilder<"img">;
    var input: EleganceElementBuilder<"input">;
    var link: EleganceElementBuilder<"link">;
    var meta: EleganceElementBuilder<"meta">;
    var param: EleganceElementBuilder<"param">;
    var source: EleganceElementBuilder<"source">;
    var track: EleganceElementBuilder<"track">;
    var wbr: EleganceElementBuilder<"wbr">;

    var a: EleganceElementBuilder<"a">;
    var abbr: EleganceElementBuilder<"abbr">;
    var address: EleganceElementBuilder<"address">;
    var article: EleganceElementBuilder<"article">;
    var aside: EleganceElementBuilder<"aside">;
    var audio: EleganceElementBuilder<"audio">;
    var b: EleganceElementBuilder<"b">;
    var bdi: EleganceElementBuilder<"bdi">;
    var bdo: EleganceElementBuilder<"bdo">;
    var blockquote: EleganceElementBuilder<"blockquote">;
    var body: EleganceElementBuilder<"body">;
    var button: EleganceElementBuilder<"button">;
    var canvas: EleganceElementBuilder<"canvas">;
    var caption: EleganceElementBuilder<"caption">;
    var cite: EleganceElementBuilder<"cite">;
    var code: EleganceElementBuilder<"code">;
    var colgroup: EleganceElementBuilder<"colgroup">;
    var data: EleganceElementBuilder<"data">;
    var datalist: EleganceElementBuilder<"datalist">;
    var dd: EleganceElementBuilder<"dd">;
    var del: EleganceElementBuilder<"del">;
    var details: EleganceElementBuilder<"details">;
    var dfn: EleganceElementBuilder<"dfn">;
    var dialog: EleganceElementBuilder<"dialog">;
    var div: EleganceElementBuilder<"div">;
    var dl: EleganceElementBuilder<"dl">;
    var dt: EleganceElementBuilder<"dt">;
    var em: EleganceElementBuilder<"em">;
    var fieldset: EleganceElementBuilder<"fieldset">;
    var figcaption: EleganceElementBuilder<"figcaption">;
    var figure: EleganceElementBuilder<"figure">;
    var footer: EleganceElementBuilder<"footer">;
    var form: EleganceElementBuilder<"form">;
    var h1: EleganceElementBuilder<"h1">;
    var h2: EleganceElementBuilder<"h2">;
    var h3: EleganceElementBuilder<"h3">;
    var h4: EleganceElementBuilder<"h4">;
    var h5: EleganceElementBuilder<"h5">;
    var h6: EleganceElementBuilder<"h6">;
    var head: EleganceElementBuilder<"head">;
    var header: EleganceElementBuilder<"header">;
    var hgroup: EleganceElementBuilder<"hgroup">;
    var html: EleganceElementBuilder<"html">;
    var i: EleganceElementBuilder<"i">;
    var iframe: EleganceElementBuilder<"iframe">;
    var ins: EleganceElementBuilder<"ins">;
    var kbd: EleganceElementBuilder<"kbd">;
    var label: EleganceElementBuilder<"label">;
    var legend: EleganceElementBuilder<"legend">;
    var li: EleganceElementBuilder<"li">;
    var main: EleganceElementBuilder<"main">;
    var map: EleganceElementBuilder<"map">;
    var mark: EleganceElementBuilder<"mark">;
    var menu: EleganceElementBuilder<"menu">;
    var meter: EleganceElementBuilder<"meter">;
    var nav: EleganceElementBuilder<"nav">;
    var noscript: EleganceElementBuilder<"noscript">;
    var object: EleganceElementBuilder<"object">;
    var ol: EleganceElementBuilder<"ol">;
    var optgroup: EleganceElementBuilder<"optgroup">;
    var option: EleganceElementBuilder<"option">;
    var output: EleganceElementBuilder<"output">;
    var p: EleganceElementBuilder<"p">;
    var picture: EleganceElementBuilder<"picture">;
    var pre: EleganceElementBuilder<"pre">;
    var progress: EleganceElementBuilder<"progress">;
    var q: EleganceElementBuilder<"q">;
    var rp: EleganceElementBuilder<"rp">;
    var rt: EleganceElementBuilder<"rt">;
    var ruby: EleganceElementBuilder<"ruby">;
    var s: EleganceElementBuilder<"s">;
    var samp: EleganceElementBuilder<"samp">;
    var script: EleganceElementBuilder<"script">;
    var search: EleganceElementBuilder<"search">;
    var section: EleganceElementBuilder<"section">;
    var select: EleganceElementBuilder<"select">;
    var slot: EleganceElementBuilder<"slot">;
    var small: EleganceElementBuilder<"small">;
    var span: EleganceElementBuilder<"span">;
    var strong: EleganceElementBuilder<"strong">;
    var style: EleganceElementBuilder<"style">;
    var sub: EleganceElementBuilder<"sub">;
    var summary: EleganceElementBuilder<"summary">;
    var sup: EleganceElementBuilder<"sup">;
    var table: EleganceElementBuilder<"table">;
    var tbody: EleganceElementBuilder<"tbody">;
    var td: EleganceElementBuilder<"td">;
    var template: EleganceElementBuilder<"template">;
    var textarea: EleganceElementBuilder<"textarea">;
    var tfoot: EleganceElementBuilder<"tfoot">;
    var th: EleganceElementBuilder<"th">;
    var thead: EleganceElementBuilder<"thead">;
    var time: EleganceElementBuilder<"time">;
    var title: EleganceElementBuilder<"title">;
    var tr: EleganceElementBuilder<"tr">;
    var u: EleganceElementBuilder<"u">;
    var ul: EleganceElementBuilder<"ul">;
    var varElement: EleganceElementBuilder<"var">;
    var video: EleganceElementBuilder<"video">;

    var path: EleganceElementBuilder<"path">;
    var circle: EleganceElementBuilder<"circle">;
    var ellipse: EleganceElementBuilder<"ellipse">;
    var line: EleganceElementBuilder<"line">;
    var polygon: EleganceElementBuilder<"polygon">;
    var polyline: EleganceElementBuilder<"polyline">;
    var stopElement: EleganceElementBuilder<"stop">;

    var svg: EleganceElementBuilder<"svg">;
    var g: EleganceElementBuilder<"g">;
    var text: EleganceElementBuilder<"text">;
    var tspan: EleganceElementBuilder<"tspan">;
    var textPath: EleganceElementBuilder<"textPath">;
    var defs: EleganceElementBuilder<"defs">;
    var symbol: EleganceElementBuilder<"symbol">;
    var use: EleganceElementBuilder<"use">;
    var image: EleganceElementBuilder<"image">;
    var clipPath: EleganceElementBuilder<"clipPath">;
    var mask: EleganceElementBuilder<"mask">;
    var pattern: EleganceElementBuilder<"pattern">;
    var linearGradient: EleganceElementBuilder<"linearGradient">;
    var radialGradient: EleganceElementBuilder<"radialGradient">;
    var filter: EleganceElementBuilder<"filter">;
    var marker: EleganceElementBuilder<"marker">;
    var view: EleganceElementBuilder<"view">;
    var feBlend: EleganceElementBuilder<"feBlend">;
    var feColorMatrix: EleganceElementBuilder<"feColorMatrix">;
    var feComponentTransfer: EleganceElementBuilder<"feComponentTransfer">;
    var feComposite: EleganceElementBuilder<"feComposite">;
    var feConvolveMatrix: EleganceElementBuilder<"feConvolveMatrix">;
    var feDiffuseLighting: EleganceElementBuilder<"feDiffuseLighting">;
    var feDisplacementMap: EleganceElementBuilder<"feDisplacementMap">;
    var feDistantLight: EleganceElementBuilder<"feDistantLight">;
    var feFlood: EleganceElementBuilder<"feFlood">;
    var feFuncA: EleganceElementBuilder<"feFuncA">;
    var feFuncB: EleganceElementBuilder<"feFuncB">;
    var feFuncG: EleganceElementBuilder<"feFuncG">;
    var feFuncR: EleganceElementBuilder<"feFuncR">;
    var feGaussianBlur: EleganceElementBuilder<"feGaussianBlur">;
    var feImage: EleganceElementBuilder<"feImage">;
    var feMerge: EleganceElementBuilder<"feMerge">;
    var feMergeNode: EleganceElementBuilder<"feMergeNode">;
    var feMorphology: EleganceElementBuilder<"feMorphology">;
    var feOffset: EleganceElementBuilder<"feOffset">;
    var fePointLight: EleganceElementBuilder<"fePointLight">;
    var feSpecularLighting: EleganceElementBuilder<"feSpecularLighting">;
    var feSpotLight: EleganceElementBuilder<"feSpotLight">;
    var feTile: EleganceElementBuilder<"feTile">;
    var feTurbulence: EleganceElementBuilder<"feTurbulence">;

    var mi: EleganceElementBuilder<"mi">;
    var mn: EleganceElementBuilder<"mn">;
    var mo: EleganceElementBuilder<"mo">;

    var math: EleganceElementBuilder<"math">;
    var ms: EleganceElementBuilder<"ms">;
    var mtext: EleganceElementBuilder<"mtext">;
    var mrow: EleganceElementBuilder<"mrow">;
    var mfenced: EleganceElementBuilder<"mfenced">;
    var msup: EleganceElementBuilder<"msup">;
    var msub: EleganceElementBuilder<"msub">;
    var msubsup: EleganceElementBuilder<"msubsup">;
    var mfrac: EleganceElementBuilder<"mfrac">;
    var msqrt: EleganceElementBuilder<"msqrt">;
    var mroot: EleganceElementBuilder<"mroot">;
    var mtable: EleganceElementBuilder<"mtable">;
    var mtr: EleganceElementBuilder<"mtr">;
    var mtd: EleganceElementBuilder<"mtd">;
    var mstyle: EleganceElementBuilder<"mstyle">;
    var menclose: EleganceElementBuilder<"menclose">;
    var mmultiscripts: EleganceElementBuilder<"mmultiscripts">;
}

export {};