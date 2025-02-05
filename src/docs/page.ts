import { createState } from "../server/createState"
import { Header } from "./components/Header";

export const state = createState({});

const pageTemplateString = 
`
import { getState, observe } from "elegance-js/helpers";

export const CounterPage = () => {
    const state = getState();

    const counter = state.create(0, { id: "counter", })

    return body ({
        // Set any attribute you want.
        class: "bg-black text-white",
        staticProperty: "I am never re-evaluated!",
        dynamicProperty: () => "My value changes on every render.",
    },
        p ({ 
            // No black-boxes, just the observer pattern.
            innerText: observe({
                ids: [counter.id],
                // Whenever a value in the above id list changes, 
                // this function gets called with the new values. 
                update: (counterValue) => \`\${counterValue}\`,
            })
        }),

        button ({
            onclick: () => {
                counter.set(counter.get() + 1);

                // Explicit state signalling!
                counter.signal()
            }
        })
    )
};
`

// idk if this is right, but yk
// its like close enough
// and it looks pretty cool
const convertToSpans = (inputString: string) => {
    const tokenMap = {
        "const": "text-orange-400",
        "return": "text-orange-400",
        "body": "text-orange-400",
        "observe": "text-orange-400",
        "p": "text-orange-400",
        "button": "text-orange-400",
        "initializePage": "text-orange-400",
        "getState": "text-orange-400",

        "ids": "text-purple-400",
        "state": "text-purple-400",

        "signal": "text-red-400",
        "create": "text-red-400",
        "set": "text-red-400",
        "get": "text-red-400",
        "export": "text-red-400",

        "update": "text-red-400",
        "import": "text-red-400",
        "from": "text-red-400",

        "onclick": "text-orange-200",
        "staticProperty": "text-orange-200",
        "innerText": "text-orange-200",
        "class": "text-orange-200",
        "dynamicProperty": "text-orange-200",
    };

    const regex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|\b(?:const|observe|getState|export|import|from|staticProperty|dynamicProperty|return|body|p|button|onclick|ids|update|innerText|class|signal|state|create|set|get|initializePage)\b|"(?:\\.|[^"\\])*"|\${[^}]*}|`(?:\\.|[^`\\])*`/g;

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


export const page = body ({
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50 cursor-none"
},
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
            class: "mt-4 bg-background-950 p-4 rounded-md mb-8 sm:mb-20",
        },
            div ({},
                h2 ({
                    class: "text-sm sm:text-base text-text-200",
                    innerText: "/pages/page.js"
                })
            ),

            pre ({
                class: "text-xs sm:text-sm font-mono select-text overflow-x-scroll w-full",
                innerHTML: convertToSpans(pageTemplateString)
            })
        )
    ), 

    div ({
        class: "max-w-[900px] w-full mx-auto px-4",
    },
        h2 ({
            class: "text-xl sm:text-3xl font-bold mb-4",
            innerText: "Key Features",
        }),

        section({
            class: "mb-10 pb-4 border-b-[1px] border-background-800"
        },
            h3 ({
                class: "text-base sm:text-lg font-semibold mb-2",
                innerText: "Simple by Design",
            }),

            p ({
                class: "text-xs sm:text-sm text-text-100 leading-5",
            },
                "Elegance is not a ", b("black box "), "with thousands of moving parts, nor does it have 10 years of tech-debt.",
                br({}),
                "Everything is made in-house using as few depencencies as possible (1), with ", b("modern vanilla javascript. "),
                br({}),
                br({}),
                "By learning Elegance, you know ", b("exactly "), "how it works, and what it does.",
                br({}),
                "This ", b("in-depth knowledge "), "allows you to utilize Elegance to it's fullest, allowing you to create the best user experience.",
            ),
        ),

        section({
            class: "mb-10 pb-4 border-b-[1px] border-background-800"
        },
            h3 ({
                class: "text-base sm:text-lg font-semibold mb-2",
                innerText: "Fully Reactive"
            }),

            p ({
                class: "text-xs sm:text-sm text-text-100 leading-5",
                },
                    "Things you've come to learn, or even love from React like ",
                    b("functional components, "),
                    b("conditional rendering, "),
                    b("client-side navigation, "),
                    "etc. Are all fully available in Elegance; no extra packages needed."
                ),
            ),

            section({
                class: "mb-10 pb-4 border-b-[1px] border-background-800"
            },
                h3 ({
                    class: "text-base sm:text-lg font-semibold mb-2",
                    innerText: "Strict & Opinionated"
                }),

                p ({
                    class: "text-xs sm:text-sm text-text-100 leading-5",
                },
                    "Developers are", b(" lazy"), ". Which is not as bad as it sounds. ",
                    "However, it does mean that if you give them", b(" 10 "), "ways of doing something, ",
                    "they will choose the way that is", b(" quickest, "), b(" easiest "), "and", b(" most "), b(" comfortable "), "to them.",
                    br({}),
                    br({}),
                    "This often results in sub-optimal code. ",
                    "It's impacts may not always be apparent, and sometimes may not show at all for a while, ",
                    "however when put to scale, small issues become big issues. ",
                    br({}),
                    br({}),
                    "By forcing developers to code correctly, you can prevent these issues from ever become ones in the first place.",
                    br({}),
                    b("Elegance Page Rater "), "can be mounted on any page to address things like contrast, alt descriptors, component render time, etc."
                ),
            ),
        ),
) 

