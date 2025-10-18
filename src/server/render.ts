import "../shared/bindServerElements";

export const renderRecursively = (element: Child) => {
    let returnString = "";

    if (typeof element === "boolean") return returnString;

    else if (
        typeof element === "number" ||
        typeof element === "string"
    ) {
	    return returnString + element;
    }

    else if (Array.isArray(element)) {
        return returnString + element.join(", ");
    }

    returnString += `<${element.tag}`;
    
    if (typeof element.options === "object") {
        const {
            tag: elementTag,
            options: elementOptions,
            children: elementChildren
        } = (element.options as AnyBuiltElement);

        if (
            elementTag !== undefined &&
            elementOptions !== undefined &&
            elementChildren !== undefined
        ) {
            const children = element.children as Child[];
            
            (element.children as Child[]) = [
                (element.options as Child),
                ...children
            ];
            
            element.options = {};
        }  else {
            for (const [attrName, attrValue] of Object.entries(element.options)) {
                if (typeof attrValue === "object") {
                    throw `Attr ${attrName}, for element ${element.tag} has obj type. Got: ${JSON.stringify(element, null, 2)}`;
                }
    
                returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
            }
        }
    } else if (typeof element.options !== "object" && element.options !== undefined) {
        element.children = [element.options, ...element.children || []];
    }
     
    if (element.children === null) {
        returnString += "/>";

        return returnString;
    }

    returnString += ">";

    for (const child of element.children) {
	    returnString += renderRecursively(child);  
    }

    returnString += `</${element.tag}>`;

    return returnString;
};

export const serverSideRenderPage = async (page: Page, pathname: string) => {
    if (!page) {
        throw `No Page Provided.`;
    }
    
    if (typeof page === "function") {
        throw `Unbuilt page provided to ssr page.`
    }

    const bodyHTML = renderRecursively(page);

    return {
        bodyHTML,
    };
};
