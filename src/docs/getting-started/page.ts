import { createState } from "../../server/createState";
import { Sidebar } from "../components/sidebar";

export const state = createState({});

export const page = body ({
    class: "max-w-[1200px] w-full mx-auto bg-background-50 text-text-950 flex flex-row h-screen w-screen overflow-hidden"
},
    Sidebar (),

    div ({
        class: "p-8 w-full"
    },
        h1 ({
            class: "text-3xl font-fancy font-semibold mb-6 text-text-900",
            innerText: "Getting Started",
        }),

        h2 ({
            id: "install",
            class: "text-xl font-fancy mb-4",
            innerText: "1. Install Elegance.JS",
        }),

        p ({
            class: "max-w-[60ch]"
        },
            "As Elegance.JS is still in early development, installing is done via our ",
            a ({
                href: "https://github.com/valdemar-dev/elegance-js",
                class: "border-b-2",
            }, "GitHub. "),
            "Simply navigate there, and download or git clone it. Take note of where you place Elegance.JS. ",
            br({}),
        )
    ),
)
