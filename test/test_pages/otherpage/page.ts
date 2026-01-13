import { eventListener } from "../../../src/client/eventListener";
import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";

export const page = () => {
    const counter = state(1);

    const interval = state(() => {
        setInterval(() => {
            counter.value += 1;
        }, 100)
    });

    const myEventListener = eventListener((_, counter, interval) => {
        counter.value += 1;
    }, [counter, interval]);

    return div({
        onClick: myEventListener,
        innerText: observer((counter) => {
            console.log("OBSERVER HAS BEEN TRIGGERED")

            return counter.toString();
        }, [counter]),
    }, "This is otherpage");
};

export const metadata = () => {
    return []
};