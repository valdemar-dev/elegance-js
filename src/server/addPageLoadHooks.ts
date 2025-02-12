export const initializePageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__ = [];
export const getPageLoadHooks = () => globalThis.__SERVER_CURRENT_PAGELOADHOOKS__;

export const addPageLoadHooks = <T>(hooks: Array<(state: State<T>) => any>) => {
    globalThis.__SERVER_CURRENT_PAGELOADHOOKS__.push(...hooks)
};
