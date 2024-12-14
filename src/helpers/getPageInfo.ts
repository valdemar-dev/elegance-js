const unmimizePageInfo = (minimized: MinimizedPageInfo): PageInfo => {
    return {
        pathname: minimized.pn,
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

export const getPageInfo = (pathname: string,) => {
    const minimizedPageInfos: MinimizedPageInfo[] | null = globalThis.__PAGE_INFOS__;

    if (!minimizedPageInfos) {
        alert("Misconfigured Elegance.JS server, check console.");

        throw `globalThis.__PAGE_INFOS__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.`;
    }

    const minimized = minimizedPageInfos.find(p => p.pn === pathname);

    if (!minimized) {
        throw `Page with pathname not found.`;
    }

    return unmimizePageInfo(minimized);
};

