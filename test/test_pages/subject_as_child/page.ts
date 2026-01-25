import { loadHook, state } from "elegance-js";

export function page() {
    const counter = state(0);

    loadHook((counter) => {
        setInterval(() => {
            counter.value++;
        }, 100)
    }, [counter])

    return div(
        "i am above counter: ",
        counter,
        "i am below counter",
    );
}

export function metadata() {
    return []
}