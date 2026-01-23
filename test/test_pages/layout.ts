export const layout = (child: any) => {
    return html(
        body({
            class: "bg-black text-white"
        },
            div({
                class: "h-8 bg-yellow-400",
            },
                p({ class: "text-black" }, "header"),
            ),

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