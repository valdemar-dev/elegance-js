import { createState } from "../../server/createState";
import { eventListener } from "../../server/eventListener";
import { observe } from "../../server/observe";

const variables = createState({
    counter: 0,
});

const functions = createState({
    increment: eventListener(
        [variables.counter],
        (event, counter) => {
            counter.value++;
            counter.signal();
        }
    ),
})

export const page = body ({
},
    p ({
        innerText: observe(
            [variables.counter],
            (value) => `The Counter is at: ${value}`,
        )
    }),

    button ({
        onClick: functions.increment,
    },
        "Increment Counter",
    ),
);
