import { EleganceElement, SpecialElementOption } from "../elements/element";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";
type ObserverCallback<T extends readonly ServerSubject<unknown>[]> = (this: HTMLElement, ...dependencies: {
    [K in keyof T]: ClientSubject<T[K]["value"]>["value"];
}) => string | boolean | number | Record<string, unknown>;
declare class ObserverOption extends SpecialElementOption {
    id: string;
    constructor(id: string);
    mutate(element: EleganceElement<any, any>, optionName: string): void;
    serialize(optionName: string, elementKey: string): string;
}
declare class ServerObserver<const T extends readonly ServerSubject<unknown>[]> {
    id: string;
    callback: ObserverCallback<T>;
    dependencies: string[];
    constructor(id: string, callback: ObserverCallback<T>, dependencies: [...T]);
    serialize(): string;
}
/**
 * Create an observer.
 *
 * [Read More](https://elegance.js.org/observers)
 * @param callbackOrSubject A callback to call whenever any of the `dependencies` changes.
 * @param dependencies An array of dependencies to watch.
 * @returns A special element option you attach to any attribute of an element.
 */
declare function observer<T extends ServerSubject<unknown>>(subject: T): ObserverOption;
declare function observer<const T extends readonly ServerSubject<unknown>[]>(callback: ObserverCallback<T>, dependencies: [...T]): ObserverOption;
/**
 *
 * @returns The HTML Element this observer is attached to.
 */
declare const getSelf: () => HTMLElement;
export { observer, ServerObserver, ObserverOption, getSelf, };
export type { ObserverCallback, };
