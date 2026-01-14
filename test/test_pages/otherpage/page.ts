import { eventListener } from "../../../src/client/eventListener";
import { loadHook } from "../../../src/client/loadHook";
import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";

export const page = () => {
    const counter = state(1);

    const myEventListener = eventListener((_, counter) => {
        counter.value += 1;
    }, [counter]);

    loadHook((counter) => {
        const timerId = setInterval(() => {
            counter.value++;
        }, 100);

        return () => {
            clearInterval(timerId);
        }
    }, [counter]);

    return div({
        onClick: myEventListener,
        innerText: observer((counter) => {
            return counter.toString();
        }, [counter]),
    }, "This is otherpage");
};

export const metadata = () => {
    return []
};