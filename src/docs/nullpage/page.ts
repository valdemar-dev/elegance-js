import { createEventListener, createState } from "../../server/createState";
import { observe } from "../../server/observe";

const variables = createState({
    counter: 0,
});

const increment = createEventListener({
    dependencies: [variables.counter],
    eventListener: (event, counter) => {
        counter.value++;
        counter.signal();
    }
});

export const page = body ({
},
    p ({
        innerText: observe(
            [variables.counter],
            (value) => `The Counter is at: ${value}`,
        )
    }),

    button ({
        onClick: increment,
    },
        "Increment Counter",
    ),
);
