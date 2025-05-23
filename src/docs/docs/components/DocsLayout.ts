import { Breakpoint } from "../../../components/Breakpoint";
import { Link } from "../../../components/Link";
import { createState } from "../../../server/createState";
import { Header } from "../components/Header";
import { observe } from "../../../server/observe";
import { createLoadHook } from "../../../server/loadHook";
import { Toast } from "./CodeBlock";
import { createLayout } from "../../../server/layout";

const docsLayoutId = createLayout("docs-layout");

const secondsSpentOnPage = createState(0, {
    bind: docsLayoutId,
});

createLoadHook({
    deps: [secondsSpentOnPage], 
    bind: docsLayoutId,

    fn: (state, time) => {
        const storedTime = localStorage.getItem("time-on-page");
        if (storedTime) {
            time.value = parseInt(storedTime);
            time.signal();
        }

        let intervalId;

        intervalId = setInterval(() => {
            time.value++;
            time.signal();
        }, 1000);

        const handlePageLeave = () => {
            localStorage.setItem("time-on-page", `${time.value}`);
        };

        window.addEventListener("beforeunload", handlePageLeave);

        return () => {
            window.removeEventListener("beforeunload", handlePageLeave);

            handlePageLeave();
            clearInterval(intervalId);
        }
    },
});

const NavSubLink = (href: string, innerText: string) => Link ({
    class: "text-sm font-normal flex flex-col gap-2 opacity-80 hover:opacity-60 duration-200",
    innerText: innerText,
    href: href,
    prefetch: "hover",
});

const Sidebar = () => nav ({
    class: "w-1/5"
},
    ul ({
        class: "flex flex-col gap-4"
    },
        li ({
        },
            h2 ({
                class: "text-lg font-semibold",
            },
                "Quick Nav"
            ),

            span ({
                class: "text-xs opacity-75",
            },
                "Elapsed: ",

                span ({
                    class: "font-mono",
                    innerText: observe(
                        [secondsSpentOnPage],
                        (secondsSpentOnPage) => {
                            const hours = Math.floor(secondsSpentOnPage / 60 / 60);
                            const minutes = Math.floor((secondsSpentOnPage / 60) % 60);
                            const seconds = secondsSpentOnPage % 60;

                            return `${hours}h:${minutes}m:${seconds}s`;
                        }
                    ), 
                }),
            ),
        ),

        li ({
            class: "flex flex-col gap-1",
        },
            h4 ({
                class: "text-base font-medium",
                innerText: "The Basics",
            }),

            ol ({
                class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
            },
                NavSubLink (
                    "/docs/basics#preamble",
                    "Preamble",
                ),

                NavSubLink (
                    "/docs/basics#how-elegance-works",
                    "How Elegance Works",
                ),

                NavSubLink (
                    "/docs/basics#installation",
                    "Installation",
                ),

                NavSubLink (
                    "/docs/basics#your-first-page",
                    "Your First Page",
                ),
            ),
        ),

        li ({
            class: "flex flex-col gap-1",
        },
            h4 ({
                class: "text-base font-medium",
                innerText: "Concepts",
            }),

            ol ({
                class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
            },
                NavSubLink (
                    "/docs/concepts#elements",
                    "Elements",
                ),

                NavSubLink (
                    "/docs/concepts#object-attributes",
                    "Object Attributes",
                ),
            ),
        ),
        
        li ({
            class: "flex flex-col gap-1",
        },
            h4 ({
                class: "text-base font-medium",
                innerText: "Page Files",
            }),

            ol ({
                class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
            },
                NavSubLink (
                    "/docs/page-files#state",
                    "State",
                ),

                NavSubLink (
                    "/docs/page-files#load-hooks",
                    "Load Hooks",
                ),

                NavSubLink (
                    "/docs/page-files#event-listeners",
                    "Event Listeners",
                ),

                NavSubLink (
                    "/docs/page-files#layouts",
                    "Layouts",
                ),
            ),
        ),
        
        li ({
            class: "flex flex-col gap-1",
        },
            h4 ({
                class: "text-base font-medium",
                innerText: "Compilation",
            }),

            ol ({
                class: "pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"
            },
                NavSubLink (
                    "/docs/compilation#options",
                    "Compilation Options",
                ),
            ),
        ),
    ),
)
 
export const DocsLayout = (...children: Child[]) => div ({
    class: "h-screen overflow-clip",
},
    Header(),

    Toast(docsLayoutId),

    div ({
        class: "max-w-[1200px] h-full w-full mx-auto flex pt-8 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0",
    },
        Sidebar(),

        article ({
            class: "h-full w-full overflow-y-scroll pb-[250px] pl-6 ml-6",
        },
            Breakpoint ({
                id: docsLayoutId,
            },
                ...children,
            )
        ), 
    ),
);
