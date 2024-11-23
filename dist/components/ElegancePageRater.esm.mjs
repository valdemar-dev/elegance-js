import { getState } from '../helpers/getGlobals.esm.mjs';

const ElegancePageRater = (pageRootElement) => {
    if (!pageRootElement) {
        throw new Error("Must provide a page to rate to ElegancePageRater");
    }
    const state = getState();
    state.createGlobal(100, { id: "elegancePageRaterCurrentPageScore", });
    return div({
        class: "flex w-screen h-screen overflow-y-scroll"
    }, div({
        class: "w-full"
    }, pageRootElement), div({
        class: "min-w-[200px] "
    }, "s"));
};

export { ElegancePageRater };
//# sourceMappingURL=ElegancePageRater.esm.mjs.map
