import type { EventListenerOption } from "../client/eventListener";
import type { ServerSubject } from "../client/state";
import type { SpecificPropsMap } from "./specific_props";
/** Any valid element that has not been constructed via the use of an element constructor such as h1() */
type ElementLiteral = boolean | number | string | Array<any> | null | undefined | void;
type AnyElement = EleganceElement<any, any> | ElementLiteral | ServerSubject<any>;
type ElementChildren = AnyElement[];
/** Helper to make SpecialElementOption usable on any prop value while preserving original type enforcement */
export type MaybeSpecial<T> = T | SpecialElementOption;
/**
 * An option that should be treated differently by the compiler.
 */
declare abstract class SpecialElementOption {
    /**
     * Mutate this option in the element to it's serializeable state.
     */
    abstract mutate(element: EleganceElement<any, any>, optionName: string): void;
    /**
     * Convert this special element option into a string.
     */
    abstract serialize(optionName: string, elementKey: string): string;
}
type CommonElementProps = {
    "map-id"?: string;
    "component-id"?: string;
    "key"?: string;
    className?: MaybeSpecial<string>;
    style?: MaybeSpecial<Record<string, string | number>>;
    innerHTML?: MaybeSpecial<string>;
    innerText?: MaybeSpecial<string>;
    id?: MaybeSpecial<string>;
    title?: MaybeSpecial<string>;
    lang?: MaybeSpecial<string>;
    dir?: MaybeSpecial<"ltr" | "rtl" | "auto">;
    tabIndex?: MaybeSpecial<number>;
    role?: MaybeSpecial<string>;
    draggable?: MaybeSpecial<boolean>;
    hidden?: MaybeSpecial<boolean>;
    onClick?: MaybeSpecial<EventListenerOption>;
    onDoubleClick?: MaybeSpecial<EventListenerOption>;
    onContextMenu?: MaybeSpecial<EventListenerOption>;
    onMouseDown?: MaybeSpecial<EventListenerOption>;
    onMouseUp?: MaybeSpecial<EventListenerOption>;
    onMouseEnter?: MaybeSpecial<EventListenerOption>;
    onMouseLeave?: MaybeSpecial<EventListenerOption>;
    onMouseMove?: MaybeSpecial<EventListenerOption>;
    onMouseOver?: MaybeSpecial<EventListenerOption>;
    onMouseOut?: MaybeSpecial<EventListenerOption>;
    onWheel?: MaybeSpecial<EventListenerOption>;
    onKeyDown?: MaybeSpecial<EventListenerOption>;
    onKeyUp?: MaybeSpecial<EventListenerOption>;
    onKeyPress?: MaybeSpecial<EventListenerOption>;
    onFocus?: MaybeSpecial<EventListenerOption>;
    onBlur?: MaybeSpecial<EventListenerOption>;
    onFocusIn?: MaybeSpecial<EventListenerOption>;
    onFocusOut?: MaybeSpecial<EventListenerOption>;
    onChange?: MaybeSpecial<EventListenerOption>;
    onInput?: MaybeSpecial<EventListenerOption>;
    onSubmit?: MaybeSpecial<EventListenerOption>;
    onInvalid?: MaybeSpecial<EventListenerOption>;
    onReset?: MaybeSpecial<EventListenerOption>;
    onScroll?: MaybeSpecial<EventListenerOption>;
    [key: `aria-${string}`]: MaybeSpecial<string | number | boolean | null | undefined>;
    [key: `data-${string}`]: MaybeSpecial<string | number | boolean | null | undefined>;
};
type SpecificProps<Tag extends AllElementTags> = Tag extends keyof SpecificPropsMap ? SpecificPropsMap[Tag] : {};
type ElementOptions<Tag extends AllElementTags, ExtraOptions extends object = {}> = CommonElementProps & SpecificProps<Tag> & ExtraOptions;
type ElementOptionsOrChild<Tag extends AllElementTags, ExtraOptions extends object = {}> = ElementOptions<Tag, ExtraOptions> | AnyElement;
type HtmlChildrenlessElementTags = "area" | "base" | "br" | "col" | "embed" | "hr" | "img" | "input" | "link" | "meta" | "param" | "source" | "track" | "wbr";
type HtmlElementTags = "a" | "abbr" | "address" | "article" | "aside" | "audio" | "b" | "bdi" | "bdo" | "blockquote" | "body" | "button" | "canvas" | "caption" | "cite" | "code" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "html" | "i" | "iframe" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "menu" | "meter" | "nav" | "noscript" | "object" | "ol" | "optgroup" | "option" | "output" | "p" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "search" | "section" | "select" | "slot" | "small" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video";
type SvgChildrenlessElementTags = "path" | "circle" | "ellipse" | "line" | "polygon" | "polyline" | "stop";
type SvgElementTags = "svg" | "g" | "text" | "tspan" | "textPath" | "defs" | "symbol" | "use" | "image" | "clipPath" | "mask" | "pattern" | "linearGradient" | "radialGradient" | "filter" | "marker" | "view" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence";
type MathMLChildrenlessElementTags = "mi" | "mn" | "mo";
type MathMLElementTags = "math" | "ms" | "mtext" | "mrow" | "mfenced" | "msup" | "msub" | "msubsup" | "mfrac" | "msqrt" | "mroot" | "mtable" | "mtr" | "mtd" | "mstyle" | "menclose" | "mmultiscripts";
type AllElementTags = HtmlChildrenlessElementTags | HtmlElementTags | SvgChildrenlessElementTags | SvgElementTags | MathMLChildrenlessElementTags | MathMLElementTags;
type EleganceElementBuilder<Tag extends AllElementTags> = Tag extends HtmlChildrenlessElementTags | SvgChildrenlessElementTags | MathMLChildrenlessElementTags ? (options?: ElementOptions<Tag>) => EleganceElement<Tag, false> : (options?: ElementOptionsOrChild<Tag>, ...children: ElementChildren) => EleganceElement<Tag, true>;
declare function isAnElement(value: any): value is AnyElement;
declare class EleganceElement<Tag extends AllElementTags, CanHaveChildren extends boolean> {
    readonly tag: Tag;
    readonly options: ElementOptions<Tag>;
    key?: string;
    children: CanHaveChildren extends true ? ElementChildren : null;
    constructor(tag: Tag, options?: ElementOptionsOrChild<Tag>, children?: ElementChildren | null);
    canHaveChildren(): this is EleganceElement<Tag, true>;
}
export { EleganceElement, SpecialElementOption, isAnElement, };
export type { EleganceElementBuilder, AnyElement, ElementChildren, AllElementTags, HtmlElementTags, HtmlChildrenlessElementTags, SvgElementTags, SvgChildrenlessElementTags, MathMLElementTags, MathMLChildrenlessElementTags, ElementOptions, ElementOptionsOrChild, };
