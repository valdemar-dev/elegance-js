import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type SetEvent<E extends Event, T extends EventTarget> =
    E & { target: T; currentTarget: T };
 
type ToClient<T> =
    T extends ServerSubject<infer V>
        ? ClientSubject<V>
        : never;

type EventListenerCallback<T extends ServerSubject<any>> =
    (event: SetEvent<any, any>, ...dependencies: ToClient<T>[]) => void;



class EventListenerOption extends SpecialElementOption {
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
        result += `option:"${optionName.toLowerCase()}",`;
        result += `key:"${elementKey}",`;
        result += `id:"${this.id}"`;
        result += "}";

        return result;
    }
}

class EventListener<T extends ServerSubject<any>> {
    id: string;
    callback: EventListenerCallback<T>;
    dependencies: string[];

    constructor(id: string, callback: EventListenerCallback<T>, dependencies: T[]) {
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

function eventListener<T extends ServerSubject<any>>(
    callback: EventListenerCallback<T>,
    dependencies: T[]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of eventListener(). Ensure that the eventListener() function is only called inside components, and never at the top-level of a page or layout.");

    const id = store.generateId();
    const listener = new EventListener(id, callback, dependencies);
    store.addEventListener(listener);
    return new EventListenerOption(id);
}

export {
    eventListener,
    EventListenerOption,
    EventListener
}

export type {
    EventListenerCallback,
    SetEvent,
}