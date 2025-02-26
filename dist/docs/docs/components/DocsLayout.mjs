// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  if (options.id === void 0) throw `Breakpoints must set a name attribute.`;
  const id = options.id;
  delete options.id;
  return div(
    {
      bp: id,
      ...options
    },
    ...children
  );
};

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (value, options) => {
  const serverStateEntry = {
    id: currentId++,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  return serverStateEntry;
};
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId++,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener.toString()})({ event, ...${JSON.stringify(params || {})} }, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

// src/server/loadHook.ts
var createLoadHook = (options) => {
  const stringFn = options.fn.toString();
  const deps = (options.deps || []).map((dep) => ({
    id: dep.id,
    bind: dep.bind
  }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`,
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
});
var navigate = createEventListener({
  eventListener: (params) => {
    const target = new URL(params.event.currentTarget.href);
    const client2 = globalThis.client;
    const sanitizedTarget = client2.sanitizePathname(target.pathname);
    const sanitizedCurrent = client2.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return params.event.preventDefault();
      return;
    }
    params.event.preventDefault();
    client2.navigateLocally(target.href);
  }
});
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

// src/docs/docs/components/Header.ts
var Header = () => header(
  {
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
  },
  div(
    {
      class: "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 border-b-background-800 bg-background-950"
    },
    div(
      {
        class: "max-w-[1200px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"
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

// src/server/observe.ts
var observe = (refs, update) => {
  const returnValue = {
    type: 2 /* OBSERVER */,
    initialValues: refs.map((ref) => ref.value),
    update,
    refs: refs.map((ref) => ({
      id: ref.id,
      bind: ref.bind
    }))
  };
  return returnValue;
};

// src/docs/docs/components/CodeBlock.ts
var isToastShowing = createState(false);
var toastTimeoutId = createState(0);
var copyCode = createEventListener({
  dependencies: [
    isToastShowing,
    toastTimeoutId
  ],
  eventListener: async (params, isToastShowing2, toastTimeoutId2) => {
    const children = params.event.currentTarget.children;
    const pre2 = children.item(0);
    const content = pre2.innerText;
    await navigator.clipboard.writeText(content);
    if (toastTimeoutId2.value !== 0) clearTimeout(toastTimeoutId2.value);
    isToastShowing2.value = true;
    isToastShowing2.signal();
    const timeoutId = window.setTimeout(() => {
      isToastShowing2.value = false;
      isToastShowing2.signal();
    }, 3e3);
    toastTimeoutId2.value = timeoutId;
  }
});
var Toast = (bind) => {
  createLoadHook({
    bind,
    deps: [
      toastTimeoutId,
      isToastShowing
    ],
    fn: (state, toastTimeoutId2, isToastShowing2) => {
      return () => {
        clearTimeout(toastTimeoutId2.value);
        isToastShowing2.value = false;
        isToastShowing2.signal();
      };
    }
  });
  return div(
    {
      class: observe(
        [isToastShowing],
        (isShowing) => {
          const modularClass = isShowing ? "right-8" : "right-0 translate-x-full";
          return `fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 ` + modularClass;
        }
      )
    },
    h1({
      class: "font-mono uppercase"
    }, "copied to clipboard")
  );
};

// src/server/layout.ts
if (!globalThis.__SERVER_CURRENT_LAYOUT_ID__) globalThis.__SERVER_CURRENT_LAYOUT_ID__ = 1;
var layoutId = globalThis.__SERVER_CURRENT_LAYOUT_ID__;
var createLayout = (name) => {
  const layouts = globalThis.__SERVER_CURRENT_LAYOUTS__;
  if (layouts.has(name)) return layouts.get(name);
  const id = layoutId++;
  layouts.set(name, id);
  return id;
};

// src/docs/docs/components/DocsLayout.ts
var docsLayoutId = createLayout("docs-layout");
var secondsSpentOnPage = createState(0, {
  bind: docsLayoutId
});
createLoadHook({
  deps: [secondsSpentOnPage],
  bind: docsLayoutId,
  fn: (state, time) => {
    const storedTime = localStorage.getItem("time-on-page");
    if (storedTime) {
      time.value = parseInt(storedTime);
      time.signal();
    }
    let intervalId;
    intervalId = setInterval(() => {
      time.value++;
      time.signal();
    }, 1e3);
    const handlePageLeave = () => {
      localStorage.setItem("time-on-page", `${time.value}`);
    };
    window.addEventListener("beforeunload", handlePageLeave);
    return () => {
      window.removeEventListener("beforeunload", handlePageLeave);
      handlePageLeave();
      clearInterval(intervalId);
    };
  }
});
var NavSubLink = (href, innerText) => Link({
  class: "text-sm font-normal flex flex-col gap-2 opacity-80 hover:opacity-60 duration-200",
  innerText,
  href,
  prefetch: "hover"
});
var Sidebar = () => nav(
  {
    class: "w-1/5"
  },
  ul(
    {
      class: "flex flex-col gap-4"
    },
    li(
      {},
      h2(
        {
          class: "text-lg font-semibold"
        },
        "Quick Nav"
      ),
      span(
        {
          class: "text-xs opacity-75"
        },
        "Elapsed: ",
        span({
          class: "font-mono",
          innerText: observe(
            [secondsSpentOnPage],
            (secondsSpentOnPage2) => {
              const hours = Math.floor(secondsSpentOnPage2 / 60 / 60);
              const minutes = Math.floor(secondsSpentOnPage2 / 60 % 60);
              const seconds = secondsSpentOnPage2 % 60;
              return `${hours}h:${minutes}m:${seconds}s`;
            }
          )
        })
      )
    ),
    li(
      {
        class: "flex flex-col gap-1"
      },
      h4({
        class: "text-base font-medium",
        innerText: "The Basics"
      }),
      ol(
        {
          class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
        },
        NavSubLink(
          "/docs/basics#preamble",
          "Preamble"
        ),
        NavSubLink(
          "/docs/basics#how-elegance-works",
          "How Elegance Works"
        ),
        NavSubLink(
          "/docs/basics#installation",
          "Installation"
        ),
        NavSubLink(
          "/docs/basics#your-first-page",
          "Your First Page"
        )
      )
    ),
    li(
      {
        class: "flex flex-col gap-1"
      },
      h4({
        class: "text-base font-medium",
        innerText: "Concepts"
      }),
      ol(
        {
          class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
        },
        NavSubLink(
          "/docs/concepts#elements",
          "Elements"
        ),
        NavSubLink(
          "/docs/concepts#object-attributes",
          "Object Attributes"
        )
      )
    ),
    li(
      {
        class: "flex flex-col gap-1"
      },
      h4({
        class: "text-base font-medium",
        innerText: "Page Files"
      }),
      ol(
        {
          class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
        },
        NavSubLink(
          "/docs/page-files#state",
          "State"
        ),
        NavSubLink(
          "/docs/page-files#load-hooks",
          "Load Hooks"
        )
      )
    ),
    li(
      {
        class: "flex flex-col gap-1"
      },
      h4({
        class: "text-base font-medium",
        innerText: "Compilation"
      }),
      ol(
        {
          class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
        },
        NavSubLink(
          "/docs/compilation#options",
          "Compilation Options"
        )
      )
    )
  )
);
var DocsLayout = (...children) => div(
  {
    class: "h-screen overflow-clip"
  },
  Header(),
  Toast(docsLayoutId),
  div(
    {
      class: "max-w-[1200px] h-full w-full mx-auto flex pt-8 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"
    },
    Sidebar(),
    article(
      {
        class: "h-full w-full overflow-y-scroll pb-[250px] pl-6 ml-6"
      },
      Breakpoint(
        {
          id: docsLayoutId
        },
        ...children
      )
    )
  )
);
export {
  DocsLayout
};
