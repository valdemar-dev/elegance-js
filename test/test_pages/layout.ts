import { LayoutConstructor, ClientComponent, loadHook, state } from "elegance-js";

const layout: LayoutConstructor = (child) => {
    const pagename = state("");

    loadHook((pagename) => {
        pagename.value = window.location.pathname;

        const idx = eleganceClient.onNavigate(() => {
            pagename.value = window.location.pathname;
        });

        return () => eleganceClient.removeNavigationCallback(idx);
    }, [pagename]);

    return html(
        body(
            child({ yes: true, }),
        ),
    );
};

export const metadata = () => {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ];
};
export const isDynamic = false;