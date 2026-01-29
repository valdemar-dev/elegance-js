import { eventListener, SetEvent } from "../client/eventListener";
import { AnyElement, ElementOptionsOrChild, isAnElement } from "../elements/element";

/**
 * Create a custom anchor element that let's you hook into client-side navigation.
 * @param options Standard element optins, must include href for the link to work properly.
 * @param children Standard element children.
 * @returns A custom anchor element.
 */
function Link(options: ElementOptionsOrChild<"a">, ...children: AnyElement[]) {
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

export {
    Link,
}