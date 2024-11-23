import { getStateController, StateController } from "./state";
import { getRouter, Router } from "./router";

class Renderer {
    stateController: StateController;
    router: Router;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>

    constructor() {
        this.stateController = getStateController();

        this.router = getRouter();
        this.renderTime = 0;

        this.onRenderFinishCallbacks = []
    }

    log(content: any) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
    }

    getPageRenderTime() {
        return this.renderTime
    }

    onRenderFinish(callback: () => void) {
        this.log("Added render callback.");
        this.onRenderFinishCallbacks.push(callback);
    }

    renderPage(page: Page) {
        const start = performance.now();

        this.log("Starting render..");

        this.log("Emptying previous onRenderFinishCallbacks..")
        this.onRenderFinishCallbacks = [];

        const fragment = document.createDocumentFragment();

        const calledPage = page({
            router: this.router,
            state: this.stateController,
            renderer: this
        });

        const element = this.createElement(
            calledPage,  
            undefined,
            true
        );

        const renderTime = performance.now() - start
        this.log(`Page fully rendered after: ${renderTime}ms`);

        fragment.appendChild(element);
        console.log(document.body);

        document.documentElement.replaceChild(element, document.body);

        this.renderTime = renderTime;

        this.log("Calling on render finish callbacks..");
        for (const onRenderFinishCallback of this.onRenderFinishCallbacks) {
            onRenderFinishCallback()
        }

        this.router.setPopState();
    }

    buildElement(element: BuildableElement<ElementTags> | OptionlessBuildableElement<ElementTags> | string) {
        if (typeof element === "string") return element;

        if (element instanceof Promise) {
            console.error(element);
            throw `Asynchronous elements are not supported, consider using a suspense element.`;
        }

        if (typeof element !== "function") {
            console.error(element); 
            throw `Cannot build a non-functional element, got ${element}`;
        }

        return element ();
    }

    assignPropertyToHTMLElement(
        elementInDocument: HTMLElement,
        propertyName: string,
        propertyValue: any,
    ) {
        if (!(elementInDocument instanceof HTMLElement)) {
            throw new Error(`Provided elementInDocument is not a valid HTML element. Got: ${elementInDocument}.`);
        }

        if (propertyName in elementInDocument) {
            // this language is so bad, why do we use typescript again?
            (elementInDocument as any)[propertyName] = propertyValue;
            return;
        }

        if (propertyName === 'class') {
            elementInDocument.className = propertyValue;
            return;
        }

        if (propertyName === 'style' && typeof propertyValue === 'object') {
            Object.assign(elementInDocument.style, propertyValue);
            return;
        }

        if (typeof propertyValue === "function") {
            elementInDocument.setAttribute(propertyName, propertyValue());
            return;
        }

        elementInDocument.setAttribute(propertyName, propertyValue);
    }

    processElementOptions(
        builtElement: BuiltElement<ElementTags> | OptionlessBuiltElement<ElementTags>,
        elementInDocument: HTMLElement,
        skipObservables: boolean,
    ) {
        if (!Object.hasOwn(builtElement, "getOptions")) { 
            return;
        }

        const element = builtElement as BuiltElement<ElementTags>;

        const options = element.getOptions();

        if (!options) return;

        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                const value = options[key];
                if (typeof value !== "object") {
                    this.assignPropertyToHTMLElement(elementInDocument, key, value);
                } else if (!skipObservables) {
                    this.processOptionAsObserver(value, elementInDocument, element, key);
                }
            }
        }
    }

    createElement(
        element: BuildableElement<ElementTags> | OptionlessBuildableElement<ElementTags> | string,
        parentInDocument: HTMLElement | undefined,
        doRenderAllChildren: boolean,
    ) {
        const builtElement = this.buildElement(element);
        
        if (typeof builtElement === "string") {
            const elementInDocument = document.createTextNode(builtElement);

            if (parentInDocument) {
                parentInDocument.appendChild(elementInDocument);
            }

            return elementInDocument;
        }

        const elementInDocument = document.createElement(builtElement.tag);

        this.processElementOptions(builtElement, elementInDocument, false);

        if (doRenderAllChildren) {
            const childrenLength = builtElement.children.length;

            for (let i = 0; i < childrenLength; i++) {
                const child = builtElement.children[i];
                if (child) {
                    this.createElement(child, elementInDocument, true);
                }
            }
        }

        if (parentInDocument) {
            parentInDocument.appendChild(elementInDocument);
        }

        if (builtElement.onMount) {
            builtElement.onMount(builtElement, elementInDocument);
        }

        return elementInDocument;
    }

    updateElement(eleganceID: string) {
        // Implementation needed for update logic
    }

    processOptionAsObserver(
        option: Record<string, any>,
        elementInDocument: HTMLElement,
        builtElement: BuiltElement<ElementTags>,
        updateKey: string,
    ) {
        const { ids, scope, update } = option;
        const subjectValues: Array<any> = [];

        for (let i = 0; i < ids.length; i++) {
            const subjectId = ids[i];
            const subject = scope === "local" ?
                this.stateController.get(subjectId) :
                this.stateController.getGlobal(subjectId);

            subjectValues.push(subject.get());

            const callbackFunction = async (newValue: typeof subject) => {
                subjectValues[i] = newValue;
                this.assignPropertyToHTMLElement(elementInDocument, updateKey, update(...subjectValues));
            };

            subject.observe(callbackFunction);
        }

        // Give initial update value
        this.assignPropertyToHTMLElement(elementInDocument, updateKey, update(...subjectValues));
    }
}

const getRenderer = () => {
    if (globalThis.eleganceRenderer) return globalThis.eleganceRenderer;

    console.log("%cElegance renderer is loading..", "font-size: 30px; color: #ffffaa");

    globalThis.eleganceRenderer = new Renderer();

    return globalThis.eleganceRenderer;
};

export { getRenderer, Renderer };
