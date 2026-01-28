import {
    HtmlChildrenlessElementTags,
    HtmlElementTags,
    SvgChildrenlessElementTags,
    SvgElementTags,
    MathMLChildrenlessElementTags,
    MathMLElementTags,
    EleganceElement,
    EleganceElementBuilder,
    ElementChildren,
    ElementOptions,
    AllElementTags,
    ElementOptionsOrChild,
} from "./element";

const htmlChildrenlessElementTags: Array<HtmlChildrenlessElementTags> = [
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
];

const htmlElementTags: Array<HtmlElementTags> = [
    "a", "abbr", "address", "article", "aside", "audio", "b", "bdi", "bdo",
    "blockquote", "body", "button", "canvas", "caption", "cite", "code",
    "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog",
    "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer",
    "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup",
    "html", "i", "iframe", "ins", "kbd", "label", "legend", "li", "main",
    "map", "mark", "menu", "meter", "nav", "noscript", "object", "ol",
    "optgroup", "option", "output", "p", "picture", "pre", "progress",
    "q", "rp", "rt", "ruby", "s", "samp", "script", "search", "section",
    "select", "slot", "small", "span", "strong", "style", "sub", "summary",
    "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th",
    "thead", "time", "title", "tr", "u", "ul", "var", "video",
];

const svgChildrenlessElementTags: Array<SvgChildrenlessElementTags> = [
    "path", "circle", "ellipse", "line", "polygon", "polyline", "stop",
];

const svgElementTags: Array<SvgElementTags> = [
    "svg", "g", "text", "tspan", "textPath", "defs", "symbol", "use",
    "image", "clipPath", "mask", "pattern", "linearGradient", "radialGradient",
    "filter", "marker", "view",
    "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite",
    "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight",
    "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur",
    "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset",
    "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence",
];

const mathmlChildrenlessElementTags: Array<MathMLChildrenlessElementTags> = [
    "mi", "mn", "mo",
];

const mathmlElementTags: Array<MathMLElementTags> = [
    "math", "ms", "mtext", "mrow", "mfenced", "msup", "msub", "msubsup",
    "mfrac", "msqrt", "mroot", "mtable", "mtr", "mtd", "mstyle",
    "menclose", "mmultiscripts",
];

const elements: Record<string, EleganceElementBuilder<any>> = {};
const childrenlessElements: Record<string, EleganceElementBuilder<any>> = {};

function createElementBuilder<Tag extends AllElementTags>(
    tag: Tag
): EleganceElementBuilder<Tag> {
    return ((options: ElementOptionsOrChild<any>, ...children: ElementChildren) => 
        new EleganceElement(tag as any, options, children)) as EleganceElementBuilder<Tag>;
}

function createChildrenlessElementBuilder<Tag extends AllElementTags>(
    tag: Tag
): EleganceElementBuilder<Tag> {
    return ((options: ElementOptionsOrChild<any>) =>
        new EleganceElement(tag as any, options, null)) as EleganceElementBuilder<Tag>;
}

for (const tag of htmlElementTags) elements[tag] = createElementBuilder(tag);
for (const tag of svgElementTags) elements[tag] = createElementBuilder(tag);
for (const tag of mathmlElementTags) elements[tag] = createElementBuilder(tag);

for (const tag of htmlChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);

for (const tag of svgChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);

for (const tag of mathmlChildrenlessElementTags)
    childrenlessElements[tag] = createChildrenlessElementBuilder(tag);

const allElements = {
    ...elements,
    ...childrenlessElements,
};

export {
    elements,
    childrenlessElements,
    allElements,
};
