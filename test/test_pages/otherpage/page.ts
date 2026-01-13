import { eventListener } from "../../../src/client/eventListener";
import { state } from "../../../src/client/state";

export const page = () => { 
    const counter = state(1);

    const myEventListener = eventListener((_, counter) => {
        alert("HELLO!");
    }, [counter]);

    return div({
        onClick: myEventListener,
    }, "This is otherpage");

};

export const metadata = () => {
    return []
};