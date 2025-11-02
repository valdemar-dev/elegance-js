import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage<Record<string, any>>();

export const getStore = () => {
    const store = als.getStore();
    
    if (store === undefined)
        throw new Error("Tried to access ALS outside of ALS context.");
        
    return store;
};