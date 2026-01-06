export const page = () => {
    return h1({
        class: "bg-red-400",
    },
        "Hello World!",
    );
};

export const metadata = () => {
    return title("HELLO WORLD!");
};

export const isDynamic = false;