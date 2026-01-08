export const layout = (child: any) => {
    return html(body(ol(li(child))));
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