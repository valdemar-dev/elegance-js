import { createEventListener, createState, SetEvent, } from "../../../server/createState"
import { createLoadHook } from "../../../server/loadHook";
import { observe } from "../../../server/observe";

const isToastShowing = createState(false);
const toastTimeoutId = createState(0);

const copyCode = createEventListener({
    dependencies: [
        isToastShowing,
        toastTimeoutId,
    ],

    params: {
    },

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
        }, 5000);

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
                const defaultClassName = "fixed duration-200 bottom-4 max-w-[300px] w-full bg-background-800 ";

                if (isShowing) {
                    return defaultClassName + "right-8";
                }

                return defaultClassName + "right-0 translate-x-full";
            }
        )
    },
        h1 ("Copied to clipboard!"),
    );

}

export const CodeBlock =  (value: string) => div ({
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode, 
},
    pre ({}, value ),
)
