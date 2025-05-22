import { renderRecursively } from "./render";

export const generateHTMLTemplate = ({
    pageURL,
    head,
    serverData = null,
    addPageScriptTag = true,
}: {
    addPageScriptTag: boolean,
    pageURL: string,
    head: () => BuiltElement<"head">,
    serverData?: string | null,
}) => {
    let HTMLTemplate = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`
    HTMLTemplate += '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta charset="UTF-8">'

    if (addPageScriptTag === true) {
        HTMLTemplate += `<script type="module" src="${pageURL === "" ? "" : "/"}${pageURL}/page_data.js" defer="true"></script>`;
    }

    HTMLTemplate += `<script stype="module" src="/client.js" defer="true"></script>`;

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
