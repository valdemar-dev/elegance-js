// src/internal/deprecate.ts
var ShowDeprecationWarning = (msg) => {
  console.warn("\x1B[31m", msg, "\x1B[0m");
  console.trace("Stack Trace:");
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
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: bind || ""
  });
};
var createLoadHook = (options) => {
  ShowDeprecationWarning("WARNING: createLoadHook() is a deprecated function. Use loadHook() from elegance-js/loadHook instead.");
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
  const isAsync = options.fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
    bind: options.bind || ""
  });
};

// src/server/state.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId = globalThis.__SERVER_CURRENT_STATE_ID__;
var eventListener = (dependencies, eventListener2) => {
  const deps = dependencies.map((dep) => ({ id: dep.id, bind: dep.bind }));
  let dependencyString = "[";
  for (const dep of deps) {
    dependencyString += `{id:${dep.id}`;
    if (dep.bind) dependencyString += `,bind:${dep.bind}`;
    dependencyString += `},`;
  }
  dependencyString += "]";
  const value = {
    id: currentId += 1,
    type: 1 /* STATE */,
    value: new Function(
      "state",
      "event",
      `(${eventListener2.toString()})(event, ...state.getAll(${dependencyString}))`
    )
  };
  globalThis.__SERVER_CURRENT_STATE__.push(value);
  return value;
};

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

// src/server/createState.ts
if (!globalThis.__SERVER_CURRENT_STATE_ID__) {
  globalThis.__SERVER_CURRENT_STATE_ID__ = 0;
}
var currentId2 = globalThis.__SERVER_CURRENT_STATE_ID__;
var createState = (value, options) => {
  ShowDeprecationWarning("WARNING: The createState() and function is deprecated. Please use state() instead, from elegance-js/state.");
  const serverStateEntry = {
    id: currentId2 += 1,
    value,
    type: 1 /* STATE */,
    bind: options?.bind
  };
  globalThis.__SERVER_CURRENT_STATE__.push(serverStateEntry);
  return serverStateEntry;
};

// src/docs/components/Header.ts
var hasUserScrolled = createState(false);
createLoadHook({
  deps: [hasUserScrolled],
  fn: (state2, hasUserScrolled2) => {
    const handleScroll = () => {
      const pos = {
        x: window.scrollX,
        y: window.scrollY
      };
      if (pos.y > 20) {
        if (hasUserScrolled2.value === true) return;
        hasUserScrolled2.value = true;
        hasUserScrolled2.signal();
      } else {
        if (hasUserScrolled2.value === false) return;
        hasUserScrolled2.value = false;
        hasUserScrolled2.signal();
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
        [hasUserScrolled],
        (hasUserScrolled2) => {
          const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
          if (hasUserScrolled2) return defaultClass + "border-b-background-800 bg-background-950";
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
          href: "/docs/basics",
          innerText: "Docs"
        })
      )
    )
  )
);

// src/docs/components/RootLayout.ts
var RootLayout = (...children) => body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
  ...children
);

// src/docs/page.ts
import fs from "fs";
fs.existsSync("./page.mjs");
var metadata = () => {
  return head(
    {},
    link({
      rel: "stylesheet",
      href: "/index.css"
    }),
    title("Hi There!")
  );
};
var pageTemplateString = `
const variables = createState({
    counter: 0,
});

const functions = createState({
    increment: eventListener(
        [variables.counter],
        (event, counter) => {
            counter.value++;
            counter.signal();
        }
    ),
});

export const page = body ({
    class: "bg-black text-white",
},
    p ({
        innerText: observe(
            [variables.counter],
            (value) => \`The Counter is at: \${value}\`,
        )
    }),

    button ({
        onClick: functions.increment,
    },
        "Increment Counter",
    ),
);
`;
var convertToSpans = (inputString) => {
  const tokenMap = {
    "body": "text-orange-400",
    "observe": "text-orange-400",
    "createState": "text-orange-400",
    "p": "text-orange-400",
    "button": "text-orange-400",
    "eventListener": "text-orange-400",
    "signal": "text-orange-400",
    "const": "text-orange-300",
    "return": "text-orange-300",
    "export": "text-red-400",
    "import": "text-red-400",
    "from": "text-red-400",
    "onClick": "text-orange-200",
    "innerText": "text-orange-200",
    "class": "text-orange-200",
    "increment": "text-orange-200",
    "counter": "text-orange-200",
    "event": "text-orange-200"
  };
  const regex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|\b(?:const|incrementobserve|createState|export|import|from|return|body|p|button|onClick|ids|update|event|innerText|counter|class|signal|eventListener)\b|"(?:\\.|[^"\\])*"|\${[^}]*}|`(?:\\.|[^`\\])*`/g;
  const result = inputString.replace(regex, (match) => {
    if (match.startsWith("//")) {
      return `<span class="text-neutral-500">${match}</span>`;
    } else if (match.startsWith("${") && match.endsWith("}")) {
      return `<span class="text-purple-400">${match}</span>`;
    } else if (match.startsWith('"') && match.endsWith('"')) {
      return `<span class="text-green-400">${match}</span>`;
    } else if (match.startsWith("`") && match.endsWith("`")) {
      return `<span class="text-green-400">${match}</span>`;
    }
    const className = tokenMap[match];
    return className ? `<span class="${className}">${match}</span>` : match;
  });
  return result;
};
var page = RootLayout(
  Header(),
  div(
    {
      class: "max-w-[900px] w-full mx-auto pt-4 px-2"
    },
    div(
      {
        class: "text-center px-4 pt-8 mb-12 sm:mb-20"
      },
      div(
        {
          class: "text-3xl md:text-4xl lg:text-5xl font-bold font-inter mb-4"
        },
        span({
          innerText: "Your site doesn't"
        }),
        span({
          innerText: " need "
        }),
        span({
          innerText: "to be slow."
        })
      ),
      p({
        class: "text-xs sm:text-sm text-text-100",
        innerHTML: 'Nor should you depend on <b class="hover:text-red-400">1314</b> packages to display <b>"Hello World"</b>.'
      })
    ),
    p(
      {
        class: "text-base sm:text-xl text-center"
      },
      span({
        innerText: "Elegance gives you"
      }),
      span({
        class: "bg-gradient-to-r font-bold from-red-400 to-orange-400 bg-clip-text text-transparent",
        innerText: " performance, "
      }),
      span({
        class: "bg-gradient-to-r font-bold from-blue-400 to-green-400 bg-clip-text text-transparent",
        innerText: "state-of-the-art features"
      }),
      span({
        innerText: " and "
      }),
      span({
        class: "font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
        innerText: "syntaxical sugar, "
      }),
      span({
        class: "",
        innerHTML: "whilst leaving <b>you</b> in full control of how your site works."
      })
    ),
    div(
      {
        class: "mt-6 bg-background-950 p-4 rounded-md mb-8 sm:mb-20"
      },
      div(
        {},
        h2({
          class: "text-sm sm:text-base text-text-200",
          innerText: "/pages/page.ts"
        })
      ),
      pre({
        class: "text-xs sm:text-sm font-mono select-text overflow-x-scroll w-full",
        innerHTML: convertToSpans(pageTemplateString)
      })
    )
  ),
  div(
    {
      class: "max-w-[900px] w-full mx-auto px-4 pb-64 flex flex-col gap-4 items-start  sm:items-center sm:flex-row sm:justify-between"
    },
    div(
      {},
      h2({
        class: "text-xl sm:text-3xl font-bold",
        innerText: "Learn More"
      }),
      p(
        {},
        "Interested? ",
        "Read our Docs on how Elegance works."
      )
    ),
    Link({
      class: "text-base sm:text-lg uppercase font-bold text-background-950 font-semibold px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-accent-400",
      href: "/docs/basics",
      innerText: "documentation"
    })
  )
);
export {
  metadata,
  page
};
