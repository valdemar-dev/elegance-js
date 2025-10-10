import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

import { loadHook } from "./loadHook";

type ClientSubjectGeneric<T> = Omit<ClientSubject, "value"> & {
    value: T;
};

if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
    globalThis.__SERVER_CURRENT_STATE_ID__ = 1;
}

type Widen<T> =
    T extends number ? number :
    T extends string ? string :
    T extends boolean ? boolean :
    T extends {} ? T & Record<string, any> :
    T;

export const state = <
    U extends number | string | boolean | {},
>(
    value: U,
    options?: {
        bind?: number;
        // ephemeral?: boolean;
    },
) => {
    type ValueType = Widen<U>;

    const serverStateEntry = {
        id: __SERVER_CURRENT_STATE_ID__ += 1,
        value: value,
        type: ObjectAttributeType.STATE,
        bind: options?.bind,
    };

    globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
    
    // shimmy it in
    if (Array.isArray(value)) {
        (serverStateEntry as any).reactiveMap = reactiveMap
    }

    return serverStateEntry as {
        id: number,
        value: ValueType,
        type: ObjectAttributeType.STATE,
        bind: string | undefined,
        reactiveMap: U extends Array<any> ? ReactiveMap<U, any> : null,
    };
};

type ReactiveMap<
    T extends any[],
    D extends Dependencies,
> = (
    this: {
        id: number;
        value: any;
        type: ObjectAttributeType.STATE;
        bind: string | undefined;
    },
    template: (
        item: T[number],
        index: number,
        ...deps: { [K in keyof D]: ClientSubjectGeneric<D[K]>["value"] }
    ) => Child,
    deps: [...D],
) => Child;

const reactiveMap = function <
    T extends any[],
    D extends Dependencies
>(
    this: {
        id: number;
        value: any;
        type: ObjectAttributeType.STATE;
        bind: string | undefined;
    },
    template: (
        item: T[number],
        index: number,
        ...deps: { [K in keyof D]: ClientSubjectGeneric<D[K]>["value"] }
    ) => AnyBuiltElement,
    deps: [...D],
): Child {
    const subject = this;
    
    const dependencies = state(deps || []);
    const templateFn = state(template);
    
    loadHook(
        [subject, templateFn, dependencies],
        (state, subject, templateFn, dependencies) => {
            const el = document.querySelector(
                `[map-id="${subject.id}"]`
            ) as HTMLDivElement;
            if (!el) throw new Error(`Couldn't find map tag with map-id=${subject.id}`);
            
            const parentElement = el.parentElement as HTMLElement;
            const nextSibling = el.nextSibling as HTMLElement;
            
            el.remove();
            
            const value = subject.value as Array<any>;
            
            const deps = state.getAll(dependencies.value.map(dep => ({ id: dep.id, bind: dep.bind })));
            
            const attributes: any[] = [];
            const currentlyWatched: any[] = [];
            
            const createElements = () => {
                const state = pd[client.currentPage].stateManager;
                
                for (let i = 0; i < value.length; i += 1) {
                    const htmlElement = client.renderRecursively(templateFn.value(value[i], i, ...deps as any), attributes) as HTMLElement;
                    
                    htmlElement.setAttribute("map-id", subject.id.toString())
                    
                    const elementKey = ((i-1) * -1).toString();
                    htmlElement.setAttribute("key", elementKey);
                    
                    for (const attribute of attributes) {
                        let values: Record<string, any> = {};
                        
                        const type = attribute.type;
                        
                        switch (type) {
                        case ObjectAttributeType.OBSERVER: {
                            const { field, subjects, updateCallback } = attribute;
                             
                            for (const reference of subjects) {
                                const subject = state.get(reference.id, reference.bind);
                                
                                const updateFunction = (value: any) => {
                                    values[subject.id] = value;
                    
                                    try {
                                        const newValue = updateCallback(...Object.values(values));
                                        let attribute = field === "class" ? "className" : field;
                        
                                        (htmlElement as any)[attribute] = newValue;
                                    } catch(e) {
                                        console.error(e);
                                        
                                        return;
                                    }
                                };
                    
                                updateFunction(subject.value);
                                
                                state.observe(subject, updateFunction, elementKey);
                                
                                currentlyWatched.push({
                                    key: elementKey,
                                    subject,
                                });
                            }
                            break;
                        }    
                            
                        case ObjectAttributeType.STATE: {
                            const { field, element, subjects, eventListener } = attribute;
                            
                            const lc = field.toLowerCase();
                            
                            const state = pd[client.currentPage].stateManager;
                            
                            const fn = (event: Event) => {
                                eventListener(event, ...subjects);
                            };
                            
                            console.log(element);
                            (element as any)[lc] = fn;
                            
                            break;
                        }
                        }    
                    }
                    
                    parentElement.insertBefore(htmlElement, nextSibling);
                    
                    attributes.splice(0, attributes.length)
                }
                
            };
            
            const removeOldElements = () => {
                const list = Array.from(document.querySelectorAll(`[map-id="${subject.id}"]`));
                
                for (const el of list) { el.remove(); }
                
                const pageData = pd[client.currentPage];
                
                const state = pageData.stateManager;
                    
                for (const watched of currentlyWatched) {                    
                    state.unobserve(watched.subject, watched.key);
                }
                
                currentlyWatched.splice(0, currentlyWatched.length);
            };
            
            createElements();
            
            const uniqueId = `${Date.now()}`;
            
            state.observe(subject, (value) => {
                removeOldElements();
                createElements();
            }, uniqueId);
        }
    );

    return globalThis.template({
        "map-id": subject.id,
    });
};


type Dependencies = { type: ObjectAttributeType; value: unknown; id: number; bind?: string }[];

export type SetEvent<Event, Target> =
  Omit<Event, "currentTarget"> & { currentTarget: Target };

export const eventListener = <
    D extends Dependencies,
    E extends Event,
    T,
>(
    dependencies: [...D] | [],
    eventListener: (
        event: SetEvent<E, T>,
        ...subjects: { [K in keyof D]: ClientSubjectGeneric<D[K]["value"]> }
    ) => void
) => {
    const deps = dependencies.map(dep => ({ id: dep.id, bind: dep.bind }));

    let dependencyString = "[";
    for (const dep of deps) {
        dependencyString += `{id:${dep.id}`;

        if (dep.bind) dependencyString += `,bind:${dep.bind}`;

        dependencyString += `},`;
    }

    dependencyString += "]";

    const value = {
        id: __SERVER_CURRENT_STATE_ID__ += 1,
        type: ObjectAttributeType.STATE,
        value: new Function(
            "state",
            "event",
            `(${eventListener.toString()})(event, ...state.getAll(${dependencyString}))`
        ),
    };

    globalThis.__SERVER_CURRENT_STATE__.push(value);

    return value;
};

export const initializeState = () => globalThis.__SERVER_CURRENT_STATE__ = [];
export const getState = () => {
    return globalThis.__SERVER_CURRENT_STATE__;
}


