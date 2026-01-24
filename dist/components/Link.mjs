import { eventListener } from "../../src/client/eventListener";
import { isAnElement } from "../../src/elements/element";
function Link(options, ...children) {
  const handler = eventListener((event) => {
    event.preventDefault();
    eleganceClient.navigateLocally(event.currentTarget.href, true);
  }, []);
  const extraOptions = typeof options === "object" ? options : {};
  const firstChild = isAnElement(options) ? options : void 0;
  return a(
    {
      onClick: handler,
      ...extraOptions
    },
    ...firstChild ? [firstChild, ...children] : children
  );
}
export {
  Link
};
