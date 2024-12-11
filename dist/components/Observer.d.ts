declare const Observer: (options: {
    ids: Array<string>;
    scope: "local" | "global";
}, ...children: ElementChildren) => BuildableElement<"div">;
export { Observer, };
