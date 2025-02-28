import { Link } from "../../../components/Link";
import { RootLayout } from "../../components/RootLayout";
import { CodeBlock } from "../components/CodeBlock";
import { DocsLayout } from "../components/DocsLayout";
import { Mono } from "../components/Mono";
import { PageHeading } from "../components/PageHeading";
import { Paragraph } from "../components/Paragraph";
import { Separator } from "../components/Separator";
import { SubSeparator } from "../components/SubSeparator";

const exampleElementWithNoOptions = `
h1 ("I'll have 1 child, and no options!"),
h1 ("I'll have 2 children, and no options!", "I am the second child."),
`;

const exampleElementWithNoOptionsResult = `
[
    {
        tag: "h1",
        options: {},
        children: ["I'll have 1 child, and no options!"],
    },
    {
        tag: "h1",
        options: {},
        children: [
            "I'll have 1 child, and no options!",
            "I am the second child!",
        ],
    }
]
`

const exampleOptions = `
div ({
    id: "my-element-id",
    customAttribute: "SUPER-IMPORTANT",
    innerText: "Pokemon Platinum was peak Pokemon.",
})
`;

const exampleAllowedChildren = `
div (
    1,
    true,
    "Hello World!",
    ["Apple", "Banana"],
    ...someArray.map((value, index) => p(index)),
)
`;

const exampleObjectAttributeType = `export enum ObjectAttributeType {
    GENERIC = 0,
    STATE = 1,
    OBSERVER = 2,
    EVENT_LISTENER = 3,
    REFERENCE = 4,
}`;

const exampleObserveReturn = `{
    type: ObjectAttributeType.OBSERVER,
    initialValues: refs.map(ref => ref.value),
    update: update,
    refs: refs.map(ref => ({
        id: ref.id,
        bind: ref.bind,
    })),
};
`;

export const metadata = () => head ({
},
    link ({
        rel: "stylesheet",
        href: "/index.css"
    }),
    title ("Hi There!")
)

export const page = RootLayout (
    DocsLayout (
        PageHeading ("Elements", "elements"),

        Paragraph (
            "Elements are simple function calls of ambient global variables.",

            br(),

            "All standard HTML5 elements except ", Mono ("var"), " (for obvious reasons) are available.",
        ),

        SubSeparator(),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Element Options",
        }),

        Paragraph (
            "The first parameter you pass to an element can either be another element,",

            br(),

            "or an options object. If the first parameter is an element, then that element is prepended",

            br(),

            "to the elements children; and the element will have no options.",
        ),

        CodeBlock (exampleElementWithNoOptions),
        CodeBlock (exampleElementWithNoOptionsResult),

        Paragraph (
            "This is done purely for syntax reasons. For example,",

            br(),

            "I think it's nicer to write ", Mono ("b(\"bold.\")"),
            " than ", Mono ("b({}, \"bold.\")"),

            br(),
            br(),

            "An options object may specify ", b ("any"), " attribute, and that attributes value may be a string,",

            br(),

            "number or boolean.",

            CodeBlock (exampleOptions),
        ),

        SubSeparator (),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Important Considerations",
        }),

        ol ({
            class: "flex flex-col gap-2",
        },
            Paragraph (
                "1. You should enter attributes as camelCase. They will be converted into kebab-case upon compilation.",
            ),

            Paragraph (
                "2. Unlike in React, you'll want to use ", Mono ("class"), " for class names, rather than ", Mono ("className."),
            ),

            Paragraph (
                "3. ", Mono ("on[Event]"), " handlers can only be ",

                Link ({
                    href: "/docs/concepts/object-attributes",
                    class: "border-b-2",
                }, "State Object Attributes"),
            ),
            
            Paragraph (
                "4. The attributes ", Mono ("key"), " and ", Mono ("bp"), " are reserved by Elegance."
            ),

            Paragraph (
                "5. ", Mono ("innerText"), " prepends its own value to the elements children.",
            ),

            Paragraph (
                "6. ", Mono ("innerHTML"), " sets the elements children to its value.",
            ),
        ),

        SubSeparator (),

        h3 ({
            class: "text-lg font-medium mb-1",
            innerText: "Children",
        }),

        Paragraph (
            "The rest of the values passed in to an element call, will be the elements children.",

            br(),

            "Strings, numbers, booleans, arrays, and other element calls, are all valid children.",
        ),

        CodeBlock (exampleAllowedChildren),

        Separator (),

        PageHeading ("Object Attributes", "object-attributes"),

        Paragraph (
            "Object attributes, simply put, are a type of option for elements.",

            br(),

            "Any Element Option with type ", Mono("object"), " is considered an Object Attribute.",

            br(),

            "They are used to tell the compiler to do special things with the option, instead of just serializing it.",

            br(),
            br(),

            "For brevity, we shorten object attributes to [TYPE]OA.",

            br(),

            "So, a State Object Attribute -> SOA.",

            br(),
            br(),

            "Object Attributes are required to specify a ", Mono("type"), " property.",
        ),

        CodeBlock (exampleObjectAttributeType),

        Paragraph (
            "Now, 99% of the time, you won't craft OAs manually.",

            br(),

            "Instead, you'll use a helper function, which returns an OA of a specified type.",

            br(),
            br(),

            "For example, the ", Mono ("observe()"), " function, returns something like this."
        ),

        CodeBlock (exampleObserveReturn),

        Paragraph (
            "Then, the compiler; when it encounters an OA that is of type ", Mono ("ObjectAttributeType.OBSERVER"),

            br(),

            "Calls the update function, sets the return value as the attribute value, and puts the OOA into the page_data.",

            br(),
            br(),

            "This is really all you need to know about OAs, they are just object values for attributes,",

            br(),

            "which the compiler treats differently."
        ),
    ),
)
