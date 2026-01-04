import { renderRecursively } from "./render";
const generateHTMLTemplate = async ({
  pageURL,
  head,
  serverData = null,
  addPageScriptTag = true,
  name,
  requiredClientModules = {},
  environment
}) => {
  let StartTemplate = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  if (environment === "production") {
    StartTemplate += `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
  }
  StartTemplate += '<meta charset="UTF-8">';
  for (const [globalName] of Object.entries(requiredClientModules)) {
    StartTemplate += `<script data-module="true" src="/shipped/${globalName}.js" defer="true"></script>`;
  }
  if (addPageScriptTag === true) {
    const sanitized = pageURL === "" ? "/" : `/${pageURL}`;
    StartTemplate += `<script data-page="true" type="module" data-pathname="${sanitized}" src="${sanitized.endsWith("/") ? sanitized : sanitized + "/"}${name}_data.js" defer="true"></script>`;
  }
  StartTemplate += `<script type="module" src="/client.js" defer="true"></script>`;
  let builtHead;
  if (head.constructor.name === "AsyncFunction") {
    builtHead = await head();
  } else {
    builtHead = head();
  }
  let HTMLTemplate = renderRecursively(builtHead);
  if (serverData) {
    HTMLTemplate += serverData;
  }
  return {
    internals: StartTemplate,
    builtMetadata: HTMLTemplate
  };
};
export {
  generateHTMLTemplate
};
