// src/server/createEventListener.ts
var createEventListener = (fn) => fn;

// src/server/addPageLoadHooks.ts
var addPageLoadHooks = (hooks) => {
  globalThis.__SERVER_CURRENT_PAGELOADHOOKS__.push(...hooks);
};

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  for (const [key, value] of Object.entries(augment)) {
    globalThis.__SERVER_CURRENT_STATE__[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return globalThis.__SERVER_CURRENT_STATE__;
};

// src/components/Link.ts
addPageLoadHooks([
  () => {
    const anchors = Array.from(document.querySelectorAll("a[prefetch]"));
    const elsToClear = [];
    for (const anchor of anchors) {
      const prefetch = anchor.getAttribute("prefetch");
      const href = new URL(anchor.href);
      switch (prefetch) {
        case "load":
          __ELEGANCE_CLIENT__.fetchPage(href);
          break;
        case "hover":
          const fn = () => {
            __ELEGANCE_CLIENT__.fetchPage(href);
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
        listener.el.removeEventListener("onmouseenter", listener.fn);
      }
    };
  }
]);
var serverState = createState({
  navigate: createEventListener((state, event) => {
    event.preventDefault();
    __ELEGANCE_CLIENT__.navigateLocally(event.currentTarget.href);
  })
});
var Link = (options, ...children) => {
  if (!options.href) {
    throw `Link elements must have a HREF attribute set.`;
  }
  return a(
    {
      ...options,
      onClick: serverState.navigate
    },
    ...children
  );
};
export {
  Link
};
