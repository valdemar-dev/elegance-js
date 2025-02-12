import { hasSubscribers } from "diagnostics_channel";
import { createState } from "../../server/createState"
import { observe } from "../../server/observe";
import { Link } from "../../components/Link";
import { addPageLoadHooks } from "../../server/addPageLoadHooks";

const serverState = createState({
    hasUserScrolled: false,
    interval: 0,
    globalTicker: 0,
    urmom: "hi"
});

addPageLoadHooks([
    (state: State<typeof serverState>) => {
        const hasScrolled = state.subjects.hasUserScrolled;

        window.addEventListener("scroll", () => {
            const pos = {
                x: window.scrollX,
                y: window.scrollY,
            };

            if (pos.y > 20) {
                if (hasScrolled.value === true) return;

                state.set(hasScrolled, true);
            } else {
                if (hasScrolled.value === false) return;

                state.set(hasScrolled, false);
            }

            state.signal(hasScrolled);
        })
    },
])

export const Header = () => header ({
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
},
    div ({
        class: observe(
            [serverState.hasUserScrolled],
            (hasUserScrolled) => {
                const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 "

                if (hasUserScrolled) return defaultClass + "border-b-background-800 bg-background-950"

                return defaultClass + "bg-background-900 border-b-transparent"
            }
        )
    },
        div ({
            class: "max-w-[900px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(900px+1rem)]:px-0"
        },
            div ({
                class: "flex min-w-max w-full items-center z-10"
            },
                a ({
                    href: "/",
                    class: "flex items-center gap-1 hover:cursor-none h-full", 
                },
                    p ({
                        class: "font-niconne pointer-fine:group-hover:text-background-950 font-bold text-xl sm:text-3xl relative top-0 z-20 duration-300 pointer-events-none",
                        innerText: "Elegance"
                    }),

                    p ({
                        innerText: "JS",
                        class: "font-bold pointer-fine:group-hover:text-background-950 relative top-0 text-xl sm:text-3xl z-10 text-accent-400 duration-300 pointer-events-none",
                    }),
                ),
            ),

            div ({
                class: "flex py-2 sm:py-4 flex relative items-center justify-end w-full",
            },
                Link ({
                    href: "/test-page"
                },
                    "hi",
                ),

                a ({ 
                    class: "font-inter text-sm font-semibold text-text-100 pt-[2px] h-full flex items-center px-4 pointer-fine:group-hover:text-background-950 duration-200 hover:cursor-none group/link",
                    href: "/demo",
                    innerText: "", 
                },
                    span ({
                        class: "border-transparent border-b-2 group-hover/link:border-background-950 duration-200"

                    }, "Docs"),
                ),

                a ({
                    class: "z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950 hover:cursor-none",
                    href: "/install",
                    innerText: "Install",
                })
            )
        )
    )
)
