import { EleganceElement, SpecialElementOption } from "../elements/element";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";
type ToClient<T> = T extends ServerSubject<infer V> ? ClientSubject<V> : never;
type ObserverCallback<T extends ServerSubject<any>> = (...dependencies: ToClient<T>["value"][]) => string | boolean | number | Record<string, unknown>;
declare class ObserverOption extends SpecialElementOption {
    id: string;
    constructor(id: string);
    mutate(element: EleganceElement<any>, optionName: string): void;
    serialize(optionName: string, elementKey: string): string;
}
/**
 * An observer, as it exists on the server.
 * The is never *used* on the server, but it is declared there,
 * and then transformed into a ClientObserver
 */
declare class ServerObserver<T extends ServerSubject<any>> {
    id: string;
    callback: ObserverCallback<T>;
    dependencies: string[];
    constructor(id: string, callback: ObserverCallback<T>, dependencies: T[]);
    serialize(): string;
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
declare function observer<T extends ServerSubject<any>>(subject: T): ObserverOption;
declare function observer<T extends ServerSubject<any>>(callback: ObserverCallback<T>, dependencies: T[]): ObserverOption;
export { observer, ServerObserver, ObserverOption };
export type { ObserverCallback, };
