import { RenderingMethod } from "../types/Metadata";
const renderElement = (element) => {
  if (typeof element === "string") {
    return element;
  }
  if (typeof element === "number") {
    return element;
  }
  if (typeof element !== "function") {
    throw "Cannot render non-functional elements.";
  }
  const builtElement = element();
  let returnHTML = "";
  returnHTML += `<${builtElement.tag}`;
  if (Object.hasOwn(builtElement, "getOptions")) {
    const options = builtElement.getOptions();
    for (const [key, value] of Object.entries(options)) {
      returnHTML += ` ${key}="${value}"`;
    }
  }
  if (!builtElement.children) {
    returnHTML += "/>";
    return returnHTML;
  }
  returnHTML += ">";
  for (const child of builtElement.children) {
    returnHTML += renderElement(child);
  }
  returnHTML += `</${builtElement.tag}>`;
  return returnHTML;
};
const generateHTMLTemplate = ({
  pageURL,
  head,
  renderingMethod,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  switch (renderingMethod) {
    case RenderingMethod.SERVER_SIDE_RENDERING:
      HTMLTemplate += `<script src="/SSRClient.js" defer="true"></script>`;
      break;
    case RenderingMethod.STATIC_GENERATION:
      HTMLTemplate += `<script src="/SSGClient.js" defer="true"></script>`;
      break;
    case RenderingMethod.CLIENT_SIDE_RENDERING:
      HTMLTemplate += `<script src="/CSRClient.js" defer="true"></script>`;
      break;
  }
  if (addPageScriptTag) {
    HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page.js" defer="true"></script>`;
  }
  const builtHead = head()();
  for (const child of builtHead.children) {
    HTMLTemplate += renderElement(child);
  }
  if (serverData) {
    HTMLTemplate += serverData;
  }
  return HTMLTemplate;
};
export {
  generateHTMLTemplate
};
