// src/docs/components/RootLayout.ts
var RootLayout = (...children) => body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
  ...children
);

// src/docs/docs/components/PageHeading.ts
var PageHeading = (title, id) => h2({
  class: "text-3xl font-semibold mb-4",
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
var createEventListener = ({
  eventListener,
  dependencies = [],
  params
}) => {
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
var navigate = createEventListener({
  eventListener: (event) => {
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
    type: 3 /* OBSERVER */,
    ids: refs.map((ref) => ref.id),
    initialValues: refs.map((ref) => ref.value),
    update
  };
  return returnValue;
};

// src/docs/docs/components/DocsLayout.ts
var serverState = createState({
  secondsSpentOnPage: 1
});
createLoadHook({
  deps: [serverState.secondsSpentOnPage],
  bind: "docs-breakpoint",
  fn: (state, time) => {
    let intervalId;
    intervalId = setInterval(() => {
      time.value++;
      time.signal();
    }, 1e3);
    return () => {
      clearInterval(intervalId);
      time.value = 1;
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
            [serverState.secondsSpentOnPage],
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
      class: "max-w-[1200px] h-full w-full mx-auto flex pt-8 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"
    },
    Sidebar(),
    article(
      {
        class: "h-full w-full overflow-y-scroll pb-[250px] pl-6 ml-6"
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

// src/docs/docs/components/Separator.ts
var Separator = () => div({
  class: "my-20"
}, []);

// src/docs/docs/components/Mono.ts
var Mono = (text) => span({
  class: "font-mono"
}, text);

// src/server/createReference.ts
if (!globalThis.__SERVER_CURRENT_REF_ID__) {
  globalThis.__SERVER_CURRENT_REF_ID__ = 0;
}
var currentRefId = globalThis.__SERVER_CURRENT_REF_ID__;
var createReference = () => {
  return {
    type: 6 /* REFERENCE */,
    value: currentRefId++
  };
};

// src/docs/docs/components/CodeBlock.ts
var toastRef = createReference();
var copyCode = createEventListener({
  dependencies: [],
  params: {
    ref: toastRef.value
  },
  eventListener: async ({ event, ref }) => {
    const children = event.currentTarget.children;
    const pre2 = children.item(0);
    await navigator.clipboard.writeText(pre2.innerText);
    console.log(`toast reference: ${ref}`);
  }
});
var Toast = () => div(
  {
    ref: toastRef
  },
  "i am a toast!"
);
var CodeBlock = (value) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({
    innerText: value
  })
);

// src/docs/docs/basics/page.ts
var demoPageTS = `export const page = body ({
    style: "background-color: #000; color: #fff;",
},
    h1 ({
        innerText: "Greetings Traveler!",
    }),
);`;
var bodyCallResult = `
{
    tag: "body",
    options: {
        style: "background-color: #000; color: #fff;",
    },
    children: [
        {
            tag: "h1",
            options: {
                innerText: "Greetings Traveler!",
            },
            children: [],
        },
    ],
}
`;
var demoInfoTS = `export const metadata = () => head ({},
    title ("Greetings Traveler!"),
);
`;
var page = RootLayout(
  DocsLayout(
    PageHeading(
      "Preamble",
      "preamble"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "A Quick Forewarning"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance is still in very early development.",
      br({}),
      "There are absolutely no guarantees of backwards compatibility, security or really anything.",
      br({}),
      "As such, elegance isn't really meant for production, yet."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "What is Elegance?"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance is an opinionated, strict, compiled, fully-typescript, ",
      br({}),
      "web-framework designed for building feature-rich, yet fast and efficient web pages.",
      br({}),
      br({}),
      "Elegance is written fully by hand, and dependencies are used ",
      b("very "),
      "sparsely.",
      br({}),
      "As of writing, ",
      b("esbuild "),
      "is the only dependency.",
      br({}),
      br({}),
      "A simple, fully-working (non gzipped) elegance page transfers only ",
      b("4kB "),
      "of data!",
      img({
        class: "border-[1px] rounded-sm border-background-600 my-4",
        src: "/assets/nullpage_size.png"
      }),
      'For context, an "empty" (gzipped)  react app on average transfers roughly ',
      b("200-300kB "),
      "of data.",
      br({}),
      br({}),
      "This lack of JS sent to the browser is achieved through not ",
      "creating unnecessary, wildly complex rude goldberg machines; ",
      "and compilation instead of interpretation."
    ),
    Separator(),
    PageHeading(
      "How Elegance Works",
      "how-elegance-works"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "File Structure"
    }),
    p(
      {
        class: "opacity-80"
      },
      "An Elegance.JS projects file structure is akin to that of something like a Next.JS project. ",
      br({}),
      "We use filesystem routing, where each directory contains a ",
      Mono("page.ts,"),
      " and an ",
      Mono("info.ts"),
      " file."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Page Files"
    }),
    p(
      {
        class: "opacity-80"
      },
      "The page.ts file has one requirement, it must export a ",
      Mono("page"),
      " object, which is of type ",
      Mono('EleganceElement<"body">')
    ),
    CodeBlock(demoPageTS),
    p(
      {
        class: "opacity-70"
      },
      "Elements are created using simple, ambient global functions.",
      br({}),
      "The above ",
      Mono("body()"),
      " call, for example, gets turned into this."
    ),
    CodeBlock(bodyCallResult),
    p(
      {
        class: "opacity-80"
      },
      "The estute among you may have noticed that the result can easily be serialized into HTML or JSON.",
      br({}),
      "This is ",
      b("precisely "),
      "what the Elegance compiler does.",
      br({}),
      br({}),
      "It recursively goes through the page, notes down any points of interest (more on this later), ",
      br({}),
      "and then serializes each element.",
      br({}),
      br({}),
      "The resulting data can then either be used to serve static HTML pages, ",
      br({}),
      "(which still have all the normal features of Elegance, but won't get re-rendered),",
      br({}),
      "or dynamically server-rendered content."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Info Files"
    }),
    p(
      {
        class: "opacity-80"
      },
      "The info.ts file also has only one requirement, it must export a ",
      Mono("metadata"),
      " function, which then resolves into an ",
      Mono('EleganceElement<"head">')
    ),
    CodeBlock(demoInfoTS),
    p(
      {
        class: "opacity-80"
      },
      "Metadata is of course a function, so that you may dynamically generate page information. ",
      br({}),
      br({}),
      "This is useful for something like a social media page, ",
      br({}),
      "where you may want need to fetch information about a post, and then display it in a nice rich embed."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Compilation"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance exposes a function called ",
      Mono("compile()"),
      "which your project should call to build itself.",
      br({}),
      "Compilation handles generating page_data files, ",
      "HTML, JSON, transpilation of ts into js, etc.",
      br({}),
      br({}),
      "We will explore compilation, state, reactivity, optimization, ",
      "static generation, hot-reloading, and many of the other features of ",
      "Elegance in greater-depth later on. However, this is all that you need to know for now."
    ),
    Separator(),
    PageHeading(
      "Installation",
      "installation"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "GitHub"
    }),
    p(
      {
        class: "opacity-80"
      },
      "As Elegance is still in it's formative stages, ",
      "we haven't yet published to things like the NPM registry.",
      br({}),
      "However, installation is still quite simple.",
      br({}),
      br({}),
      "First, decide where you'll want Elegance to live. ",
      br({}),
      "On a linux-based system, somewhere like ",
      Mono("~/bin/elegance"),
      " is a good place.",
      br({}),
      b("Just remember where it is! You'll need it later."),
      br({}),
      br({}),
      "Install ",
      a({
        href: "https://git-scm.com/",
        class: "border-b-2 border-text-50"
      }, "git"),
      " for your system, if you haven't already.",
      br({}),
      br({}),
      "Next, open a terminal / command prompt window, and issue the following the command.",
      CodeBlock("git clone https://github.com/valdemar-dev/elegance-js [your destination folder]")
    )
  ),
  Toast()
);
export {
  page
};
