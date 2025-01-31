export declare const generateHTMLTemplate: ({ pageURL, head, serverData, addPageScriptTag, }: {
    addPageScriptTag: boolean;
    pageURL: string;
    head: () => BuiltElement<"head">;
    serverData?: string | null;
}) => string;
