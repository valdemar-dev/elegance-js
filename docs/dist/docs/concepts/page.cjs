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
var import_SubSeparator = require("../components/SubSeparator");
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
`;
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
    (0, import_PageHeading.PageHeading)("Elements", "elements"),
    (0, import_Paragraph.Paragraph)(
      "Elements are simple function calls of ambient global variables.",
      br(),
      "All standard HTML5 elements except ",
      (0, import_Mono.Mono)("var"),
      " (for obvious reasons) are available."
    ),
    (0, import_SubSeparator.SubSeparator)(),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Element Options"
    }),
    (0, import_Paragraph.Paragraph)(
      "The first parameter you pass to an element can either be another element,",
      br(),
      "or an options object. If the first parameter is an element, then that element is prepended",
      br(),
      "to the elements children; and the element will have no options."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleElementWithNoOptions),
    (0, import_CodeBlock.CodeBlock)(exampleElementWithNoOptionsResult),
    (0, import_Paragraph.Paragraph)(
      "This is done purely for syntax reasons. For example,",
      br(),
      "I think it's nicer to write ",
      (0, import_Mono.Mono)('b("bold.")'),
      " than ",
      (0, import_Mono.Mono)('b({}, "bold.")'),
      br(),
      br(),
      "An options object may specify ",
      b("any"),
      " attribute, and that attributes value may be a string,",
      br(),
      "number or boolean.",
      (0, import_CodeBlock.CodeBlock)(exampleOptions)
    ),
    (0, import_SubSeparator.SubSeparator)(),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Important Considerations"
    }),
    ol(
      {
        class: "flex flex-col gap-2"
      },
      (0, import_Paragraph.Paragraph)(
        "1. You should enter attributes as camelCase. They will be converted into kebab-case upon compilation."
      ),
      (0, import_Paragraph.Paragraph)(
        "2. Unlike in React, you'll want to use ",
        (0, import_Mono.Mono)("class"),
        " for class names, rather than ",
        (0, import_Mono.Mono)("className.")
      ),
      (0, import_Paragraph.Paragraph)(
        "3. ",
        (0, import_Mono.Mono)("on[Event]"),
        " handlers can only be ",
        (0, import_Link.Link)({
          href: "/docs/concepts/object-attributes",
          class: "border-b-2"
        }, "State Object Attributes")
      ),
      (0, import_Paragraph.Paragraph)(
        "4. The attributes ",
        (0, import_Mono.Mono)("key"),
        " and ",
        (0, import_Mono.Mono)("bp"),
        " are reserved by Elegance."
      ),
      (0, import_Paragraph.Paragraph)(
        "5. ",
        (0, import_Mono.Mono)("innerText"),
        " prepends its own value to the elements children."
      ),
      (0, import_Paragraph.Paragraph)(
        "6. ",
        (0, import_Mono.Mono)("innerHTML"),
        " sets the elements children to its value."
      )
    ),
    (0, import_SubSeparator.SubSeparator)(),
    h3({
      class: "text-lg font-medium mb-1",
      innerText: "Children"
    }),
    (0, import_Paragraph.Paragraph)(
      "The rest of the values passed in to an element call, will be the elements children.",
      br(),
      "Strings, numbers, booleans, arrays, and other element calls, are all valid children."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleAllowedChildren),
    (0, import_Separator.Separator)(),
    (0, import_PageHeading.PageHeading)("Object Attributes", "object-attributes"),
    (0, import_Paragraph.Paragraph)(
      "Object attributes, simply put, are a type of option for elements.",
      br(),
      "Any Element Option with type ",
      (0, import_Mono.Mono)("object"),
      " is considered an Object Attribute.",
      br(),
      "They are used to tell the compiler to do special things with the option, instead of just serializing it.",
      br(),
      br(),
      "For brevity, we shorten object attributes to [TYPE]OA.",
      br(),
      "So, a State Object Attribute -> SOA.",
      br(),
      br(),
      "Object Attributes are required to specify a ",
      (0, import_Mono.Mono)("type"),
      " property."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleObjectAttributeType),
    (0, import_Paragraph.Paragraph)(
      "Now, 99% of the time, you won't craft OAs manually.",
      br(),
      "Instead, you'll use a helper function, which returns an OA of a specified type.",
      br(),
      br(),
      "For example, the ",
      (0, import_Mono.Mono)("observe()"),
      " function, returns something like this."
    ),
    (0, import_CodeBlock.CodeBlock)(exampleObserveReturn),
    (0, import_Paragraph.Paragraph)(
      "Then, the compiler; when it encounters an OA that is of type ",
      (0, import_Mono.Mono)("ObjectAttributeType.OBSERVER"),
      br(),
      "Calls the update function, sets the return value as the attribute value, and puts the OOA into the page_data.",
      br(),
      br(),
      "This is really all you need to know about OAs, they are just object values for attributes,",
      br(),
      "which the compiler treats differently."
    )
  )
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  metadata,
  page
});
