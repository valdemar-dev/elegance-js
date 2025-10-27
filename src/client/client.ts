import type { ClientLoadHook, } from "../server/loadHook";
import "../shared/bindServerElements";

import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

console.log("Elegance.JS is loading..");

let pd: Record<string, any> = {};
let ld: Record<string, any> = {};

/** Determines how strict we should be with layout_data and page_data when we clean it. */
enum BindLevel {
    /** Strict means /blog -> /blog/entry does clean up the entries of /blog. */
    STRICT=1,
    /** Scoped means /blog -> /blog/entry does not clean up the entries of /blog. */
    SCOPED=2,
};

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
    page: string,
    loadHook: ClientLoadHook,
    bindLevel: BindLevel,
}> = []

const sanitizePathname = (pn: string) => {
    if ((!pn.endsWith("/")) || pn === "/") return pn;
    return pn.slice(0, -1);
};

let currentPage: string = sanitizePathname(loc.pathname);

/** 
    Get all paths from a pathname:
    Path: /home/recipes/cake
    Result: / /home /home/recipes /home/recipes/cake
*/
function getAllPaths(pathname: string) {
    const sanitized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
    const parts = sanitized.split("/").filter(Boolean);
    
    const subpaths = [
        "/",
        ...parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"))
    ];
    
    if (sanitized === "/") return ["/"];
    
    return subpaths;
}

const createStateManager = (subjects: ClientSubject[], bindLevel: BindLevel) => {
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

        get: (id: number) => {
            const subject = state.subjects.find((s: ClientSubject) => s.id === id);
            if (subject) return subject; // early return because computing is expensive
            
            // prevents recursion in layouts.
            if (bindLevel === BindLevel.SCOPED) return undefined;
            
            /*
                goes *up* in pathname until it finds
                a layout that contains the state we want.
            */
            const parts = window.location.pathname.split("/").filter(Boolean);
    
            const paths = [
                ...parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/")),
                "/",
            ].reverse() //so we get deepest-to-root;
            
            for (const item of paths) {
                const sanitized = sanitizePathname(item);
                
                const data = ld[sanitized];
                if (!data) continue;
                
                const entry = data.stateManager.get(id);
                if (entry) return entry;
            }
            
            return undefined;
        },

        /**
            Bind is deprecated, but kept as a paramater to not upset legacy code.
        */
        getAll: (refs: { id: number, bind?: number, }[]) => refs?.map(ref => {
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

const initPageData = (
    data: any, 
    currentPage: string,
    previousPage: string | null,
    bindLevel: BindLevel,
) => {
    if (!data) {
        console.error("Data for page " + currentPage + " is null.")
        
        return;
    }
    
    let state = data?.stateManager;
    if (!state) {
        state = createStateManager(data.state || [], bindLevel);

        data.stateManager = state;
    }

    for (const subject of state.subjects) {
        /*
            layout data gets re-inited on every navigation
            (it has to),
            but we don't want to clean up stuff that was already there.
            (eg. existing observers, etc)
        */
        if (!subject.observers) subject.observers = new Map();
    }

    for (const ooa of data.ooa || []) {
        // do all, because reactive-maps all use the same key
        const els = doc.querySelectorAll(`[key="${ooa.key}"]`);

        let values: Record<string, any> = {};

        for (const { id } of ooa.refs) {
            const subject = state.get(id);

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
        
        if (!el) {
            console.error("Could not find SOA element for SOA:", soa);
            
            continue;
        }

        const subject = state.get(soa.id);

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
        const wasInScope = previousPage ? previousPage.startsWith(currentPage) : false;
        
        if (wasInScope && bindLevel !== BindLevel.STRICT) {
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
                            page: `${currentPage}`,
                            loadHook: loadHook,
                            bindLevel,
                        });
                    }
                })
            } else {
                cleanupFunction = fn(state) as (void | (() => void));
                
                if (cleanupFunction){
                    cleanupProcedures.push({
                        cleanupFunction,
                        page: `${currentPage}`,
                        loadHook: loadHook,
                        bindLevel,
                    });
                }
            }
            
        } catch(e) {
            console.error(e);
            
            return;
        }
    }
};
const loadPage = async (
    previousPage: null | string = null
) => {
    const fixedUrl = new URL(loc.href);
    fixedUrl.pathname = sanitizePathname(fixedUrl.pathname)

    const pathname = fixedUrl.pathname;
    currentPage = pathname;
    
    /*
        it's important to do this *before*
        any client-side code runs from pd or anything of the sort,
        so that when the page is re-navigated to, the html is the original html
        that was sent from the server.
    */
    pageStringCache.set(
        currentPage,
        xmlSerializer.serializeToString(doc)
    );
    
    history.replaceState(null, "", fixedUrl.href);
    
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
            const layoutDataScript = document.querySelector(`script[data-layout="true"][data-pathname="${path}"]`) as HTMLScriptElement;
            
            if (!layoutDataScript) {
                continue;
            }
        
            const { data } = await import(layoutDataScript.src);
            
            if (!ld[pathname]) ld[pathname] = data;
            
            // remove the script that contained the string literal of the page_data
            {
                const dataScript = document.querySelector(`script[data-hook="true"][data-pathname="${sanitizePathname(pathname)}"]`);
                
                if (dataScript) dataScript.remove();
            }

            initPageData(ld[pathname], path, previousPage, BindLevel.SCOPED);
        }
    }
    
    /*
        init page state
    */
    {
        const pageDataScript = document.head.querySelector(`script[data-page="true"][data-pathname="${sanitizePathname(pathname)}"]`) as HTMLScriptElement;
        
        const { data } = await import(pageDataScript.src);
        if (!pd[pathname]) pd[pathname] = data;
        
        // remove the script that contained the string literal of the page_data
        {
            const dataScript = document.querySelector(`script[data-hook="true"][data-pathname="${sanitizePathname(pathname)}"]`);
            
            if (dataScript) dataScript.remove();
        }
        
        initPageData(pd[pathname], currentPage, previousPage, BindLevel.STRICT);
    }
    
    console.info(
        `Loading finished, cleanupProcedures are currently:`,
        cleanupProcedures,
    );
};

const fetchPage = async (targetURL: URL): Promise<Document | void> => {
    const pathname = sanitizePathname(targetURL.pathname);

    if (pageStringCache.has(pathname)) {
        return domParser.parseFromString(pageStringCache.get(pathname), "text/html");
    }

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
    
    // get page script
    {
        const pageDataScript = newDOM.querySelector('script[data-page="true"]') as HTMLScriptElement
        
        if (!pageDataScript) {
            return;
        }
    
        if (!pd[pathname]) {
            await import(pageDataScript.src);
        }
        
    }
    
    // get layout scripts
    {
        const layoutDataScripts = Array.from(newDOM.querySelectorAll('script[data-layout="true"]')) as HTMLScriptElement[]
        
        for (const script of layoutDataScripts) {
            const url = new URL(script.src, window.location.origin);
            
            const dir = url.pathname.substring(0, url.pathname.lastIndexOf('/')) || '/';
            const pathname = sanitizePathname(dir);
            
            if (!ld[pathname]) {
                await import(script.src);
            }
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

    for (const cleanupProcedure of [...cleanupProcedures]) {
        const isInScope = pathname.startsWith(cleanupProcedure.page);
        
        if (
            !isInScope || cleanupProcedure.bindLevel === BindLevel.STRICT
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
    
    let oldPageLatest = doc.body;
    let newPageLatest = newPage.body;
    
    {
        const newPageLayouts = Array.from(newPage.querySelectorAll("template[layout-id]")) as HTMLTemplateElement[];
        const oldPageLayouts = Array.from(doc.querySelectorAll("template[layout-id]")) as HTMLTemplateElement[];
        
        const size = Math.min(newPageLayouts.length, oldPageLayouts.length);
        
        for (let i = 0; i < size; i++) {
            const newPageLayout = newPageLayouts[i];
            const oldPageLayout = oldPageLayouts[i];
            
            const newLayoutId = newPageLayout.getAttribute("layout-id")!;
            const oldLayoutId = oldPageLayout.getAttribute("layout-id")!;
            
            if (newLayoutId !== oldLayoutId) {
                break
            }
            
            oldPageLatest = oldPageLayout.nextElementSibling! as HTMLElement;
            newPageLatest = newPageLayout.nextElementSibling! as HTMLElement;
        }
    }
    
    oldPageLatest.replaceWith(newPageLatest);
    
    {   
        // Gracefully replace head.
        // document.head.replaceWith(); causes FOUC on Chromium browsers.
        doc.head.querySelector("title")?.replaceWith(
            newPage.head.querySelector("title") ?? ""
        )
        
        const update = (targetList: HTMLElement[], matchAgainst: HTMLElement[], action: (node: HTMLElement) => void) => {
            for (const target of targetList) {
                const matching = matchAgainst.find(n => n.isEqualNode(target));
                
                if (matching) {
                    continue;
                }
                
                action(target);
            }
        };
        
        // add new tags and reomve old ones
        const oldTags = Array.from([
            ...Array.from(document.head.querySelectorAll("link")),
            ...Array.from(document.head.querySelectorAll("meta")),
            ...Array.from(document.head.querySelectorAll("script")),
            ...Array.from(document.head.querySelectorAll("base")),
            ...Array.from(document.head.querySelectorAll("style")),
        ]);
        
        const newTags = Array.from([
            ...Array.from(newPage.head.querySelectorAll("link")),
            ...Array.from(newPage.head.querySelectorAll("meta")),
            ...Array.from(newPage.head.querySelectorAll("script")),
            ...Array.from(newPage.head.querySelectorAll("base")),
            ...Array.from(newPage.head.querySelectorAll("style")),
        ]);
        
        update(newTags, oldTags, (node) => document.head.appendChild(node));
        update(oldTags, newTags, (node) => node.remove());
    }
    

    if (pushState) history.pushState(null, "", targetURL.href); 
    
    await loadPage(currentPage);
    
    currentPage = pathname;

    if (targetURL.hash) {
        doc.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }

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
