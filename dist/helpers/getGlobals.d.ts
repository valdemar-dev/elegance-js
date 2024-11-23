declare const getRouter: () => import("../router").Router;
declare const getState: () => import("../state").StateController;
declare const getRenderer: () => import("../renderer").Renderer;
declare const observe: ({ ids, scope, update, }: {
    ids: Array<string>;
    scope: "local" | "global";
    update: (...arg: any) => void;
}) => {
    ids: string[];
    scope: "local" | "global";
    update: (...arg: any) => void;
};
export { getRouter, getRenderer, getState, observe };
