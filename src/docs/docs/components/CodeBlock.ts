import { createEventListener, createState, SetEvent, } from "../../../server/createState"
import { observe } from "../../../server/observe";

const serverState = createState({
    isToastShowing: false,
    toastTimeoutId: 0,
});

const copyCode = createEventListener({
    dependencies: [
        serverState.isToastShowing,
        serverState.toastTimeoutId,
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

        const timeoutId: number = window.setTimeout(() => {
            isToastShowing.value = false;
            isToastShowing.signal();
        }, 5000);

        toastTimeoutId.value = timeoutId;
    },
});

export const Toast = () => div ({
    class: observe(
        [serverState.isToastShowing],
        (isShowing) => {
            const defaultClassName = "fixed duration-200 bottom-4 max-w-[300px] w-full bg-white text-black ";

            if (isShowing) {
                return defaultClassName + "right-8";
            }

            return defaultClassName + "right-0 translate-x-full";
        }
    )
},
    h1 ("Copied to clipboard!"),
);

export const CodeBlock =  (value: string) => div ({
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode, 
},
    pre ({}, value ),
)
