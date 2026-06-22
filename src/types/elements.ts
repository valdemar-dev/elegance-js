import type { makeEl } from "../elements";



export type StateEventHandler<
    S,
    E extends Event = Event,
    Target extends EventTarget = Element,
> = (state: S, event: E & { currentTarget: Target }) => any;

export type On<
    S,
    K extends keyof (HTMLElementEventMap & SVGElementEventMap),
    Target extends EventTarget = Element,
> = StateEventHandler<S, (HTMLElementEventMap & SVGElementEventMap)[K], Target>;

type EventHandlerMap<S, Target extends EventTarget = Element> = {
    [K in keyof (HTMLElementEventMap & SVGElementEventMap) as `on${Capitalize<K>}`]?: On<S, K, Target>;
};

export type ElementOptions<
    T extends AnyTag,
    S,
> = Record<string, any> &
    Partial<
        EventHandlerMap<
            S,
            T extends keyof HTMLElementTagNameMap
                ? HTMLElementTagNameMap[T]
                : T extends keyof SVGElementTagNameMap
                    ? SVGElementTagNameMap[T]
                    : Element
        >
    >;

export type PrimitiveElementOptionsOrChild<T extends AnyTag, S> =
    | ElementOptions<T, S>
    | VirtualNode<S>;

declare global {
    type AnyTag =
    | keyof HTMLElementTagNameMap
    | keyof MathMLElementTagNameMap
    | keyof HTMLElementDeprecatedTagNameMap
    | keyof SVGElementTagNameMap;

    type ElementDescriptor<T extends AnyTag = any, S = any> = {
        __type: "element";
        tag: T;
        options: Record<string, any>;
        children: Array<VirtualNode<S>>;
    };
    
    interface ElementGenerator<T extends AnyTag> {
        <S = any>(
            options?: PrimitiveElementOptionsOrChild<T, S>,
            ...children: Array<VirtualNode<S>>
        ): ElementDescriptor<T, S>;
    }
    
    /** Creates an `<html>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html */
    var html: ReturnType<typeof makeEl<"html">>;
    /** Creates a `<head>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head */
    var head: ReturnType<typeof makeEl<"head">>;
    /** Creates a `<title>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title */
    var title: ReturnType<typeof makeEl<"title">>;
    /** Creates a `<base>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base */
    var base: ReturnType<typeof makeEl<"base">>;
    /** Creates a `<link>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link */
    var link: ReturnType<typeof makeEl<"link">>;
    /** Creates a `<meta>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta */
    var meta: ReturnType<typeof makeEl<"meta">>;
    /** Creates a `<style>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style */
    var style: ReturnType<typeof makeEl<"style">>;
    /** Creates a `<body>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body */
    var body: ReturnType<typeof makeEl<"body">>;
    /** Creates an `<article>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article */
    var article: ReturnType<typeof makeEl<"article">>;
    /** Creates a `<section>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section */
    var section: ReturnType<typeof makeEl<"section">>;
    /** Creates a `<nav>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav */
    var nav: ReturnType<typeof makeEl<"nav">>;
    /** Creates an `<aside>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside */
    var aside: ReturnType<typeof makeEl<"aside">>;
    /** Creates an `<h1>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h1: ReturnType<typeof makeEl<"h1">>;
    /** Creates an `<h2>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h2: ReturnType<typeof makeEl<"h2">>;
    /** Creates an `<h3>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h3: ReturnType<typeof makeEl<"h3">>;
    /** Creates an `<h4>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h4: ReturnType<typeof makeEl<"h4">>;
    /** Creates an `<h5>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h5: ReturnType<typeof makeEl<"h5">>;
    /** Creates an `<h6>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
    var h6: ReturnType<typeof makeEl<"h6">>;
    /** Creates a `<header>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header */
    var header: ReturnType<typeof makeEl<"header">>;
    /** Creates a `<footer>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer */
    var footer: ReturnType<typeof makeEl<"footer">>;
    /** Creates an `<address>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/address */
    var address: ReturnType<typeof makeEl<"address">>;
    /** Creates a `<main>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main */
    var main: ReturnType<typeof makeEl<"main">>;
    /** Creates a `<p>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p */
    var p: ReturnType<typeof makeEl<"p">>;
    /** Creates an `<hr>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr */
    var hr: ReturnType<typeof makeEl<"hr">>;
    /** Creates a `<pre>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre */
    var pre: ReturnType<typeof makeEl<"pre">>;
    /** Creates a `<blockquote>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote */
    var blockquote: ReturnType<typeof makeEl<"blockquote">>;
    /** Creates an `<ol>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol */
    var ol: ReturnType<typeof makeEl<"ol">>;
    /** Creates a `<ul>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul */
    var ul: ReturnType<typeof makeEl<"ul">>;
    /** Creates a `<li>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li */
    var li: ReturnType<typeof makeEl<"li">>;
    /** Creates a `<dl>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl */
    var dl: ReturnType<typeof makeEl<"dl">>;
    /** Creates a `<dt>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt */
    var dt: ReturnType<typeof makeEl<"dt">>;
    /** Creates a `<dd>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd */
    var dd: ReturnType<typeof makeEl<"dd">>;
    /** Creates a `<figure>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure */
    var figure: ReturnType<typeof makeEl<"figure">>;
    /** Creates a `<figcaption>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption */
    var figcaption: ReturnType<typeof makeEl<"figcaption">>;
    /** Creates a `<div>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div */
    var div: ReturnType<typeof makeEl<"div">>;
    /** Creates an `<a>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a */
    var a: ReturnType<typeof makeEl<"a">>;
    /** Creates an `<em>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em */
    var em: ReturnType<typeof makeEl<"em">>;
    /** Creates a `<strong>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong */
    var strong: ReturnType<typeof makeEl<"strong">>;
    /** Creates a `<small>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small */
    var small: ReturnType<typeof makeEl<"small">>;
    /** Creates an `<s>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/s */
    var s: ReturnType<typeof makeEl<"s">>;
    /** Creates a `<cite>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/cite */
    var cite: ReturnType<typeof makeEl<"cite">>;
    /** Creates a `<q>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q */
    var q: ReturnType<typeof makeEl<"q">>;
    /** Creates a `<dfn>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn */
    var dfn: ReturnType<typeof makeEl<"dfn">>;
    /** Creates an `<abbr>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr */
    var abbr: ReturnType<typeof makeEl<"abbr">>;
    /** Creates a `<ruby>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby */
    var ruby: ReturnType<typeof makeEl<"ruby">>;
    /** Creates a `<rt>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rt */
    var rt: ReturnType<typeof makeEl<"rt">>;
    /** Creates a `<rp>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rp */
    var rp: ReturnType<typeof makeEl<"rp">>;
    /** Creates a `<data>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/data */
    var data: ReturnType<typeof makeEl<"data">>;
    /** Creates a `<time>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time */
    var time: ReturnType<typeof makeEl<"time">>;
    /** Creates a `<code>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code */
    var code: ReturnType<typeof makeEl<"code">>;
    /** Creates a `<kbd>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd */
    var kbd: ReturnType<typeof makeEl<"kbd">>;
    /** Creates a `<samp>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp */
    var samp: ReturnType<typeof makeEl<"samp">>;
    /** Creates a `<sub>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sub */
    var sub: ReturnType<typeof makeEl<"sub">>;
    /** Creates a `<sup>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sup */
    var sup: ReturnType<typeof makeEl<"sup">>;
    /** Creates an `<i>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i */
    var i: ReturnType<typeof makeEl<"i">>;
    /** Creates a `<b>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b */
    var b: ReturnType<typeof makeEl<"b">>;
    /** Creates an `<u>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/u */
    var u: ReturnType<typeof makeEl<"u">>;
    /** Creates a `<mark>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark */
    var mark: ReturnType<typeof makeEl<"mark">>;
    /** Creates a `<bdi>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdi */
    var bdi: ReturnType<typeof makeEl<"bdi">>;
    /** Creates a `<bdo>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdo */
    var bdo: ReturnType<typeof makeEl<"bdo">>;
    /** Creates a `<span>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span */
    var span: ReturnType<typeof makeEl<"span">>;
    /** Creates a `<br>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br */
    var br: ReturnType<typeof makeEl<"br">>;
    /** Creates a `<wbr>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr */
    var wbr: ReturnType<typeof makeEl<"wbr">>;
    /** Creates an `<ins>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins */
    var ins: ReturnType<typeof makeEl<"ins">>;
    /** Creates a `<del>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del */
    var del: ReturnType<typeof makeEl<"del">>;
    /** Creates a `<picture>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture */
    var picture: ReturnType<typeof makeEl<"picture">>;
    /** Creates a `<source>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source */
    var source: ReturnType<typeof makeEl<"source">>;
    /** Creates an `<img>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img */
    var img: ReturnType<typeof makeEl<"img">>;
    /** Creates an `<iframe>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe */
    var iframe: ReturnType<typeof makeEl<"iframe">>;
    /** Creates an `<embed>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/embed */
    var embed: ReturnType<typeof makeEl<"embed">>;
    /** Creates an `<object>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object */
    var object: ReturnType<typeof makeEl<"object">>;
    /** Creates a `<param>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/param */
    var param: ReturnType<typeof makeEl<"param">>;
    /** Creates a `<video>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video */
    var video: ReturnType<typeof makeEl<"video">>;
    /** Creates an `<audio>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio */
    var audio: ReturnType<typeof makeEl<"audio">>;
    /** Creates a `<track>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track */
    var trackEl: ReturnType<typeof makeEl<"track">>;
    /** Creates a `<map>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map */
    var map: ReturnType<typeof makeEl<"map">>;
    /** Creates an `<area>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area */
    var area: ReturnType<typeof makeEl<"area">>;
    /** Creates a `<table>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table */
    var table: ReturnType<typeof makeEl<"table">>;
    /** Creates a `<caption>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption */
    var caption: ReturnType<typeof makeEl<"caption">>;
    /** Creates a `<colgroup>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup */
    var colgroup: ReturnType<typeof makeEl<"colgroup">>;
    /** Creates a `<col>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col */
    var col: ReturnType<typeof makeEl<"col">>;
    /** Creates a `<tbody>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody */
    var tbody: ReturnType<typeof makeEl<"tbody">>;
    /** Creates a `<thead>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead */
    var thead: ReturnType<typeof makeEl<"thead">>;
    /** Creates a `<tfoot>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot */
    var tfoot: ReturnType<typeof makeEl<"tfoot">>;
    /** Creates a `<tr>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr */
    var tr: ReturnType<typeof makeEl<"tr">>;
    /** Creates a `<td>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td */
    var td: ReturnType<typeof makeEl<"td">>;
    /** Creates a `<th>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th */
    var th: ReturnType<typeof makeEl<"th">>;
    /** Creates a `<form>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form */
    var form: ReturnType<typeof makeEl<"form">>;
    /** Creates a `<label>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label */
    var label: ReturnType<typeof makeEl<"label">>;
    /** Creates an `<input>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input */
    var input: ReturnType<typeof makeEl<"input">>;
    /** Creates a `<button>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button */
    var button: ReturnType<typeof makeEl<"button">>;
    /** Creates a `<select>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select */
    var select: ReturnType<typeof makeEl<"select">>;
    /** Creates a `<datalist>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist */
    var datalist: ReturnType<typeof makeEl<"datalist">>;
    /** Creates an `<optgroup>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup */
    var optgroup: ReturnType<typeof makeEl<"optgroup">>;
    /** Creates an `<option>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option */
    var option: ReturnType<typeof makeEl<"option">>;
    /** Creates a `<textarea>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea */
    var textarea: ReturnType<typeof makeEl<"textarea">>;
    /** Creates an `<output>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output */
    var output: ReturnType<typeof makeEl<"output">>;
    /** Creates a `<progress>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress */
    var progress: ReturnType<typeof makeEl<"progress">>;
    /** Creates a `<meter>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter */
    var meter: ReturnType<typeof makeEl<"meter">>;
    /** Creates a `<fieldset>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset */
    var fieldset: ReturnType<typeof makeEl<"fieldset">>;
    /** Creates a `<legend>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend */
    var legend: ReturnType<typeof makeEl<"legend">>;
    /** Creates a `<details>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details */
    var details: ReturnType<typeof makeEl<"details">>;
    /** Creates a `<summary>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary */
    var summary: ReturnType<typeof makeEl<"summary">>;
    /** Creates a `<dialog>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog */
    var dialog: ReturnType<typeof makeEl<"dialog">>;
    /** Creates a `<script>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script */
    var script: ReturnType<typeof makeEl<"script">>;
    /** Creates a `<noscript>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript */
    var noscript: ReturnType<typeof makeEl<"noscript">>;
    /** Creates a `<template>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template */
    var template: ReturnType<typeof makeEl<"template">>;
    /** Creates a `<slot>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot */
    var slot: ReturnType<typeof makeEl<"slot">>;
    /** Creates a `<canvas>` element, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas */
    var canvas: ReturnType<typeof makeEl<"canvas">>;
    /** Creates an `<svg>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg */
    var svg: ReturnType<typeof makeEl<"svg">>;
    /** Creates a `<g>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g */
    var g: ReturnType<typeof makeEl<"g">>;
    /** Creates a `<defs>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs */
    var defs: ReturnType<typeof makeEl<"defs">>;
    /** Creates a `<desc>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc */
    var desc: ReturnType<typeof makeEl<"desc">>;
    /** Creates a `<symbol>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol */
    var symbol: ReturnType<typeof makeEl<"symbol">>;
    /** Creates a `<use>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use */
    var use: ReturnType<typeof makeEl<"use">>;
    /** Creates an `<image>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image */
    var image: ReturnType<typeof makeEl<"image">>;
    /** Creates a `<switch>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch */
    var switchEl: ReturnType<typeof makeEl<"switch">>;
    /** Creates a `<path>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path */
    var path: ReturnType<typeof makeEl<"path">>;
    /** Creates a `<rect>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect */
    var rect: ReturnType<typeof makeEl<"rect">>;
    /** Creates a `<circle>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle */
    var circle: ReturnType<typeof makeEl<"circle">>;
    /** Creates an `<ellipse>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse */
    var ellipse: ReturnType<typeof makeEl<"ellipse">>;
    /** Creates a `<line>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line */
    var line: ReturnType<typeof makeEl<"line">>;
    /** Creates a `<polyline>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline */
    var polyline: ReturnType<typeof makeEl<"polyline">>;
    /** Creates a `<polygon>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon */
    var polygon: ReturnType<typeof makeEl<"polygon">>;
    /** Creates a `<text>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text */
    var text: ReturnType<typeof makeEl<"text">>;
    /** Creates a `<tspan>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan */
    var tspan: ReturnType<typeof makeEl<"tspan">>;
    /** Creates a `<textPath>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath */
    var textPath: ReturnType<typeof makeEl<"textPath">>;
    /** Creates a `<marker>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker */
    var marker: ReturnType<typeof makeEl<"marker">>;
    /** Creates a `<pattern>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern */
    var pattern: ReturnType<typeof makeEl<"pattern">>;
    /** Creates a `<mask>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask */
    var mask: ReturnType<typeof makeEl<"mask">>;
    /** Creates a `<clipPath>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath */
    var clipPath: ReturnType<typeof makeEl<"clipPath">>;
    /** Creates a `<linearGradient>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient */
    var linearGradient: ReturnType<typeof makeEl<"linearGradient">>;
    /** Creates a `<radialGradient>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient */
    var radialGradient: ReturnType<typeof makeEl<"radialGradient">>;
    /** Creates a `<stop>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop */
    var stopEl: ReturnType<typeof makeEl<"stop">>;
    /** Creates a `<filter>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter */
    var filter: ReturnType<typeof makeEl<"filter">>;
    /** Creates a `<feBlend>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend */
    var feBlend: ReturnType<typeof makeEl<"feBlend">>;
    /** Creates a `<feColorMatrix>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix */
    var feColorMatrix: ReturnType<typeof makeEl<"feColorMatrix">>;
    /** Creates a `<feComponentTransfer>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer */
    var feComponentTransfer: ReturnType<typeof makeEl<"feComponentTransfer">>;
    /** Creates a `<feComposite>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite */
    var feComposite: ReturnType<typeof makeEl<"feComposite">>;
    /** Creates a `<feConvolveMatrix>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix */
    var feConvolveMatrix: ReturnType<typeof makeEl<"feConvolveMatrix">>;
    /** Creates a `<feDiffuseLighting>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting */
    var feDiffuseLighting: ReturnType<typeof makeEl<"feDiffuseLighting">>;
    /** Creates a `<feDisplacementMap>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap */
    var feDisplacementMap: ReturnType<typeof makeEl<"feDisplacementMap">>;
    /** Creates a `<feDistantLight>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight */
    var feDistantLight: ReturnType<typeof makeEl<"feDistantLight">>;
    /** Creates a `<feDropShadow>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow */
    var feDropShadow: ReturnType<typeof makeEl<"feDropShadow">>;
    /** Creates a `<feFlood>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood */
    var feFlood: ReturnType<typeof makeEl<"feFlood">>;
    /** Creates a `<feFuncA>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA */
    var feFuncA: ReturnType<typeof makeEl<"feFuncA">>;
    /** Creates a `<feFuncB>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB */
    var feFuncB: ReturnType<typeof makeEl<"feFuncB">>;
    /** Creates a `<feFuncG>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG */
    var feFuncG: ReturnType<typeof makeEl<"feFuncG">>;
    /** Creates a `<feFuncR>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR */
    var feFuncR: ReturnType<typeof makeEl<"feFuncR">>;
    /** Creates a `<feGaussianBlur>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur */
    var feGaussianBlur: ReturnType<typeof makeEl<"feGaussianBlur">>;
    /** Creates a `<feImage>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage */
    var feImage: ReturnType<typeof makeEl<"feImage">>;
    /** Creates a `<feMerge>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge */
    var feMerge: ReturnType<typeof makeEl<"feMerge">>;
    /** Creates a `<feMergeNode>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode */
    var feMergeNode: ReturnType<typeof makeEl<"feMergeNode">>;
    /** Creates a `<feMorphology>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology */
    var feMorphology: ReturnType<typeof makeEl<"feMorphology">>;
    /** Creates a `<feOffset>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset */
    var feOffset: ReturnType<typeof makeEl<"feOffset">>;
    /** Creates a `<fePointLight>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight */
    var fePointLight: ReturnType<typeof makeEl<"fePointLight">>;
    /** Creates a `<feSpecularLighting>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting */
    var feSpecularLighting: ReturnType<typeof makeEl<"feSpecularLighting">>;
    /** Creates a `<feSpotLight>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight */
    var feSpotLight: ReturnType<typeof makeEl<"feSpotLight">>;
    /** Creates a `<feTile>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile */
    var feTile: ReturnType<typeof makeEl<"feTile">>;
    /** Creates a `<feTurbulence>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence */
    var feTurbulence: ReturnType<typeof makeEl<"feTurbulence">>;
    /** Creates a `<foreignObject>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject */
    var foreignObject: ReturnType<typeof makeEl<"foreignObject">>;
    /** Creates a `<view>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view */
    var viewEl: ReturnType<typeof makeEl<"view">>;
    /** Creates an `<animate>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate */
    var animate: ReturnType<typeof makeEl<"animate">>;
    /** Creates an `<animateMotion>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion */
    var animateMotion: ReturnType<typeof makeEl<"animateMotion">>;
    /** Creates an `<animateTransform>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform */
    var animateTransform: ReturnType<typeof makeEl<"animateTransform">>;
    /** Creates a `<set>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set */
    var set: ReturnType<typeof makeEl<"set">>;
    /** Creates an `<mpath>` element, https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath */
    var mpath: ReturnType<typeof makeEl<"mpath">>;
    /** Creates a `<math>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/math */
    var math: ReturnType<typeof makeEl<"math">>;
    /** Creates an `<maction>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/maction */
    var maction: ReturnType<typeof makeEl<"maction">>;
    /** Creates an `<mi>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mi */
    var mi: ReturnType<typeof makeEl<"mi">>;
    /** Creates an `<mmultiscripts>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mmultiscripts */
    var mmultiscripts: ReturnType<typeof makeEl<"mmultiscripts">>;
    /** Creates an `<mn>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mn */
    var mn: ReturnType<typeof makeEl<"mn">>;
    /** Creates an `<mo>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mo */
    var mo: ReturnType<typeof makeEl<"mo">>;
    /** Creates an `<mover>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mover */
    var mover: ReturnType<typeof makeEl<"mover">>;
    /** Creates an `<mpadded>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mpadded */
    var mpadded: ReturnType<typeof makeEl<"mpadded">>;
    /** Creates an `<mphantom>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mphantom */
    var mphantom: ReturnType<typeof makeEl<"mphantom">>;
    /** Creates an `<mroot>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mroot */
    var mroot: ReturnType<typeof makeEl<"mroot">>;
    /** Creates an `<mrow>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mrow */
    var mrow: ReturnType<typeof makeEl<"mrow">>;
    /** Creates an `<ms>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/ms */
    var ms: ReturnType<typeof makeEl<"ms">>;
    /** Creates an `<mspace>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mspace */
    var mspace: ReturnType<typeof makeEl<"mspace">>;
    /** Creates an `<msqrt>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msqrt */
    var msqrt: ReturnType<typeof makeEl<"msqrt">>;
    /** Creates an `<mstyle>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle */
    var mstyle: ReturnType<typeof makeEl<"mstyle">>;
    /** Creates an `<msub>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msub */
    var msub: ReturnType<typeof makeEl<"msub">>;
    /** Creates an `<msubsup>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msubsup */
    var msubsup: ReturnType<typeof makeEl<"msubsup">>;
    /** Creates an `<msup>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msup */
    var msup: ReturnType<typeof makeEl<"msup">>;
    /** Creates an `<mtable>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable */
    var mtable: ReturnType<typeof makeEl<"mtable">>;
    /** Creates an `<mtd>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtd */
    var mtd: ReturnType<typeof makeEl<"mtd">>;
    /** Creates an `<mtext>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtext */
    var mtext: ReturnType<typeof makeEl<"mtext">>;
    /** Creates an `<mtr>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtr */
    var mtr: ReturnType<typeof makeEl<"mtr">>;
    /** Creates an `<munder>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/munder */
    var munder: ReturnType<typeof makeEl<"munder">>;
    /** Creates an `<munderover>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/munderover */
    var munderover: ReturnType<typeof makeEl<"munderover">>;
    /** Creates a `<semantics>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/semantics */
    var semantics: ReturnType<typeof makeEl<"semantics">>;
    /** Creates an `<annotation>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/annotation */
    var annotation: ReturnType<typeof makeEl<"annotation">>;
    /** Creates an `<annotation-xml>` element, https://developer.mozilla.org/en-US/docs/Web/MathML/Element/annotation-xml */
    var annotationxml: ReturnType<typeof makeEl<"annotation-xml">>;

}

export {}