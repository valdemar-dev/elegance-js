import { Child } from "elegance-js";

export function layout({ props, child }: { props: { counter: number }, child: Child }) {
    console.log("within nested layout, counter is:", props.counter);

    return div(
        child(props),
    );
}

export function metadata() {
    return [];
}

export const isDynamic = true;