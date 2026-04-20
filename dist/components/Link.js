import { eventListener } from "../client/eventListener";
import { isAnElement } from "../elements/element";
function Link(options, ...children) {
    const handler = eventListener((event) => {
        const targetUrl = new URL(event.currentTarget.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        const isSameHost = targetUrl.host === currentUrl.host;
        if (!isSameHost) {
            return;
        }
        event.preventDefault();
        eleganceClient.navigateLocally(targetUrl.href, true);
    }, []);
    const extraOptions = options && typeof options === "object" ? options : {};
    const firstChild = isAnElement(options) ? options : undefined;
    return a({
        onClick: handler,
        ...extraOptions,
    }, ...(firstChild ? [firstChild, ...children] : children));
}
export { Link, };
