import { loadHook, observer, state } from "elegance-js";

export function page() {
    const pathname = state("test");

    loadHook((pathname) => {
        pathname.value = window.location.pathname;
    }, [pathname]);

    return div({
    },
        p({
            innerText: observer((p) => {
                return `The pathname ${p} does not exist.`;
            }, [pathname])
        }),
    )
}

export function metadata() {
    return []
}