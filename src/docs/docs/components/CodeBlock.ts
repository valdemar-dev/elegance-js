import { createEventListener, createState, SetEvent, } from "../../../server/createState"
import { createLoadHook } from "../../../server/loadHook";
import { observe } from "../../../server/observe";
import { highlightCode } from "../../utils/MEGALEXER";

const isToastShowing = createState(false);
const toastTimeoutId = createState(0);

const copyCode = createEventListener({
    dependencies: [
        isToastShowing,
        toastTimeoutId,
    ],

    eventListener: async (
        params: SetEvent<MouseEvent, HTMLButtonElement>,
        isToastShowing,
        toastTimeoutId,
    ) => {
        const children = params.event.currentTarget.children;
        const pre = children.item(0) as HTMLPreElement;

        const content = pre.innerText;

        await navigator.clipboard.writeText(content); 

        if (toastTimeoutId.value !== 0) clearTimeout(toastTimeoutId.value);

        isToastShowing.value = true;
        isToastShowing.signal();

        const timeoutId = window.setTimeout(() => {
            isToastShowing.value = false;
            isToastShowing.signal();
        }, 3000);

        toastTimeoutId.value = timeoutId;
    },
});

export const Toast = (bind?: number) =>{
    createLoadHook({
        bind: bind,

        deps: [
            toastTimeoutId,
            isToastShowing
        ],

        fn: (state, toastTimeoutId, isToastShowing,) => {
            return () => {
                clearTimeout(toastTimeoutId.value);

                isToastShowing.value = false;
                isToastShowing.signal();
            }
        }
    });

    return div ({
        class: observe(
            [isToastShowing],
            (isShowing) => {
                const modularClass = isShowing ? "right-8" : "right-0 translate-x-full";

                return `fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 ` + modularClass;

            }
        )
    },
        h1 ({
            class: "font-mono uppercase",
        }, "copied to clipboard"),
    );
}

const escapeHtml = (str: string): string => {
    const replaced = str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    return replaced;
};

export const CodeBlock =  (value: string, parse: boolean = true) => div ({
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode, 
},
    pre ({}, parse ? highlightCode(value) : escapeHtml(value) ),
)

