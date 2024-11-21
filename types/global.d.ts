import { Renderer } from "./renderer"
import { Router } from "./router"
import { StateController } from "./state"

declare global {
    type BuiltElement<T> = {
        tag: T;
        children: Array<BuildableElement<string>>;
        getOptions: () => Record<string, any>;
        onMount?: (builtElement: BuiltElement<T>, elementInDocument: HTMLElement) => void;
    };

    type BuildableElement<T> = (
        options: Record<string, any>, 
        ...children: Array<() => BuiltElement<string>> | string[]
    ) => () => BuiltElement<T>;

    type Page = (
        args: { router: Router; state: StateController; renderer: Renderer }
    ) => () => BuiltElement<string>;
}

export {};
