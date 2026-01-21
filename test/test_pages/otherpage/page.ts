import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";
import { loadHook } from "../../../src/client/loadHook";
import { eventListener } from "../../../src/client/eventListener";

export const page = () => {
    const arrayState = state([1,2,3]);
    const test = state("hello");

    loadHook((arrayState, test) => {
        setTimeout(() => {
            arrayState.value.push(2);
        }, 1000)
    }, [arrayState, test]);

    eventListener((_, arrayState) => {
        arrayState
    }, [arrayState]);

    return div({
        class: "flex flex-col gap-4"
    }, 
        div("the reactive map is below me"),

        arrayState.reactiveMap((value) => {
            return div(value.toString());
        }),

        div("the reactive map is above me"),
    );
};

export const metadata = () => {
    return []
};