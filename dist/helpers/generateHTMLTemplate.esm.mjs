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
const generateHTMLTemplate = ({ pageURL, head, serverData = null, }) => {
    let HTMLTemplate = `<script type="module" elegance-script="true" src="${pageURL}/page.js" defer=true></script>` +
        `<script type="module" elegance-script="true" src="client.js" defer=true></script>` +
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    const builtHead = head()();
    for (const child of builtHead.children) {
        HTMLTemplate += renderElement(child);
    }
    if (serverData) {
        HTMLTemplate += serverData;
    }
    return HTMLTemplate;
};

export { generateHTMLTemplate };
//# sourceMappingURL=generateHTMLTemplate.esm.mjs.map
