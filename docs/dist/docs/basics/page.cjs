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
var import_RootLayout = require("../../components/RootLayout");
var import_PageHeading = require("../components/PageHeading");
var import_DocsLayout = require("../components/DocsLayout");
var import_Separator = require("../components/Separator");
var import_Mono = require("../components/Mono");
var import_CodeBlock = require("../components/CodeBlock");
const bodyCallResult = `
{
    tag: "body",
    options: {
        style: "background-color: #000; color: #fff;",
    },
    children: [
        {
            tag: "h1",
            options: {
                innerText: "Greetings Traveler!",
            },
            children: [],
        },
    ],
}
`;
const demoPageTS = `export const page = body ({
    style: "background-color: #000; color: #fff;",
},
    h1 ("Greetings Traveler!"),
);`;
const demoInfoTS = `export const metadata = () => head (
    title ("The BEST Page Ever!"),
);
`;
const demoIndexTs = `import { compile } from "elegance-js/build";

compile({
    environment: "development",
    outputDirectory: "./.elegance",
    pagesDirectory: "./pages",
    writeToHTML: true,
});`;
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
    (0, import_PageHeading.PageHeading)(
      "Preamble",
      "preamble"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "A Quick Forewarning"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance is still only in Beta.",
      br(),
      "There are absolutely no guarantees of backwards compatibility, security or really anything.",
      br(),
      "As such, elegance isn't really meant for production, yet."
    ),
    (0, import_Separator.Separator)(),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "What is Elegance?"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance is an opinionated, strict, compiled, fully-typescript, ",
      br(),
      "web-framework designed for building feature-rich, yet fast and efficient web pages.",
      br(),
      br(),
      "Elegance is written fully by hand, and dependencies are used ",
      b("very "),
      "sparsely.",
      br(),
      "As of writing, ",
      b("esbuild "),
      "is the only dependency.",
      br(),
      br(),
      "A simple, fully-working (non gzipped) elegance page transfers only ",
      b("4kB "),
      "of data!",
      img({
        class: "border-[1px] rounded-sm border-background-600 my-4",
        src: "/nullpage_size.png"
      }),
      'For context, an "empty" (gzipped)  react app on average transfers roughly ',
      b("200-300kB "),
      "of data.",
      br(),
      br(),
      "This lack of JS sent to the browser is achieved through not ",
      "creating unnecessary, wildly complex rude goldberg machines; ",
      "and compilation instead of interpretation."
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)(
      "How Elegance Works",
      "how-elegance-works"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "File Structure"
    }),
    p(
      {
        class: "opacity-80"
      },
      "An Elegance.JS projects file structure is akin to that of something like a Next.JS project. ",
      br(),
      "We use filesystem routing, where each directory contains a ",
      (0, import_Mono.Mono)("page.ts"),
      " file."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Page Files"
    }),
    p(
      {
        class: "opacity-80"
      },
      "The page.ts file has two requirements, it must export a ",
      (0, import_Mono.Mono)("page"),
      " object, which is of type ",
      (0, import_Mono.Mono)('EleganceElement<"body">')
    ),
    (0, import_CodeBlock.CodeBlock)(demoPageTS),
    p(
      {
        class: "opacity-80"
      },
      "and it must also export a ",
      (0, import_Mono.Mono)("metadata"),
      " function, which then resolves into an ",
      (0, import_Mono.Mono)('EleganceElement<"head">')
    ),
    (0, import_CodeBlock.CodeBlock)(demoInfoTS),
    p(
      {
        class: "opacity-80"
      },
      "Elements are created using simple, ambient global functions.",
      br(),
      "The above ",
      (0, import_Mono.Mono)("body()"),
      " call, for example, gets turned into this."
    ),
    (0, import_CodeBlock.CodeBlock)(bodyCallResult),
    p(
      {
        class: "opacity-80"
      },
      "The estute among you may have noticed that the result can easily be serialized into HTML or JSON.",
      br(),
      "This is ",
      b("precisely "),
      "what the Elegance compiler does.",
      br(),
      br(),
      "It recursively goes through the page, notes down any points of interest (more on this later), ",
      br(),
      "and then serializes each element.",
      br(),
      br(),
      "The resulting data can then either be used to serve static HTML pages, ",
      br(),
      "(which still have all the normal features of Elegance, but won't get re-rendered),",
      br(),
      "or dynamically server-rendered content."
    ),
    p(
      {
        class: "opacity-80"
      },
      "Metadata is of course a function, so that you may dynamically generate page information. ",
      br(),
      br(),
      "This is useful for something like a social media page, ",
      br(),
      "where you may want need to fetch information about a post, and then display it in a nice rich embed."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Compilation"
    }),
    p(
      {
        class: "opacity-80"
      },
      "Elegance exposes a function called ",
      (0, import_Mono.Mono)("compile()"),
      " which your project should call to build itself.",
      br(),
      "This is typically done via the use of the built in build scripts.",
      br(),
      "However, if you wish to customize your build options, you need just create a file which calls compile.",
      br(),
      br(),
      "Compilation handles generating page_data files, ",
      "HTML, JSON, transpilation of ts into js, etc.",
      br(),
      br(),
      "We will explore compilation, state, reactivity, optimization, ",
      "static generation, hot-reloading, and many of the other features of ",
      "Elegance in greater-depth later on. However, this is all that you need to know for now."
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)(
      "Installation",
      "installation"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "NPM"
    }),
    p(
      {
        class: "opacity-80"
      },
      "To make an elegance project, first create a directory with a name of your choosing.",
      br(),
      "For this example, we'll use ",
      (0, import_Mono.Mono)("my-first-webpage"),
      br(),
      "Then, in that directory, issue the following command to initialize an empty NPM project."
    ),
    (0, import_CodeBlock.CodeBlock)("npm init -y", false),
    p(
      {
        class: "opacity-80"
      },
      "After this, install elegance-js by running"
    ),
    (0, import_CodeBlock.CodeBlock)("npm install elegance-js", false),
    p(
      {
        class: "opacity-80"
      },
      "And that's it! Elegance.js has been installed into your project."
    ),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)(
      "Your First Page",
      "your-first-page"
    ),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Making a Project"
    }),
    p(
      {
        class: "opacity-80"
      },
      "To bootstrap an Elegance.js project, run the following command in the directory we just made."
    ),
    (0, import_CodeBlock.CodeBlock)("npx bootstrap", false),
    p(
      {
        class: "opacity-80"
      },
      "This will create a few files and directories for you.",
      br(),
      "Firstly, it creates the aforementioned pages directory, and an example ",
      (0, import_Mono.Mono)("page.ts"),
      " file.",
      br(),
      br(),
      "Then it makes a public directory where you can store files",
      br(),
      "that you want to be publicly accessible on your website.",
      br(),
      br(),
      "Thirdly, it creates an ",
      (0, import_Mono.Mono)("env.d.ts + tsconfig.json"),
      br(),
      "which gives you ambient global typings for the elements that are in Elegance.",
      br(),
      br(),
      "Lastly, it creates a file in the pages directory called ",
      (0, import_Mono.Mono)("index.css"),
      br(),
      "which tailwind will automatically compile and put in your dist folder."
    ),
    div({
      class: "my-10"
    }, []),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Running your project."
    }),
    p(
      {
        class: "opacity-80"
      },
      "There's a few way to run elegance.",
      br(),
      br(),
      "The intended way is using our provided scripts."
    ),
    (0, import_CodeBlock.CodeBlock)("npx dev", false),
    (0, import_CodeBlock.CodeBlock)("npx prod", false),
    (0, import_CodeBlock.CodeBlock)("npx static", false),
    p(
      {
        class: "opacity-80"
      },
      "However, you may also serve the files in any way you like.",
      br(),
      br(),
      "API Routes will not be available without the built-in Elegance server,",
      br(),
      "but all static content like event listeners, load hooks, pages, etc, will work."
    )
  )
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  metadata,
  page
});
