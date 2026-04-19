import { loadHook, state } from "elegance-js"

function counter() {
    const counter = state(1);
    
    loadHook(() => {
        for (let i = 0; i < 10; i++) {
            counter.value++;
        } 
    });

    return div();
}

export function page() {

    return div({
        className: "bg-black text-white",
    },
        h1("this is static"),

        counter(),
    );
}

export function metadata() {
    return [];
}