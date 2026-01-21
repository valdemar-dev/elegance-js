import { state } from "../../../src/client/state";
import { loadHook } from "../../../src/client/loadHook";

export const page = () => {
    const arrayState = state([1,2,3]);
    const test = state("hello");

    loadHook((arrayState, test) => {
        const timerId = setInterval(() => {
            arrayState.value.push(arrayState.value.length+1);
            arrayState.triggerObesrvers();

            if (Math.random() > 0.7) {
                arrayState.value = [];
            }
        }, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, [arrayState, test]);

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