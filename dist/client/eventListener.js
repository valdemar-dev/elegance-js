import { SpecialElementOption } from "../elements/element.js";
import { compilerStore } from "../compilation/compiler.js";
class EventListenerOption extends SpecialElementOption {
    constructor(id) {
        super();
        this.id = id;
    }
    mutate(element, optionName) {
        // this cast is fine
        delete element.options[optionName];
    }
    serialize(optionName, elementKey) {
        let result = "{";
        result += `option:"${optionName.toLowerCase()}",`;
        result += `key:"${elementKey}",`;
        result += `id:"${this.id}"`;
        result += "}";
        return result;
    }
}
class EventListener {
    constructor(id, callback, dependencies) {
        this.id = id;
        this.callback = callback;
        this.dependencies = dependencies.map(d => d.id);
    }
    serialize() {
        return `{id:"${this.id}",callback:${this.callback.toString()},dependencies:[${this.dependencies.map(d => `"${d}"`).join(",")}]}`;
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
function eventListener(callback, dependencies) {
    const store = compilerStore.getStore();
    if (!store)
        throw new Error("Illegal invocation of eventListener(). Ensure that the eventListener() function is only called inside components, and never at the top-level of a page or layout.");
    const id = store.generateId();
    const listener = new EventListener(id, callback, dependencies);
    store.addClientToken(listener);
    return new EventListenerOption(id);
}
export { eventListener, EventListenerOption, EventListener };
