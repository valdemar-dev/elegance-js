console.log("Elegance.JS is loading..")

const parser = new DOMParser();
const serializer = new XMLSerializer();

const pageStringCache = new Map();

let cleanupFunctions: Array<() => void> = [];

let evtSource: EventSource | null = null;
let currentPage: string = window.location.pathname;

const sanitizePathname = (pn: string) => {
    if (!pn.endsWith("/")) return pn;

    if (pn === "/") return pn;

    return pn.slice(0, -1);
};

const fetchPage = async (targetURL: URL): Promise<Document | void> => {
    const pathname = sanitizePathname(targetURL.pathname);

    if (pageStringCache.has(pathname)) {
        return parser.parseFromString(pageStringCache.get(pathname), "text/html");
    }

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

    const newDOM = parser.parseFromString(resText, "text/html");

    const pageDataScriptSrc = pathname === "/" ?
        pathname + "page_data.js" :
        pathname + "/page_data.js";

    if (!pd[pathname]) {
        await import(pageDataScriptSrc);
    }

    pageStringCache.set(pathname, serializer.serializeToString(newDOM));

    return newDOM;
};

const navigateLocally = async (target: string, pushState: boolean = true) => {
    console.log(`Naving to: ${target} from ${currentPage}`);

    for (const func of cleanupFunctions) {
        func();
    }

    cleanupFunctions = [];

    pageStringCache.set(currentPage, serializer.serializeToString(document));

    const targetURL = new URL(target);
    const pathname = sanitizePathname(targetURL.pathname);

    let newPage: Document | string | undefined = pageStringCache.get(pathname) ?? await fetchPage(targetURL);
    if (!newPage) return;
    
    if (typeof newPage === "string") {
        newPage = parser.parseFromString(newPage, "text/html");
    }

    const currentPageBreakpoints= Array.from(document.querySelectorAll("div[bp]"));
    const newPageBreakpoints = Array.from(newPage.querySelectorAll("div[bp]"));

    let lastMatchingBreakpoint: HTMLElement = document.body;
    let lastMatchingNewPageBreakpoint: HTMLElement = newPage.body;

    for (let i = 0; i < currentPageBreakpoints.length; i++) {
        if (i > newPageBreakpoints.length -1) break;

        const currentPageBreakpoint = currentPageBreakpoints[i]; 
        const newPageBreakpoint = newPageBreakpoints[i];

        const currentPageBreakpointName = currentPageBreakpoint.getAttribute("bp")
        const newPageBreakpointName = newPageBreakpoint.getAttribute("bp")

        if (currentPageBreakpointName !== newPageBreakpointName) {
            break;
        }

        lastMatchingBreakpoint = currentPageBreakpoint as HTMLElement; 
        lastMatchingNewPageBreakpoint = newPageBreakpoint as HTMLElement;
    }

    console.log(`Replacing ${lastMatchingBreakpoint} width ${lastMatchingNewPageBreakpoint}`);

    const parent = lastMatchingBreakpoint.parentElement;

    parent?.replaceChild(lastMatchingNewPageBreakpoint, lastMatchingBreakpoint);
    document.head.replaceChildren(...Array.from(newPage.head.children));

    if (pushState) history.pushState(null, "", target); 

    load();

    currentPage = pathname;
};

window.onpopstate = async (event: PopStateEvent) => {
    event.preventDefault();

    const target = event.target as Window;
    await navigateLocally(target.location.href, false);

    history.replaceState(null, "", sanitizePathname(target.location.pathname));
};

const load = () => {
    let pathname = sanitizePathname(window.location.pathname);

    let pageData = pd[pathname];
    if (!pageData) {
        console.error(`Invalid Elegance Configuration. Page.JS is not properly sent to the client. Pathname: ${window.location.pathname}`)
        return;
    };

    console.log(`Loading ${pathname}:`, pageData);
    
    const serverState = pageData.state;
    const serverObservers = pageData.ooa;
    const stateObjectAttributes = pageData.soa;
    const isInWatchMode = pageData.w;
    const pageLoadHooks = pageData.plh

    const state = {
        subjects: {} as Record<string, ClientSubject> ,

        get: (id: number) => Object.values(state.subjects).find((s) => s.id === id),

        set: (subject: ClientSubject, value: any) => {
            subject.value = value;

            pd[subject.pathname].sm.subjects[Object.keys(subject)[0]] = subject;
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

    pageData.sm = state;

    for (const observer of serverObservers || []) {
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

        console.info(`Registered observer for key ${observer.key}`)
    }

    for (const soa of stateObjectAttributes || []) {
        const el = document.querySelector(`[key="${soa.key}"]`);

        if (!el) {
            console.warn(`Couldn't find el for key=${soa.key}. Page: ${pathname}. Ref:`, pageData);
            console.log(soa);
            return;
        }

        const subject = state.get(soa.id);
        if (!subject) {
            console.error(`An SOA is watching an illegal ID: ${soa.id}.`);
            return;
        }

        (el as any)[soa.attribute] = (event: Event) => subject.value(state, event);

        console.info(`Registered SOA ${soa.attribute} for key ${soa.key}, with id ${soa.id}, to the element:`, el);
    }

    for (const pageLoadHook of pageLoadHooks || []) {
        const cleanupFunction = pageLoadHook(state);

        if (!cleanupFunction) continue;
        cleanupFunctions.push(cleanupFunction);
    }

    if (isInWatchMode && !evtSource) {
        evtSource = new EventSource("http://localhost:3001/events");

        evtSource.onmessage = async (event: MessageEvent<any>) => { 
            console.log(`Message: ${event.data}`);

            if (event.data === "reload") {
                const newHTML = await fetch(window.location.href);

                for (const func of cleanupFunctions) {
                    func();
                }

                cleanupFunctions = [];

                const newDOM = new DOMParser().parseFromString(
                    await newHTML.text(),
                    "text/html"
                );

                document.body = newDOM.body;
                document.head.replaceWith(newDOM.head);

                const link = document.querySelector('[rel=stylesheet]') as HTMLLinkElement;

                if (!link) return;

                const href = link.getAttribute('href')!;
                link.setAttribute('href', href.split('?')[0] + '?' + new Date().getTime());

                load();
            } else if (event.data === "hard-reload") {
                window.location.reload();
            }
        };
    }
};


globalThis.__ELEGANCE_CLIENT__ = {
    navigateLocally,
    fetchPage,
};

load();
