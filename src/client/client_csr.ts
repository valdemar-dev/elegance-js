import "../shared/bindBrowserElements";

import { Router } from "../shared/router";
import { Renderer } from "./renderer";
import { RenderingMethod } from "../types/Metadata";
import { StateController } from "./state";
import { getPageInfo } from "../helpers/getPageInfo";


const pageInfo = getPageInfo(window.location.pathname);

if (pageInfo.renderingMethod !== RenderingMethod.CLIENT_SIDE_RENDERING) {
    console.error(`The CLIENT_SIDE_RENDERING client may only be used if the page has been rendered via the CLIENT_SIDE_RENDERING renderingMethod.`);
    throw ``;
}

const scripts = document.querySelectorAll('script[type="module"]');

const pageScript = Array.from(scripts).find((script) => {
    const htmlScript = script as HTMLScriptElement;
    return htmlScript.src.includes("/page.js");
});

if (!pageScript) {
    throw new Error("Failed to mount elegance. No page script found.");
}

import((pageScript as HTMLScriptElement).src).then((module) => {
    if (!module.page) throw new Error("Page script does not export page function.");

    const renderer = new Renderer();
    const stateController = new StateController();
    const router = new Router();

    globalThis.eleganceRouter = router;
    globalThis.eleganceStateController = stateController;
    globalThis.eleganceRenderer = renderer;

    router.addPage(window.location.pathname, module.page);

    renderer.renderPage(module.page);
}).catch((error) => {
    alert("Failed to import module, please check the console.");
    console.error(error);
});
