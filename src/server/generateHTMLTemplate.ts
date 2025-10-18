import { renderRecursively } from "./render";

export const generateHTMLTemplate = async ({
    pageURL,
    head,
    serverData = null,
    addPageScriptTag = true,
    name,
    requiredClientModules = [],
}: {
    addPageScriptTag: boolean,
    pageURL: string,
    head: Metadata,
    serverData?: string | null,
    name: string,
    requiredClientModules: string[],
}) => {
    
    let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    StartTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">'

    for (const module of requiredClientModules) {
        StartTemplate += `<script data-module="true" src="/shipped/${module}.js" defer="true"></script>`;
    }
    
    if (addPageScriptTag === true) {
        StartTemplate += `<script data-tag="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
    }

    StartTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
    
    let builtHead: AnyBuiltElement;
    
    if (head.constructor.name === "AsyncFunction") {
        builtHead = await head(StartTemplate);
    } else {
        builtHead = head(StartTemplate) as BuiltElement<"html">;
    }
    
    let HTMLTemplate = renderRecursively(builtHead);

    if (serverData) {
        HTMLTemplate += serverData;
    }

    HTMLTemplate += "";

    return HTMLTemplate;
};
