
import { allElements } from "../elements/element_list";

type ClientSubject = {
    id: string,
    value: any,
};

class StateManager {
    private readonly subjects: Map<string, ClientSubject> = new Map()

    constructor() {}

    loadValues(values: ClientSubject[], doOverwrite: boolean = false) {
        for (const value of values) {
            if (this.subjects.has(value.id) && doOverwrite === false) continue;

            this.subjects.set(value.id, value);
        }
    }

    get(id: string): ClientSubject | undefined {
        return this.subjects.get(id)
    }

    getAll(ids: string[]): Array<ClientSubject | undefined> {
        const results: Array<ClientSubject | undefined> = [];

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

    const { eventListeners, observers } = data;

    if (!eventListeners || !observers) {
        throw new Error("Possibly malformed page data");
    }

    console.log(data)

    return data;
}

async function loadPage(previousPage?: string) {
    // ensure the existence of element builders in the browser
    Object.assign(globalThis, allElements);

    const pathname = sanitizePathname(window.location.pathname);

    const pageData = await getPageData(pathname);
}

loadPage();