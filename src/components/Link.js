import "../bindElements";

const Link = (options, ...children) => {
    const { href } = options;

    if (!href) throw new Error("Links must specify an HREF that starts with a /");

    const router = globalThis.eleganceRouter;

    router.prefetch(href);

    return a ({
        ...options,
        href: href,
        onclick: async (ev) => {  
            ev.preventDefault();
            
            router.navigate(href, true);
        },
    }, 
        ...children
    );
};

export {
    Link,
}
