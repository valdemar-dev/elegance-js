// src/docs/components/RootLayout.ts
var RootLayout = (...children) => body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
  ...children
);

// src/docs/docs/components/PageHeading.ts
var PageHeading = (title2, id) => h2({
  class: "text-3xl font-semibold mb-4",
  id,
  innerText: title2
});

// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  console.log("THIS IS ME: ", void 0);
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
    id: currentId += 1,
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
    id: currentId += 1,
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
  const isAsync = options.fn.constructor.name === "AsyncFunction";
  const wrapperFn = isAsync ? `async (state) => await (${stringFn})(state, ...state.getAll(${dependencyString}))` : `(state) => (${stringFn})(state, ...state.getAll(${dependencyString}))`;
  globalThis.__SERVER_CURRENT_LOADHOOKS__.push({
    fn: wrapperFn,
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

// src/docs/utils/MEGALEXER.ts
var tokenize = (input) => {
  const tokens = [];
  const length = input.length;
  let index = 0;
  const keywords = /* @__PURE__ */ new Set([
    "if",
    "else",
    "for",
    "while",
    "function",
    "return",
    "class",
    "const",
    "let",
    "var",
    "interface",
    "extends",
    "implements",
    "export",
    "import",
    "from"
  ]);
  const operatorChars = /* @__PURE__ */ new Set([
    "+",
    "-",
    "*",
    "/",
    "%",
    "=",
    ">",
    "<",
    "!",
    "&",
    "|",
    "^",
    "~",
    "?",
    ":"
  ]);
  const punctuationChars = /* @__PURE__ */ new Set([
    ";",
    ",",
    ".",
    "(",
    ")",
    "{",
    "}",
    "[",
    "]"
  ]);
  const peek = (offset = 1) => index + offset < length ? input[index + offset] : "";
  const readWhile = (predicate) => {
    const start = index;
    while (index < length && predicate(input[index])) {
      index++;
    }
    return input.slice(start, index);
  };
  const readString = (quoteType) => {
    let value = input[index++];
    while (index < length && input[index] !== quoteType) {
      if (input[index] === "\\") {
        value += input[index++];
        if (index < length) {
          value += input[index++];
        }
      } else {
        value += input[index++];
      }
    }
    if (index < length) {
      value += input[index++];
    }
    return value;
  };
  const readLineComment = () => {
    const start = index;
    index += 2;
    while (index < length && input[index] !== "\n") {
      index++;
    }
    return input.slice(start, index);
  };
  const readBlockComment = () => {
    const start = index;
    index += 2;
    while (index < length && !(input[index] === "*" && peek() === "/")) {
      index++;
    }
    if (index < length) {
      index += 2;
    }
    return input.slice(start, index);
  };
  while (index < length) {
    const char = input[index];
    const startPos = index;
    if (/\s/.test(char)) {
      const value = readWhile((c) => /\s/.test(c));
      tokens.push({ type: "" /* Whitespace */, value, position: startPos });
      continue;
    }
    if (char === "/") {
      if (peek() === "/") {
        const value = readLineComment();
        tokens.push({ type: "text-gray-400" /* Comment */, value, position: startPos });
        continue;
      } else if (peek() === "*") {
        const value = readBlockComment();
        tokens.push({ type: "text-gray-400" /* Comment */, value, position: startPos });
        continue;
      }
    }
    if (char === '"' || char === "'") {
      const value = readString(char);
      tokens.push({ type: "text-green-200" /* String */, value, position: startPos });
      continue;
    }
    if (/\d/.test(char)) {
      const value = readWhile((c) => /[\d\.]/.test(c));
      tokens.push({ type: "text-blue-400" /* Number */, value, position: startPos });
      continue;
    }
    if (/[a-zA-Z_$]/.test(char)) {
      const value = readWhile((c) => /[a-zA-Z0-9_$]/.test(c));
      let type = "text-orange-300" /* Identifier */;
      if (keywords.has(value)) {
        type = "text-amber-100 font-semibold" /* Keyword */;
      } else if (value === "true" || value === "false") {
        type = "text-blue-200" /* Boolean */;
      }
      let tempIndex = index;
      while (tempIndex < length && /\s/.test(input[tempIndex])) {
        tempIndex++;
      }
      if (tempIndex < length && input[tempIndex] === "(") {
        type = "text-red-300" /* FunctionCall */;
      }
      tokens.push({ type, value, position: startPos });
      continue;
    }
    if (operatorChars.has(char)) {
      let value = char;
      index++;
      if (index < length && operatorChars.has(input[index])) {
        value += input[index++];
      }
      tokens.push({ type: "" /* Operator */, value, position: startPos });
      continue;
    }
    if (punctuationChars.has(char)) {
      tokens.push({ type: "text-gray-400" /* Punctuation */, value: char, position: startPos });
      index++;
      continue;
    }
    tokens.push({ type: "" /* Unknown */, value: char, position: startPos });
    index++;
  }
  return tokens;
};
var escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
var highlightCode = (code) => {
  const tokens = tokenize(code);
  return tokens.map(
    (token) => token.type === "" /* Whitespace */ ? token.value : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
  ).join("");
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
var escapeHtml2 = (str) => {
  const replaced = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return replaced;
};
var CodeBlock = (value, parse = true) => div(
  {
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode
  },
  pre({}, parse ? highlightCode(value) : escapeHtml2(value))
);

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
        ),
        NavSubLink(
          "/docs/page-files#event-listeners",
          "Event Listeners"
        ),
        NavSubLink(
          "/docs/page-files#layouts",
          "Layouts"
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

// src/docs/docs/components/Separator.ts
var Separator = () => div({
  class: "my-20"
}, []);

// src/docs/docs/components/Mono.ts
var Mono = (text) => span({
  class: "font-mono select-text"
}, text);

// src/docs/docs/components/Subtext.ts
var Subtext = (text) => span({
  class: "text-xs opacity-60",
  innerText: text
});

// src/docs/docs/basics/page.ts
var demoPageTS = `export const page = body ({
    style: "background-color: #000; color: #fff;",
},
    h1 ("Greetings Traveler!"),
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
var demoInfoTS = `export const metadata = () => head (
    title ("The BEST Page Ever!"),
);
`;
var demoIndexTs = `import { compile } from "elegance-js/build";

compile({
    environment: "development",
    outputDirectory: "./.elegance",
    pagesDirectory: "./pages",
    writeToHTML: true,
});`;
var demoFirstPage = `export const page = body ("Greetings Traveller!");`;
var metadata = () => head(
  {},
  link({
    rel: "stylesheet",
    href: "/index.css"
  }),
  title("Hi There!")
);
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
      br(),
      "There are absolutely no guarantees of backwards compatibility, security or really anything.",
      br(),
      "As such, elegance isn't really meant for production, yet."
    ),
    Separator(),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "What is Elegance?"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance is an opinionated, strict, compiled, fully-typescript, ",
      br(),
      "web-framework designed for building feature-rich, yet fast and efficient web pages.",
      br(),
      br(),
      "Elegance is written fully by hand, and dependencies are used ",
      b("very "),
      "sparsely.",
      br(),
      "As of writing, ",
      b("esbuild "),
      "is the only dependency.",
      br(),
      br(),
      "A simple, fully-working (non gzipped) elegance page transfers only ",
      b("4kB "),
      "of data!",
      img({
        class: "border-[1px] rounded-sm border-background-600 my-4",
        src: "/nullpage_size.png"
      }),
      'For context, an "empty" (gzipped)  react app on average transfers roughly ',
      b("200-300kB "),
      "of data.",
      br(),
      br(),
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
      br(),
      "We use filesystem routing, where each directory contains a ",
      Mono("page.ts"),
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
      "The page.ts file has two requirements, it must export a ",
      Mono("page"),
      " object, which is of type ",
      Mono('EleganceElement<"body">')
    ),
    CodeBlock(demoPageTS),
    p(
      {
        class: "opacity-80"
      },
      "and it must also export a ",
      Mono("metadata"),
      " function, which then resolves into an ",
      Mono('EleganceElement<"head">')
    ),
    CodeBlock(demoInfoTS),
    p(
      {
        class: "opacity-80"
      },
      "Elements are created using simple, ambient global functions.",
      br(),
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
      br(),
      "This is ",
      b("precisely "),
      "what the Elegance compiler does.",
      br(),
      br(),
      "It recursively goes through the page, notes down any points of interest (more on this later), ",
      br(),
      "and then serializes each element.",
      br(),
      br(),
      "The resulting data can then either be used to serve static HTML pages, ",
      br(),
      "(which still have all the normal features of Elegance, but won't get re-rendered),",
      br(),
      "or dynamically server-rendered content."
    ),
    p(
      {
        class: "opacity-80"
      },
      "Metadata is of course a function, so that you may dynamically generate page information. ",
      br(),
      br(),
      "This is useful for something like a social media page, ",
      br(),
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
      " which your project should call to build itself.",
      br(),
      "Compilation handles generating page_data files, ",
      "HTML, JSON, transpilation of ts into js, etc.",
      br(),
      br(),
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
      br(),
      "However, installation is still quite simple.",
      br(),
      br(),
      "First, decide where you'll want Elegance to live. ",
      br(),
      "On a linux-based system, somewhere like ",
      Mono("~/bin/elegance"),
      " is a good place.",
      br(),
      b("Just remember where it is! You'll need it later."),
      br(),
      br(),
      "Install ",
      a({
        href: "https://git-scm.com/",
        class: "border-b-2 border-text-50"
      }, "git"),
      " for your system, if you haven't already.",
      br(),
      br(),
      "Next, open a terminal / command prompt window, and issue the following the command."
    ),
    CodeBlock("git clone https://github.com/valdemar-dev/elegance-js [your destination folder]", false),
    p(
      {
        class: "opacity-80"
      },
      "You have now installed Elegance.JS onto your system. Congratulations!"
    ),
    Separator(),
    PageHeading(
      "Your First Page",
      "your-first-page"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Making a Project"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Now that Elegance is installed on your machine, it's time to make your first page.",
      br(),
      "With your terminal still open, go ahead and make a new a directory where your project will live.",
      br(),
      br(),
      "Once that's done, navigate to the directory you just made, and run this command."
    ),
    CodeBlock("npm init -y && npm install esbuild", false),
    p(
      {
        class: "opacity-80"
      },
      "This will initialize npm, and install ",
      b("esbuild"),
      ", Elegances only dependency.",
      br(),
      br(),
      "For the unitiated, esbuild is a ridiculously fast JS bundler written in Go."
    ),
    p(
      {
        class: "opacity-80"
      },
      "Next, you'll need to link Elegance to your project."
    ),
    CodeBlock("npm link [where you installed elegance]", false),
    Subtext("(you might need sudo for this if you're on linux)"),
    div({
      class: "my-10"
    }),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Typescript Configuration"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Now, for the TypeScript users, you'll want to do these next few steps.",
      br(),
      "First, boostrap a ",
      Mono("tsconfig.json"),
      " so typescript works properly.",
      br(),
      Subtext("Note: You might need to set your moduleResolution as bundler, or this might not work."),
      br(),
      br(),
      "Create a file at the root of your project called ",
      Mono("env.d.ts"),
      br(),
      "And put this inside of it."
    ),
    CodeBlock('/// <reference path="elegance-js/types/global" />', false),
    p(
      {
        class: "opacity-80"
      },
      "This takes the ambient global types from Elegance, and puts them into your project.",
      br(),
      "If all goes well, Elegance should be setup fully now!"
    ),
    div({
      class: "my-10"
    }),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Creating Pages"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Like we mentioned earlier, a page requires just one file. ",
      Mono("page.ts"),
      br(),
      "So, let's create that, shall we?",
      br(),
      br(),
      "At the root of your project, create a directory. You can call it pages, app, whatever you want.",
      br(),
      br(),
      "In this new directory, create a ",
      Mono("page.ts"),
      " file.",
      br(),
      "Just for a start, put something simple into it. Like this.",
      br(),
      "We'll get whacky and crazy later on, don't worry."
    ),
    CodeBlock(demoFirstPage),
    CodeBlock(demoInfoTS),
    div({
      class: "my-10"
    }),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Building your Project"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Create an ",
      Mono("index.ts"),
      " file at the root of your project.",
      br(),
      br(),
      "Elegance exposes the ",
      Mono("compile()"),
      " function from it's build process,",
      br(),
      "which we'll be using to compile your project."
    ),
    CodeBlock(demoIndexTs),
    p(
      {
        class: "opacity-80"
      },
      "Here's an example usage of the ",
      Mono("compile()"),
      " function.",
      br(),
      br(),
      Mono('environment: "development"'),
      br(),
      " Means that Elegance won't minify your page code, and will create a 'watch-server',",
      br(),
      "which will auto-reload your pages when you save them.",
      br(),
      br(),
      Mono('outputDirectory: "./.elegance"'),
      br(),
      " This is where Elegance will put it's compiled files into.,",
      br(),
      "We wouldn't recommend changing this, however, you can, if need be.",
      br(),
      br(),
      Mono('pagesDirectory: "./pages"'),
      br(),
      "This is the directory where you put your pages.",
      br(),
      "You should make it match whatever you named the directory obviously.",
      br(),
      br(),
      Mono("writeToHTML: true"),
      br(),
      "This makes Elegance write static HTML files, instead of keeping the generated page JSON",
      br(),
      "You can turn this off if you want to server render per-request.",
      br(),
      br(),
      ""
    ),
    div({
      class: "my-10"
    }),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Running your Project"
    }),
    p(
      {
        class: "opacity-80"
      },
      "You can choose how to run your own project. ",
      br(),
      "Elegance ",
      i("should "),
      "work with most JS runtimes like Node, Deno, etc.",
      br(),
      "However some (like Deno), may require a little tweaking.",
      br(),
      br(),
      Link(
        {
          href: "/docs/running",
          class: "border-b-2"
        },
        "More about running here."
      )
    ),
    div({
      class: "my-10"
    }),
    p(
      {
        class: "opacity-80"
      },
      "For the purposes of this tutorial, we'll try to keep it simple.",
      br(),
      "Simply issue the following commands in your terminal."
    ),
    CodeBlock("npx tsx index.ts", false),
    CodeBlock("python3 -m http.server 3000 -d .elegance", false),
    p(
      {
        class: "opacity-80"
      },
      "This'll take your ",
      Mono("index.ts"),
      " run it, and then serve the ",
      br(),
      "generated files over a simple Python HTTP server.",
      br(),
      br(),
      "And that's it! You can view your shiny new webpage at the URL, ",
      a(
        {
          href: "http://localhost:3000/",
          class: "border-b-2"
        },
        "localhost:3000."
      )
    )
  )
);
export {
  metadata,
  page
};
