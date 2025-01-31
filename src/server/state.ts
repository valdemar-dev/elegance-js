const debounce = (delay: number) => {
    let timer: NodeJS.Timeout;

    return (callback: () => void) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, delay);
    };
};

export const enum SubjectScope {
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

class ServerStateController {
    subjectStore: Array<Subject<any>> = [];
    observerStore: Array<{ [key: string]: "local" | "global", }> = [];
    pathname: string

    constructor(pathname: string) {
	this.pathname = pathname;
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
            return sub.pathname === this.pathname && sub.id === id;
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
            this.pathname, 
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
            return sub.pathname === this.pathname && sub.id === id;
        });

        if (!subject) {
            console.error(`Could not find a subject with the ID of ${id} in the page ${this.pathname}`);
            return;
        }

        return subject;
    }

    storeObserver(id: string, scope: "local" | "global") { 
	this.observerStore.push({ [id]: scope, })
    }
}

export { ServerStateController };
export type { Subject }
