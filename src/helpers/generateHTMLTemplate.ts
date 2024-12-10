const renderElement = (element: Child) => {
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
        const options = (builtElement as BuiltElement<string>).getOptions();

        for (const [key, value] of Object.entries(options)) {
            returnHTML += ` ${key}="${value}"`
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

    returnHTML += `</${builtElement.tag}>`

    return returnHTML;
};

export const generateHTMLTemplate = ({
    pageURL,
    head,
    serverData = null,
}: {
    pageURL: string,
    head: () => BuildableElement<"head">,
    serverData?: string | null,
}) => {
    let HTMLTemplate = 
        `<script type="module" elegance-script="true" src="${pageURL}/page.js" defer=true></script>` +
        `<script type="module" elegance-script="true" src="client.js" defer=true></script>` +
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

    const builtHead = head()();

    for (const child of builtHead.children) {
        HTMLTemplate += renderElement(child);
    }

    if (serverData) {
        HTMLTemplate += serverData;
    }

    return HTMLTemplate;
};
