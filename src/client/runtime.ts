
import type { EventListener, EventListenerCallback, EventListenerOption } from "./eventListener";
import type { ServerSubject } from "./state";

declare let DEV_BUILD: boolean;

type ClientSubjectObserver<T> = (newValue: T) => void;

class ClientSubject<T extends any> {
    readonly id: string;
    private _value: T;

    private readonly observers: ClientSubjectObserver<T>[] = [];

    constructor(id: string, value: T) {
        this._value = value;
        this.id = id;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        this._value = newValue;

        for (const observer of this.observers) {
            observer(newValue);
        }
    }
}

class StateManager {
    private readonly subjects: Map<string, ClientSubject<any>> = new Map()

    constructor() {}

    loadValues(values: ServerSubject<any>[], doOverwrite: boolean = false) {
        for (const value of values) {
            if (this.subjects.has(value.id) && doOverwrite === false) continue;

            const clientSubject = new ClientSubject(value.id, value.value);
            this.subjects.set(value.id, clientSubject);
        }
    }

    get(id: string): ClientSubject<any> | undefined {
        return this.subjects.get(id)
    }

    getAll(ids: string[]): Array<ClientSubject<any>> {
        const results: Array<ClientSubject<any>> = [];

        for (const id of ids) {
            results.push(this.get(id)!);
        }
        
        return results;
    }
}

class ClientEventListener {
    id: string;
    callback: EventListenerCallback<any>;
    dependencies: string[];

    constructor(id: string, callback: EventListenerCallback<any>, depencencies: string[]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = depencencies;
    }

    call(ev: Event) {
        const dependencies = stateManager.getAll(this.dependencies);
        console.log(this.dependencies, dependencies);
        this.callback(ev, ...dependencies);
    }
}

type ClientEventListenerOption = {
    /** The html attribute name this option should be attached to */
    option: string,
    /** The key of the element this option should be attached to. */
    key: string,
    /** The event listener id this option is referencing. */ 
    id: string,
}

class EventListenerManager {
    private readonly eventListeners: Map<string, ClientEventListener> = new Map();

    constructor() {}

    loadValues(serverEventListeners: EventListener<any>[], doOverride: boolean = false) {
        for (const serverEventListener of serverEventListeners) {
            if (this.eventListeners.has(serverEventListener.id) && doOverride === false) continue;

            const clientEventListener = new ClientEventListener(serverEventListener.id, serverEventListener.callback, serverEventListener.dependencies);
            this.eventListeners.set(clientEventListener.id, clientEventListener);
        }
    }

    hookCallbacks(eventListenerOptions: ClientEventListenerOption[]) {
        for (const eventListenerOption of eventListenerOptions) {
            const element = document.querySelector(`[key="${eventListenerOption.key}"]`) as HTMLElement;
            if (!element) {
                DEV_BUILD && errorOut("Possibly corrupted HTML, failed to find element with key " + eventListenerOption.key + " for event listener.");
                return;
            }

            const eventListener = this.eventListeners.get(eventListenerOption.id);
            if (!eventListener) {
                DEV_BUILD && errorOut("Invalid EventListenerOption: Event listener with id \”" + eventListenerOption.id + "\" does not exist.");
                return;
            }

            (element as any)[eventListenerOption.option] = (ev: Event) => {
                eventListener.call(ev);
            };
        }
    }

    get(id: string) { 
        return this.eventListeners.get(id);
    }
}

const eventListenerManager = new EventListenerManager();
const stateManager = new StateManager();

/** Take any directory pathname, and make it into this format: /path */
function sanitizePathname(pathname: string = ""): string {
    if (!pathname) return "/";

    pathname = "/" + pathname;
    pathname = pathname.replace(/\/+/g, "/");

    if (pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
    }

    return pathname;
}

async function getPageData(pathname: string) {
    /** Find the correct script tag in head. */
    const dataScriptTag = document.head.querySelector(`script[data-page="true"][data-pathname="${pathname}"]`) as HTMLScriptElement | null;
    if (!dataScriptTag) {
        DEV_BUILD && ("Failed to find script tag for query:" + `script[data-page="true"][data-pathname="${pathname}"]`);
        return;
    }

    const { data } = await import(dataScriptTag.src);

    const { subjects, eventListeners, eventListenerOptions, observers } = data;

    if (!eventListenerOptions || !eventListeners || !observers || !subjects) {
        DEV_BUILD && errorOut("Possibly malformed page data");
        return;
    }

    return data;
}

function errorOut(message: string) {
    throw new Error(message);
} 

async function loadPage(previousPage?: string) {
    const pathname = sanitizePathname(window.location.pathname);

    const pageData = await getPageData(pathname);
    const { 
        subjects, 
        eventListenerOptions, 
        eventListeners,
    } = pageData;

    {
        //@ts-ignore
        DEV_BUILD: globalThis.ELEGANCE = {};
        //@ts-ignore
        DEV_BUILD: globalThis.ELEGANCE.pageData = pageData;
        //@ts-ignore
        DEV_BUILD: globalThis.ELEGANCE.stateManager = stateManager;
        //@ts-ignore
        DEV_BUILD: globalThis.ELEGANCE.eventListenerManager = eventListenerManager;
    }

    stateManager.loadValues(subjects);

    eventListenerManager.loadValues(eventListeners);
    eventListenerManager.hookCallbacks(eventListenerOptions);
}

loadPage();

export type {
    ClientSubject,
}