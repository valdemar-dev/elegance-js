import { getPageInfo } from "../helpers/getPageInfo";
import { Router } from "../shared/router";
import { RenderingMethod } from "../types/Metadata";
import { Hydrator } from "./hydrator";

const pageInfo = getPageInfo(window.location.pathname);

if (pageInfo.renderingMethod !== RenderingMethod.SERVER_SIDE_RENDERING) {
    throw `The SERVER_SIDE_RENDERING client may only be used if the page has been rendered via the SERVER_SIDE_RENDERING renderingMethod.`;
}

const hydrator = new Hydrator();
const router = new Router();

globalThis.eleganceHydrator = hydrator;

hydrator.hydratePage(pageInfo);
