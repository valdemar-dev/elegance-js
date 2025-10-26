import { renderRecursively } from "./render";

export const generateHTMLTemplate = async ({
    pageURL,
    head,
    serverData = null,
    addPageScriptTag = true,
    name,
    requiredClientModules = {},
    environment,
}: {
    addPageScriptTag: boolean,
    pageURL: string,
    head: Metadata,
    serverData?: string | null,
    name: string,
    requiredClientModules: ShippedModules,
    environment: "development" | "production",
}) => {
    
    let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    
    if (environment === "production") {
        StartTemplate += `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
    }
    
    StartTemplate += '<meta charset="UTF-8">'

    for (const [globalName] of Object.entries(requiredClientModules)) {
        StartTemplate += `<script data-module="true" src="/shipped/${globalName}.js" defer="true"></script>`;
    }
    
    if (addPageScriptTag === true) {
        StartTemplate += `<script data-page="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
    }

    StartTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
    
    let builtHead: AnyBuiltElement;
    
    if (head.constructor.name === "AsyncFunction") {
        builtHead = await head();
    } else {
        builtHead = head() as BuiltElement<"html">;
    }
    
    let HTMLTemplate = renderRecursively(builtHead);

    if (serverData) {
        HTMLTemplate += serverData;
    }

    return {
        internals: StartTemplate,
        builtMetadata: HTMLTemplate,
    };
};
