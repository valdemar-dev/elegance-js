import { ClientComponent, Link, loadHook, observer, state } from "elegance-js";

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

    return div({
        
    });

}

export function metadata() {
    return []
}