import { EleganceElement, EleganceElementBuilder, ElementChildren } from "./element";
declare const elements: Record<string, EleganceElementBuilder<any>>;
declare const childrenlessElements: Record<string, EleganceElementBuilder<any>>;
declare const allElements: {
    [x: string]: ((options?: any) => EleganceElement<any, false>) | ((options?: any, ...children: ElementChildren) => EleganceElement<any, true>);
};
export { elements, childrenlessElements, allElements, };
