import { Renderer } from "../renderer";
import { Router } from "../router";
import { StateController } from "../state";

declare function getRouter(): Router;
declare function getState(): StateController;
declare function getRenderer(): Renderer;

type ObserveOptions = {
    ids: string[],
    scope?: "local" | "global",
    update: (...params: any) => any
}

// just validates what you put in
// also acts as a wrapper
declare function observe(options: ObserveOptions): ObserveOptions;

export { getRouter, getRenderer, getState, observe }
