import { Breakpoint } from "../../../components/Breakpoint";
import { Link } from "../../../components/Link";
import { Header } from "../components/Header";

const Sidebar = () => nav ({
    class: "w-1/4 pr-6 mr-6"
},
    ul ({
        class: "flex flex-col gap-4"
    },
        li ({
            class: "flex flex-col gap-1",
        },
            h4 ({
                class: "text-base font-medium",
                innerText: "The Basics",
            }),

            Link ({
                href: "/docs/basics#installation",
                prefetch: "hover",
            },
                ol ({
                    class: "text-sm font-normal flex flex-col gap-2",
                    innerText: "Installation",
                }),
            )

        ),
    ),
)
 
export const RootLayout = (...children: Child[]) => body ({
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
},
    Header(),

    Breakpoint ({
        name: "docs-navigation",
    },
        div ({
            class: "max-w-[1200px] w-full mx-auto flex mt-8",
        },
            Sidebar(),

            main ({
                class: "w-3/4",
            },
                ...children,
            )
        ),
    ), 
);
