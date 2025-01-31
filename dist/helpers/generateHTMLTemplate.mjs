// src/helpers/generateHTMLTemplate.ts
var renderElement = (element) => {
  if (typeof element === "string") {
    return element;
  }
  if (typeof element === "number") {
    return element;
  }
  if (typeof element === "boolean") return null;
  if (Array.isArray(element)) {
    return element.join(", ");
  }
  let returnHTML = "";
  returnHTML += `<${element.tag}`;
  if (Object.hasOwn(element, "options")) {
    const options = element.options;
    for (const [key, value] of Object.entries(options)) {
      returnHTML += ` ${key}="${value}"`;
    }
  }
  if (!element.children) {
    returnHTML += "/>";
    return returnHTML;
  }
  returnHTML += ">";
  for (const child of element.children) {
    returnHTML += renderElement(child);
  }
  returnHTML += `</${element.tag}>`;
  return returnHTML;
};
var generateHTMLTemplate = ({
  pageURL,
  head,
  serverData = null,
  addPageScriptTag = true
}) => {
  let HTMLTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  if (addPageScriptTag === true) {
    HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page.js" defer="true"></script>`;
  }
  HTMLTemplate += `<script stype="module" src="/client.js" defer="true"></script>`;
  const builtHead = head();
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
