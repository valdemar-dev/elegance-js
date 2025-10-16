import { renderRecursively } from "./render";

export const generateHTMLTemplate = ({
    pageURL,
    head,
    serverData = null,
    addPageScriptTag = true,
    name,
    requiredClientModules = [],
}: {
    addPageScriptTag: boolean,
    pageURL: string,
    head: () => BuiltElement<"head">,
    serverData?: string | null,
    name: string,
    requiredClientModules: string[],
}) => {
    let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`
    HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">'

    for (const module of requiredClientModules) {
        HTMLTemplate += `<script src="/shipped/${module}.js" defer="true"></script>`;
    }
    
    if (addPageScriptTag === true) {
        HTMLTemplate += `<script data-tag="true" type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/${name}_data.js" defer="true"></script>`;
    }

    HTMLTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
    

    const builtHead = head();
    
    for (const child of builtHead.children) {
        HTMLTemplate += renderRecursively(child);
    }

    if (serverData) {
        HTMLTemplate += serverData;
    }

    HTMLTemplate += "</head>";

    return HTMLTemplate;
};
