

export const layout: Layout = (child) => {
    return body({
        class: "bg-black text-white",
    },
        header({}),
        
        child,
    );
};

export const metadata = (child: Child) => {
    return html({
        lang: "en",
    },
        child,
        
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    );
};