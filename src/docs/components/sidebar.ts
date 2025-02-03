
export const Sidebar = () => { 
    return nav ({
        class: "flex flex-col bg-background-50 px-4 py-2 min-w-[300px]",
    },
        div ({
            class: "flex items-center gap-1",
        },
            span({
                class: "text-2xl font-fancy"
            }, "Elegance"),

            span({
                class: "text-3xl font-bold text-text-600 relative"
            }, "JS"),
        ), 

        ul ({},
            li ({
            }, "Getting Started"),
        ),

    )
};
