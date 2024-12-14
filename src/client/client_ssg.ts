import { getPageInfo } from "../helpers/getPageInfo";
import { RenderingMethod } from "../types/Metadata";

const pageInfo = getPageInfo(window.location.pathname);

if (pageInfo.renderingMethod !== RenderingMethod.STATIC_GENERATION) {
    throw `The STATIC_GENERATION client may only be used if the page has been rendered via the SERVER_SIDE_RENDERING renderingMethod.`;
}

throw `not implemented`;

