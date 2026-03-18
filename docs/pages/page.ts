import { fileURLToPath } from "url";
import path from "path";
import { Link } from "elegance-js";

export function page({ params }: { params: { page: string } }) {
    return div({
        className: "flex flex-col-reverse md:grid h-full w-full md:grid-cols-[minmax(300px,700px)_minmax(300px,1fr)]",
    },
        article({
            className: "m-4 lg:mt-8 pb-[300px]",
        },
            h1({
                className: "text-4xl font-semibold mb-8",
            },
                "Elegance.JS",
            ),

            p({
                className: "mb-2",
            },
                "Elegance is a full-stack web-framework written in pure TypeScript with minimal dependencies."
            ),

            p({
                className: "mb-2",
            },
                "It uses functional components to create an element tree on the server, and then serializes that into HTML and JS.",
            ),

            p({
                className: "mb-8",
            },
                "The result is then either stored on the server, or generated per-request.",
            ),

            Link({
                href: "/getting-started",
                className: "px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md"
            },
                "Get Started"
            ),

            hr({
                className: "my-32 border-black dark:border-white"
            }),

            h2({
                className: "text-xl font-semibold mb-4",
            },
                "Feature TLDR"
            ),

            ul({
                className: "flex flex-col gap-2",
            },
                li(
                    "Built-in API route support"
                ),

                li(
                    "FS-Based routing (with slug support)"
                ),

                li(
                    "Minimal Dependencies",
                ),

                li(
                    "Easy to extend",
                ),

                li(
                    "Static & Server-runtime variants included"
                ),

                li(
                    "Very easy to use"
                ),

                li(
                    "Express style middleware",
                )
            ),

            h2({
                className: "mt-16 text-xl font-semibold mb-4",
            },
                "Curious?"
            ),

            p({

            },
                "The best place to start is just by exploring the docs.",

                br(),

                "We'd recommend the ",
                Link({
                    className: "border-b-2 text-blue-500 dark:text-blue-400 hover:opacity-70 duration-200",
                    href: "/getting-started",
                }, "getting started"),

                " section!",
            )
        ),
   );
}

export function metadata({ params }: { params: { page: string }}) {
    return [
        title("hello world!"),
    ];
}

export const isDynamic = false;