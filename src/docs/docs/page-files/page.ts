import { Link } from "../../../components/Link";
import { RootLayout } from "../../components/RootLayout";
import { CodeBlock } from "../components/CodeBlock";
import { DocsLayout } from "../components/DocsLayout";
import { Mono } from "../components/Mono";
import { PageHeading } from "../components/PageHeading";
import { Paragraph } from "../components/Paragraph";
import { SubHeading } from "../components/SubHeading";
import { SubSeparator } from "../components/SubSeparator";
import { Subtext } from "../components/Subtext";

const exampleLoadHook = `
createLoadHook({
    fn: () => {
        console.log("The page has loaded!");
    },
});
`

const exampleCleanupFunction = `
const counter = createState(0);

createLoadHook({
    deps: [counter],
    fn: (state, counter) => {
        const timer = setInterval(() => {
            counter.value++;
            counter.signal();
        }, 100);

        return () => {
            // Begone, timer!
            clearInterval(timer);
        }
    },
});
`;

const exampleLoadHookBind = `
const layout = createLayout("epic-layout");

createLoadHook({
    bind: layout,
    fn: () => {
        alert("epic layout was just rendered")

        return () => {
            alert ("epic layout is no longer with us :(")
        };
    },
})
`;

export const page = RootLayout (
    DocsLayout (
        PageHeading("Load Hooks", "load-hooks"),

        Subtext (
            "Available Via: elegance-js/server/loadHook",
        ),

        br(),
        br(),

        SubHeading("Basic Usage"),

        Paragraph (
            "Load hooks are functions that are called on the initial page load, and subsequent navigations.",

            br(),

            "A load hook is registered using the ", Mono("createLoadHook()"), " function.",
        ),

        CodeBlock(exampleLoadHook),

        SubSeparator(),

        SubHeading("Cleanup Function"),

        Paragraph (
            "The return value of a load hook is referred to as a cleanup function.",

            br(),

            "It is called whenever the load hook goes out of scope.",

            br(),
            br(),

            "You'll want to do things like ", Mono("clearInterval() & element.removeEventListener()"),

            br(),

            " here, so you don't get any unintended/undefined behavior.",
        ),

        CodeBlock(exampleCleanupFunction),

        SubSeparator(),
        SubHeading("Load Hook Scope"),
        
        Paragraph (
            "The scope of a load hook is either the page it is on, or the layout it is bound to.",

            br(),

            "If a load hook is bound to layout, it is called when that layout first appears.",

            br(),

            "Subsequently, its cleanup function will get called once it's bound layout no longer exists on the page.",

            br(),
            br(),

            "To bind a load hook to a layout, use the ", Mono("bind"),
            " attribute, and pass in a ",

            Link ({
                href: "/docs/page-files#layouts",
                class: "border-b-2",
            },
                "Layout ID",
            ),

            CodeBlock (exampleLoadHookBind),
        ),

        SubSeparator(),
        SubHeading("Important Considerations"),

        Paragraph (
            "It's important to note that the load hook function body exists in ",

            br(),

            b("browser land "), " not server land. Therefore the code is ", b("untrusted.")
        )
    ),
)
