import { LayoutParams, Link } from "elegance-js";

export function layout({ child, }: LayoutParams) {
    return html(
        body(
            div({
                className: "h-12 w-full hover:bg-white duration-200 top-0 left-0 bg-yellow-300 right-0",
            },
                Link({
                    href: "/page-one",
                }, "page one"),

                Link({
                    href: "/page-two",
                }, "page two"),
            ),

            child({ 
                counter: 1,
            }),
        )
    )
}

export function metadata() {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ]
}