export const layout = (child: any) => {
    return html(
        body({
            class: "bg-black text-white"
        },
            child,
        )
    );
};

export const metadata = () => {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ];
};
export const isDynamic = false;