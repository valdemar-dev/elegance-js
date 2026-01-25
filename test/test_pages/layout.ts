import { ClientComponent, loadHook, state } from "elegance-js";

export const layout = (child: any) => {
    const pagename = state("");

    loadHook((pagename) => {
            console.log("layout one is called");

        pagename.value = window.location.pathname;

        eleganceClient.onNavigate(() => {
            pagename.value = window.location.pathname;
        });

        return () => {
            console.log("layout one's cleanup is called");
        };
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