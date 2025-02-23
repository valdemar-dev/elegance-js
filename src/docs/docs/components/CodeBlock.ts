import { createReference, } from "../../../server/createReference";
import { createEventListener, } from "../../../server/createState"

const toastRef = createReference();

const copyCode = createEventListener({
    dependencies: [],
    params: {
        ref: toastRef.value,
    },

    eventListener: async ({ event, ref }) => {
        const children = (event.currentTarget as HTMLElement).children;
        const pre = children.item(0) as HTMLPreElement;

        await navigator.clipboard.writeText(pre.innerText); 

        console.log(`toast reference: ${ref}`);
    },
});

export const Toast = () => div ({
    ref: toastRef,
},
    "i am a toast!",
);

export const CodeBlock =  (value: string) => div ({
    class: `bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,
    onClick: copyCode, 
},
    pre ({
        innerText: value,
    }),
)
