import { loadHook, observer, state } from "elegance-js";

export function page() {
    const pathname = state("test");

    loadHook((pathname) => {
        pathname.value = window.location.pathname;
    }, [pathname]);

    return div({
    },
        p({},
            "The pathname ",
            pathname,
            " is not a real pathname you little liar.",
        ),
    )
}

export function metadata() {
    return []
}