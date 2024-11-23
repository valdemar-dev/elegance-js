const debounce = (delay) => {
    let timer;

    return (callback) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, delay);
    };
};

class Subject {
    constructor(initialValue, id, enforceRuntimeTypes = true, debounceUpdateMs = null, pathname) {
        this.enforceRuntimeTypes = enforceRuntimeTypes;
        this.observers = [];
        this.value = initialValue;
        this.initialValue = initialValue;
        this.id = id;
        this.signalId = 1;
        this.pathname = pathname;

        if (debounceUpdateMs) {
            this.debounce = debounce(debounceUpdateMs);
        }
    }

    observe(callback) {
        if (typeof callback !== "function") {
            throw new Error("The provided callback function must be a function.");
        }

        if (callback.length !== 1) {
            throw new Error("The callback function must take one parameter (new value of the subject).");
        }

        this.observers.push({ callback });
    }

    signal() {
        const observerLength = this.observers.length;

        const callback = async () => {
            const value = this.get();

            for (let i = 0; i < observerLength; i++) {
                const observer = this.observers[i];
                observer.callback(value);
            }
        };

        if (!this.debounce) {
            callback();
            return;
        } else {
            this.debounce(callback);
        }
    }

    set(newValue) {
        if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
            throw new Error(
                `Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`
            );
        }

        this.value = newValue;
    }

    get() {
        return this.value;
    }

    getInitialValue() {
        return this.initialValue;
    }
}

class StateController {
    constructor() {
        this.subjectStore = [];
    }

    create(
        initialValue,
        { id, enforceRuntimeTypes = true, debounceUpdateMs }
    ) {
        const isLocal = (pathname) => pathname === window.location.pathname
        const isCorrectId = (subId) => subId === id

        const existingSubject = this.subjectStore.find(sub => isLocal(sub.pathname) && isCorrectId(sub.id));

        if (existingSubject) {
            console.info(
                `%cSubject with ID ${id} already exists, therefore it will not be re-created.`,
                "font-size: 12px; color: #aaaaff"
            );
            return existingSubject;
        }

        const subject = new Subject(initialValue, id, enforceRuntimeTypes, debounceUpdateMs, pathname);
        this.subjectStore.push(subject);

        return subject;
    }

    createGlobal(
        initialValue,
        { id, enforceRuntimeTypes = true, debounceUpdateMs }
    ) {
        const existingSubject = this.globalSubjectCache.find(sub => sub.id === id);

        if (existingSubject) {
            console.info(
                `%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`,
                "font-size: 12px; color: #aaaaff"
            );
            return existingSubject;
        }

        const subject = new Subject(initialValue, id, enforceRuntimeTypes, debounceUpdateMs);
        this.globalSubjectCache.push(subject);

        return subject;
    }

    getGlobal(id) {
        const subject = this.globalSubjectCache.find(sub => sub.id === id);

        if (!subject) {
            throw new Error(`Could not find a global subject with the ID of ${id}.`);
        }

        return subject;
    }

    get(id) {
        const cache = this.pageSubjectCaches.get(this.currentPage);

        const subject = cache?.find(sub => sub.id === id);

        if (!subject) {
            throw new Error(`Could not find a subject with the ID of ${id} in the page ${this.currentPage}`);
        }

        return subject;
    }

    observe(id, callback) {
        const subject = this.get(id);
        subject.observe(callback);
    }
}

const getStateController = () => {
    if (globalThis.eleganceStateController) return globalThis.eleganceStateController;

    console.log("%cElegance state is loading..", "font-size: 30px; color: #aaaaff");

    globalThis.eleganceStateController = new StateController();

    return globalThis.eleganceStateController;
};

export { getStateController, StateController };
