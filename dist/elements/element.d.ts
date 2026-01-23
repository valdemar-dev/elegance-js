/** Any valid element that has not been constructed via the use of an element constructor such as h1() */
type ElementLiteral = boolean | number | string | Array<any>;
type AnyElement = EleganceElement<any> | ElementLiteral;
type ElementChildren = AnyElement[];
/** Element options of this type will be made into field="value.toString()" */
type ElementOptionLiteral = number | string | Record<any, any>;
type ProcessSpecialElementOption = (element: EleganceElement<any>, optionName: string, value: any) => void;
/**
 * An option that should be treated differently by the compiler.
 */
declare abstract class SpecialElementOption {
    /**
     * Mutate this option in the element to it's serializeable state.
     */
    abstract mutate(element: EleganceElement<any>, optionName: string): void;
    /**
     * Convert this special element option into a string.
     */
    abstract serialize(optionName: string, elementKey: string): string;
}
type ElementOptions = Record<string, string | number | SpecialElementOption> | ElementOptionLiteral;
/**
 * Purely for syntax reasons, you can use an element as the options parameter
 * when creating an element using an element builder.
 * This is then prepended into the children by the element builder.
 */
type ElementOptionsOrChildElement = ElementOptions | AnyElement;
type HtmlChildrenlessElementTags = "area" | "base" | "br" | "col" | "embed" | "hr" | "img" | "input" | "link" | "meta" | "param" | "source" | "track" | "wbr";
type HtmlElementTags = "a" | "abbr" | "address" | "article" | "aside" | "audio" | "b" | "bdi" | "bdo" | "blockquote" | "body" | "button" | "canvas" | "caption" | "cite" | "code" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "html" | "i" | "iframe" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "menu" | "meter" | "nav" | "noscript" | "object" | "ol" | "optgroup" | "option" | "output" | "p" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "search" | "section" | "select" | "slot" | "small" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video";
type SvgChildrenlessElementTags = "path" | "circle" | "ellipse" | "line" | "polygon" | "polyline" | "stop";
type SvgElementTags = "svg" | "g" | "text" | "tspan" | "textPath" | "defs" | "symbol" | "use" | "image" | "clipPath" | "mask" | "pattern" | "linearGradient" | "radialGradient" | "filter" | "marker" | "view" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence";
type MathMLChildrenlessElementTags = "mi" | "mn" | "mo";
type MathMLElementTags = "math" | "ms" | "mtext" | "mrow" | "mfenced" | "msup" | "msub" | "msubsup" | "mfrac" | "msqrt" | "mroot" | "mtable" | "mtr" | "mtd" | "mstyle" | "menclose" | "mmultiscripts";
type AllElementTags = HtmlChildrenlessElementTags | HtmlElementTags | SvgChildrenlessElementTags | SvgElementTags | MathMLChildrenlessElementTags | MathMLElementTags;
type EleganceElementBuilder<Tag extends AllElementTags> = Tag extends HtmlChildrenlessElementTags | SvgChildrenlessElementTags | MathMLChildrenlessElementTags ? (options?: ElementOptions) => EleganceElement<false> : (options?: ElementOptions, ...children: ElementChildren) => EleganceElement<true>;
/** Check if any given value can be classified as an element. */
declare function isAnElement(value: any): value is AnyElement;
/** Represents an element that has been constructed via the use of an element constructor such as h1() */
declare class EleganceElement<CanHaveChildren extends boolean> {
    readonly tag: keyof HTMLElementTagNameMap;
    readonly options: ElementOptions;
    /**
     * The unique key of this element.
     * Use getElementKey() in from the compiler to retrieve this value
     */
    key?: string;
    children: CanHaveChildren extends true ? ElementChildren : null;
    constructor(tag: keyof HTMLElementTagNameMap, options: ElementOptionsOrChildElement | undefined, children: ElementChildren | null);
    canHaveChildren(): this is EleganceElement<true>;
}
export { EleganceElement, SpecialElementOption, isAnElement, };
export type { EleganceElementBuilder, AnyElement, ElementChildren, AllElementTags, HtmlElementTags, HtmlChildrenlessElementTags, SvgElementTags, SvgChildrenlessElementTags, MathMLElementTags, MathMLChildrenlessElementTags, ElementOptions, ProcessSpecialElementOption, ElementOptionsOrChildElement, };
