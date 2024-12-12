declare class Renderer {
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;
    constructor();
    log(content: any): void;
    getDomTree(element: HTMLElement): string;
    getPageRenderTime(): number;
    onRenderFinish(callback: () => void): void;
    renderPage(page: Page<any>): void;
    buildElement(element: Child): string | BuiltElement<ElementTags> | BuiltElement<OptionlessElementTags> | BuiltElement<ChildrenlessElementTags> | BuiltElement<ChildrenlessOptionlessElementTags>;
    assignPropertyToHTMLElement(elementInDocument: HTMLElement, propertyName: string, propertyValue: any): void;
    processElementOptions(builtElement: AnyBuiltElement, elementInDocument: HTMLElement, skipObservables: boolean): void;
    anyToString(value: any): string;
    createElement(element: Child, parentInDocument: HTMLElement | DocumentFragment, doRenderAllChildren: boolean): HTMLElement | Text | null;
    updateElement(elementInDocument: HTMLElement, buildableElement: Child): HTMLElement | Text;
    processOptionAsObserver(option: Record<string, any>, elementInDocument: HTMLElement, builtElement: BuiltElement<ElementTags>, updateKey: string): void;
}
export { Renderer };
