// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (augment) => {
  const returnAugmentValue = {};
  for (const [key, value] of Object.entries(augment)) {
    const serverStateEntry = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
    globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
    returnAugmentValue[key] = serverStateEntry;
  }
  return returnAugmentValue;
};
var createEventListener = (dependencies, eventListener, params) => {
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params)} }, ...state.getAll([${dependencies.map((dep) => dep.id)}]))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 3 /* OBSERVER */,
    ids: refs.map((ref) => ref.id),
    initialValues: refs.map((ref) => ref.value),
    update
  };
  return returnValue;
};

// src/server/loadHook.ts
var createLoadHook = (options) => {
  const stringFn = options.fn.toString();
  const depIds = options.deps?.map((dep) => dep.id);
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll([${depIds}]))`,
    bind: options.bind || ""
  });
};

// src/components/Link.ts
createLoadHook({
  fn: () => {
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
        listener.el.removeEventListener("mouseenter", listener.fn);
      }
    };
  }
});
var navigate = createEventListener(
  [],
  (event) => {
    const target = new URL(event.currentTarget.href);
    const client = globalThis.__ELEGANCE_CLIENT__;
    const sanitizedTarget = client.sanitizePathname(target.pathname);
    const sanitizedCurrent = client.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return event.preventDefault();
      return;
    }
    event.preventDefault();
    client.navigateLocally(target.href);
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

// src/docs/components/Header.ts
var serverState = createState({
  hasUserScrolled: false
});
createLoadHook({
  deps: [serverState.hasUserScrolled],
  fn: (state, hasUserScrolled) => {
    const handleScroll = () => {
      const pos = {
        x: window.scrollX,
        y: window.scrollY
      };
      if (pos.y > 20) {
        if (hasUserScrolled.value === true) return;
        hasUserScrolled.value = true;
        hasUserScrolled.signal();
      } else {
        if (hasUserScrolled.value === false) return;
        hasUserScrolled.value = false;
        hasUserScrolled.signal();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }
});
var Header = () => header(
  {
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
  },
  div(
    {
      class: observe(
        [serverState.hasUserScrolled],
        (hasUserScrolled) => {
          const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
          if (hasUserScrolled) return defaultClass + "border-b-background-800 bg-background-950";
          return defaultClass + "bg-background-900 border-b-transparent";
        }
      )
    },
    div(
      {
        class: "max-w-[900px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(900px+1rem)]:px-0"
      },
      div(
        {
          class: "flex min-w-max w-full items-center z-10"
        },
        Link(
          {
            href: "/",
            class: "flex items-center gap-1 h-full"
          },
          p({
            class: "font-niconne pointer-fine:group-hover:text-background-950 font-bold text-xl sm:text-3xl relative top-0 z-20 duration-300 pointer-events-none",
            innerText: "Elegance"
          }),
          p({
            innerText: "JS",
            class: "font-bold pointer-fine:group-hover:text-background-950 relative top-0 text-xl sm:text-3xl z-10 text-accent-400 duration-300 pointer-events-none"
          })
        )
      ),
      div(
        {
          class: "flex py-2 sm:py-4 flex relative items-center justify-end w-full"
        },
        Link({
          prefetch: "hover",
          class: "z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950",
          href: "/docs",
          innerText: "Docs"
        })
      )
    )
  )
);
export {
  Header
};
