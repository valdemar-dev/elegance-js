// src/server/createState.ts
var currentId = 0;
var createState = (augment) => {
  const state2 = {};
  for (const [key, value] of Object.entries(augment)) {
    state2[key] = {
      id: currentId++,
      value,
      type: 1 /* STATE */
    };
  }
  return state2;
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
                href: "/getting-started#cloning"
              },
              span(
                {
                  class: "opacity-80"
                },
                "Cloning This Repository"
              )
            )
          )
        )
      )
    )
  );
};

// src/docs/page.ts
var state = createState({});
var page = body(
  {
    class: "bg-background-100 text-text-900 flex flex-row h-screen w-screen overflow-hidden"
  },
  Sidebar()
);
export {
  page,
  state
};
