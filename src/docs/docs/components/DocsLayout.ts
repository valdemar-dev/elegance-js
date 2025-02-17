import internal from "stream";
import { Breakpoint } from "../../../components/Breakpoint";
import { Link } from "../../../components/Link";
import { addPageLoadHooks } from "../../../server/addPageLoadHooks";
import { createState } from "../../../server/createState";
import { Header } from "../components/Header";
import { observe } from "../../../server/observe";

const serverState = createState({
    secondsSpentOnPage: 0,
});

addPageLoadHooks([
    ({
        subjects,
        signal,
    }: State<typeof serverState>) => {
        const secondsSpentOnPage = subjects.secondsSpentOnPage;

        const intervalId = setInterval(() => {
            secondsSpentOnPage.value++;

            signal(secondsSpentOnPage);
        }, 1000);

        return () => clearInterval(intervalId);
    },
]);

const Sidebar = () => nav ({
    class: "w-1/4 pr-6 mr-6"
},
    ul ({
        class: "flex flex-col gap-4"
    },
        li ({
        },
            span ({
                innerText: observe(
                    [serverState.secondsSpentOnPage],
                    (secondsSpentOnPage) => `${secondsSpentOnPage}`,
                )
            })
        ),
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
            ),
        ),
    ),
)
 
export const DocsLayout = (...children: Child[]) => div ({
  class: "",
},
    Header(),

    Breakpoint ({
        name: "docs-layout-breakpoint",
    },
        div ({
            class: "max-w-[1200px] w-full mx-auto flex mt-8 pr-2 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0",
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
