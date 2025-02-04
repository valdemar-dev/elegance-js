
export const Sidebar = () => { 
    return nav ({
        class: "flex flex-col bg-background-50 px-4 py-2 min-w-[300px] pt-4",
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

        hr({
            class: "my-3 border-background-200",
        }),

        ul ({
            class: "mt-4"
        },
            li ({
            }, 
                span ({
                    class: "font-fancy text-text-900"
                }, 
                    "Getting Started"
                ),

                ul ({
                    class: "ml-2 pl-3 flex flex-col border-l-[1px] mt-1"
                },
                    li ({
                        class: "text-sm text-text-950",
                    },
                        a ({
                            href: "/getting-started/#install",
                        },
                            span ({
                                class: "opacity-80"
                            },
                                "Installing Elegance.JS"
                            )
                        ),
                    )
                ),
            ),
        ),
    )
};
