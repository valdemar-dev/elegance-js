import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type SetEvent<E extends Event = Event, T extends EventTarget = EventTarget> =
    E & { target: T; currentTarget: T };

type ToClientTuple<T extends readonly ServerSubject<any>[]> = {
    [K in keyof T]: T[K] extends ServerSubject<infer V> ? ClientSubject<V> : never;
};

type EventListenerCallback<T extends readonly ServerSubject<any>[]> =
    (event: SetEvent, ...dependencies: ToClientTuple<T>) => void;

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

class EventListener<T extends readonly ServerSubject<any>[]> {
    id: string;
    callback: EventListenerCallback<T>;
    dependencies: string[];

    constructor(id: string, callback: EventListenerCallback<T>, dependencies: [...T]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
    }

    serialize(): string {
        return `{id:\"${this.id}\",callback:${this.callback.toString()},dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}]}`;
    }
}

function eventListener<T extends readonly ServerSubject<any>[]>(
    callback: EventListenerCallback<T>,
    dependencies: [...T]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of eventListener(). Ensure that the eventListener() function is only called inside components, and never at the top-level of a page or layout.");

    const id = store.generateId();
    const listener = new EventListener<T>(id, callback, dependencies);

    store.addEventListener(listener as unknown as EventListener<readonly ServerSubject<any>[]>);

    return new EventListenerOption(id);
}

export {
    eventListener,
    EventListenerOption,
    EventListener
};

export type {
    EventListenerCallback,
    SetEvent,
    ToClientTuple
};
