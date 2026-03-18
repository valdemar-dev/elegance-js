import { eventListener } from "../client/eventListener.js";
import { isAnElement } from "../elements/element.js";
function Link(options, ...children) {
    const handler = eventListener((event) => {
        if (new URL(event.currentTarget.href, window.location.href).origin !== window.location.origin) {
            return;
        }
        event.preventDefault();
        eleganceClient.navigateLocally(event.currentTarget.href, true);
    }, []);
    const extraOptions = options && typeof options === "object" ? options : {};
    const firstChild = isAnElement(options) ? options : undefined;
    return a({
        onClick: handler,
        ...extraOptions,
    }, ...(firstChild ? [firstChild, ...children] : children));
}
export { Link, };
