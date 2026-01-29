import { EleganceElement, SpecialElementOption } from "../elements/element";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";
type SetEvent<E extends Event = Event, T extends EventTarget = EventTarget> = E & {
    target: T;
    currentTarget: T;
};
type ToClientTuple<T extends readonly ServerSubject<any>[]> = {
    [K in keyof T]: T[K] extends ServerSubject<infer V> ? ClientSubject<V> : never;
};
type EventListenerCallback<T extends readonly ServerSubject<any>[]> = (event: SetEvent, ...dependencies: ToClientTuple<T>) => void;
declare class EventListenerOption extends SpecialElementOption {
    id: string;
    constructor(id: string);
    mutate(element: EleganceElement<any, any>, optionName: string): void;
    serialize(optionName: string, elementKey: string): string;
}
declare class EventListener<T extends readonly ServerSubject<any>[]> {
    id: string;
    callback: EventListenerCallback<T>;
    dependencies: string[];
    constructor(id: string, callback: EventListenerCallback<T>, dependencies: [...T]);
    serialize(): string;
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
declare function eventListener<T extends readonly ServerSubject<any>[]>(callback: EventListenerCallback<T>, dependencies: [...T]): EventListenerOption;
export { eventListener, EventListenerOption, EventListener };
export type { EventListenerCallback, SetEvent, ToClientTuple };
