import { compilerStore, makeId } from "../compilation/compiler";
import { getCallerFile } from "../compilation/modify";
import { EleganceElement } from "../elements/element";
import { raw } from "../elements/raw";
import { loadHook } from "./loadHook";

type StateCreationOptions = {
    /**
     * Override the default ID generation, this is not generally encouraged, 
     * but can be useful if you cannot guarantee order-dependent state() calls. 
     */
    explicitId?: string,
};

class ServerSubject<T extends any> {
    readonly id: string;
    value: T;

    constructor(id: string, value: T) {
        this.id = id;
        this.value = value;
    }

    /**
     * Create a client-side reactiveMap, that dynamically updates itself whenever the subject changes.
     * 
     * **IMPORTANT** `callback` is sent literally to the browser, and thus doesn't have access to server-side variables, and is untrusted.
     * @param callback Client side templating function that gets each entry of T, and returns an EleganceElement.
     * @returns An HTML represent used to track the position of the reactive map.
     */
    reactiveMap(callback: (entry: T extends (infer U)[] ? U : never) => EleganceElement<any, any>): EleganceElement<any, true> {
        if (!callback) {
            throw new Error("No template provided for reactiveMap.");
        }

        if (Array.isArray(this.value) === false) {
            throw new Error("Reactive maps can only be used on arrays.");
        }

        const store = compilerStore.getStore();
        if (!store) {
            throw new Error("reactiveMap() can only be invoked during the build process of a page or layout.");
        }

        const mapId = state(store.generateId());

        const templateState = state(callback);

        loadHook((templateState, thisState, mapId) => {
            let trackedElements: Node[] = [];

            function updateCallback() {
                const mapTemplateElement = document.querySelector(`template[map-id="${mapId.value}"]`);
                if(!mapTemplateElement) {
                    DEV_BUILD: throw new Error("The DOM has been mutated and no longer contains the required template element to create an track the reactiveMap of subject with id: " + thisState.id);
                    return;
                }

                for (const elem of trackedElements) {
                    elem.parentElement?.removeChild(elem);
                }

                trackedElements = [];

                for (const value of thisState.value as any[]) {
                    const result = templateState.value(value);

                    const instanceHTML = eleganceClient.createHTMLElementFromElement(result);

                    mapTemplateElement.parentElement?.insertBefore(instanceHTML.root, mapTemplateElement);

                    trackedElements.push(instanceHTML.root);
                }
            }

            const callbackId = Date.now().toString();
            thisState.observe(callbackId, updateCallback);
            updateCallback();

            return () => {
                thisState.unobserve(callbackId);
            };
        }, [templateState, this, mapId]);

        return template({ "map-id": mapId.value, });
    }

    /**
     * Allows the use of a ServerSubject as the child of an EleganceElement.
     * 
     * Returns an HTML string that will be removed on page-load in the client and replaced with the appropriate value.
     * @returns HTML string
     */
    generateObserverNode(): string {
        return raw(`<template o="${this.id}"></template>`);
    }

    toString() {
        return this.generateObserverNode();
    }

    serialize(): string {
        let result = `{id:"${this.id}",value:`;

        switch (typeof this.value) {
        case "string":
            result += `"${this.value}"`;
            break;
        case "function":
            result += `${(this.value as any).toString()}`;
            break;
        case "object":
            if (Array.isArray(this.value)) {
                result += `${JSON.stringify(this.value)}`;
                break;
            }
        default:
            result += JSON.stringify(this.value);
            break;
        }

        result += "}";
        return result;
    }
}

/**
 * Create a reactive ServerSubject which will be serialized and sent to the browser.
 * 
 * Once in the callback of a loadHook, eventListener, etc. it will become a *ClientSubject*.
 * @param value Any value you want to be accessible in the browser. Value is sent literally as-is. Functions are supported.
 * @param options Set options for the state (usually unused)
 * @returns An instance of ServerSubject you can use as a reference to this state in functions like `loadHook()`
 */
function state<T>(value: T, options?: StateCreationOptions): ServerSubject<T> {
    const store = compilerStore.getStore();
    
    if (!store) {
        const message = "Illegal invocation of state(). Ensure that the state() function is only called inside components, and never at the top-level of a page or layout.";
        throw new Error(message);
    }

    const { ourCaller } = getCallerFile();
    console.log("guy who called state", ourCaller)
    const subjectId = makeId(ourCaller.fileName, ourCaller.line, ourCaller.char);

    const serverSubject = new ServerSubject(subjectId, value);

    store.addClientToken(serverSubject);

    return serverSubject
}

export {
    state,
    ServerSubject,
}