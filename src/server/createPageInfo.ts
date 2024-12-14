import { RenderingMethod } from "../types/Metadata";

export const createPageInfo = ({
    storedEventListeners,
    renderingMethod,
    pathname,
}: {
    storedEventListeners: Array<{
        eleganceID: number,
        eventListeners: string[]
    }>,
    renderingMethod: RenderingMethod,
    pathname: string,
}) => {
    let storedEventListenersString = storedEventListeners.map(storedEL => `{id:${storedEL.eleganceID},els:[${storedEL.eventListeners.map(el => el)}]}`);

    return `<script e-pi>(globalThis.__PAGE_INFOS__ ||= []).push({pn:"${pathname}",rm:${renderingMethod},sels:[${storedEventListenersString}]})</script>`
}
