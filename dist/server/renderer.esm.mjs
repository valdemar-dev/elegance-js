const reservedAttributes = [
    "clientOnly",
];
class ServerRenderer {
    constructor(router, stateController) {
        this.currentElementIndex = 0;
        this.HTMLString = "";
        this.eventListenerStore = [];
        this.router = router;
        this.stateController = stateController;
        this.renderTime = 0;
        this.onRenderFinishCallbacks = [];
    }
    log(content) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa;");
    }
    getOption(key, elementOptions) {
        const value = elementOptions.find(([key]) => key === key);
        if (!value)
            return null;
        return value[1];
    }
    serializeEventHandler(attributeName, el, eleganceID) {
        let elementInStore = this.eventListenerStore.find(el => el.eleganceID === eleganceID);
        if (!elementInStore) {
            elementInStore = {
                eleganceID: eleganceID,
                eventListeners: [],
            };
            this.eventListenerStore.push(elementInStore);
        }
        const eventListenerString = el.toString();
        elementInStore.eventListeners.push({
            attributeName,
            eventListenerString,
        });
        console.log(`Serialized attribute ${attributeName} for element with id: ${eleganceID}. Set to string ${eventListenerString}`);
    }
    renderElement(element) {
        if (typeof element === "string" ||
            typeof element === "number" ||
            typeof element === "boolean") {
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
                this.HTMLString += ` ${key}="${value}"`;
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
    async renderPage(page) {
        const builtPage = page({
            router: this.router,
            renderer: this,
            state: this.stateController,
        });
        this.renderElement(builtPage);
    }
}

export { ServerRenderer };
//# sourceMappingURL=renderer.esm.mjs.map
