import { loadHook, observer, state } from "elegance-js";

export function page() {
    const time = state(0);

    loadHook((time) => {
        time.value = Date.now();

        const timerId = setInterval(() => {
            time.value += 11;
        }, 11);

        return () => clearInterval(timerId);
    }, [time])

    return div({
        innerText: observer((t) => `The time is: ${new Date(t).toLocaleTimeString("en-us")}`, [time])
    });
}

export function metadata() {
    return []
}

export const isDynamic = true;