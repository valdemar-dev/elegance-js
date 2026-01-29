import { loadHook, state, PageConstructor, ServerSubject, observer } from "elegance-js";

type RandomData = {
    content: string;
};

export const page = ({ props: { isDarkModeActive }, }: { props: { isDarkModeActive: ServerSubject<boolean>, }}) => {
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

    loadHook((clientData, isDarkModeActive) => {
        const timeoutId = setTimeout(() => {
            clientData.value = { content: "HI!", };
            isDarkModeActive.value = true;
        }, 1000)

        return () => clearTimeout(timeoutId);
    }, [clientData, isDarkModeActive]);

    return div({
        className: observer((dm) => {
            return dm ? "bg-black text-white" : "bg-white text-black";
        }, [isDarkModeActive]),
    },

        "hello",
    );
}

export function metadata() {
    return []
}