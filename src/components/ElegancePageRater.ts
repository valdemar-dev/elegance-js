import { getState } from "../helpers/getGlobals.js";

const ElegancePageRater = (pageRootElement: Child) => {
    if (!pageRootElement) {
        throw new Error("Must provide a page to rate to ElegancePageRater");
    }

    const state = getState();

    const pageScore = state.createGlobal(100, { id: "elegancePageRaterCurrentPageScore", })

    return div ({
        class: "flex w-screen h-screen overflow-y-scroll"
    },
        div ({
            class: "w-full"
        },
            pageRootElement,
        ),

        div ({
            class: "min-w-[200px] "
        },
        "s")
    )
};


export {
    ElegancePageRater 
}
