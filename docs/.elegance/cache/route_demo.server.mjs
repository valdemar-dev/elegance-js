// ../../libraries/elegance-js/dist/components/Link.js
var Link = component({ __id: "NBeH2j0",
  init(self) {
    if (!self.props.href) {
      throw new Error("Link components require an HREF attribute to be set. Received: " + self.props.href);
    }
  },
  onMount(self) {
    if (self.props.preload === "load") {
      fetchPage(self.props.href);
    }
  },
  view({ self, children }) {
    return __tags.a(
      {
        ...self.props,
        onClick(_, event) {
          event.preventDefault();
          navigate(self.props.href, true, self.props.doViewTransition);
        },
        onMouseenter() {
          if (self.props.preload !== "hover") {
            return;
          }
          fetchPage(self.props.href);
        }
      },
      ...children
    );
  }
});
var Link_default = Link;

// pages/demo/components/Header.tsx
function Header() {
  return __tags.div([Link_default({ href: "/" }, ["GO TO ROOT"])]);
}

// pages/demo/page.tsx
var UNUSED_VARIABLE = 1234;
var BUILD_TIME = Date.now();
function Page() {
  return __tags.main([Link_default({ href: "/demo" }, ["demo's page link"]), "This page was built at:", BUILD_TIME.toString(), Header()]);
}
export {
  Page as default
};
