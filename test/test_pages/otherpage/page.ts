import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";

export const page = () => {
    const message = state("HELLOTHERE");
    const arrayState = state([1,2,3]);

    arrayState.reactiveMap(() => {
        return div();
    });

    return div({
        innerText: observer((c) => c.toString(), [message]),
    }, 

        div({
            class: "what the flip"
        }),
    );
};

export const metadata = () => {
    return []
};