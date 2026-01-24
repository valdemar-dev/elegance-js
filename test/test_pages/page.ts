import { ClientComponent, loadHook, state } from "elegance-js";

type RandomData = {
    content: string;
};

export function page() {
    const clientData = state<RandomData | null>(null);

    const links = [
        {
            target: "/blog",
            name: "Blog",
        },
        {
            target: "/what-time-is-it",
            name: "What time is it?",
        },
    ];

    loadHook((clientData) => {
        const timeoutId = setTimeout(() => {
            clientData.value = { content: "HI!", };
        }, 1000)

        return () => clearTimeout(timeoutId);
    }, [clientData]);

    return ClientComponent((clientData) => {
        if (clientData.value === null) {
            return div("Loading...");
        }

        return div(clientData.value.content);
    }, [clientData]);
}

export function metadata() {
    return []
}