const pageData = pd[window.location.pathname]
if (!pageData) {
    throw `Invalid Elegance Configuration. Page.JS is not properly sent to the Client. Pathname: ${window.location.pathname}}`;
};

const serverState = pageData.state;
const serverObservers = pageData.ooa;

const state = {
    subjects: [] as Array<{ id: any, value: any, observers: Array<(value: any) => any>}>,

    populate: () => {
	for (const [key, value] of Object.entries(serverState)) {
	    state.subjects.push({
		id: parseInt(key),
		value: value,
		observers: [],
	    });
	}
    },

    get: (id: number) => state.subjects.find((s) => s.id === id),

    set: (id: number, value: any) => {
	const subject = state.get(id);
	if (!subject) throw `No subject with id ${id}`;

	subject.value = value;
    },

    signal: (id: number) => {
	const subject = state.get(id);
	if (!subject) throw `No subject with id ${id}`;

	const observers = subject.observers;

	for (const observer of observers) {
	    observer(subject.value);
	}
    },

    observe: (id: number, observer: (value: any) => any) => {
	const subject = state.get(id);
	if (!subject) throw `No subject with id ${id}`;

	subject.observers.push(observer);
    }
}

state.populate();

if (serverObservers) {
    for (const observer of serverObservers) {
	const el = document.querySelector(`[key="${observer.key}"]`)

	const subject = state.get(observer.id)!;

	state.observe(subject.id, (value: any) => {
	    // mm.. adult programming language.
	    (el as any)[observer.attribute] = observer.update(value)
	});
    }

    setInterval(() => {
	const subject = state.get(0)!;

	state.set(subject.id, subject.value + 1);
	state.signal(subject.id);
    }, 1000);
}

