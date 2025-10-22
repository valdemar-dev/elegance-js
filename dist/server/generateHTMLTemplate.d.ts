export declare const generateHTMLTemplate: ({ pageURL, head, serverData, addPageScriptTag, name, requiredClientModules, environment, }: {
    addPageScriptTag: boolean;
    pageURL: string;
    head: Metadata;
    serverData?: string | null;
    name: string;
    requiredClientModules: string[];
    environment: "development" | "production";
}) => Promise<{
    internals: string;
    builtMetadata: string;
}>;
