import { eventListener, SetEvent } from "../../src/client/eventListener";
import { AnyElement, ElementOptionsOrChildElement, isAnElement } from "../../src/elements/element";

function Link(options: ElementOptionsOrChildElement, ...children: AnyElement[]) {
    const handler = eventListener((event: SetEvent<MouseEvent, HTMLAnchorElement>) => {
        event.preventDefault();

        eleganceClient.navigateLocally(event.currentTarget.href, true);
    }, []);

    const extraOptions = typeof options === "object" ? options : {};
    const firstChild = isAnElement(options) ? options : undefined;

    return a({
        onClick: handler,
        ...extraOptions,
    },
        ...(firstChild ? [firstChild, ...children] : children)
    );
}

export function page() {
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

    return div(
        "mapped links",
        br(),
        ...links.map(v => Link({ 
            href: v.target 
        }, 
            v.name,
        ))
    );
}

export function metadata() {
    return []
}