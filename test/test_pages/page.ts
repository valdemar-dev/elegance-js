import { effect, eventListener, state } from "elegance-js";

export function page() {
    const counter = state(0);

    effect(() => {
        console.log("counter changed");
    }, [counter])

    return div(
        button({
            onClick: eventListener((_, counter) => {counter.value += 1}, [counter])
        }, "increment")
    );
}

export function metadata() {}