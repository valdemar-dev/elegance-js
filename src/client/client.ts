console.log("Elegance.JS is loading..");

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

const pageStringCache = new Map();

let currentPage: string = window.location.pathname;

// Return values of pageloadhooks.
let cleanupFunctions: Array<() => void> = [];

const sanitizePathname = (pn: string) => {
    if (!pn.endsWith("/")) return pn;

    if (pn === "/") return pn;

    return pn.slice(0, -1);
};

const loadObserverObjectAttributes = (
    pageData: any,
    deprecatedKeys: string[],
    state: State<any>
) => {
    const observerObjectAttributes = pageData.ooa;

    for (const observer of observerObjectAttributes || []) {
        if (observer.key in deprecatedKeys) {
            continue; 
        }

        const el = document.querySelector(`[key="${observer.key}"]`);

        let values: Record<string, any> = {};

        for (const id of observer.ids) {
            const subject = state.get(id);
            if (!subject) {
                console.error(`OOA watching an illegal ID: ${id}`);
                return;
            }

            values[subject.id] = subject.value;

            const updateFunction = (value: any) => {
                values[id] = value;

                const newValue = observer.update(...Object.values(values));
                let attribute = observer.attribute;

                switch (attribute) {
                    case "class":
                        attribute = "className";
                        break;
                }

                (el as any)[attribute] = newValue;
            };

            state.observe(subject, updateFunction);
        }

        console.info(`Registered Observer.`, observer);
    }
};

const loadStateObjectAttributes = (
    pageData: any,
    deprecatedKeys: string[],
    state: State<any>
) => {
    const stateObjectAttributes = pageData.soa;

    for (const soa of stateObjectAttributes || []) {
        if (soa.key in deprecatedKeys) {
            continue; 
        }

        const el = document.querySelector(`[key="${soa.key}"]`);

        if (!el) {
            console.error(`An SOA is registered to a key which does not exist.`, soa);
            return;
        }

        const subject = state.get(soa.id);

        if (!subject) {
            console.error(`An SOA is registered to a subject which does not exist.`, soa);
            return;
        }

        if (typeof subject.value === "function") {
            (el as any)[soa.attribute] = (event: Event) => subject.value(state, event);
        } else {
            (el as any)[soa.attribute] = subject.value;
        }

        console.info(`Processed SOA.`, soa);
    }
};

const loadPage = (deprecatedKeys: string[] = []) => {
    let pathname = sanitizePathname(window.location.pathname);

    let pageData = pd[pathname];
    if (!pageData) {
        console.error(`Failed to load! "page_data.js" is not present for the pathname: ${window.location.pathname}`)
        return;
    };

    console.log(`Loading ${pathname}:`, pageData);
    
    const serverState = pageData.state;
    const pageLoadHooks = pageData.plh

    console.log(pageData.state);

    const state = {
        subjects: {} as Record<string, any>,

        get: (id: number) => Object.values(state.subjects).find((s) => s.id === id),

        set: (subject: ClientSubject, value: any) => {
            subject.value = value;

            state.subjects[Object.keys(subject)[0]] = subject;
        },

        signal: (subject: ClientSubject) => {
            const observers = subject.observers;

            for (const observer of observers) {
                observer(subject.value);
            }
        },

        observe: (subject: ClientSubject, observer: (value: any) => any) => {
            subject.observers.push(observer);
        }
    }

    for (const [subjectName, value] of Object.entries(serverState)) {
        const subject = value as {
            value: any,
            id: number,
        }

        state.subjects[subjectName] = {
            id: subject.id,
            value: subject.value,
            observers: [],
            pathname: pathname,
        }
    }

    loadObserverObjectAttributes(pageData, deprecatedKeys, state);
    loadStateObjectAttributes(pageData, deprecatedKeys, state);

    for (const pageLoadHook of pageLoadHooks || []) {
        const cleanupFunction = pageLoadHook(state);

        if (!cleanupFunction) continue;
        cleanupFunctions.push(cleanupFunction);
    }
};

const fetchPage = async (targetURL: URL): Promise<Document | void> => {
    const pathname = sanitizePathname(targetURL.pathname);

    if (pageStringCache.has(pathname)) return;

    console.log(`Fetching ${pathname}`);

    if (targetURL.hostname !== window.location.hostname) {
        console.error(`Client-side navigation may only occur on local URL's`);
        return;
    }

    const res = await fetch(targetURL);
    const resText = await res.text();

    if (!res.ok && res.status >= 500) {
        console.error(`Server error whilst navigating to ${pathname}: ${resText}`);
        return;
    }

    const newDOM = domParser.parseFromString(resText, "text/html");

    const pageDataScriptSrc = pathname === "/" ?
        pathname + "page_data.js" :
        pathname + "/page_data.js";

    if (!pd[pathname]) {
        await import(pageDataScriptSrc);
    }

    pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));

    return newDOM;
};

const getDeprecatedKeys = ({
    breakpointKey,
    document 
}: {
    breakpointKey: string,
    document: Document,
}) => {
    const deprecatedKeys: string[] = [];

    const getRecursively = (element: HTMLElement) => {
        const key = element.getAttribute("key");

        if (key) {
            deprecatedKeys.push(key)
        }

        if (element.children) {
            // don't want to remove the actually useful keys!
            if (key === breakpointKey) {
                return;
            }

            for (const child of Array.from(element.children)) {
                getRecursively(child as HTMLElement);
            }
        }
    };

    getRecursively(document.body);

    return deprecatedKeys;
}

const navigateLocally = async (target: string, pushState: boolean = true) => {
    console.log(`Naving to: ${target} from ${currentPage}`);

    // Cleanup of prev page, very important!
    // If these aren't there, window ev's will run forever or stack up.
    for (const func of cleanupFunctions) {
        func();
    }

    cleanupFunctions = [];

    pageStringCache.set(currentPage, xmlSerializer.serializeToString(document));

    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    let newPage: Document | string | undefined = pageStringCache.get(pathname) ?? await fetchPage(targetURL);
    if (!newPage) return;
    
    if (typeof newPage === "string") {
        newPage = domParser.parseFromString(newPage, "text/html");
    }
    
    // Find matching pairs of Breakpoint() elements in the current and new dom.
    // This essentially re-creates the layout.tsx files you may know from Next.JS.
    // Except way more efficient, and they're opt-in.
    // Ref: [https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts].
    const curBreaks = Array.from(document.querySelectorAll("div[bp]"));
    const newBreaks = Array.from(newPage.querySelectorAll("div[bp]"));

    let lastBreakPairMatch = {
        currentPage: document.body,
        newPage: newPage.body,
    };

    for (let i = 0; i < curBreaks.length; i++) {
        if (i > newBreaks.length - 1) break;

        const curBreak = curBreaks[i]; 
        const newBreak = newBreaks[i];

        const curName = curBreak.getAttribute("bp");
        const newName = newBreak.getAttribute("bp");

        // The second that they don't match,
        // there is a layout difference.
        // This makes the last known breakpoint pair match,
        // the "layout" that we will use.
        if (curName !== newName) break;

        lastBreakPairMatch = {
            currentPage: curBreak as HTMLElement,
            newPage: newBreak as HTMLElement
        }
    }

    console.log(`Replacing ${lastBreakPairMatch.currentPage} with ${lastBreakPairMatch.newPage}`);

    // Thanks to layouts, some state object attributes may be referencing invalid keys,
    // due to no fault of the user.
    const deprecatedKeys = getDeprecatedKeys({
        breakpointKey: lastBreakPairMatch.currentPage.getAttribute("key")!,
        // Clean out the new page! Not the current one.
        document: newPage,
    });

    const parent = lastBreakPairMatch.currentPage.parentElement;

    parent?.replaceChild(lastBreakPairMatch.newPage, lastBreakPairMatch.currentPage); 
    document.head.replaceChildren(...Array.from(newPage.head.children));

    if (pushState) history.pushState(null, "", target); 

    loadPage(deprecatedKeys);

    currentPage = pathname;
};


// Popstate is back-forward navigation.
window.onpopstate = async (event: PopStateEvent) => {
    event.preventDefault();

    const target = event.target as Window;
    await navigateLocally(target.location.href, false);

    history.replaceState(null, "", sanitizePathname(target.location.pathname));
};

// Not used by much (just Link()s i think), but useful to have
// in-case it's needed in the future.
globalThis.__ELEGANCE_CLIENT__ = {
    navigateLocally,
    fetchPage,
};

loadPage();
