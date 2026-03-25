
import type { EventListener, EventListenerCallback, EventListenerOption } from "./eventListener";
import type { LoadHookCleanupFunction, LoadHook } from "./loadHook";
import type { ObserverCallback, ServerObserver } from "./observer";
import type { ServerSubject } from "./state";

import type { Effect } from "./effect";

import { allElements } from "../elements/element_list";
import type { AnyElement, } from "../elements/element";
import { SpecialElementOption, EleganceElement } from "../elements/element";

Object.assign(window, allElements);

// these are both defined in the build of this in the esbuild build call
declare let DEV_BUILD: boolean;
declare let PROD_BUILD: boolean;

const newArray = Array.from;

interface SerializationResult {
    root: Node;
    specialElementOptions: { elementKey: string, optionName: string, optionValue: SpecialElementOption }[];
}

let idCounter = 0;
/**
 * Generate a non-deterministic unique id that can be used for browser specific things like custom client observers.
 * Unique, but may change between builds; depends on order of creation.
 * @returns A unique id
 */
function genLocalID(): number {
    idCounter++;
    return idCounter;
}

function createHTMLElementFromEleganceElement(
    element: EleganceElement<any, any>,
): SerializationResult {
    let specialElementOptions: { elementKey: string, optionName: string, optionValue: SpecialElementOption }[] = [];
    const domElement = document.createElement(element.tag);

    // Process options.
    {
        const entries = Object.entries(element.options);
        for (const [optionName, optionValue] of entries) {
            if (optionValue instanceof SpecialElementOption) {
                optionValue.mutate(element, optionName);
     
                const elementKey = genLocalID().toString();
     
                specialElementOptions.push({ elementKey, optionName, optionValue });
            } else {
                domElement.setAttribute(optionName, `${optionValue}`);
            }
        }
    }

    if (element.key) {
        domElement.setAttribute("key", element.key);
    }

    // Process children.
    {
        if (element.children !== null) {
            for (const child of element.children) {
                const result = createHTMLElementFromElement(child);
     
                domElement.appendChild(result.root);
                specialElementOptions.push(...result.specialElementOptions);
            }
        }
    }

  return { root: domElement, specialElementOptions };
}

function createHTMLElementFromElement(
    element: AnyElement,
): SerializationResult {
    let specialElementOptions: { elementKey: string, optionName: string, optionValue: SpecialElementOption }[] = [];

    if (element === undefined || element === null) {
        return { root: document.createTextNode(""), specialElementOptions: [], };
    }

    switch (typeof element) {
    case "object":
        if (Array.isArray(element)) {
            const fragment = document.createDocumentFragment();

            for (const subElement of element) {
                const result = createHTMLElementFromElement(subElement);
                fragment.appendChild(result.root);
                specialElementOptions.push(...result.specialElementOptions);
            }

            return { root: fragment, specialElementOptions };
        }
        
        if (element instanceof EleganceElement) {
            return createHTMLElementFromEleganceElement(element);
        }

    throw new Error(`This element is an arbitrary object, and arbitrary objects are not valid children. Please make sure all elements are one of: EleganceElement, boolean, number, string or Array. Also note that currently in client components like reactiveMap, state subject references are not valid children.`);

    case "boolean":
    case "number":
    case "string":
        const text = typeof element === "string" ? element : element.toString();
        const textNode = document.createTextNode(text);
  
        return { root: textNode, specialElementOptions: [] };
    default:
        throw new Error(`The typeof of this element is not one of EleganceElement, boolean, number, string or Array. Please convert it into one of these types.`);
    }
}

type ClientSubjectObserver<T> = (newValue: T) => void;

DEV_BUILD && (() => {
    let isErrored = false;

    (function connect() {
        const es = new EventSource(`${window.location.origin}/elegance-hot-reload`);

        es.onopen = () => {
            if (isErrored) {
                window.location.reload();
            }
        };

        es.onmessage = (event: MessageEvent) => {
            if (event.data === "hot-reload") {
                window.location.reload();
            }
        };

        es.onerror = () => {
            isErrored = true;
            es.close();
            
            setTimeout(connect, 1000);
        };
    })();
})();

/**
 * A ServerSubject that has been serialized, shipped to the browser, and re-created as it's final form.
 * 
 * Setting the `value` of this ClientSubject will trigger it's observers callbacks.
 * 
 * To listen for changes in `value`, you may call the `observe()` method.
 */
class ClientSubject<T> {
    readonly id: string;
    private _value: T;

    private readonly observers: Map<string, ClientSubjectObserver<T>> = new Map();

    constructor(id: string, value: T) {
        this._value = value;
        this.id = id;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        this._value = newValue;

        for (const observer of this.observers.values()) {
            observer(newValue);
        }
    }

    /**
     * Manually trigger each of this subject's observers, with the subject's current value.
     * 
     * Useful if you're mutating for example fields of an object, or pushing to an array.
     */
    triggerObservers() {
        for (const observer of this.observers.values()) {
            observer(this._value);
        }
    }

    /**
     * Add a new observer to this subject, `callback` is called whenever the value setter is called on this subject.
     * 
     * Note: if an ID is already in use it's callback will just be overwritten with whatever you give it.
     * 
     * Note: this triggers `callback` with the current value of this subject.
     * 
     * @param id The unique id of this observer
     * @param callback Called whenever the value of this subject changes.
     */
    observe(id: string, callback: (newValue: T) => void) {
        if (this.observers.has(id)) {
            this.observers.delete(id);
        }

        this.observers.set(id, callback);
        callback(this.value);
    }

    /**
     * Remove an observer from this subject.
     * @param id The unique id of the observer.
     */
    unobserve(id: string) {
        this.observers.delete(id);
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


type ClientEventListenerOption = {
    /** The html attribute name this option should be attached to */
    option: string,
    /** The key of the element this option should be attached to. */
    key: string,
    /** The event listener id this option is referencing. */ 
    id: string,
}

/**
 * An event listener after it has been generated on the server, processed into pagedata, and reconstructed on the client.
 */
class ClientEventListener {
    id: string;
    callback: EventListenerCallback<any, any, any>;
    dependencies: string[];

    constructor(id: string, callback: EventListenerCallback<any, any, any>, depencencies: string[]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = depencencies;
    }

    call(ev: Event) {
        const dependencies = stateManager.getAll(this.dependencies);
        this.callback(ev as any, ...dependencies);
    }
}

class EventListenerManager {
    private readonly eventListeners: Map<string, ClientEventListener> = new Map();

    constructor() {}

    loadValues(serverEventListeners: EventListener<any, any, any>[], doOverride: boolean = false) {
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


type ClientObserverOption = {
    /** The html attribute name this option should be attached to */
    option: string,
    /** The key of the element this option should be attached to. */
    key: string,
    /** The event listener id this option is referencing. */ 
    id: string,
}

class ClientObserver {
    id: string;
    callback: ObserverCallback<any>;
    dependencies: string[];
    
    subjectValues: ClientSubject<any>["value"][] = [];

    private readonly elements: { element: Element, optionName: string }[] = [];

    constructor(id: string, callback: ObserverCallback<any>, depencencies: string[]) {
        this.id = id;
        this.callback = callback;
        this.dependencies = depencencies;

        const initialValues = stateManager.getAll(this.dependencies);

        for (const initialValue of initialValues) {
            const idx = this.subjectValues.length;
            this.subjectValues.push(initialValue.value);

            initialValue.observe(this.id, (newValue) => {
                this.subjectValues[idx] = newValue;

                this.call();
            });
        }

        this.call();
    }

    /**
     * Add an element to update when this observer updates.
     */
    addElement(element: Element, optionName: string) {
        this.elements.push({ element, optionName });
    }

    setProp(element: Element, key: string, value: any) {
        if (key === "class") {
            element.className = value;
        } 
        else if (key === "style" && typeof value === "object") {
            Object.assign((element as any).style, value);
        } 
        else if (key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.slice(2), value);
        } 
        else if (key in element) {
            const isTruthy = value === "true" || value === "false";
            if (isTruthy) {
                (element as any)[key] = Boolean(value);
            } else {
                (element as any)[key] = value;
            }
        } 
        else {
            element.setAttribute(key, value);
        }
    }

    call() {
        for (const { element, optionName } of this.elements) {
            const getSelf = function getSelf() {
                return element;
            };

            const newValue = this.callback.call(element, ...this.subjectValues);

            this.setProp(element, optionName, newValue);
        }
    }
}

class ObserverManager {
    private readonly clientObservers: Map<string, ClientObserver> = new Map();

    constructor() {}

    loadValues(serverObservers: ServerObserver<any>[], doOverride: boolean = false) {
        for (const serverObserver of serverObservers) {
            if (this.clientObservers.has(serverObserver.id) && doOverride === false) continue;

            const clientObserver = new ClientObserver(serverObserver.id, serverObserver.callback, serverObserver.dependencies);
            this.clientObservers.set(clientObserver.id, clientObserver);
        }
    }

    hookCallbacks(observerOptions: ClientObserverOption[]) {
        for (const observerOption of observerOptions) {
            const element = document.querySelector(`[key="${observerOption.key}"]`) as HTMLElement;
            if (!element) {
                DEV_BUILD && errorOut("Possibly corrupted HTML, failed to find element with key " + observerOption.key + " for event listener.");
                return;
            }

            const observer = this.clientObservers.get(observerOption.id);
            if (!observer) {
                DEV_BUILD && errorOut("Invalid ObserverOption: Observer with id \”" + observerOption.id + "\" does not exist.");
                return;
            }

            observer.addElement(element, observerOption.option);
            observer.call();
        }
    }

    /**
     * Take the results of ServerSubject.generateObserverNode(), replace their HTML placeins for text nodes, and turn those into observers.
     */
    transformSubjectObserverNodes() {
        const observerNodes = newArray(document.querySelectorAll("template[o]"));

        for (const node of observerNodes) {
            const subjectId = node.getAttribute("o")!;

            const subject = stateManager.get(subjectId);
            if (!subject) {
                DEV_BUILD: errorOut("Failed to find subject with id " + subjectId + " for observerNode.");
                continue;
            }

            const textNode = document.createTextNode(subject.value);

            const id = genLocalID().toString();

            function update(value: any) {
                textNode.textContent = value;
            }

            subject.observe(id, update);

            update(subject.value);

            node.replaceWith(textNode);
        }
    }
}


type CleanupProcedure = {
    pathname?: string,
    kind: LoadHookKind,
    cleanupFunction: LoadHookCleanupFunction,
    loadHookIdx: number,
};

enum LoadHookKind {
    LAYOUT_LOADHOOK,
    PAGE_LOADHOOK,
};

class EffectManager {
    private activeEffects: string[] = [];
    private cleanupProcedures: Map<string, () => void> = new Map();

    loadValues(effects: Effect<any>[]) {
        for (const effect of effects) {
            const depencencies = stateManager.getAll(effect.dependencies);

            if (this.activeEffects.includes(effect.id)) {
                continue;
            }

            this.activeEffects.push(effect.id);

            const update = () => {
                if (this.cleanupProcedures.has(effect.id)) {
                    this.cleanupProcedures.get(effect.id)!();
                }

                effect.callback(...depencencies);
            };

            for (const dependency of depencencies) {
                const id = genLocalID().toString();

                dependency.observe(id, update)
            }
        }
    }
}

class LoadHookManager {
    private cleanupProcedures: CleanupProcedure[] = [];
    private activeLoadHooks: string[] = [];

    constructor() {
    }

    loadValues(loadHooks: LoadHook<any>[]) {
        for (const loadHook of loadHooks) {
            const depencencies = stateManager.getAll(loadHook.dependencies);

            if (this.activeLoadHooks.includes(loadHook.id)) {
                continue;
            }

            this.activeLoadHooks.push(loadHook.id);

            const cleanupFunction = loadHook.callback(...depencencies);
            if (cleanupFunction) {
                this.cleanupProcedures.push({ 
                    kind: loadHook.kind,
                    cleanupFunction: cleanupFunction,
                    pathname: loadHook.pathname,
                    loadHookIdx: this.activeLoadHooks.length - 1,
                })
            }
        }
    }

    callCleanupFunctions() {
        let remainingProcedures: CleanupProcedure[] = [];

        for (const cleanupProcedure of this.cleanupProcedures) {
            if (cleanupProcedure.kind === LoadHookKind.LAYOUT_LOADHOOK) {
                const isInScope = sanitizePathname(window.location.pathname).startsWith(cleanupProcedure.pathname!);

                if (isInScope) {
                    remainingProcedures.push(cleanupProcedure);

                    continue;
                }
            }
            
            cleanupProcedure.cleanupFunction();
            this.activeLoadHooks.splice(cleanupProcedure.loadHookIdx, 1);
        }

        this.cleanupProcedures = remainingProcedures;
    }
}

const observerManager = new ObserverManager();
const eventListenerManager = new EventListenerManager();
const stateManager = new StateManager();
const loadHookManager = new LoadHookManager();
const effectManager = new EffectManager();

const pageStringCache = new Map<string, string>();
const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

const fetchPage = async (targetURL: URL): Promise<Document | void> => {
    const pathname = sanitizePathname(targetURL.pathname);

    if (pageStringCache.has(pathname)) {
        return domParser.parseFromString(pageStringCache.get(pathname)!, "text/html");
    }

    const res = await fetch(targetURL);

    const newDOM = domParser.parseFromString(await res.text(), "text/html");
    
    {
        const dataScripts = newArray(newDOM.querySelectorAll('script[data-package="true"]')) as HTMLScriptElement[]
        
        const currentScripts = newArray(document.head.querySelectorAll('script[data-package="true"]')) as HTMLScriptElement[]
        
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
        const pageDataScript = newDOM.querySelector(`script[data-hook="true"][data-pathname="${pathname}"]`) as HTMLScriptElement
    
        if (pageDataScript) {
            const text = pageDataScript.textContent;

            pageDataScript.remove();
            const blob = new Blob([text!], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            
            const script = document.createElement("script");

            script.src = url;
            script.type = "module";
            script.setAttribute("data-page", "true");
            script.setAttribute("data-pathname", `${pathname}`);
            
            newDOM.head.appendChild(script);
        }
    }

    pageStringCache.set(pathname, xmlSerializer.serializeToString(newDOM));

    return newDOM;
};


type NavigationCallback = (pathname: string) => any;

let navigationCallbacks: NavigationCallback[] = [];

function onNavigate(callback: NavigationCallback): number {
    navigationCallbacks.push(callback);
    return navigationCallbacks.length - 1;
}

function removeNavigationCallback(idx: number) {
    navigationCallbacks.splice(idx, 1);
}

const navigateLocally = async (target: string, pushState: boolean = true, isPopState: boolean = false) => {
    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    if (!isPopState && pathname === sanitizePathname(window.location.pathname)) {
        if (targetURL.hash) {
            document.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
        }

        if (pushState) history.pushState(null, "", targetURL.href); 
    
        return;
    }

    let newPage = await fetchPage(targetURL);
    if (!newPage) return;

    let oldPageLatest = document.body;
    let newPageLatest = newPage.body;

    {
        const newPageLayouts = newArray(newPage.querySelectorAll("template[layout-id]")) as HTMLTemplateElement[];
        const oldPageLayouts = newArray(document.querySelectorAll("template[layout-id]")) as HTMLTemplateElement[];
        
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

    const head = document.head;
    const newHead = newPage.head;
    
    oldPageLatest.replaceWith(newPageLatest);
    
    // Gracefully replace head.
    // document.head.replaceWith(); causes FOUC on Chromium browsers.
    {   
        document.head.querySelector("title")?.replaceWith(
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
        const oldTags = [
            ...newArray(head.querySelectorAll("link")),
            ...newArray(head.querySelectorAll("meta")),
            ...newArray(head.querySelectorAll("script")),
            ...newArray(head.querySelectorAll("base")),
            ...newArray(head.querySelectorAll("style")),
        ];
        
        const newTags = [
            ...newArray(newHead.querySelectorAll("link")),
            ...newArray(newHead.querySelectorAll("meta")),
            ...newArray(newHead.querySelectorAll("script")),
            ...newArray(newHead.querySelectorAll("base")),
            ...newArray(newHead.querySelectorAll("style")),
        ];
        
        update(newTags, oldTags, (node) => document.head.appendChild(node));
        update(oldTags, newTags, (node) => node.remove());
    }

    if (pushState) history.pushState(null, "", targetURL.href); 
    
    loadHookManager.callCleanupFunctions();

    {
        for (const callback of navigationCallbacks) {
            callback(pathname);
        }
    }

    await loadPage();

    if (targetURL.hash) {
        document.getElementById(targetURL.hash.slice(1))?.scrollIntoView();
    }
};

/** a simple path sanitizer that just ensures no repeat-slashes and no trailing slash */
function safePercentDecode(input: string): string {
    return input.replace(/%[0-9A-Fa-f]{2}/g, (m) =>
        String.fromCharCode(parseInt(m.slice(1), 16))
    );
}

function sanitizePathname(pathname: string = ""): string {
    if (!pathname) return "/";

    pathname = safePercentDecode(pathname);
    pathname = "/" + pathname;
    pathname = pathname.replace(/\/+/g, "/");

    const segments = pathname.split("/");

    const resolved: string[] = [];

    for (const segment of segments) {
        if (!segment || segment === ".") continue;

        if (segment === "..") {
            resolved.pop();
            continue;
        }

        resolved.push(segment);
    }

    const encoded = resolved.map((s) => encodeURIComponent(s));

    return "/" + encoded.join("/");
}

async function getPageData(pathname: string) {
    /** Find the correct script tag in head. */
    const dataScriptTag = document.head.querySelector(`script[data-page="true"][data-pathname="${pathname}"]`) as HTMLScriptElement | null;
    if (!dataScriptTag) {
        DEV_BUILD && errorOut("Failed to find script tag for query:" + `script[data-page="true"][data-pathname="${pathname}"]`);
        return;
    }

    const { data } = await import(dataScriptTag.src);

    const { 
        subjects, 
        eventListeners, 
        eventListenerOptions, 
        observers, 
        observerOptions,
        effects,
    } = data;

    if (!eventListenerOptions || !eventListeners || !observers || !subjects || !observerOptions || !effects) {
        DEV_BUILD && errorOut(`Possibly malformed page data ${data}`);
        return;
    }

    return data;
}

function errorOut(message: string) {
    throw new Error(message);
} 

async function loadPage() {
    window.onpopstate = async (event: PopStateEvent) => {
        event.preventDefault();

        const target = event.target as Window;

        await navigateLocally(target.location.href, false, true);

        history.replaceState(null, "", target.location.href);
    };

    const pathname = sanitizePathname(window.location.pathname);

    const { 
        subjects, 
        eventListenerOptions, 
        eventListeners,
        observers,
        observerOptions,
        loadHooks,
        effects,
    } = await getPageData(pathname);

    DEV_BUILD: {
        globalThis.devtools = {
            pageData: {
                subjects, 
                eventListenerOptions, 
                eventListeners,
                observers,
                observerOptions,
                loadHooks,
                effects,
            },
            stateManager,
            eventListenerManager,
            observerManager,
            loadHookManager,
            effectManager,
        }
    }

    globalThis.eleganceClient = {
        createHTMLElementFromElement,
        fetchPage,
        navigateLocally,
        onNavigate,
        removeNavigationCallback,
        genLocalID,
    }

    stateManager.loadValues(subjects);

    eventListenerManager.loadValues(eventListeners);
    eventListenerManager.hookCallbacks(eventListenerOptions);

    observerManager.loadValues(observers);
    observerManager.hookCallbacks(observerOptions);
    observerManager.transformSubjectObserverNodes();

    loadHookManager.loadValues(loadHooks);
    effectManager.loadValues(effects);
}

loadPage();

export {
    ClientSubject,
    StateManager,
    ObserverManager,
    LoadHookManager,
    EventListenerManager,
    EffectManager,
}