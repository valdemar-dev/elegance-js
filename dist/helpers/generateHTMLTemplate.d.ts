export declare const generateHTMLTemplate: ({ pageURL, head, serverData, addPageScriptTag, }: {
    addPageScriptTag: boolean;
    pageURL: string;
    head: () => BuildableElement<"head">;
    serverData?: string | null;
}) => string;
