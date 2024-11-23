const debounce = (delay) => {
    let timer;
    return (callback) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, delay);
    };
};
var SubjectScope;
(function (SubjectScope) {
    SubjectScope[SubjectScope["LOCAL"] = 1] = "LOCAL";
    SubjectScope[SubjectScope["GLOBAL"] = 2] = "GLOBAL";
})(SubjectScope || (SubjectScope = {}));
class Subject {
    constructor(initialValue, id, enforceRuntimeTypes = false, debounceUpdateMs = null, pathname = "", scope = SubjectScope.LOCAL) {
        this.enforceRuntimeTypes = enforceRuntimeTypes;
        this.observers = [];
        this.value = initialValue;
        this.initialValue = initialValue;
        this.id = id;
        this.pathname = pathname;
        this.scope = scope;
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
        }
        else {
            this.debounce(callback);
        }
    }
    set(newValue) {
        if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
            throw new Error(`Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`);
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
    create(initialValue, { id, enforceRuntimeTypes = true, debounceUpdateMs }) {
        const existingSubject = this.subjectStore.find(sub => {
            return sub.pathname === window.location.pathname && sub.id === id;
        });
        if (existingSubject) {
            console.info(`%cSubject with ID ${id} already exists, therefore it will not be re-created.`, "font-size: 12px; color: #aaaaff");
            return existingSubject;
        }
        const subject = new Subject(initialValue, id, enforceRuntimeTypes, debounceUpdateMs, window.location.pathname);
        this.subjectStore.push(subject);
        return subject;
    }
    createGlobal(initialValue, { id, enforceRuntimeTypes = true, debounceUpdateMs }) {
        const existingSubject = this.subjectStore.find(sub => {
            return sub.scope === SubjectScope.GLOBAL && sub.id === id;
        });
        if (existingSubject) {
            console.info(`%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`, "font-size: 12px; color: #aaaaff");
            return existingSubject;
        }
        const subject = new Subject(initialValue, id, enforceRuntimeTypes, debounceUpdateMs, "", SubjectScope.GLOBAL);
        this.subjectStore.push(subject);
        return subject;
    }
    getGlobal(id) {
        const subject = this.subjectStore.find(sub => {
            return sub.scope === SubjectScope.GLOBAL && sub.id === id;
        });
        if (!subject) {
            throw new Error(`Could not find a global subject with the ID of ${id}.`);
        }
        return subject;
    }
    get(id) {
        const subject = this.subjectStore.find(sub => {
            return sub.pathname === window.location.pathname && sub.id === id;
        });
        if (!subject) {
            throw new Error(`Could not find a subject with the ID of ${id} in the page ${window.location.pathname}`);
        }
        return subject;
    }
    observe(id, callback, scope = SubjectScope.LOCAL) {
        if (scope === SubjectScope.LOCAL) {
            const subject = this.get(id);
            subject.observe(callback);
        }
        else {
            const subject = this.getGlobal(id);
            subject.observe(callback);
        }
    }
}
const getStateController = () => {
    if (globalThis.eleganceStateController)
        return globalThis.eleganceStateController;
    console.log("%cElegance state is loading..", "font-size: 30px; color: #aaaaff");
    globalThis.eleganceStateController = new StateController();
    return globalThis.eleganceStateController;
};

export { StateController, getStateController };
//# sourceMappingURL=state.esm.mjs.map
