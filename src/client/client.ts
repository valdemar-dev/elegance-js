console.log("Elegance.JS is loading..");

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const pageStringCache = new Map();

// Hello! Brief explanation of the below stuff.
// Basically, optimization. They get minified into smaller variable references.
// Put a definition here if something is referenced a lot.
const loc = window.location;
const doc = document;

let cleanupFunctions: Array<() => void> = [];

const makeArray = Array.from;

const sanitizePathname = (pn: string) => {
    if ((!pn.endsWith("/")) || pn === "/") return pn;
    return pn.slice(0, -1);
};

let currentPage: string = sanitizePathname(loc.pathname);

const loadPage = (deprecatedKeys: string[] = []) => {
    const fixedUrl = new URL(loc.href);
    fixedUrl.pathname = sanitizePathname(fixedUrl.pathname)

    const pathname = fixedUrl.pathname;

    history.replaceState(null, "", fixedUrl.href);
    
    let pageData = pd[pathname];
    if (!pageData) {
        console.error(`Failed to load! "page_data.js" is not present for the pathname: ${pathname}`)
        return;
    };

    console.log(`Loading ${pathname}:`, pageData);
    
    let state = pageData.stateManager;

    if (!state) {
        state = {
            subjects: pageData.state.map((subject: any) => {
                const s = {
                    ...subject,
                    observers: new Map(),
                    pathname: pathname,
                };

                s.signal = () => {
                    for (const observer of s.observers.values()) {
                        observer(s.value);
                    }
                }

                return s;
            }),

            get: (id: number) => state.subjects.find((s: ClientSubject) => s.id === id),
            getAll: (ids: number[]) => ids?.map(id => state.get(id)),

            observe: (subject: ClientSubject, observer: (value: any) => any, key: string) => {
                subject.observers.delete(key);
                subject.observers.set(key, observer);
            }
        }

        pageData.stateManager = state;
    }

    for (const observer of pageData.ooa || []) {
        if (observer.key in deprecatedKeys) {
            continue;
        }

        const el = doc.querySelector(`[key="${observer.key}"]`);

        let values: Record<string, any> = {};

        for (const id of observer.ids) {
            const subject = state.get(id);

            values[subject.id] = subject.value;

            const updateFunction = (value: any) => {
                values[id] = value;

                const newValue = observer.update(...Object.values(values));
                let attribute = observer.attribute === "class" ? "className" : observer.attribute;

                (el as any)[attribute] = newValue;
            };

            state.observe(subject, updateFunction, observer.key);
        }

        const newValue = observer.update(...Object.values(values));
        let attribute = observer.attribute === "class" ? "className" : observer.attribute;

        (el as any)[attribute] = newValue;

        console.info(`Registered Observer.`, observer);
    }

    for (const soa of pageData.soa || []) {
        if (soa.key in deprecatedKeys) {
            console.info(`not setting ${soa.key}`);
            continue;
        }

        const el = doc.querySelector(`[key="${soa.key}"]`) as any;
        const subject = state.get(soa.id);

        if (typeof subject.value === "function") {
            el[soa.attribute] = (event: Event) => subject.value(state, event);
        } else {
            el[soa.attribute] = subject.value;
        }

        console.info(`Processed SOA.`, soa);
    }

    for (const pageLoadHook of pageData.plh || []) {
        console.log(pageLoadHook.toString());
        const cleanupFunction = pageLoadHook(state);
        if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
    }

    pageStringCache.set(
        currentPage,
        xmlSerializer.serializeToString(doc)
    );
};

const fetchPage = async (targetURL: URL): Promise<Document | void> => {
    const pathname = sanitizePathname(targetURL.pathname);

    if (pageStringCache.has(pathname)) {
        return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
    }

    console.log(`Fetching ${pathname}`);

    const res = await fetch(targetURL);

    if (!res.ok) return;

    const newDOM = domParser.parseFromString(await res.text(), "text/html");

    const pageDataScriptSrc = pathname === "/" ?
        pathname + "page_data.js" :
        pathname + "/page_data.js";

    if (!pd[pathname]) {
        await import(pageDataScriptSrc);
    }

    pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));

    return newDOM;
};

const navigateLocally = async (target: string, pushState: boolean = true) => {
    console.log(`Naving to: ${target} from ${currentPage}`);

    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    let newPage = await fetchPage(targetURL);
    if (!newPage) return;

    for (const func of cleanupFunctions) {
        func();
    }

    cleanupFunctions = [];
    
    const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
    const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));

    let lastBreakPairMatch = {
        currentPage: doc.body,
        newPage: newPage.body,
    };

    for (let i = 0; i < curBreaks.length; i++) {
        if (i > newBreaks.length - 1) break;

        const curBreak = curBreaks[i]; 
        const newBreak = newBreaks[i];

        const curName = curBreak.getAttribute("bp");
        const newName = newBreak.getAttribute("bp");

        if (curName !== newName) break;

        lastBreakPairMatch = {
            currentPage: curBreak as HTMLElement,
            newPage: newBreak as HTMLElement
        }
    }

    const deprecatedKeys: string[] = [];

    const breakpointKey = lastBreakPairMatch.currentPage.getAttribute("key")!;

    const getDeprecatedKeysRecursively = (element: HTMLElement) => {
        const key = element.getAttribute("key");

        if (key) {
            deprecatedKeys.push(key)
        }

        if (key === breakpointKey) return;
        
        for (const child of makeArray(element.children)) {
            getDeprecatedKeysRecursively(child as HTMLElement);
        }
    };

    getDeprecatedKeysRecursively(doc.body);

    lastBreakPairMatch.currentPage.replaceWith(lastBreakPairMatch.newPage)
    doc.head.replaceChildren(...makeArray(newPage.head.children));

    if (pushState) history.pushState(null, "", targetURL.href); 
    currentPage = pathname;

    if (targetURL.hash) {
        doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }

    loadPage(deprecatedKeys);
};

window.onpopstate = async (event: PopStateEvent) => {
    event.preventDefault();

    const target = event.target as Window;

    await navigateLocally(target.location.href, false);

    history.replaceState(null, "", target.location.href);
};

globalThis.__ELEGANCE_CLIENT__ = {
    navigateLocally,
    fetchPage,
    currentPage,
    sanitizePathname,
};

loadPage();
