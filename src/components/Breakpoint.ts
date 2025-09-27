import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

export const Breakpoint = (
    options: {
        id?: number,
    },
    ...children: Child[]
) => {    
    if (options.id === undefined) throw `Breakpoints must set a name attribute.`;
    const id = options.id;

    delete options.id;

    return div ({
        bp: id,
        ...options,
    },
        ...children,
    );
}
