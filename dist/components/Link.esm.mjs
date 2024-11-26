import { getRouter } from '../helpers/getGlobals.esm.mjs';

const Link = (options, ...children) => {
    const { href } = options;
    if (!href)
        throw new Error("Links must specify an HREF, and that HREF much start with a /");
    const router = getRouter();
    router.prefetch(href);
    return a({
        ...options,
        href: href,
        onclick: async (ev) => {
            ev.preventDefault();
            if (href === window.location.pathname)
                return;
            router.navigate(href, true);
        },
    }, ...children);
};

export { Link };
//# sourceMappingURL=Link.esm.mjs.map
