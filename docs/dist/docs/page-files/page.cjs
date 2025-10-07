"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var page_exports = {};
__export(page_exports, {
  metadata: () => metadata,
  page: () => page
});
module.exports = __toCommonJS(page_exports);
var import_Link = require("../../../components/Link");
var import_RootLayout = require("../../components/RootLayout");
var import_CodeBlock = require("../components/CodeBlock");
var import_DocsLayout = require("../components/DocsLayout");
var import_Mono = require("../components/Mono");
var import_PageHeading = require("../components/PageHeading");
var import_Paragraph = require("../components/Paragraph");
var import_Separator = require("../components/Separator");
var import_SubHeading = require("../components/SubHeading");
var import_SubSeparator = require("../components/SubSeparator");
var import_Subtext = require("../components/Subtext");
const exampleLoadHook = `
createLoadHook({
    fn: () => {
        console.log("The page has loaded!");
    },
});
`;
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
const exampleStateLayoutBind = `
const docsLayout = createLayout("docs-layout");

const timeSpentOnPage = createState(0, {
    bind: docsLayout
});
`;
const exampleCreateEventListener = `
const handleClick = createEventListener({
    eventListener: (params: SetEvent<MouseEvent, HTMLDivElement>) => {
        console.log(params.event);
        console.log(params.event.currentTarget);
    },
});

div ({
    onClick: handleClick,
});
`;
const exampleCreateEventListenerDependencies = `
const counter = createState(0);

const handleClick = createEventListener({
    dependencies: [counter],
    eventListener: (params, counter) => {
        counter++;
        counter.signal();
    },
});
`;
const exampleCreateEventListenerParams = `
const reference = createReference();

createEventListener({
    params: {
        someElementReference: reference,
        pageCompiledAt: new Date(),
    },

    eventListener: (params) => {
        console.log("i am now aware of: ", params.someElementReference);
        console.log("This page was originally compiled at: ", pageCompiledAt);
    },
});
`;
const exampleCreateLayout = `
const superAwesomeLayoutID  = createLayout("super-awesome-layout");
`;
const exampleSimpleLayout = `
const superAwesomeLayoutID = createLayout("super-awesome-layout");

const SuperAwesomeLayout = (...children: Child[]) => div ({
    style: "background-color: #000; color: #fff",
},
    ...children
);
`;
const exampleBreakpoint = `
const superAwesomeLayoutID = createLayout("super-awesome-layout");

const SuperAwesomeLayout = (...children: Child[]) => div ({
    style: "background-color: #000; color: #fff",
},
    Breakpoint ({
        id: superAwesomeLayoutID
    },
        ...children
    ),
);
`;
const metadata = () => head(
  {},
  link({
    rel: "stylesheet",
    href: "/index.css"
  }),
  title("Hi There!")
);
const page = (0, import_RootLayout.RootLayout)(
  (0, import_DocsLayout.DocsLayout)(
    (0, import_PageHeading.PageHeading)("State", "state"),
    (0, import_Subtext.Subtext)("Available Via: elegance-js/server/state"),
    (0, import_Paragraph.Paragraph)(
      "State is, simply put, a collection of variables.",
      br(),
      "You initialize it on the server using the ",
      (0, import_Mono.Mono)("createState()"),
      " function."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleStateCreation),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Usage"),
    (0, import_Paragraph.Paragraph)(
      "The ",
      (0, import_Mono.Mono)("createState()"),
      " function takes in two values.",
      br(),
      "The initial value of the state, and an options object.",
      br(),
      "The options object may currently only define a bind to the state (more on this later)",
      br(),
      br(),
      "The function stores the created state in the servers current state store,",
      br(),
      "so that upon completion of compilation, it may be serialized into page_data."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Return Value"),
    (0, import_Paragraph.Paragraph)(
      "The return value of ",
      (0, import_Mono.Mono)("createState()"),
      " is a State ",
      (0, import_Link.Link)(
        {
          href: "/docs/concepts#object-attributes",
          class: "border-b-2"
        },
        "Object Attribute, "
      ),
      br(),
      "which you can use to refer back to the created state."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleStateCreationReturn),
    (0, import_CodeBlock.CodeBlock)(exampleStateReference),
    (0, import_Paragraph.Paragraph)(
      "Many functions like load hooks, event listeners, and observe, take in optional SOAs."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Bind"),
    (0, import_Paragraph.Paragraph)(
      "State, in the browser, is kept in the global ",
      (0, import_Mono.Mono)("pd"),
      " object, and indexed via pathnames.",
      br(),
      "All state for the pathname ",
      (0, import_Mono.Mono)("/recipes/apple-pie"),
      " will be in ",
      (0, import_Mono.Mono)('pd["/recipes/apple-pie"]'),
      br(),
      br(),
      "However, in some scenarios you may want to reference the same state on multiple pages. ",
      br(),
      "For this, you may ",
      b("bind "),
      "the state to a ",
      (0, import_Link.Link)({
        href: "/docs/page-files#layouts",
        class: "border-b-2"
      }, "Layout."),
      br(),
      br(),
      "Then, the state will go into ",
      (0, import_Mono.Mono)("pd[layout_id]"),
      ", instead of the pathname of the page."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleStateLayoutBind),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Important Considerations"),
    (0, import_Paragraph.Paragraph)(
      "State persists it's value during page navigation.",
      br(),
      "Meaning if you want it to reset it's value, you must do so yourself."
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)("Load Hooks", "load-hooks"),
    (0, import_Subtext.Subtext)(
      "Available Via: elegance-js/server/loadHook"
    ),
    br(),
    br(),
    (0, import_SubHeading.SubHeading)("Basic Usage"),
    (0, import_Paragraph.Paragraph)(
      "Load hooks are functions that are called on the initial page load, and subsequent navigations.",
      br(),
      "A load hook is registered using the ",
      (0, import_Mono.Mono)("createLoadHook()"),
      " function."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleLoadHook),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Cleanup Function"),
    (0, import_Paragraph.Paragraph)(
      "The return value of a load hook is referred to as a cleanup function.",
      br(),
      "It is called whenever the load hook goes out of scope.",
      br(),
      br(),
      "You'll want to do things like ",
      (0, import_Mono.Mono)("clearInterval() & element.removeEventListener()"),
      br(),
      " here, so you don't get any unintended/undefined behavior."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleCleanupFunction),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Load Hook Scope"),
    (0, import_Paragraph.Paragraph)(
      "The scope of a load hook is either the page it is on, or the layout it is bound to.",
      br(),
      "If a load hook is bound to layout, it is called when that layout first appears.",
      br(),
      "Subsequently, its cleanup function will get called once it's bound layout no longer exists on the page.",
      br(),
      br(),
      "To bind a load hook to a layout, use the ",
      (0, import_Mono.Mono)("bind"),
      " attribute, and pass in a ",
      (0, import_Link.Link)(
        {
          href: "/docs/page-files#layouts",
          class: "border-b-2"
        },
        "Layout ID"
      ),
      (0, import_CodeBlock.CodeBlock)(exampleLoadHookBind)
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Important Considerations"),
    (0, import_Paragraph.Paragraph)(
      "It's important to note that the load hook function body exists in ",
      br(),
      b("browser land "),
      " not server land. Therefore the code is ",
      b("untrusted.")
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)("Event Listener", "event-listeners"),
    (0, import_Subtext.Subtext)("Available Via: elegance-js/server/createState"),
    br(),
    br(),
    (0, import_SubHeading.SubHeading)("Basic Usage"),
    (0, import_Paragraph.Paragraph)(
      "Event listeners are a type of state, that you can create with the",
      br(),
      (0, import_Mono.Mono)("createEventListener()"),
      " function."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleCreateEventListener),
    (0, import_Paragraph.Paragraph)(
      "This function returns an SOA, which can then be put on any event listener option of an element.",
      br(),
      br(),
      "The eventListener parameter of ",
      (0, import_Mono.Mono)("createEventListener()"),
      " takes in two types values.",
      br(),
      "First, a params object, which by default contains the native event which was triggered."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Dependencies"),
    (0, import_Paragraph.Paragraph)(
      "The second parameter, is a spread parameter, containing the dependencies of the event listener."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleCreateEventListenerDependencies),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Extra Params"),
    (0, import_Paragraph.Paragraph)(
      "You may also extend the params object parameter of the event listener,",
      br(),
      "With the ",
      (0, import_Mono.Mono)("params"),
      " attribute.",
      br(),
      br(),
      "This is handy for when you need to pass some value to the client, ",
      br(),
      "that is not necessarily a state variable, but it can change per compilation."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleCreateEventListenerParams),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Important Considerations"),
    (0, import_Paragraph.Paragraph)(
      "It's important to note that the event listener function body exists in ",
      br(),
      b("browser land "),
      " not server land. Therefore the code is ",
      b("untrusted.")
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)("Layouts", "layouts"),
    (0, import_Subtext.Subtext)("Available Via: elegance-js/server/layout"),
    br(),
    br(),
    (0, import_Paragraph.Paragraph)(
      "A layout is a section of a page that is not re-rendered between",
      br(),
      "page navigations, to pages that share the same layout order.",
      br(),
      br(),
      "Instead, the layouts ",
      b("children"),
      " are replaced.",
      br(),
      br(),
      "This has a few advantages. The main one being, that since the elements themselves,",
      br(),
      "are not re-rendered, they maintain things like their hover state."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Basic Usage"),
    (0, import_Paragraph.Paragraph)(
      "Layouts work a bit differently in Elegance than you may perhaps be used to.",
      br(),
      "For example, in Next.JS, layouts are ",
      b("inherited "),
      "to every subsequent page.",
      br(),
      br(),
      "So a layout defined at ",
      (0, import_Mono.Mono)("/"),
      " would apply to ",
      b("every"),
      " single page.",
      br(),
      "Which you may think is nice and saves time, but almost always I find myself in a situation",
      br(),
      "where I want a layout for every page of a given depth, except one.",
      br(),
      br(),
      "And then, I have to either move the special page one depth upward",
      br(),
      "or the others one-depth downward.",
      br(),
      br(),
      "Conversly, layouts in Elegance are ",
      b("not "),
      "inherited, and are are ",
      b("opt-in."),
      br(),
      br(),
      "To create a layout, use the ",
      (0, import_Mono.Mono)("createLayout()"),
      " function, and pass in a name.",
      br(),
      "The name is used so any subsequent calls to this function by other pages will get the same ID."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleCreateLayout),
    (0, import_Paragraph.Paragraph)(
      "This layout ID can then be passed to state, load hooks, etc."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Breakpoints"),
    (0, import_Paragraph.Paragraph)(
      "Creating the actual layout element is simple.",
      br(),
      "Just make a function that takes in child elements, and have it return some kind of simple layout."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleSimpleLayout),
    (0, import_Paragraph.Paragraph)(
      "Then, wrap the children with the built-in ",
      (0, import_Mono.Mono)("Breakpoint()"),
      " element."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleBreakpoint),
    (0, import_SubSeparator.SubSeparator)(),
    (0, import_SubHeading.SubHeading)("Important Considerations"),
    (0, import_Paragraph.Paragraph)(
      "The ",
      (0, import_Mono.Mono)("Breakpoint()"),
      " element is the one that gets replaced",
      br(),
      "when navigating within any given layout.",
      br(),
      br(),
      "All sibling and parent elements stay untouched.",
      br(),
      br(),
      "Also note, that in complex pages where there are multiple nested layouts,",
      br(),
      "the one that has its children replaced, is the layout that is ",
      b("last shared."),
      br(),
      br(),
      b("For example:"),
      br(),
      "Page 1 Layouts: A,B,C,D,E",
      br(),
      "Page 2 Layouts: A,B,D,C,E",
      br(),
      "In this instance, the ",
      b("B"),
      " layout is the last shared layout."
    )
  )
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  metadata,
  page
});
