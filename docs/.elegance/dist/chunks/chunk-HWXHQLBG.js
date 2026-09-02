// pages/components/nav.ts
var Navbar = component({ __id: "8xBIPlt",
  atoms: { pinned: false },
  onMount: (_, { pinned }) => {
    window.addEventListener("scroll", () => {
      pinned.value = window.scrollY > 32;
    }, { passive: true });
  },
  view: ({ atoms: { pinned } }) => __tags.nav(
    { class: pinned.value ? "nav nav--pinned" : "nav" },
    __tags.div(
      { class: "nav-wrap" },
      __tags.a(
        { href: "/", onClick: (_, e) => {
          e.preventDefault();
          navigate("/");
        }, class: "nav-logo" },
        __tags.svg(
          { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": "true" },
          __tags.polygon({ points: "12,1 23,12 12,23 1,12", fill: "none", stroke: "var(--amber)", "stroke-width": "1.5" }),
          __tags.circle({ cx: 12, cy: 12, r: 2.5, fill: "var(--amber)" })
        ),
        __tags.span({ class: "nav-wordmark" }, "ELEGANCE")
      ),
      __tags.div(
        { class: "nav-links" },
        __tags.a({ href: "#examples", onClick: (_, e) => {
          e.preventDefault();
          navigate("/#examples");
        }, class: "nav-link" }, "Examples"),
        __tags.a({ href: "/speed", onClick: (_, e) => {
          e.preventDefault();
          navigate("/speed");
        }, class: "nav-link nav-link--speed" }, "Speed"),
        __tags.a({ href: "/docs/start/setup", onClick: (_, e) => {
          e.preventDefault();
          navigate("/docs/start/setup");
        }, class: "nav-link" }, "Docs"),
        __tags.a(
          {
            href: "https://github.com/valdemar-dev/elegance-js",
            class: "nav-gh",
            rel: "noopener noreferrer",
            target: "_blank"
          },
          __tags.svg(
            { width: 15, height: 15, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
            __tags.path({ d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s1.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A11.02 11.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" })
          ),
          "GitHub"
        )
      )
    )
  )
});

export {
  Navbar
};
