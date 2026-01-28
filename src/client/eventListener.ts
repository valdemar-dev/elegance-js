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

    mutate(element: EleganceElement<any, any>, optionName: string): void {
        // this cast is fine
        delete (element.options as Record<string, any>)[optionName];
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

/**
 * Creates, an event listener, which is a callback that is called when the event that it is attached to, is triggered.
 * If you intend to use the same eventListener many times, declare it once, and use the returned special element option as the reference to it.
 * This ships less code to the browser.
 * 
 * **IMPORTANT**: The callback is *browser-code*, and thus does not have any context of your page.ts or layout.ts file. 
 * The callback function is sent *literally* to the browser, as-is.
 * 
 * @param callback The function to be called when the event that this eventListener is attached to is triggered.
 * @param dependencies An array of ServerSubject's that should be passed into the callback when it is run.
 * @returns A special element option that you can use as a value on an option of an EleganceElement.
 */
function eventListener<T extends readonly ServerSubject<any>[]>(
    callback: EventListenerCallback<T>,
    dependencies: [...T]
) {
    const store = compilerStore.getStore();
    if (!store) throw new Error("Illegal invocation of eventListener(). Ensure that the eventListener() function is only called inside components, and never at the top-level of a page or layout.");

    const id = store.generateId();
    const listener = new EventListener<T>(id, callback, dependencies);

    store.addClientToken(listener);

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
