import { RenderingMethod } from "../types/Metadata";
export declare const createPageInfo: ({ storedEventListeners, renderingMethod, }: {
    storedEventListeners: Array<{
        eleganceID: number;
        eventListeners: string[];
    }>;
    renderingMethod: RenderingMethod;
}) => string;
