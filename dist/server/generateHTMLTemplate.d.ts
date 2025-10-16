export declare const generateHTMLTemplate: ({ pageURL, head, serverData, addPageScriptTag, name, requiredClientModules, }: {
    addPageScriptTag: boolean;
    pageURL: string;
    head: () => BuiltElement<"head">;
    serverData?: string | null;
    name: string;
    requiredClientModules: string[];
}) => string;
