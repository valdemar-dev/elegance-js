import "../shared/bindBrowserElements";

import { Router } from "../shared/router";
import { RenderingMethod } from "../types/Metadata";

const unminimizePageInfo = (minimized: MinimizedPageInfo): PageInfo => {
    return {
        renderingMethod: minimized.rm,
        storedEventListeners: minimized.sels?.map(selection => ({
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

if (pageInfo.renderingMethod !== RenderingMethod.STATIC_GENERATION) {
    throw `The STATIC_GENERATION client may only be used if the page has been rendered via the STATIC_GENERATION renderingMethod.`;
}

throw `STATIC_GENERATION renderingMethod not implemented yet.`;

//const hydrator = globalThis.eleganceHydrator();
const router = new Router();

// find out way to make this work
//router.addPage(window.location.pathname, module.page);

//hydrator.hydratePage(pageInfo);


