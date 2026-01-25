import { ClientComponent, loadHook, state } from "elegance-js";

export const layout = (child: any) => {
    const pagename = state("");

    loadHook((pagename) => {
        pagename.value = window.location.pathname;

        const idx = eleganceClient.onNavigate(() => {
            pagename.value = window.location.pathname;
        });

        return () => eleganceClient.removeNavigationCallback(idx);
    }, [pagename]);

    return html(body(child));
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