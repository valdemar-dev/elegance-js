import { createEventListener } from "../../../server/createState"

const copyCode = createEventListener(
    [],
    async (event: MouseEvent) => {
        const children = (event.currentTarget as HTMLElement).children;
        const pre = children.item(0) as HTMLPreElement;

        await navigator.clipboard.writeText(pre.innerText);
    },
);

export const CodeBlock =  (value: string) => div ({
    class: "bg-background-950 hover:cursor-pointer p-2 rounded-sm border-[1px] border-background-800 w-max my-3 max-w-full overflow-scroll",
    onClick: copyCode,
},
    pre ({
        innerText: value,
    }),
)
