import { eventListener } from "../client/eventListener.js";
import { isAnElement } from "../elements/element.js";
function Link(options, ...children) {
    const handler = eventListener((event) => {
        const targetUrl = new URL(event.currentTarget.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        const isSameHost = targetUrl.hostname === currentUrl.hostname &&
            targetUrl.port === currentUrl.port;
        if (!isSameHost) {
            return;
        }
        event.preventDefault();
        eleganceClient.navigateLocally(targetUrl.pathname + targetUrl.search + targetUrl.hash, true);
    }, []);
    const extraOptions = options && typeof options === "object" ? options : {};
    const firstChild = isAnElement(options) ? options : undefined;
    return a({
        onClick: handler,
        ...extraOptions,
    }, ...(firstChild ? [firstChild, ...children] : children));
}
export { Link, };
