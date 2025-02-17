import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const Breakpoint = (
    options: Record<string, any>,
    ...children: Child[]
) => { 
    if (!options.name) throw `Breakpoints must set a name attribute.`;
    const name = options.name;

    delete options.name;

    return div ({
        bp: {
            type: ObjectAttributeType.BREAKPOINT,
            value: name,
        },
        ...options,
    },
        ...children,
    );
}
