import { EleganceElement, EleganceElementBuilder, ElementChildren, ElementOptions } from "./element";
declare const elements: Record<string, EleganceElementBuilder<any>>;
declare const childrenlessElements: Record<string, EleganceElementBuilder<any>>;
declare const allElements: {
    [x: string]: ((options?: ElementOptions) => EleganceElement<false>) | ((options?: ElementOptions, ...children: ElementChildren) => EleganceElement<true>);
};
export { elements, childrenlessElements, allElements, };
