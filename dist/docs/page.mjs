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

// src/server/createEventListener.ts
var createEventListener = (fn) => fn;

// src/server/addPageLoadHooks.ts
var addPageLoadHooks = (hooks) => {
  globalThis.__SERVER_CURRENT_PAGELOADHOOKS__.push(...hooks);
};

// src/components/Link.ts
addPageLoadHooks([
  () => {
    const anchors = Array.from(document.querySelectorAll("a[prefetch]"));
    for (const anchor of anchors) {
      const prefetch = anchor.getAttribute("prefetch");
      const href = new URL(anchor.href);
      switch (prefetch) {
        case "load":
          __ELEGANCE_CLIENT__.fetchPage(href);
          break;
      }
    }
  }
]);
var serverState = createState({
  navigate: createEventListener((state, event) => {
    event.preventDefault();
    __ELEGANCE_CLIENT__.navigateLocally(event.target.href);
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

// src/docs/components/Header.ts
var serverState2 = createState({
  hasUserScrolled: false,
  interval: 0,
  globalTicker: 0,
  urmom: "hi"
});
addPageLoadHooks([
  (state) => {
    const hasScrolled = state.subjects.hasUserScrolled;
    const handleScroll = () => {
      const pos = {
        x: window.scrollX,
        y: window.scrollY
      };
      if (pos.y > 20) {
        if (hasScrolled.value === true) return;
        state.set(hasScrolled, true);
        state.signal(hasScrolled);
      } else {
        if (hasScrolled.value === false) return;
        state.set(hasScrolled, false);
        state.signal(hasScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }
]);
var Header = () => header(
  {
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
  },
  div(
    {
      class: observe(
        [serverState2.hasUserScrolled],
        (hasUserScrolled) => {
          console.log("change");
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
            class: "flex items-center gap-1 hover:cursor-none h-full"
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
          prefetch: "load",
          class: "z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950 hover:cursor-none",
          href: "/docs",
          innerText: "Docs"
        })
      )
    )
  )
);

// src/docs/page.ts
var pageTemplateString = `
import { createState } from "elegance-js/helpers/createState";
import { observe } from "elegance-js/helpers/observe"; 

export const serverState = createState({
    counter: 0,
})

export const page = body ({
    // Set any attribute you want.
    class: "bg-black text-white",
},
    p ({ 
        // No black-boxes, just the observer pattern.
        innerText: observe({
            // Types and values inferred!
            [serverState.counter],
            // Whenever a value in the above id list changes, 
            // this function gets called with the new values. (fully type-safe!) 
            (counterValue) => \`\${counterValue}\`,
        })
    }),

    button ({
        onClick: eventListener((state: State<typeof serverState>) => {
            const counter = state.subjects.counter;

            state.set(counter, counter.value + 1);

            // Explicit state signalling!
            state.signal(counter)
        })
    })
)
`;
var convertToSpans = (inputString) => {
  const tokenMap = {
    "const": "text-orange-400",
    "return": "text-orange-400",
    "body": "text-orange-400",
    "observe": "text-orange-400",
    "createState": "text-orange-400",
    "p": "text-orange-400",
    "button": "text-orange-400",
    "initializePage": "text-orange-400",
    "getState": "text-orange-400",
    "ids": "text-purple-400",
    "state": "text-purple-400",
    "signal": "text-red-400",
    "create": "text-red-400",
    "set": "text-red-400",
    "get": "text-red-400",
    "export": "text-red-400",
    "update": "text-red-400",
    "import": "text-red-400",
    "from": "text-red-400",
    "onClick": "text-orange-200",
    "staticProperty": "text-orange-200",
    "innerText": "text-orange-200",
    "class": "text-orange-200",
    "dynamicProperty": "text-orange-200"
  };
  const regex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|\b(?:const|observe|createState|export|import|from|staticProperty|dynamicProperty|return|body|p|button|onClick|ids|update|innerText|class|signal|state|create|set|get|initializePage)\b|"(?:\\.|[^"\\])*"|\${[^}]*}|`(?:\\.|[^`\\])*`/g;
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
var page = body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
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
        class: "mt-4 bg-background-950 p-4 rounded-md mb-8 sm:mb-20"
      },
      div(
        {},
        h2({
          class: "text-sm sm:text-base text-text-200",
          innerText: "/pages/page.js"
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
      class: "max-w-[900px] w-full mx-auto px-4"
    },
    h2({
      class: "text-xl sm:text-3xl font-bold mb-4",
      innerText: "Key Features"
    }),
    section(
      {
        class: "mb-10 pb-4 border-b-[1px] border-background-800"
      },
      h3({
        class: "text-base sm:text-lg font-semibold mb-2",
        innerText: "Simple by Design"
      }),
      p(
        {
          class: "text-xs sm:text-sm text-text-100 leading-5"
        },
        "Elegance is not a ",
        b("black box "),
        "with thousands of moving parts, nor does it have 10 years of tech-debt.",
        br({}),
        "Everything is made in-house using as few depencencies as possible (1), with ",
        b("modern vanilla typescript. "),
        br({}),
        br({}),
        "By learning Elegance, you know ",
        b("exactly "),
        "how it works, and what it does.",
        br({}),
        "This ",
        b("in-depth knowledge "),
        "allows you to utilize Elegance to it's fullest, allowing you to create the best user experience."
      )
    ),
    section(
      {
        class: "mb-10 pb-4 border-b-[1px] border-background-800"
      },
      h3({
        class: "text-base sm:text-lg font-semibold mb-2",
        innerText: "Fully Reactive"
      }),
      p(
        {
          class: "text-xs sm:text-sm text-text-100 leading-5"
        },
        "Things you've come to learn, or even love from React like ",
        b("functional components, "),
        b("conditional rendering, "),
        b("client-side navigation, "),
        "etc. Are all fully available in Elegance; no extra packages needed."
      )
    ),
    section(
      {
        class: "mb-10 pb-4 border-b-[1px] border-background-800"
      },
      h3({
        class: "text-base sm:text-lg font-semibold mb-2",
        innerText: "Strict & Opinionated"
      }),
      p(
        {
          class: "text-xs sm:text-sm text-text-100 leading-5"
        },
        "Developers are",
        b(" lazy"),
        ". Which is not as bad as it sounds. ",
        "However, it does mean that if you give them",
        b(" 10 "),
        "ways of doing something, ",
        "they will choose the way that is",
        b(" quickest, "),
        b(" easiest "),
        "and",
        b(" most "),
        b(" comfortable "),
        "to them.",
        br({}),
        br({}),
        "This often results in sub-optimal code. ",
        "It's impacts may not always be apparent, and sometimes may not show at all for a while, ",
        "however when put to scale, small issues become big issues. ",
        br({}),
        br({}),
        "By forcing developers to code correctly, you can prevent these issues from ever become ones in the first place.",
        br({}),
        b("Elegance Page Rater "),
        "can be mounted on any page to address things like contrast, alt descriptors, component render time, etc."
      )
    )
  )
);
export {
  page
};
