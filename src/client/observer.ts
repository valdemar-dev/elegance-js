import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type ToClient<T> =
    T extends ServerSubject<infer V>
        ? ClientSubject<V>
        : never;

type ObserverCallback<T extends ServerSubject<any>> =
    (...dependencies: ToClient<T>["value"][]) => string;

class ObserverOption extends SpecialElementOption {
    id: string;
    
    constructor(id: string) {
        super();

        this.id = id;
    }

    mutate(element: EleganceElement<any>, optionName: string): void {
        delete (element.options as Record<string, unknown>)[optionName];
    }

    serialize(optionName: string, elementKey: string): string {
        let result = "{";
        result += `option:"${optionName}",`;
        result += `key:"${elementKey}",`;
        result += `id:"${this.id}"`;
        result += "}";

        return result;
    }
}

/** 
 * An observer, as it exists on the server. 
 * The is never *used* on the server, but it is declared there, 
 * and then transformed into a ClientObserver 
 */
class ServerObserver<T extends ServerSubject<any>> {
    id: string;
    callback: ObserverCallback<T>;
    dependencies: string[];

    constructor(id: string, callback: ObserverCallback<T>, dependencies: T[]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
    }

    serialize(): string { 
        let result = "{"; 
        result += `id:"${this.id}",`;
        result += `callback:${this.callback.toString()},`; 
        result += `dependencies:[${this.dependencies.map(d => `"${d}"`).join("\",\"")}],`; 
        result += "}"; 

        return result; 
    }
}

/**
 * Creates an observer, which is a sort of reactive element option.
 * An observer defines an array of subjects as it's dependencies, and whenever any of those dependencies values' changes,
 * the observer's callback is called, along with all the values of the subjects.
 * The observer callback returns a string, which is then set as the attributes value.
 * 
 * **IMPORTANT**: The callback is *browser-code*, and thus does not have any context of your page.ts or layout.ts file. 
 * The callback function is sent *literally* to the browser, as-is.
 * 
 * @param callback The function to be called when the event that this eventListener is attached to is triggered.
 * @param dependencies An array of ServerSubject's that should be passed into the callback when it is run.
 * @returns A special element option that you can use as a value on an option of an EleganceElement.
 */
function observer<T extends ServerSubject<any>>(
    callback: ObserverCallback<T>,
    dependencies: T[]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of observer(). Ensure that the observer() function is only called inside components, and never at the top-level of a page or layout.");

    const id = store.generateId();
    const listener = new ServerObserver(id, callback, dependencies);
    
    store.addClientToken(listener);

    return new ObserverOption(id);
}

export {
    observer,
    ServerObserver,
    ObserverOption
}

export type {
    ObserverCallback,
}