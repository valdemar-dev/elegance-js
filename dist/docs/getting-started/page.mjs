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

// src/docs/components/sidebar.ts
var Sidebar = () => {
  return nav(
    {
      class: "flex flex-col bg-background-50 px-4 py-2 min-w-[300px] pt-4"
    },
    div(
      {
        class: "flex items-center gap-1"
      },
      span({
        class: "text-2xl font-fancy"
      }, "Elegance"),
      span({
        class: "text-3xl font-bold text-text-600 relative"
      }, "JS")
    ),
    hr({
      class: "my-3 border-background-200"
    }),
    ul(
      {
        class: "mt-4"
      },
      li(
        {},
        span(
          {
            class: "font-fancy text-text-900"
          },
          "Getting Started"
        ),
        ul(
          {
            class: "ml-2 pl-3 flex flex-col border-l-[1px] mt-1"
          },
          li(
            {
              class: "text-sm text-text-950"
            },
            a(
              {
                href: "/getting-started/#install"
              },
              span(
                {
                  class: "opacity-80"
                },
                "Installing Elegance.JS"
              )
            )
          )
        )
      )
    )
  );
};

// src/docs/getting-started/page.ts
var state = createState({});
var page = body(
  {
    class: "max-w-[1200px] w-full mx-auto bg-background-50 text-text-950 flex flex-row h-screen w-screen overflow-hidden"
  },
  Sidebar(),
  div(
    {
      class: "p-8 w-full"
    },
    h1({
      class: "text-3xl font-fancy font-semibold mb-6 text-text-900",
      innerText: "Getting Started"
    }),
    h2({
      id: "install",
      class: "text-xl font-fancy mb-4",
      innerText: "1. Install Elegance.JS"
    }),
    p(
      {
        class: "max-w-[60ch]"
      },
      "As Elegance.JS is still in early development, installing is done via our ",
      a({
        href: "https://github.com/valdemar-dev/elegance-js",
        class: "border-b-2"
      }, "GitHub. "),
      "Simply navigate there, and download or git clone it. Take note of where you place Elegance.JS. ",
      br({})
    )
  )
);
export {
  page,
  state
};
