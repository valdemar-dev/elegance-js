import { Router } from "../shared/router";
import { RenderingMethod } from "../types/Metadata";
import { Hydrator } from "./hydrator";

const unminimizePageInfo = (minimized: MinimizedPageInfo): PageInfo => {
    return {
        renderingMethod: minimized.rm,
        storedEventListeners: minimized.sels.map(selection => ({
            eleganceID: selection.id,
            eventListeners: selection.els.map(element => ({
                attributeName: element.an,
                eventListener: element.el,
            })),
        })),
    };
};

const minimizedPageInfo: MinimizedPageInfo | null = globalThis.__ELEGANCE_PAGE_INFO__;

if (!minimizedPageInfo) {
    alert("Misconfigured Elegance.JS server, check console.");

    throw `globalThis.__ELEGANCE_PAGE_INFO__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.`;
}

// pageinfo is minimized on the server, so we need to unpack
const pageInfo = unminimizePageInfo(minimizedPageInfo);

if (pageInfo.renderingMethod !== RenderingMethod.SERVER_SIDE_RENDERING) {
    throw `The SERVER_SIDE_RENDERING client may only be used if the page has been rendered via the SERVER_SIDE_RENDERING renderingMethod.`;
}

const hydrator = new Hydrator();
const router = new Router();

globalThis.eleganceHydrator = hydrator;

hydrator.hydratePage(pageInfo);
