import { Link } from "../components/Link";
import { Header, } from "./components/Header";
import { RootLayout } from "./components/RootLayout";

export const metadata = () => {
    return head ({},
        link ({
            rel: "stylesheet",
            href: "/index.css"
        }),
        title ("Hi There!")
    )
}

const pageTemplateString = 
`
const variables = createState({
    counter: 0,
});

const functions = createState({
    increment: eventListener(
        [variables.counter],
        (event, counter) => {
            counter.value++;
            counter.signal();
        }
    ),
});

export const page = body ({
    class: "bg-black text-white",
},
    p ({
        innerText: observe(
            [variables.counter],
            (value) => \`The Counter is at: \${value}\`,
        )
    }),

    button ({
        onClick: functions.increment,
    },
        "Increment Counter",
    ),
);
`

// idk if this is right, but yk
// its like close enough
// and it looks pretty cool
const convertToSpans = (inputString: string) => {
    const tokenMap = {
        "body": "text-orange-400",
        "observe": "text-orange-400",
        "createState": "text-orange-400",
        "p": "text-orange-400",
        "button": "text-orange-400",
        "eventListener": "text-orange-400",
        "signal": "text-orange-400",

        "const": "text-orange-300",
        "return": "text-orange-300",

        "export": "text-red-400",

        "import": "text-red-400",
        "from": "text-red-400",

        "onClick": "text-orange-200",
        "innerText": "text-orange-200",
        "class": "text-orange-200",
        "increment": "text-orange-200",
        "counter": "text-orange-200",
        "event": "text-orange-200",
    };

    const regex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|\b(?:const|incrementobserve|createState|export|import|from|return|body|p|button|onClick|ids|update|event|innerText|counter|class|signal|eventListener)\b|"(?:\\.|[^"\\])*"|\${[^}]*}|`(?:\\.|[^`\\])*`/g;

    const result = inputString.replace(regex, (match) => {
        if (match.startsWith("//")) {
            return `<span class="text-neutral-500">${match}</span>`;
        }

        else if (match.startsWith("${") && match.endsWith("}")) {
            return `<span class="text-purple-400">${match}</span>`;
        }
        
        else if (match.startsWith('"') && match.endsWith('"')) {
            return `<span class="text-green-400">${match}</span>`;
        }

        else if (match.startsWith("`") && match.endsWith("`")) {
            return `<span class="text-green-400">${match}</span>`;
        }

        const className = tokenMap[match as keyof typeof tokenMap];

        return className ? `<span class="${className}">${match}</span>` : match;
    });

    return result;
}


export const page = RootLayout (
    Header(),

    div ({ 
        class: "max-w-[900px] w-full mx-auto pt-4 px-2",
    },
        div ({
            class: "text-center px-4 pt-8 mb-12 sm:mb-20"
        },
            div ({
                class: "text-3xl md:text-4xl lg:text-5xl font-bold font-inter mb-4",
            },
                span ({
                    innerText: "Your site doesn't",
                }),

                span ({
                    innerText: " need ",
                }),

                span({
                    innerText: "to be slow.",
                }),
            ),

            p ({
                class: "text-xs sm:text-sm text-text-100",
                innerHTML: "Nor should you depend on <b class=\"hover:text-red-400\">1314</b> packages to display <b>\"Hello World\"</b>.",
            }),
        ),

        p ({
            class: "text-base sm:text-xl text-center"
        },
            span ({
                innerText: "Elegance gives you",
            }),

            span ({
                class: "bg-gradient-to-r font-bold from-red-400 to-orange-400 bg-clip-text text-transparent",
                innerText: " performance, "
            }),

            span ({
                class: "bg-gradient-to-r font-bold from-blue-400 to-green-400 bg-clip-text text-transparent",
                innerText: "state-of-the-art features",
            }),

            span ({
                innerText: " and ",
            }),

            span ({
                class: "font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
                innerText: "syntaxical sugar, ",
            }),

            span ({
                class: "",
                innerHTML: "whilst leaving <b>you</b> in full control of how your site works."
            })
        ),

        div ({
            class: "mt-6 bg-background-950 p-4 rounded-md mb-8 sm:mb-20",
        },
            div ({},
                h2 ({
                    class: "text-sm sm:text-base text-text-200",
                    innerText: "/pages/page.ts"
                })
            ),

            pre ({
                class: "text-xs sm:text-sm font-mono select-text overflow-x-scroll w-full",
                innerHTML: convertToSpans(pageTemplateString),
            }),
        )
    ), 

    div ({
        class: "max-w-[900px] w-full mx-auto px-4 pb-64 flex flex-col gap-4 items-start  sm:items-center sm:flex-row sm:justify-between",
    },
        div ({
        },
            h2 ({
                class: "text-xl sm:text-3xl font-bold",
                innerText: "Learn More",
            }),

            p ({
            },
                "Interested? ",
                "Read our Docs on how Elegance works.",
            )
        ),

        Link ({
            class: "text-base sm:text-lg uppercase font-bold text-background-950 font-semibold px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-accent-400",
            href: "/docs/basics",
            innerText: "documentation"
        }),
    ),
) 

