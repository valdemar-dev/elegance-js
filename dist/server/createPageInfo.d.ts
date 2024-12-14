import { RenderingMethod } from "../types/Metadata";
export declare const createPageInfo: ({ storedEventListeners, renderingMethod, pathname, }: {
    storedEventListeners: Array<{
        eleganceID: number;
        eventListeners: string[];
    }>;
    renderingMethod: RenderingMethod;
    pathname: string;
}) => string;
