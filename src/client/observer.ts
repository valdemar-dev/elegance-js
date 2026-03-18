import { EleganceElement, SpecialElementOption } from "../elements/element";
import { compilerStore } from "../compilation/compiler";
import { ServerSubject } from "./state";
import { ClientSubject } from "./runtime";

type ObserverCallback<T extends readonly ServerSubject<unknown>[]> =
    (this: HTMLElement, ...dependencies: { [K in keyof T]: ClientSubject<T[K]["value"]>["value"] }) => string | boolean | number | Record<string, unknown>;

class ObserverOption extends SpecialElementOption {
    id: string;

    constructor(id: string) {
        super();
        this.id = id;
    }

    mutate(element: EleganceElement<any, any>, optionName: string): void {
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

class ServerObserver<const T extends readonly ServerSubject<unknown>[]> {
    id: string;
    callback: ObserverCallback<T>;
    dependencies: string[];

    constructor(id: string, callback: ObserverCallback<T>, dependencies: [...T]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
    }

    serialize(): string {
        let result = "{";
        result += `id:"${this.id}",`;
        result += `callback:${this.callback.toString()},`;
        result += `dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}],`;
        result += "}";

        return result;
    }
}

/**
 * Create an observer.
 * 
 * [Read More](https://elegance.js.org/observers)
 * @param callbackOrSubject A callback to call whenever any of the `dependencies` changes.
 * @param dependencies An array of dependencies to watch.
 * @returns A special element option you attach to any attribute of an element.
 */
function observer<T extends ServerSubject<unknown>>(subject: T): ObserverOption;

function observer<const T extends readonly ServerSubject<unknown>[]>(
    callback: ObserverCallback<T>,
    dependencies: [...T]
): ObserverOption;

function observer<T extends readonly ServerSubject<unknown>[]>(
    callbackOrSubject: ObserverCallback<T> | ServerSubject<unknown>,
    dependencies?: T
): ObserverOption {
    const store = compilerStore.getStore();
    if (!store) {
        throw new Error("Illegal invocation of observer(). Ensure that the observer() function is only called inside components, and never at the top-level of a page or layout.");
    }

    let callback: ObserverCallback<any>;
    let deps: readonly ServerSubject<unknown>[];

    if (dependencies) {
        callback = callbackOrSubject as ObserverCallback<T>;
        deps = dependencies;
    } else {
        const subject = callbackOrSubject as ServerSubject<unknown>;
        callback = (s: ClientSubject<unknown>) => `${s.value}`;
        deps = [subject];
    }

    const id = store.generateId();
    const listener = new ServerObserver(id, callback, deps as any);

    store.addClientToken(listener);

    return new ObserverOption(id);
}


/**
 * 
 * @returns The HTML Element this observer is attached to.
 */
const getSelf = function(): HTMLElement {
    // this is just a stub, the implementation exists only in the browser,
    // but we need typescript to sh
    //@ts-ignore
    return "CLIENT_SIDE_FUNCTION";
}

export {
    observer,
    ServerObserver,
    ObserverOption,
    getSelf,
};

export type {
    ObserverCallback,
};