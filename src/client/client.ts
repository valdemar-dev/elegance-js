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
        console.error(`%cFailed to load! Missing "page_data.js" for page ${pathname}`, "font-size: 20px; font-weight: 600;")
        return;
    };

    console.info(`Loading ${pathname}. Page info follows:`, {
        "Deprecated Keys": deprecatedKeys,
        "New Breakpoints:": newBreakpoints || "(none, initial load)",
        "State": pageData.state,
        "OOA": pageData.ooa,
        "SOA": pageData.soa,
        "Load Hooks": pageData.lh,
    })

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

    for (const ooa of pageData.ooa || []) {
        if (ooa.key in deprecatedKeys) {
            continue;
        }

        const el = doc.querySelector(`[key="${ooa.key}"]`);

        let values: Record<string, any> = {};

        for (const id of ooa.ids) {
            const subject = state.get(id);

            values[subject.id] = subject.value;

            const updateFunction = (value: any) => {
                values[id] = value;

                const newValue = ooa.update(...Object.values(values));
                let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;

                (el as any)[attribute] = newValue;
            };

            state.observe(subject, updateFunction, ooa.key);
        }

        const newValue = ooa.update(...Object.values(values));
        let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;

        (el as any)[attribute] = newValue;
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
            continue
        }

        const fn = loadHook.fn;
        const cleanupFunction = fn(state);

        if (cleanupFunction){
            cleanupProcedures.push({ 
                cleanupFunction,
                bind: `${bind}`
            });
        }
    }

    pageStringCache.set(
        currentPage,
        xmlSerializer.serializeToString(doc)
    );

    console.info(
        `Loading finished, registered these cleanupProcedures`,
        cleanupProcedures,
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
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    console.log(
        `%c${currentPage} -> ${targetURL.pathname}`,
        "font-size: 18px; font-weight: 600; color: lightgreen;",
    );

    let newPage = await fetchPage(targetURL);
    if (!newPage) return;

    if (pathname === currentPage) return;
    
    const curBreaks = makeArray(doc.querySelectorAll("div[bp]"));
    const curBpTags = curBreaks.map(bp => bp.getAttribute("bp")!)

    const newBreaks = makeArray(newPage.querySelectorAll("div[bp]"));
    const newBpTags = newBreaks.map(bp => bp.getAttribute("bp")!)

    const latestMatchingBreakpoints = (arr1: Element[], arr2: Element[]) => {
        let i = 0;
        const len = Math.min(arr1.length, arr2.length);

        while (i < len && arr1[i].getAttribute("bp")! === arr2[i].getAttribute("bp")!) i++;

        return i > 0 ? [arr1[i - 1], arr2[i - 1]] : [document.body, newPage.body];
    };

    const [oldPageLatest, newPageLatest] = latestMatchingBreakpoints(curBreaks, newBreaks);

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
    const deprecatedBreakpoints = curBpTags.filter(
        item => !newBpTags.includes(item)
    );

    // We call these, because they were just created.
    const newBreakpoints = newBpTags.filter(
        item => !curBpTags.includes(item)
    );

    for (const cleanupProcedure of [...cleanupProcedures]) {
        const bind = cleanupProcedure.bind;

        if (
            bind.length < 1 || 
            deprecatedBreakpoints.includes(bind)
        ) {
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

globalThis.client = {
    navigateLocally,
    fetchPage,
    currentPage,
    sanitizePathname,
    getReference: (id: number) => document.querySelector(`[ref="${id}"]`)
};

loadPage();
