import { StateController } from "./state";
import { Router } from "./router";
declare class Renderer {
    stateController: StateController;
    router: Router;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;
    constructor();
    log(content: any): void;
    getDomTree(element: HTMLElement): string;
    getPageRenderTime(): number;
    onRenderFinish(callback: () => void): void;
    renderPage(page: Page): void;
    buildElement(element: Child): string | OptionlessBuiltElement<ElementTags>;
    assignPropertyToHTMLElement(elementInDocument: HTMLElement, propertyName: string, propertyValue: any): void;
    processElementOptions(builtElement: BuiltElement<ElementTags> | OptionlessBuiltElement<ElementTags>, elementInDocument: HTMLElement, skipObservables: boolean): void;
    anyToString(value: any): string;
    createElement(element: Child, parentInDocument: HTMLElement | DocumentFragment, doRenderAllChildren: boolean): HTMLElement | Text | null;
    updateElement(elementInDocument: HTMLElement, buildableElement: Child): HTMLElement | Text;
    processOptionAsObserver(option: Record<string, any>, elementInDocument: HTMLElement, builtElement: BuiltElement<ElementTags>, updateKey: string): void;
}
declare const getRenderer: () => Renderer;
export { getRenderer, Renderer };
