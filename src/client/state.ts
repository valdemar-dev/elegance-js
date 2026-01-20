import { compilerStore } from "../compilation/compiler";
import { EleganceElement } from "../elements/element";
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

    reactiveMap(template: (entry: T extends (infer U)[] ? U : never) => EleganceElement<any>) {
        if (!template) {
            throw new Error("No template provided for reactiveMap.");
        }

        if (Array.isArray(this.value) === false) {
            throw new Error("Reactive maps can only be used on arrays.");
        }

        const templateState = state(template);
        loadHook((templateState, thisState) => {
            let trackedElements: Element[] = [];

            function updateCallback(value: any) {
                for (const elem of trackedElements) {
                    elem.remove();
                }

                trackedElements = [];

                for (const value of thisState.value as any[]) {
                    const result = templateState.value(value);
                }

                addNewElements();
            };

            const callbackId = Date.now().toString();
            thisState.observe(callbackId, updateCallback);

            return () => {
                thisState.unobserve(callbackId);
            };
        }, [templateState, this]);
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

function state<T>(value: T, options?: StateCreationOptions): ServerSubject<T> {
    const store = compilerStore.getStore();
    
    if (!store) {
        const message = "Illegal invocation of state(). Ensure that the state() function is only called inside components, and never at the top-level of a page or layout.";
        throw new Error(message);
    }

    const subjectId = options?.explicitId ?? store.generateId();

    const serverSubject = new ServerSubject(subjectId, value);

    store.addClientToken(serverSubject);

    return serverSubject
}

export {
    state,
    ServerSubject,
}