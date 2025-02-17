import { createEventListener } from "../server/createEventListener";
import { addPageLoadHooks } from "../server/addPageLoadHooks";
import { createState } from "../server/createState";

addPageLoadHooks([
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
                    __ELEGANCE_CLIENT__.fetchPage(href);
                    break;
                case "hover":
                    const fn = () => {
                        __ELEGANCE_CLIENT__.fetchPage(href);
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
                listener.el.removeEventListener("onmouseenter", listener.fn);
            }
        }
    }
])

const serverState = createState({
    navigate: createEventListener((state: State<typeof serverState>, event: MouseEvent) => {
        const target = new URL((event.currentTarget as HTMLLinkElement).href);

        const client = globalThis.__ELEGANCE_CLIENT__;

        const sanitizedTarget = client.sanitizePathname(target.pathname);
        const sanitizedCurrent = client.sanitizePathname(window.location.pathname);

        if (sanitizedTarget === sanitizedCurrent) {
            if (target.hash === window.location.hash)
                return event.preventDefault();
            return;  
        }

        event.preventDefault();

        client.navigateLocally(target.href);
    })
});

export const Link = (options: Record<string, any>, ...children: Child[]
) => {    
    if (!options.href) {
        throw `Link elements must have a HREF attribute set.`;
    }

    return a ({
        ...options,
        onClick: serverState.navigate
    },
        ...children,
    );
};
