const pageData = pd[window.location.pathname]
if (!pageData) {
    throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}}`;
};

const serverState = pageData.state;
const serverObservers = pageData.ooa;
const stateObjectAttributes = pageData.soa;

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

// helper used in page.ts
globalThis.getState = <T>() => state as T;

state.populate();

pd[window.location.pathname].sm = state;

if (serverObservers) {

    for (const observer of serverObservers) {
        const el = document.querySelector(`[key="${observer.key}"]`);

        const values: Array<any> = [];

        for (const id of observer.ids) {
            const subject = state.get(id);
            if (!subject) throw `No subject with id ${id}`

            values.push(subject.value);

            const updateFunction = (value: any) => {
            values[id] = value;

            (el as any)[observer.attribute] = observer.update(...values)};

            state.observe(subject, updateFunction);
        }
    }
}


if (stateObjectAttributes) {
    for (const soa of stateObjectAttributes) {
        const el = document.querySelector(`[key="${soa.key}"]`);

        const subject = state.get(soa.id);
        if (!subject) throw `SOA, no subject with ID: ${soa.id}`;

        (el as any)[soa.attribute] = subject.value;
    } 
}
