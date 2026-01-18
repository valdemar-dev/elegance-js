import { compilerStore } from "../compilation/compiler";

type StateCreationOptions = {
    /**
     * Override the default ID generation, this is not generally encouraged, 
     * but can be useful if you cannot guarantee order-dependent state() calls. 
     */
    explicitId?: string,
};

class ServerSubject<T extends any> {
    readonly id: string;
    value: T;

    constructor(id: string, value: T) {
        this.id = id;
        this.value = value;
    }
}
function state<T>(value: T, options?: StateCreationOptions): ServerSubject<T> {
    const store = compilerStore.getStore();
    
    if (!store) {
        const message = "Illegal invocation of state(). Ensure that the state() function is only called inside components, and never at the top-level of a page or layout.";
        throw new Error(message);
    }

    const subjectId = options?.explicitId ?? store.generateId();

    const serverSubject = new ServerSubject(subjectId, value);

    store.addClientToken(serverSubject);

    return serverSubject
}

export {
    state,
    ServerSubject,
}