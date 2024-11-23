import { StateController } from "./state";
import { Router } from "./router";

interface Option {
    [key: string]: any;
}

interface ObserverOption {
    ids: string[];
    scope: "local" | "global";
    update: (...args: any[]) => any;
}

type ElementFunction = () => HTMLElement;

class Renderer {
    stateController: StateController;
    log: (content: string) => void;
    router: Router;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;

    constructor();

    getPageRenderTime(): number;

    onRenderFinish(callback: () => void): void;

    generateID(): string;

    renderPage(page: Page): void;

    buildElement(element: BuildableElement): BuiltElement;

    assignPropertyToHTMLElement(
        elementInDocument: HTMLElement,
        propertyName: string,
        propertyValue: any
    ): void;

    processElementOptions(
        builtElement: BuiltElement,
        elementInDocument: HTMLElement,
        skipObservables: boolean
    ): void;

    createElement(
        element: BuildableElement,
        parentInDocument: HTMLElement | undefined,
        doRenderAllChildren: boolean
    ): HTMLElement;

    updateElement(eleganceID: string): void;

    processOptionAsObserver(
        option: ObserverOption,
        elementInDocument: HTMLElement,
        builtElement: { getOptions: () => { [key: string]: any } },
        updateKey: string
    ): void;
}

declare const getRenderer: () => Renderer;

export { getRenderer, Renderer };
