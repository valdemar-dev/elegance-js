export const initializePageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__ = [];
export const getPageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__;

export const addPageLoadHooks = <T>(hooks: Array<Function | (() => void)>) => {
    globalThis.__SERVER_CURRENT_PAGELOADHOOKS__.push(...hooks)
};
