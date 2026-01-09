
import type { ServerSubject } from "./state";

type ClientSubjectObserver<T> = (newValue: T) => void;

class ClientSubject<T extends any> {
    readonly id: string;
    _value: T;

    private readonly observers: ClientSubjectObserver<T>[] = [];

    constructor(id: string, value: T) {
        this._value = value;
        this.id = id;
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

    getAll(ids: string[]): Array<ClientSubject<any> | undefined> {
        const results: Array<ClientSubject<any> | undefined> = [];

        for (const id of ids) {
            results.push(this.get(id));
        }
        
        return results;
    }
}

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
        throw new Error("Failed to find script tag for query:" + `script[data-page="true"][data-pathname="${pathname}"]`);
    }

    const { data } = await import(dataScriptTag.src);

    const { subjects, eventListeners, observers } = data;

    if (!eventListeners || !observers || !subjects) {
        throw new Error("Possibly malformed page data");
    }

    return data;
}

async function loadPage(previousPage?: string) {
    const pathname = sanitizePathname(window.location.pathname);

    const pageData = await getPageData(pathname);
    const { subjects } = pageData;

    stateManager.loadValues(subjects);
}

loadPage();