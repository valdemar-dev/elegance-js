export declare const generateHTMLTemplate: ({ pageURL, head, serverData, }: {
    pageURL: string;
    head: () => BuildableElement<"head">;
    serverData?: string | null;
}) => string;
