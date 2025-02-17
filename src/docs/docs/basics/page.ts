import { RootLayout } from "../../components/RootLayout";
import { PageHeading } from "../components/PageHeading";
import { DocsLayout } from "../components/DocsLayout";

export const page = RootLayout (
    DocsLayout (
        PageHeading (
            "Preamble",
            "preamble",
        ), 

        h2 ({
            class: "text-lg font-medium mb-1",
            innerText: "A Quick Forewarning",
        }),

        p ({
            class: "opacity-80",
        },
            "Elegance is still in very early development.",
            br({}),
            "There are absolutely no guarantees of backwards compatibility, security or really anything.",
            br({}),
            "As such, elegance isn't really meant for production, yet."
        ),

        div ({
            class: "my-10",
        }, []),

        h2 ({
            class: "text-lg font-medium mb-1",
            innerText: "What is Elegance?",
        }),

        p ({
            class: "opacity-80",
        },
            "Elegance is a highly opinionated, compiled, fully-typescript, ",

            br({}),

            "web-framework designed for building feature-rich, yet, fast and efficient web pages.",

            br({}),
            br({}),

            "Elegance is written fully by hand, and dependencies are used ",
            b("very "),
            "sparsely.",

            br ({}),
            br ({}),

            "A simple fully-working elegance page transfers only ",
            b("4kB "),
            "of data!",

            img ({
                class: "border-[1px] border-background-600 my-4",
                src: "/assets/nullpage_size.png",
            }),

            "For context, an \"empty\" react app on average transfers roughly ",
            b("200-300kB "), "of data.",

            br({}),
            br({}),

            "This lack of JS sent to the browser is achieved through not ",
            "creating unnecessary, wildly complex rude goldberg machines; ",
            "and compilation instead of interpretation."
        ),

        div ({
            class: "my-20",
        }, []),

        PageHeading (
            "Install",
            "installation",
        ), 
    ),
);
