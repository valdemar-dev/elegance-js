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
        delete element.options[optionName];
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

function observer<T extends ServerSubject<any>>(
    callback: ObserverCallback<T>,
    dependencies: T[]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of observer(). Ensure that the observer() function is only called inside components, and never at the top-level of a page or layout.");

    const id = store.generateId();
    const listener = new ServerObserver(id, callback, dependencies);
    
    store.addServerObserver(listener);

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