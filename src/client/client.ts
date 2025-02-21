import { LoadHook } from "module";
import type { ClientLoadHook, } from "../server/loadHook";

console.log("Elegance.JS is loading..");

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const pageStringCache = new Map();

// Hello! Brief explanation of the below stuff.
// Basically, optimization. They get minified into smaller variable references.
// Put a definition here if something is referenced a lot.
const loc = window.location;
const doc = document;

let cleanupProcedures: Array<{
    cleanupFunction: () => void,
    bind: string,
}> = [];

const makeArray = Array.from;

const sanitizePathname = (pn: string) => {
    if ((!pn.endsWith("/")) || pn === "/") return pn;
    return pn.slice(0, -1);
};

let currentPage: string = sanitizePathname(loc.pathname);

const loadPage = (
    deprecatedKeys: string[] = [],
    newBreakpoints?: string[] | undefined,
) => {
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
    console.log("Deprecated Keys:", deprecatedKeys);
    console.log("New Breakpoints:", newBreakpoints);
    
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

        console.log(`%cObserver for el`, "font-size: 8px;", el);
    }

    for (const soa of pageData.soa || []) {
        if (soa.key in deprecatedKeys) {
            continue;
        }

        const el = doc.querySelector(`[key="${soa.key}"]`) as any;
        const subject = state.get(soa.id);

        if (typeof subject.value === "function") {
            el[soa.attribute] = (event: Event) => subject.value(state, event);
        } else {
            el[soa.attribute] = subject.value;
        }
    }

    const loadHooks = pageData.lh as Array<ClientLoadHook>;

    for (const loadHook of loadHooks || []) {
        const bind = loadHook.bind;

        if (
            bind.length > 0 &&
            newBreakpoints &&
            (!newBreakpoints.includes(bind))
        ) {
            console.log(`Won't add loadHook with bind ${bind}.`);

            continue
        }

        const fn = loadHook.fn;
        const cleanupFunction = fn(state);

        console.log(`Calling loadHook ${fn.toString()}, because its bind ${bind} was in`, newBreakpoints)

        if (cleanupFunction){
            console.info(`Adding cleanup procedure for bind.`);

            cleanupProcedures.push({ 
                cleanupFunction,
                bind: loadHook.bind
            });
        }
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

    console.info(`Fetching ${pathname}`);

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
    console.log(`%cNaving to: ${target} from ${currentPage}`, "font-size: 22px");

    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    let newPage = await fetchPage(targetURL);
    if (!newPage) return;

    if (pathname === currentPage) return;
    
    const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
    const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));

    const latestMatchingBreakpoints = (arr1: Element[], arr2: Element[]) => {
        let i = 0;
        const len = Math.min(arr1.length, arr2.length);

        while (i < len && arr1[i].getAttribute("bp")! === arr2[i].getAttribute("bp")!) i++;

        return i > 0 ? [arr1[i - 1], arr2[i - 1]] : [document.body, newPage.body];
    };

    const [oldPageLatest, newPageLatest] = latestMatchingBreakpoints(curBreaks, newBreaks);
    console.log(oldPageLatest, newPageLatest);

    const deprecatedKeys: string[] = [];

    const breakpointKey = oldPageLatest.getAttribute("key")!;

    const getDeprecatedKeysRecursively = (element: HTMLElement) => {
        const key = element.getAttribute("key");

        if (key) {
            deprecatedKeys.push(key)
        }

        if (
            key === breakpointKey ||
            !breakpointKey
        ) return;
        
        for (const child of makeArray(element.children)) {
            getDeprecatedKeysRecursively(child as HTMLElement);
        }
    };

    getDeprecatedKeysRecursively(doc.body);

    // We want to call these things cleanups, cause they're no longer in scope.
    const deprecatedBreakpoints = curBreaks.filter(
        item => !newBreaks.includes(item)
    ).map(br => br.getAttribute("br")!);

    // We call these, because they were just created.
    const newBreakpoints = newBreaks.filter(
        item => !curBreaks.includes(item)
    ).map(br => br.getAttribute("br")!);

    for (const cleanupProcedure of cleanupProcedures) {
        const bind = cleanupProcedure.bind;

        if (
            bind.length < 1 || 
            deprecatedBreakpoints.includes(bind)
        ) {
            console.log(`Calling: ${cleanupProcedure.cleanupFunction.toString()} for bind ${bind}`);

            cleanupProcedure.cleanupFunction();
            cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure), 1);
        }
    } 

    oldPageLatest.replaceWith(newPageLatest)
    doc.head.replaceWith(newPage.head);

    if (pushState) history.pushState(null, "", targetURL.href); 
    currentPage = pathname;

    if (targetURL.hash) {
        doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }

    loadPage(deprecatedKeys, newBreakpoints);
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
