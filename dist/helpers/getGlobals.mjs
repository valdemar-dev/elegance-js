// src/helpers/getGlobals.ts
var getRouter = () => globalThis.eleganceRouter;
var getState = () => globalThis.eleganceStateController;
var getRenderer = () => globalThis.eleganceRenderer;
var PropertyObserver = class {
  constructor({
    ids,
    scope = "local",
    update
  }) {
    if (!ids || !update) throw new Error("Invalid function invocation, must provide ids, scope and update function.");
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
    this.ids = ids;
    this.scope = scope;
    this.update = update;
  }
};
var observe = ({
  ids,
  scope = "local",
  update
}) => new PropertyObserver({ ids, scope, update });
export {
  getRenderer,
  getRouter,
  getState,
  observe
};
