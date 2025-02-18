
export const CodeBlock =  (value: string) => div ({
    class: "bg-background-950 p-2 rounded-sm border-[1px] border-background-800 w-max my-3 max-w-full overflow-scroll"
},
    pre({}, value),
)
