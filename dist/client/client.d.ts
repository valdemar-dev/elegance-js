declare const pageData: any;
declare const serverState: any;
declare const serverObservers: any;
declare const state: {
    subjects: Array<{
        id: any;
        value: any;
        observers: Array<(value: any) => any>;
    }>;
    populate: () => void;
    get: (id: number) => {
        id: any;
        value: any;
        observers: Array<(value: any) => any>;
    } | undefined;
    set: (id: number, value: any) => void;
    signal: (id: number) => void;
    observe: (id: number, observer: (value: any) => any) => void;
};
