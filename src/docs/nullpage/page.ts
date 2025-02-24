import { createEventListener, createState } from "../../server/createState";
import { observe } from "../../server/observe";

const counter = createState(0);

const increment = createEventListener({
    dependencies: [counter],
    eventListener: (event, counter) => {
        counter.value++;
        counter.signal();
    }
});

export const page = body ({
},
    p ({
        innerText: observe(
            [counter],
            (value) => `The Counter is at: ${value}`,
        )
    }),

    button ({
        onClick: increment,
    },
        "Increment Counter",
    ),
);
