import { loadHook, state } from "elegance-js"

export function page() {
    const counter = state(1);

    function getCounter() {
        return Math.random() > 0.5 ? counter : null;
    }

    const counterTwo = getCounter()!;
    
    for (let i = 0; i < 100000; i++) {
        loadHook(() => {
            console.log("I am loadhook #", i)
            console.log(counterTwo.value);
        });
    }

    return div({
        className: "bg-black text-white",
    },
    );
}

export function metadata() {
    return [];
}