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

// pages/demo/layout-import.tsx
var thing = "asdf";
var layout_import_default = thing;

// pages/demo/layout.tsx
function Layout({ child: Child }) {
  return __tags.div(["mashallah this is the layout:", Header(), Link_default({ href: "/" }, ["layout link"]), Child(), "layout end here", layout_import_default]);
}
export {
  Layout as default
};
