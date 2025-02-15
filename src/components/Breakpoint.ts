import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const Breakpoint = (
    { name, }: { name: string, },
    ...children: Child[]
) => div ({
    bp: {
        type: ObjectAttributeType.BREAKPOINT,
        value: name,
    },
},
    ...children,
);
