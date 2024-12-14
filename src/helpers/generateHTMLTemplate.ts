import { RenderingMethod } from "../types/Metadata";

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
    renderingMethod, 
    serverData = null,
    addPageScriptTag = true,
}: {
    renderingMethod: RenderingMethod,
    addPageScriptTag: boolean,
    pageURL: string,
    head: () => BuildableElement<"head">,
    serverData?: string | null,
}) => {
    let HTMLTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

    switch (renderingMethod) {
        case (RenderingMethod.SERVER_SIDE_RENDERING):
            HTMLTemplate += `<script stype="module" rc="/client_ssr.js" defer="true"></script>`;
            break;

        case (RenderingMethod.STATIC_GENERATION):
            HTMLTemplate += `<script stype="module" rc="/client_ssg.js" defer="true"></script>`;
            break;

        case (RenderingMethod.CLIENT_SIDE_RENDERING):
            HTMLTemplate += `<script type="module" src="/client_csr.js" defer="true"></script>`;
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
