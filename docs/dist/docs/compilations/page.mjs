// src/docs/components/RootLayout.ts
var RootLayout = (...children) => body(
  {
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
  },
  ...children
);

// src/docs/docs/compilations/page.ts
var page = RootLayout();
var metadata = () => head();
export {
  metadata,
  page
};
