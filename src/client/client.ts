const parser = new DOMParser();
const serializer = new XMLSerializer();

const pageStringCache = new Map();
let evtSource: EventSource | null = null;

const fetchLocalPage = async (targetURL: URL) => {
    if (targetURL.hostname !== window.location.hostname) {
        throw `Client-side navigation may only occur on local URL's`
    }

    const res = await fetch(targetURL);
    const resText = await res.text();

    if (!res.ok) {
        throw resText;
    }

    const newDOM = parser.parseFromString(resText, "text/html");

    const pageDataScriptSrc = `${targetURL.pathname}/page_data.js`;

    if (!pd[targetURL.pathname]) {
        console.log("adding, cause doesnt exist");
        await import(pageDataScriptSrc);
    }

    pageStringCache.set(targetURL.pathname, serializer.serializeToString(newDOM));

    return newDOM;
};

let oldPathname: string = window.location.pathname;
globalThis.navigateLocally = async (target: string, pushState: boolean = true) => {
    console.log(`Naving to: ${target} from ${oldPathname}`);

    pageStringCache.set(oldPathname, serializer.serializeToString(document));

    const url = new URL(target);
    const newDocument = pageStringCache.get(url.pathname) ?? await fetchLocalPage(url);

    if (pushState) history.pushState(null, "", target); 

    if (newDocument instanceof Document) {
        console.log("Fetched new page.")
        document.body = newDocument.body;
    } else {
        console.log("Got from page cache.")
        document.body = parser.parseFromString(newDocument, "text/html").body;
    }

    load();

    oldPathname = window.location.pathname;
};

window.onpopstate = async (event: PopStateEvent) => {
    event.preventDefault();

    const target = event.target as Window;
    await navigateLocally(target.location.href, false);

    history.replaceState(null, "", target.location.pathname)
};

const load = () => {
    let pathname = window.location.pathname;

    // fixes weird auto-formatting in browser urls
    if (pathname.endsWith("/") && pathname !== "/") {
        pathname = pathname.slice(0,-1);
    }

    let pageData = pd[pathname]
    if (!pageData) {
        throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}`;
    };

    console.log(`Loading ${window.location.pathname}:`, pageData);
    
    const serverState = pageData.state;
    const serverObservers = pageData.ooa;
    const stateObjectAttributes = pageData.soa;
    const isInWatchMode = pageData.w;
    const pageLoadHooks = pageData.plh

    const state = {
        subjects: {} as Record<string, ClientSubject> ,

        populate: (serverState: any) => {
            for (const [subjectName, value] of Object.entries(serverState)) {
                const subject = value as {
                    value: any,
                    id: number,
                }

                state.subjects[subjectName] = {
                    id: subject.id,
                    value: subject.value,
                    observers: [],
                }
            }
        },

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

    state.populate(serverState);
    pageData.sm = state;

    for (const observer of serverObservers || []) {
        const el = document.querySelector(`[key="${observer.key}"]`);

        let values: Record<string, any> = {};

        for (const id of observer.ids) {
            const subject = state.get(id);
            if (!subject) throw `No subject with id ${id}`

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
    }

    for (const soa of stateObjectAttributes || []) {
        const el = document.querySelector(`[key="${soa.key}"]`);

        const subject = state.get(soa.id);
        if (!subject) throw `SOA, no subject with ID: ${soa.id}`;

        (el as any)[soa.attribute] = (event: Event) => subject.value(state, event);
    }

    for (const pageLoadHook of pageLoadHooks || []) {
        pageLoadHook(state);
    }

    if (isInWatchMode && !evtSource) {
        evtSource = new EventSource("http://localhost:3001/events");

        evtSource.onmessage = async (event: MessageEvent<any>) => { 
            console.log(`Message: ${event.data}`);

            if (event.data === "reload") {
                const newHTML = await fetch(window.location.href);

                document.body = new DOMParser().parseFromString(await newHTML.text(), "text/html").body;

                const link = document.querySelector('[rel=stylesheet]') as HTMLLinkElement;

                if (!link) {
                    return;
                }

                const href = link.getAttribute('href')!;
                link.setAttribute('href', href.split('?')[0] + '?' + new Date().getTime());

                load();
            } else if (event.data === "hard-reload") {
                window.location.reload();
            }
        };
    }
};

load();
