import { getRouter } from "../helpers/getGlobals.js";

const Link = (options: Record<string, any>, ...children: ElementChildren) => {
    const { href } = options;

    if (!href) throw new Error("Links must specify an HREF, and that HREF much start with a /");

    const router = getRouter();

    router.getPage(href);

    return a ({
        ...options,
        href: href,
        onclick: async (ev: MouseEvent) => {  
            ev.preventDefault();

            if (href === window.location.pathname) return;
            
            router.navigate(href, true);
        },
    }, 
        ...children
    );
};

export {
    Link,
}
