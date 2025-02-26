import { Link } from "../../../components/Link";
import { RootLayout } from "../../components/RootLayout";
import { CodeBlock } from "../components/CodeBlock";
import { DocsLayout } from "../components/DocsLayout";
import { Mono } from "../components/Mono";
import { PageHeading } from "../components/PageHeading";
import { Paragraph } from "../components/Paragraph";
import { Separator } from "../components/Separator";
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

const exampleStateCreation = `
const superEpicState = createState("MMMMMMM STATE");
`;

const exampleStateCreationReturn = `
{
    type: ObjectAttributeType.STATE,
    id: 0,
    value: "MMMMMMM STATE", 
    bind: undefined,
}
`;

const exampleStateReference = `
const isUsingDarkMode = createState(false);

div ({
    class: observe(
        [isUsingDarkMode],
        (value) => value ? "bg-black" : "bg-white",
    ),
})
`;

export const page = RootLayout (
    DocsLayout (
        PageHeading("State", "state"),

        Subtext("Available Via: elegance-js/server/state"),

        Paragraph (
            "State is, simply put, a collection of variables.",

            br(),

            "You initialize it on the server using the ", Mono("createState()"), " function.",
        ),

        CodeBlock(exampleStateCreation),

        SubSeparator(),
        SubHeading("Usage"),

        Paragraph(
            "The ", Mono("createState()"), " function takes in two values.",

            br(),
            
            "The initial value of the state, and an options object.",

            br(),

            "The options object may currently only define a bind to the state (more on this later)",

            br(),
            br(),

            "The function stores the created state in the servers current state store,",

            br(),

            "so that upon completion of compilation, it may be serialized into page_data.",
        ),

        SubSeparator(),
        SubHeading("Return Value"),

        Paragraph (
            "The return value of ", Mono("createState()"),
            " is a State ",

            Link ({
                href: "/docs/concepts#object-attributes",
                class: "border-b-2",
            },
                "Object Attribute, ",
            ),

            br(),

            "which you can use to refer back to the created state."
        ),

        CodeBlock(exampleStateCreationReturn),
        CodeBlock(exampleStateReference),

        Paragraph (
            "Many functions like load hooks, event listeners, and observe, take in optional SOAs."
        ),

        Separator(),

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

            CodeBlock(exampleLoadHookBind),
        ),

        SubSeparator(),
        SubHeading("Important Considerations"),

        Paragraph (
            "It's important to note that the load hook function body exists in ",

            br(),

            b("browser land "), " not server land. Therefore the code is ", b("untrusted.")
        ),

    ),
)
