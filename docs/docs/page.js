// src/docs/components/RootLayout.ts
var RootLayout = (...children) => body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
  ...children
);

// src/docs/docs/components/PageHeading.ts
var PageHeading = (title, id) => h1({
  class: "text-3xl font-semibold",
  id,
  innerText: title
});

// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  if (!options.name) throw `Breakpoints must set a name attribute.`;
  const name = options.name;
  delete options.name;
  return div(
    {
      bp: {
        type: 4 /* BREAKPOINT */,
        value: name
      },
      ...options
    },
    ...children
  );
};

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
    const target = event.currentTarget;
    if (target.href === window.location.href) return;
    event.preventDefault();
    __ELEGANCE_CLIENT__.navigateLocally(target.href);
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
    type: 3 /* OBSERVER */,
    ids: refs.map((ref) => ref.id),
    initialValues: refs.map((ref) => ref.value),
    update
  };
  return returnValue;
};

// src/docs/docs/components/DocsLayout.ts
var serverState2 = createState({
  secondsSpentOnPage: 0
});
addPageLoadHooks([
  ({ subjects, signal }) => {
    const secondsSpentOnPage = subjects.secondsSpentOnPage;
    const intervalId = setInterval(() => {
      secondsSpentOnPage.value++;
      signal(secondsSpentOnPage);
    }, 1e3);
    return () => clearInterval(intervalId);
  }
]);
var NavSubLink = (href, innerText) => Link({
  class: "text-sm font-normal flex flex-col gap-2 opacity-80 hover:opacity-60 duration-200",
  innerText,
  href,
  prefetch: "hover"
});
var Sidebar = () => nav(
  {
    class: "w-1/4 pr-6 mr-6"
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
            [serverState2.secondsSpentOnPage],
            (secondsSpentOnPage) => {
              const hours = Math.floor(secondsSpentOnPage / 60 / 60);
              const minutes = Math.floor(secondsSpentOnPage / 60 % 60);
              const seconds = secondsSpentOnPage % 60;
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
  div(
    {
      class: "max-w-[1200px] h-full overflow-clip w-full mx-auto flex pt-8 px-2 sm:min-[calc(1200px+1rem)]:px-0"
    },
    Sidebar(),
    article(
      {
        class: "w-3/4 h-full overflow-y-scroll"
      },
      Breakpoint(
        {
          name: "docs-breakpoint"
        },
        ...children
      )
    )
  )
);

// src/docs/docs/page.ts
var page = RootLayout(
  DocsLayout(
    PageHeading("Getting Started", "#getting-started")
  )
);
export {
  page
};
