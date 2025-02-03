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
      class: "flex flex-col bg-background-50 px-4 py-2 min-w-[300px]"
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
    ul(
      {},
      li({}, "Getting Started")
    )
  );
};

// src/docs/page.ts
var state = createState({});
var page = body(
  {
    class: "bg-background-100 text-text-900 flex flex-row h-screen w-screen overflow-hidden"
  },
  Sidebar(),
  div({})
);
export {
  page,
  state
};
