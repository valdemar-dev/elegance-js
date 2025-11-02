// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var als = new AsyncLocalStorage();
var runAls = als.run;
var getStore = () => {
  const store = als.getStore();
  if (store === void 0)
    throw new Error("Tried to access ALS outside of ALS context.");
  return store;
};

// src/server/loadHook.ts
var loadHook = (deps, fn, bind) => {
  const stringFn = fn.toString();
  const depsArray = (deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of depsArray) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const isAsync = fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  const store = getStore();
  store.loadHooks.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};

// src/server/state.ts
var eventListener = (dependencies, eventListener2) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const store = getStore();
  const value = {
    id: store.currentStateId += 1,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener2.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  store.currentState.push(value);
  return value;
};

// src/components/Link.ts
loadHook(
  [],
  () => {
    const anchors = Array.from(document.querySelectorAll("a[prefetch]"));
    const elsToClear = [];
    for (const anchor of anchors) {
      const prefetch = anchor.getAttribute("prefetch");
      const href = new URL(anchor.href);
      switch (prefetch) {
        case "load":
          client.fetchPage(href);
          break;
        case "hover":
          const fn = () => {
            client.fetchPage(href);
          };
          anchor.addEventListener("mouseenter", fn);
          elsToClear.push({
            el: anchor,
            fn
          });
          break;
      }
    }
    return () => {
      for (const listener of elsToClear) {
        listener.el.removeEventListener("mouseenter", listener.fn);
      }
    };
  }
);
var navigate = eventListener(
  [],
  (event) => {
    const target = new URL(event.currentTarget.href);
    const client2 = globalThis.client;
    const sanitizedTarget = client2.sanitizePathname(target.pathname);
    const sanitizedCurrent = client2.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return event.preventDefault();
      return;
    }
    event.preventDefault();
    client2.navigateLocally(target.href);
  }
);
var Link = (options, ...children) => {
  if (!options.href) {
    throw `Link elements must have a HREF attribute set.`;
  }
  if (!options.href.startsWith("/")) {
    throw `Link elements may only navigate to local pages. "/"`;
  }
  return a(
    {
      ...options,
      onClick: navigate
    },
    ...children
  );
};
export {
  Link
};
