import { RootLayout } from "../../components/RootLayout";
import { PageHeading } from "../components/PageHeading";
import { DocsLayout } from "../components/DocsLayout";
import { Separator } from "../components/Separator";
import { Mono } from "../components/Mono";
import { CodeBlock, } from "../components/CodeBlock";
import { highlightCode } from "../../utils/MEGALEXER";
import { Subtext } from "../components/Subtext";
import { kill } from "process";

const demoPageTS =
`export const page = body ({
    style: "background-color: #000; color: #fff;",
},
    h1 ({
        innerText: "Greetings Traveler!",
    }),
);`;

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

const demoInfoTS =
`export const metadata = () => head ({},
    title ("Greetings Traveler!"),
);
`;

export const page = RootLayout (
    DocsLayout (
        PageHeading (
            "Preamble",
            "preamble",
        ), 

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "A Quick Forewarning",
        }),

        p ({
            class: "opacity-80",
        },
            "Elegance is still in very early development.",

            br (),

            "There are absolutely no guarantees of backwards compatibility, security or really anything.",

            br (),

            "As such, elegance isn't really meant for production, yet."
        ),

        div ({
            class: "my-10",
        }, []),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "What is Elegance?",
        }),

        p ({
            class: "opacity-80",
        },
            "Elegance is an opinionated, strict, compiled, fully-typescript, ",

            br (),

            "web-framework designed for building feature-rich, yet fast and efficient web pages.",

            br (),
            br (),

            "Elegance is written fully by hand, and dependencies are used ",
            b("very "),
            "sparsely.",

            br (),

            "As of writing, ", b("esbuild "), "is the only dependency.",

            br (),
            br (),

            "A simple, fully-working (non gzipped) elegance page transfers only ",
            b("4kB "),
            "of data!",

            img ({
                class: "border-[1px] rounded-sm border-background-600 my-4",
                src: "/assets/nullpage_size.png",
            }),

            "For context, an \"empty\" (gzipped)  react app on average transfers roughly ",
            b("200-300kB "), "of data.",

            br (),
            br (),

            "This lack of JS sent to the browser is achieved through not ",
            "creating unnecessary, wildly complex rude goldberg machines; ",
            "and compilation instead of interpretation."
        ),

        Separator(),

        PageHeading (
            "How Elegance Works",
            "how-elegance-works",
        ), 

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "File Structure",
        }),

        p ({
            class: "opacity-80",
        },
            "An Elegance.JS projects file structure is akin to that of something like a Next.JS project. ",

            br (),

            "We use filesystem routing, where each directory contains a ",
            Mono("page.ts"),
            ", and an ",
            Mono("info.ts"),
            " file.",
        ),

        div ({
            class: "my-10",
        }, []),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Page Files",
        }),

        p ({
            class: "opacity-80",
        },
            "The page.ts file has one requirement, it must export a ",
            Mono("page"), " object, which is of type ", Mono("EleganceElement<\"body\">"),
        ),

        CodeBlock(demoPageTS),

        p ({
            class: "opacity-80",
        },
            "Elements are created using simple, ambient global functions.",
            br (),
            "The above ", Mono("body()"),
            " call, for example, gets turned into this.",
        ),

        CodeBlock(bodyCallResult),

        p ({
            class: "opacity-80",
        },
            "The estute among you may have noticed that the result can easily be serialized into HTML or JSON.",

            br (),

            "This is ", b("precisely "), "what the Elegance compiler does.",

            br (),
            br (),

            "It recursively goes through the page, notes down any points of interest (more on this later), ",

            br (),

            "and then serializes each element.",

            br (),
            br (),

            "The resulting data can then either be used to serve static HTML pages, ",

            br (),

            "(which still have all the normal features of Elegance, but won't get re-rendered),",
            
            br (),

            "or dynamically server-rendered content."
        ),

        div ({
            class: "my-10",
        }, []),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Info Files",
        }),

        p ({
            class: "opacity-80",
        },
            "The info.ts file also has only one requirement, it must export a ",
            Mono("metadata"), " function, which then resolves into an ", Mono("EleganceElement<\"head\">"),
        ),

        CodeBlock(demoInfoTS),

        p ({
            class: "opacity-80",
        },
            "Metadata is of course a function, so that you may dynamically generate page information. ",

            br (),
            br (),

            "This is useful for something like a social media page, ",

            br (),

            "where you may want need to fetch information about a post, and then display it in a nice rich embed."
        ),

        div ({
            class: "my-10",
        }, []),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Compilation",
        }),

        p ({
            class: "opacity-80",
        },
            "Elegance exposes a function called ", Mono("compile()"),
            " which your project should call to build itself.",

            br (),

            "Compilation handles generating page_data files, ",
            "HTML, JSON, transpilation of ts into js, etc.",

            br (),
            br (),

            "We will explore compilation, state, reactivity, optimization, ",
            "static generation, hot-reloading, and many of the other features of ",
            "Elegance in greater-depth later on. However, this is all that you need to know for now."
        ),

        Separator(),

        PageHeading (
            "Installation",
            "installation",
        ), 

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "GitHub",
        }),

        p ({
            class: "opacity-80",
        },
            "As Elegance is still in it's formative stages, ",
            "we haven't yet published to things like the NPM registry.",

            br (),

            "However, installation is still quite simple.",

            br (),
            br (),

            "First, decide where you'll want Elegance to live. ",

            br (),

            "On a linux-based system, somewhere like ", Mono("~/bin/elegance"), " is a good place.",
            
            br (),
            
            b("Just remember where it is! You'll need it later."),

            br (),
            br (),

            "Install ",

            a ({
                href: "https://git-scm.com/",
                class: "border-b-2 border-text-50",
            }, "git"),

            " for your system, if you haven't already.",

            br (),
            br (),

            "Next, open a terminal / command prompt window, and issue the following the command."
        ),

        CodeBlock("git clone https://github.com/valdemar-dev/elegance-js [your destination folder]", false),

        p ({
            class: "opacity-80",
        },
            "You have now installed Elegance.JS onto your system. Congratulations!",
        ),

        Separator(),

        PageHeading (
            "Your First Page",
            "your-first-page",
        ), 

        p ({
            class: "opacity-80",
        },
            "Now that Elegance is installed on your machine, it's time to make your first page.",

            br (),

            "With your terminal still open, go ahead and make a new a directory where your project will live.",

            br (),
            br (),

            "Once that's done, navigate to the directory you just made, and run this command.",
        ),

        CodeBlock("npm init -y && npm install esbuild", false),

        p ({
            class: "opacity-80",
        },
            "This will create a simple npm project, and install ", b("esbuild"), ", Elegances only dependency.",

            br (),
            br (),

            "For the unitiated, esbuild is a ridiculously fast JS bundler written in Go.",

            br(),

            "I don't currently *have* plans to write my own bundler, but the complexity of the build process ",

            br(),

            "may make it necessary.",

            br (),

            Subtext("(most of the build time is spent sending different build calls to esbuild)"),
        ),

        div ({
            class: "my-10",
        }),

        p ({
            class: "opacity-80",
        },
            "Next, you'll need to link Elegance to your project.",
        ),

        CodeBlock("npm link [where you installed elegance]", false),

        p ({
            class: "opacity-80",
        },
            "After linking, create a file at the root of your project called ", 
            Mono("elegance.d.ts"),

            br (),
            
            "And put this inside of it.",
        ),

        CodeBlock('/// <reference path="elegance-js/types/global" />', false),

        p ({
            class: "opacity-80",
        },
            "This takes the ambient global types from Elegance, and puts them into your project.",

            br(),
            br(),

            "If all goes well, Elegance should be setup fully now!",
        ),
    ),
);
