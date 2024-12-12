import { ServerRouter } from "./router";
import { ServerStateController } from "./state";
declare class ServerRenderer {
    stateController: ServerStateController;
    router: ServerRouter;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>;
    currentElementIndex: number;
    HTMLString: string;
    eventListenerStore: Array<{
        eleganceID: number;
        eventListeners: string[];
    }>;
    constructor(router: ServerRouter, stateController: ServerStateController);
    log(content: any): void;
    getOption(key: string, elementOptions: [string, any][]): any;
    serializeEventHandler(attributeName: string, el: (...args: any) => any, eleganceID: number): void;
    renderElement(element: Child): string | undefined;
    renderPage(page: Page): Promise<void>;
}
export { ServerRenderer };
