declare const getRouter: () => import("../shared/router").Router;
declare const getState: () => import("../client/state").StateController;
declare const getRenderer: () => import("../client/renderer").Renderer;
declare class PropertyObserver {
    ids: Array<string>;
    scope: "local" | "global";
    update: (...args: any) => string | Record<string, any>;
    constructor({ ids, scope, update, }: {
        ids: Array<string>;
        scope?: "local" | "global";
        update: (...arg: any) => string;
    });
}
declare const observe: ({ ids, scope, update, }: {
    ids: Array<string>;
    scope?: "local" | "global";
    update: (...arg: any) => string;
}) => PropertyObserver;
export { getRouter, getRenderer, getState, observe };
export type { PropertyObserver };
