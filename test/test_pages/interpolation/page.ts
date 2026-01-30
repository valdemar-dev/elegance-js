import { eventListener, state, raw } from "elegance-js";

export function page() {
    const counter = state(0);

    const increment = eventListener((_, c) => c.value++, [counter]);

    const eleme = div(
        raw("<div>I'm a real surgeon!</div>"),
        "<div>I'm not a real surgeon!</div>",
    );

    console.log(eleme);

    return eleme;
}

export function metadata() {
    return []
}