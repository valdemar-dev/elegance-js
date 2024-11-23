import { StateController } from "./state";
import { Router } from "./router";
declare class Renderer {
    stateController: StateController;
    router: Router;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;
    constructor();
    log(content: any): void;
    getPageRenderTime(): number;
    onRenderFinish(callback: () => void): void;
    renderPage(page: Page): void;
    buildElement(element: BuildableElement<ElementTags> | OptionlessBuildableElement<ElementTags> | string): string | OptionlessBuiltElement<ElementTags>;
    assignPropertyToHTMLElement(elementInDocument: HTMLElement, propertyName: string, propertyValue: any): void;
    processElementOptions(builtElement: BuiltElement<ElementTags> | OptionlessBuiltElement<ElementTags>, elementInDocument: HTMLElement, skipObservables: boolean): void;
    createElement(element: BuildableElement<ElementTags> | OptionlessBuildableElement<ElementTags> | string, parentInDocument: HTMLElement | undefined, doRenderAllChildren: boolean): Text | HTMLElement;
    updateElement(eleganceID: string): void;
    processOptionAsObserver(option: Record<string, any>, elementInDocument: HTMLElement, builtElement: BuiltElement<ElementTags>, updateKey: string): void;
}
declare const getRenderer: () => Renderer;
export { getRenderer, Renderer };
