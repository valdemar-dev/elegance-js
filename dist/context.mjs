// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var als = new AsyncLocalStorage();
var getStore = () => {
  const store = als.getStore();
  if (store === void 0)
    throw new Error("Tried to access ALS outside of ALS context.");
  return store;
};
export {
  getStore
};
