// src/helpers/getGlobals.ts
var getRouter = () => globalThis.eleganceRouter;

// src/components/Link.ts
var Link = (options, ...children) => {
  const { href } = options;
  if (!href) throw new Error("Links must specify an HREF, and that HREF much start with a /");
  const router = getRouter();
  router.prefetch(href);
  return a(
    {
      ...options,
      href,
      onclick: async (ev) => {
        ev.preventDefault();
        if (href === window.location.pathname) return;
        router.navigate(href, true);
      }
    },
    ...children
  );
};
export {
  Link
};