const getRouter = () => globalThis.eleganceRouter;
const getState = () => globalThis.eleganceStateController;
const getRenderer = () => globalThis.eleganceRenderer;

const observe = ({
    ids,
    scope = "local",
    update, 
}: {
    ids: Array<string>,
    scope?: "local" | "global",
    update: (...arg: any) => string
}) => {
    if (
        !ids || 
        !update
    ) throw new Error("Invalid function invocation, must provide ids, scope and update function.");

    if (!Array.isArray(ids)) {
        throw new Error("The ID list you want to observe must be an array.");
    }

    if (scope !== "local" && scope !== "global") {
        throw new Error("When observing, you must set the state as either `local`, or `global`");
    }

    if (typeof update !== "function") {
        throw new Error(`Provided update function has type ${typeof update}, which is not a function.`);
    }

    if (update.length !== ids.length) {
        throw new Error(`The length of the parameters for the update function (${update.length}) does not match the length of the provided IDs (${ids.length})`);
    }

    return { ids, scope, update, };
};

export { getRouter, getRenderer, getState, observe }
