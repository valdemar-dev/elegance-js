import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const Breakpoint = (...children: Child[]) => div ({
    bp: {
        type: ObjectAttributeType.BREAKPOINT,
        value: "true",
    },
},
    ...children,
);
