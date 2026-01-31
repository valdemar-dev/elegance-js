import { Child } from "elegance-js";

export function layout({ child }: { child: Child}) {

    return html(
        body(
            child({}),
        ),
    )
}

export function metadata() {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ];
}