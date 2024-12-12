import { RenderingMethod } from "../types/Metadata";

export const createPageInfo = ({
    storedEventListeners,
    renderingMethod,
}: {
    storedEventListeners: Array<{
        eleganceID: number,
        eventListeners: string[]
    }>,
    renderingMethod: RenderingMethod,
}) => {
    let storedEventListenersString = storedEventListeners.map(storedEL => `{id:${storedEL.eleganceID},els:[${storedEL.eventListeners.map(el => el)}]}`);

    return `{rm:${renderingMethod},sels:[${storedEventListenersString}]}`
}
