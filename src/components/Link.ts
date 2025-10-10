import { loadHook, state, SetEvent, eventListener } from "../index";

loadHook(
    [],
    () => {
        const anchors = Array.from(document.querySelectorAll("a[prefetch]"));

        const elsToClear: Array<{
            el: HTMLLinkElement,
            fn: () => any,
        }> = [];

        for (const anchor of anchors) {
            const prefetch = anchor.getAttribute("prefetch");

            const href = new URL((anchor as HTMLLinkElement).href);

            switch (prefetch) {
                case "load":
                    client.fetchPage(href);
                    break;
                case "hover":
                    const fn = () => {
                        client.fetchPage(href);
                    };

                    anchor.addEventListener("mouseenter", fn);

                    elsToClear.push({
                        el: anchor as HTMLLinkElement,
                        fn: fn,
                    });

                    break;
            }
        }

        return () => {
            for (const listener of elsToClear) {
                listener.el.removeEventListener("mouseenter", listener.fn);
            }
        }
    },
)

const navigate = eventListener(
    [],
    (event: SetEvent<MouseEvent, HTMLLinkElement>) => {
        const target = new URL(event.currentTarget.href);

        const client = globalThis.client;

        const sanitizedTarget = client.sanitizePathname(target.pathname);
        const sanitizedCurrent = client.sanitizePathname(window.location.pathname);

        if (sanitizedTarget === sanitizedCurrent) {
            if (target.hash === window.location.hash) return event.preventDefault();
            return;
        }

        event.preventDefault();

        client.navigateLocally(target.href);
    }
);

export const Link = (options: Record<string, any>, ...children: Child[]
) => {    
    if (!options.href) {
        throw `Link elements must have a HREF attribute set.`;
    }

    if (!options.href.startsWith("/")) {
        throw `Link elements may only navigate to local pages. "/"`
    }

    return a ({
        ...options,
        onClick: navigate,
    },
        ...children,
    );

};
