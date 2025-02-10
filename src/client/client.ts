const pageData = pd[window.location.pathname]
if (!pageData) {
    throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}}`;
};

const serverState = pageData.state;
const serverObservers = pageData.ooa;
const stateObjectAttributes = pageData.soa;
const isInWatchMode = pageData.w;
const pageLoadHooks = pageData.plh

const state = {
    subjects: {} as Record<string, ClientSubject> ,

    populate: () => {
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

state.populate();

globalThis.getSubjects = <T>() => state.subjects as T;

pd[window.location.pathname].sm = state;

const load = () => {
    if (serverObservers) {
        for (const observer of serverObservers) {
            const el = document.querySelector(`[key="${observer.key}"]`);

            let values: Array<any> = [];

            for (const id of observer.ids) {
                const subject = state.get(id);
                if (!subject) throw `No subject with id ${id}`

                values.push(subject.value);

                const updateFunction = (value: any) => {
                    values = values.sort()

                    values[id] = value;

                    const newValue = observer.update(...values);
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
    }


    if (stateObjectAttributes) {
        for (const soa of stateObjectAttributes) {
            const el = document.querySelector(`[key="${soa.key}"]`);

            const subject = state.get(soa.id);
            if (!subject) throw `SOA, no subject with ID: ${soa.id}`;

            (el as any)[soa.attribute] = (event: Event) => subject.value(state, event);
        }
    }

    if (pageLoadHooks) {
        for (const pageLoadHook of pageLoadHooks) {
            pageLoadHook(state);
        }
    }
};

load();

if (isInWatchMode) {
    const evtSource = new EventSource("http://localhost:3001/events");

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

