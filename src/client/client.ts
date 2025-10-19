import type { ClientLoadHook, } from "../server/loadHook";
import "../shared/bindServerElements";

import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

console.log("Elegance.JS is loading..");

if (!globalThis.pd) globalThis.pd = {};


// stubs for reactiveMap
Object.assign(window, {
    observe: (subjects: ClientSubject[], updateCallback: () => any) => {
        return {
            subjects,
            updateCallback,
            isAttribute: true,
            type: ObjectAttributeType.OBSERVER,
        }

    },
    eventListener: (subjects: ClientSubject[], eventListener: () => any) => {    
        return {
            subjects,
            eventListener,
            isAttribute: true,
            type: ObjectAttributeType.STATE,
        }
    },
})

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const pageStringCache = new Map();

// Hello! Brief explanation of the below stuff.
// Basically, optimization. They get minified into smaller variable references.
// Put a definition here if something is referenced a lot.
const loc = window.location;
const doc = document;

let cleanupProcedures: Array<{
    cleanupFunction: () => void | Promise<void | (() => void)>,
    bind: string,
}> = [];

const makeArray = Array.from;

const sanitizePathname = (pn: string) => {
    if ((!pn.endsWith("/")) || pn === "/") return pn;
    return pn.slice(0, -1);
};

let currentPage: string = sanitizePathname(loc.pathname);

const createStateManager = (subjects: ClientSubject[]) => {
    const state = {
        subjects: subjects.map((subject: any) => {
            const s = {
                ...subject,
                observers: new Map(),
            };

            s.signal = () => {
                for (const observer of s.observers.values()) {
                    try {
                        observer(s.value);
                    } catch(e) {
                        console.error(e);
                        
                        continue
                    }
                }
            }

            return s;
        }),
        
        destroy: (s: ClientSubject) => {
            state.subjects.splice(state.subjects.indexOf(s), 1);
        },

        /**
            Bind is deprecated, but kept as a paramater to not upset legacy code.
        */
        get: (id: number, bind?: string | undefined) => {
            return state.subjects.find((s: ClientSubject) => s.id === id)
        },

        getAll: (refs: { id: number, bind?: number, }[]) => refs?.map(ref => {
            if (ref.bind) {
                return pd[ref.bind].get(ref.id);
            }

            return state.get(ref.id)
        }),

        observe: (subject: ClientSubject, observer: (value: any) => any, key: string) => {
            subject.observers.delete(key);
            subject.observers.set(key, observer);
        },
        
        unobserve: (subject: ClientSubject, key: string) => {
            subject.observers.delete(key);
        },
    }

    return state;
};

const initPageData = (data: any) => {
    let state = data.stateManager;
    if (!state) {
        state = createStateManager(data.state || []);

        data.stateManager = state;
    }

    for (const subject of state.subjects) {
        subject.observers = new Map();
    }

    for (const ooa of data.ooa || []) {
        // do all, because reactive-maps all use the same key
        const els = doc.querySelectorAll(`[key="${ooa.key}"]`);

        let values: Record<string, any> = {};

        for (const { id, bind } of ooa.refs) {
            const subject = state.get(id, bind);

            values[subject.id] = subject.value;

            const updateFunction = (value: any) => {
                values[id] = value;

                try {
                    const newValue = ooa.update(...Object.values(values));
                    let attribute = ooa.attribute === "class" ? "className" : ooa.attribute;
    
                    for (const el of Array.from(els)) {
                        (el as any)[attribute] = newValue;
                    }
                } catch(e) {
                    console.error(e);
                    
                    return;
                }
            };

            updateFunction(subject.value);
            
            try {
                state.observe(subject, updateFunction, ooa.key);
            } catch(e) {
                console.error(e);
                return;
            }
        }
    }

    for (const soa of data.soa || []) {
        const el = doc.querySelector(`[key="${soa.key}"]`) as any;

        const subject = state.get(soa.id, soa.bind);

        if (typeof subject.value === "function") {
            try {
                el[soa.attribute] = (event: Event) => subject.value(state, event);
            } catch(e) { 
                console.error(e);
                
                return;
            }
        } else {
            el[soa.attribute] = subject.value;
        }
    }

    const loadHooks = data.lh as Array<ClientLoadHook>;

    for (const loadHook of loadHooks || []) {
        const bind: any = (loadHook.bind as any ?? "");

        // generateClientPageData makes undefined binds into empty strings
        // so that the page_data.js is *smaller*
        if (bind !== "") {
            continue
        }

        const fn = loadHook.fn;
        
        try {
            let cleanupFunction;
            if (fn.constructor.name === 'AsyncFunction') {
                const res = fn(state) as Promise<void | (() => void)>
                
                res.then((cleanupFunction) => {
                    if (cleanupFunction){
                        cleanupProcedures.push({ 
                            cleanupFunction,
                            bind: `${bind}`
                        });
                    }
                })
            } else {
                cleanupFunction = fn(state) as (void | (() => void));
                
                if (cleanupFunction){
                    cleanupProcedures.push({
                        cleanupFunction,
                        bind: `${bind}`
                    });
                }
            }
            
        } catch(e) {
            console.error(e);
            
            return;
        }
    }
};


/*
    TEMP NOTES:
    if a new nav site, no longer includes the bind of pagedata,
    call all the returns of it
    
    eg, pd["/mypage/test"], would have it's loadhooks return values called (always if it's a page),
    but if it's a layout, when navigating to "/mypage", but not when navigating to "/mypage/test/something"
    
    you can do this with newpath.includes(mypath) (if false, call cleanup)
*/

const loadPage = (
    deprecatedKeys: string[] = [],
    newBreakpoints?: string[] | undefined,
) => {
    const fixedUrl = new URL(loc.href);
    fixedUrl.pathname = sanitizePathname(fixedUrl.pathname)

    const pathname = fixedUrl.pathname;
    currentPage = pathname;

    history.replaceState(null, "", fixedUrl.href);
    
    /*
        init page state
    */
    {
        let pageData = pd[pathname];
        
        if (pd === undefined) {
            console.error(`%cFailed to load! Missing page data!`, "font-size: 20px; font-weight: 600;")
            return;
        };
        
        console.info(`Loading page info for URL ${pathname}.`, {
            "Deprecated Keys": deprecatedKeys,
            "New Breakpoints:": newBreakpoints || "(none, initial load)",
            "State": pageData.state,
            "OOA": pageData.ooa,
            "SOA": pageData.soa,
            "Load Hooks": pageData.lh,
        })
        
        initPageData(pageData);
    }
    
    /*
        find all active layouts that were shipped
        load all their data
    */
    {
        const parts = window.location.pathname.split("/").filter(Boolean);

        const paths = [
            ...parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/")),
            "/",
        ];
        
        for (const path of paths) {
            const data = ld[path];
            if (!data) {
                continue;
            }
            
            initPageData(data);
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

    const newDOM = domParser.parseFromString(await res.text(), "text/html");
    
    {
        const dataScripts = Array.from(newDOM.querySelectorAll('script[data-module="true"]')) as HTMLScriptElement[]
        
        const currentScripts = Array.from(document.head.querySelectorAll('script[data-module="true"]')) as HTMLScriptElement[]
        
        for (const dataScript of dataScripts) {
            const existing = currentScripts.find(s => s.src === dataScript.src);
            
            if (existing) {
                continue
            }
            
            document.head.appendChild(dataScript);
        }
    }
    {
        const pageDataScript = newDOM.querySelector('script[data-tag="true"]') as HTMLScriptElement
        
        if (!pageDataScript) {
            return;
        }
    
        if (!pd[pathname]) {
            const { data } = await import(pageDataScript.src);
            
            pd[pathname] = data;
        }
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
            try {
                cleanupProcedure.cleanupFunction();
            } catch(e) {
                console.error(e);
                
                return;
            }
            
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

const renderRecursively = (element: Child, attributes: any[]) => {
    if (typeof element === "boolean") {
        return null;
    }

    if (typeof element === "number" || typeof element === "string") {
        return document.createTextNode(element.toString());
    }

    if (Array.isArray(element)) {
        const fragment = document.createDocumentFragment();
        
        element.forEach(item => {
            const childNode = renderRecursively(item, attributes);
            if (childNode) fragment.appendChild(childNode);
        });
        
        return fragment;
    }

    const domElement = document.createElement(element.tag);

    if (typeof element.options !== "object" && element.options !== undefined) {
        const childNode = renderRecursively(element.options, attributes);
        if (childNode) domElement.appendChild(childNode);
    } else if (typeof element.options === "object") {
        const { tag, options, children } = element.options as Record<string, any>;
        
        if (
            tag !== undefined ||
            options !== undefined ||
            children !== undefined
        ) {
            const childNode = renderRecursively(element.options as AnyBuiltElement, attributes);
            if (childNode) domElement.appendChild(childNode);
        } else {
            for (const [attrName, attrValue] of Object.entries(element.options)) {
                if (typeof attrValue === "object") {
                    const { isAttribute } = attrValue;
                    
                    if (isAttribute === undefined || isAttribute === false) {
                        console.error("Objects are not valid option property values.");
                        throw "";
                    }
                    
                    attributes.push({
                        ...attrValue,
                        field: attrName,
                        element: domElement,
                    });
                    
                    continue
                }
                
                domElement.setAttribute(attrName.toLowerCase(), attrValue);
            }
        }
    }

    if (element.children !== null) {
        if (Array.isArray(element.children)) {
            element.children.forEach(child => {
                const childNode = renderRecursively(child, attributes);
                if (childNode) domElement.appendChild(childNode);
            });
        } else {
            const childNode = renderRecursively(element.children, attributes);
            if (childNode) domElement.appendChild(childNode);
        }
    }

    return domElement;
};

globalThis.client = {
    navigateLocally,
    fetchPage,
    currentPage,
    sanitizePathname,
    getReference: (id: number) => document.querySelector(`[ref="${id}"]`),
    renderRecursively,
};

try {
    loadPage();
} catch(e) {
    console.error(e);
}
