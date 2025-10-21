export declare const generateHTMLTemplate: ({ pageURL, head, serverData, addPageScriptTag, name, requiredClientModules, }: {
    addPageScriptTag: boolean;
    pageURL: string;
    head: Metadata;
    serverData?: string | null;
    name: string;
    requiredClientModules: string[];
}) => Promise<{
    internals: string;
    builtMetadata: string;
}>;
