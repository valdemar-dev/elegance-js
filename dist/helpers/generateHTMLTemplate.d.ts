import { RenderingMethod } from "../types/Metadata";
export declare const generateHTMLTemplate: ({ pageURL, head, renderingMethod, serverData, addPageScriptTag, }: {
    renderingMethod: RenderingMethod;
    addPageScriptTag: boolean;
    pageURL: string;
    head: () => BuildableElement<"head">;
    serverData?: string | null;
}) => string;
