import { eventListener, SetEvent } from "../client/eventListener";
import { AnyElement, ElementOptionsOrChildElement, isAnElement } from "../elements/element";

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

export {
    Link,
}