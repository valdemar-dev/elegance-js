import { AnyElement, loadHook, observer, state } from "elegance-js";

function Header() {
    const pathname = state("");

    loadHook((pathname) => {
        pathname.value = window.location.pathname;

        const id = eleganceClient.onNavigate((newPathname) => {
            pathname.value = newPathname;
        });

        return () => eleganceClient.removeNavigationCallback(id);
    }, [pathname])

    return div({
        class: "px-4 py-2 w-max rounded-md bg-green-400 text-black"
    },
        "Currently visiting: ",

        span({
            innerText: observer(pathname)
        }),
    );
}

export function layout(child: any) {
    return html(
        body({
            class: "bg-black text-white h-screen w-screen grid grid-cols-1 p-4 gap-4 grid-rows-[auto_1fr]",
        },
            Header(),

            child({}),
        ),
    );
}

export function metadata() {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ]
}