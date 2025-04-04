import { createState } from "../../server/createState"
import { observe } from "../../server/observe";
import { Link } from "../../components/Link";
import { createLoadHook } from "../../server/loadHook";

const hasUserScrolled = createState(false);

createLoadHook({
    deps: [hasUserScrolled],
    fn: (state, hasUserScrolled) => {
        const handleScroll = () => {
            const pos = {
                x: window.scrollX,
                y: window.scrollY,
            };

            if (pos.y > 20) {
                if (hasUserScrolled.value === true) return;

                hasUserScrolled.value = true;
                hasUserScrolled.signal();
            } else {
                if (hasUserScrolled.value === false) return;

                hasUserScrolled.value = false
                hasUserScrolled.signal();
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    },
})

export const Header = () => header ({
    class: "sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"
},
    div ({
        class: observe(
            [hasUserScrolled],
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
                Link ({
                    href: "/",
                    class: "flex items-center gap-1 h-full", 
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
                    prefetch: "hover",
                    class: "z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950",
                    href: "/docs",
                    innerText: "Docs",
                })
            )
        )
    )
)
