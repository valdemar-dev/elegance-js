import { eventListener, SetEvent } from "../client/eventListener";
import { AnyElement, ElementOptionsOrChild, isAnElement } from "../elements/element";

/**
 * Create a custom anchor element that let's you hook into client-side navigation.
 * If provided a URL that is non-local, it will default to normal navigation.
 * @param options Standard element optins, must include href for the link to work properly.
 * @param children Standard element children.
 * @returns A custom anchor element.
 */

type ExtraOptions = {
    /** Mandatory, where this Link should take the user to. */
    href: string,
    /** Set window.scrollTop to 0 whenever this link navigates. */
    resetScrollOnNav?: boolean,
};

function Link(options: ElementOptionsOrChild<"a", ExtraOptions>, ...children: AnyElement[]) {
    const handler = eventListener((event: SetEvent<MouseEvent, HTMLAnchorElement>) => {
        const targetUrl = new URL(event.currentTarget.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        const isSameHost =
            targetUrl.hostname === currentUrl.hostname &&
            targetUrl.port === currentUrl.port;

        if (!isSameHost) {
            return;
        }

        event.preventDefault();

        eleganceClient.navigateLocally(targetUrl.pathname + targetUrl.search + targetUrl.hash, true);
    }, []);

    const extraOptions = options && typeof options === "object" ? options : {};
    const firstChild = isAnElement(options) ? options : undefined;

    return a(
        {
            onClick: handler,
            ...extraOptions,
        },
        ...(firstChild ? [firstChild, ...children] : children)
    );
}

export {
    Link,
}