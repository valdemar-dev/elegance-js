import { eventListener } from "../../../src/client/eventListener";
import { loadHook } from "../../../src/client/loadHook";
import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";

export const page = () => {
    const counter = state(1);

    loadHook((counter) => {
        const timerId = setInterval(() => {
            counter.value++;
        }, 100);

        return () => {
            clearInterval(timerId);
        }
    }, [counter]);

    return div({
        onClick: eventListener((_, counter) => counter.value++, [counter]),
        innerText: observer((c) => c.toString(), [counter]),
    }, 
        "This is otherpage",

        div({
            class: "what the flip"
        }, undefined),
    );
};

export const metadata = () => {
    return []
};