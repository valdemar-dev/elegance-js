declare const pageData: any;
declare const serverState: any;
declare const serverObservers: any;
declare const stateObjectAttributes: any;
declare const state: {
    subjects: Record<string, ClientSubject>;
    populate: () => void;
    get: (id: number) => ClientSubject | undefined;
    set: (subject: ClientSubject, value: any) => void;
    signal: (subject: ClientSubject) => void;
    observe: (subject: ClientSubject, observer: (value: any) => any) => void;
};
