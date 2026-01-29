import { loadHook, state, PageConstructor } from "elegance-js";

type RandomData = {
    content: string;
};

export const page: PageConstructor = ({ props, }) => {
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
    }, props.yes, clientData);

}

export function metadata() {
    return []
}