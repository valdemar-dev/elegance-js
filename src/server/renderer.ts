import { camelToKebabCase } from "../helpers/camelToKebab";
import { ServerRouter } from "./router";
import { ServerStateController } from "./state";

const reservedAttributes = [
    "clientOnly",
];

class ServerRenderer {
    stateController: ServerStateController;
    router: ServerRouter;
    renderTime: number;
    onRenderFinishCallbacks: Array<() => void>
    currentElementIndex: number = 0;

    HTMLString: string = "";
    eventListenerStore: Array<{
        eleganceID: number,
        eventListeners: string[]
    }> = [];

    constructor(router: ServerRouter, stateController: ServerStateController) {
        this.router = router;
        this.stateController = stateController;
        this.renderTime = 0;
        this.onRenderFinishCallbacks = []
    }

    log(content: any) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
    }

    getOption(key: string, elementOptions: [string, any][]) {
        const value = elementOptions.find(([k]) => k === key);

        if (!value) return null;

        return value[1];
    }

    serializeEventHandler(
        attributeName: string,
        el: (...args: any) => any,
        eleganceID: number,
    ) {
        let elementInStore = this.eventListenerStore!.find(el => el.eleganceID === eleganceID);

        if (!elementInStore) {
            elementInStore = {
                eleganceID: eleganceID,
                eventListeners: [],
            };

            this.eventListenerStore!.push(elementInStore);
        }

        const eventListenerString = el.toString();

        const elAsString = `{an:"${attributeName}",el:${eventListenerString.replace(/\s+/g, '')}}`;

        elementInStore.eventListeners.push(elAsString);

        console.log(`Serialized attribute ${attributeName} for element with id: ${eleganceID}. Set to string ${eventListenerString}`);
    }

    renderElement(element: Child) {
        if (
            typeof element === "string" || 
            typeof element === "number" ||
            typeof element === "boolean"
        ) {
            return this.HTMLString += `${element}`;
        }

        else if (typeof element !== "function") {
            throw `Elements must be either a string, number or function.`;
        }

        const builtElement = element();
        let elementEleganceID = null; 

        const options = Object.entries(builtElement.getOptions());
        const clientOnlyOption = this.getOption("clientOnly", options);

        if (clientOnlyOption === true) {
            // HANDLE CLIENT ONLY ASSIGNMENT
            console.log("CLIENT ONLY");
        }

        this.HTMLString += `<${builtElement.tag}`;


        for (const [key, value] of options) { 
            if (reservedAttributes.includes(key)) {
                console.log("reserved attr");
                continue;
            }

            // all eventlisteners start with "on(something)"
            if (!key.startsWith("on")) {
                this.HTMLString += ` ${camelToKebabCase(value)}="${value}"`;

                continue;
            }

            if (!elementEleganceID) {
                elementEleganceID = this.currentElementIndex++;

                this.HTMLString += ` e-id=${elementEleganceID}`;
            }

            this.serializeEventHandler(key, value, elementEleganceID); 
        }

        if (!builtElement.children) {
            this.HTMLString += "/>";
            return;
        }

        this.HTMLString += ">";

        for (const element of builtElement.children) {
            this.renderElement(element);
        }

        this.HTMLString += `</${builtElement.tag}>`;
    }

    async renderPage(page: Page) {
        const builtPage = page({
            router: this.router as any,
            renderer: this as any,
            state: this.stateController as any,
        });

        this.renderElement(builtPage);
    }
}

export { ServerRenderer };
