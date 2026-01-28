import { eventListener, SetEvent } from "../client/eventListener";
import { AnyElement, ElementOptionsOrChild, isAnElement } from "../elements/element";

function Link(options: ElementOptionsOrChild<any>, ...children: AnyElement[]) {
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