const debounce = (delay: number) => {
    let timer: NodeJS.Timeout;

    return (callback: () => void) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, delay);
    };
};

enum SubjectScope {
    LOCAL = 1,
    GLOBAL = 2,
}

class Subject<T> {
    enforceRuntimeTypes: boolean;
    observers: Array<{ callback: (value: T) => void }> = [];
    id: string
    value: T
    pathname: string
    debounce?: (callback: () => void) => void
    scope: SubjectScope
    resetOnPageLeave: boolean;

    constructor(
        initialValue: T, 
        id: string, 
        enforceRuntimeTypes: boolean = false, 
        debounceUpdateMs: number | null = null,
        pathname: string = "",
        scope: SubjectScope = SubjectScope.LOCAL,
        resetOnPageLeave: boolean = false,
    ) {
        this.enforceRuntimeTypes = enforceRuntimeTypes;
        this.value = initialValue;
        this.id = id;
        this.pathname = pathname;
        this.scope = scope;
        this.resetOnPageLeave = resetOnPageLeave;

        if (debounceUpdateMs) {
            this.debounce = debounce(debounceUpdateMs);
        }
    }

    observe(callback: (subject: T) => void) {
        this.observers.push({ callback });
    }

    signal() {
        const notifyObservers = async () => {
            const value = this.get();

            for (const observer of this.observers) {
                observer.callback(value);
            }
        };

        if (this.debounce) {
            this.debounce(notifyObservers);
        } else {
            notifyObservers();
        }
    }

    set(newValue: T) {
        if (this.enforceRuntimeTypes && typeof newValue !== typeof this.value) {
            console.error(`Type of new value: ${newValue} (${typeof newValue}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`);
            return;
        }

        this.value = newValue;
    }

    add(entry: T extends Array<infer U> ? U : never) {
        if (!Array.isArray(this.value)) {
            console.error(`The add method of a subject may only be used if the subject's value is an Array.`);
            return;
        }

        this.value.push(entry);
    }

    remove(entry: T extends Array<infer U> ? U : never) {
        if (!Array.isArray(this.value)) {
            console.error(`The remove method of a subject may only be used if the subject's value is an Array.`);
            return;
        }

        const index = this.value.indexOf(entry);

        if (!index) console.error(`Element ${entry} does not exist in this subject, therefore it cannot be removed.`);

        this.value.splice(index, 1);
    }

    get() {
        return this.value;
    }
}

class StateController {
    subjectStore: Array<Subject<any>>

    constructor() {
        this.subjectStore = [];
    }

    create<T>(
        initialValue: T, 
        {
            id, 
            enforceRuntimeTypes = true, 
            debounceUpdateMs,
            resetOnPageLeave = false,
        }: {
            id: string,
            enforceRuntimeTypes?: boolean,
            debounceUpdateMs?: number,
            resetOnPageLeave?: boolean,
        }
    ) {
        const existingSubject = this.subjectStore.find(sub => {
            return sub.pathname === window.location.pathname && sub.id === id;
        });

        if (existingSubject) {
            console.info(
                `%cSubject with ID ${id} already exists, therefore it will not be re-created.`,
                "font-size: 12px; color: #aaaaff"
            );
            return existingSubject;
        }

        const subject = new Subject<T>(
            initialValue, 
            id, 
            enforceRuntimeTypes, 
            debounceUpdateMs,
            window.location.pathname, 
            SubjectScope.LOCAL,
            resetOnPageLeave
        );

        this.subjectStore.push(subject);

        return subject;
    }

    createGlobal<T>(
        initialValue: T, 
        {
            id, 
            enforceRuntimeTypes = true, 
            debounceUpdateMs,
            resetOnPageLeave = false,
        }: {
            id: string,
            enforceRuntimeTypes?: boolean,
            debounceUpdateMs?: number,
            resetOnPageLeave?: boolean,
        }
    ) {
        const existingSubject = this.subjectStore.find(sub => {
            return sub.scope === SubjectScope.GLOBAL && sub.id === id
        });

        if (existingSubject) {
            console.info(
                `%cGlobal Subject with ID ${id} already exists, therefore it will not be re-created.`,
                "font-size: 12px; color: #aaaaff"
            );

            return existingSubject;
        }

        const subject = new Subject<T>(
            initialValue,
            id,
            enforceRuntimeTypes, 
            debounceUpdateMs,
            "",
            SubjectScope.GLOBAL,
            resetOnPageLeave
        );

        this.subjectStore.push(subject);

        return subject;
    }

    getGlobal(id: string) {
        const subject = this.subjectStore.find(sub => {
            return sub.scope === SubjectScope.GLOBAL && sub.id === id;
        });

        if (!subject) {
            throw new Error(`Could not find a global subject with the ID of ${id}.`);
        }

        return subject;
    }

    get(id: string) {
        const subject = this.subjectStore.find(sub => {
            return sub.pathname === window.location.pathname && sub.id === id;
        });

        if (!subject) {
            console.error(`Could not find a subject with the ID of ${id} in the page ${window.location.pathname}`);
            return;
        }

        return subject;
    }

    observe(id: string, callback: (value: any) => void, scope: SubjectScope = SubjectScope.LOCAL) {
        if (scope === SubjectScope.LOCAL) {
            const subject = this.get(id);
            if (!subject) return;

            subject.observe(callback);
        } else {
            const subject = this.getGlobal(id);
            subject.observe(callback);
        }
    }

    resetEphemeralSubjects() {
        this.subjectStore = this.subjectStore.filter(subj => subj.resetOnPageLeave === false);
    }

    cleanSubjectObservers() {
        for (const subject of this.subjectStore) {
            subject.observers = [];
        }
    }
}

export { StateController };
export type { Subject }
