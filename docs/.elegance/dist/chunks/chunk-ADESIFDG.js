// ../../libraries/elegance-js/dist/components/Link.js
var Link = component({ __id: "NBeH2j0",
  
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

export {
  Link_default
};
