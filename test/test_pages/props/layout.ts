import type { LayoutParams } from "elegance-js";

export function layout(params: LayoutParams) {
    return div(
        params.child({ passedProp: "Hello, World!" }),
    );
}

export function metadata() {
    return [
        title("you're within the props directory")
    ];
}