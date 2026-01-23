import { loadHook } from "../../src/client/loadHook";
import { observer } from "../../src/client/observer";
import { state } from "../../src/client/state";

export function page() {
    const pathname = state("test");

    loadHook((pathname) => {
        pathname.value = window.location.pathname;
    }, [pathname]);

    return div({
    },
        p({
            innerText: observer((p) => {
                return `The ${pathname} does not exist.`;
            }, [pathname])
        }),
    )
}

export function metadata() {
    return []
}