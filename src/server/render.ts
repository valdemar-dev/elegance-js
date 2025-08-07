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
    
    const {
        tag: elementTag,
        options: elementOptions,
        children: elementChildren
    } = (element.options as AnyBuiltElement);

    if (
        elementTag &&
        elementOptions &&
        elementChildren
    ) {
        const children = element.children as Child[];
        
        (element.children as Child[]) = [
            (element.options as Child),
            ...children
        ];
        
        element.options = {};
        
        for (let i = 0; i < children.length+1; i++) {
            const child = element.children![i];
            
            returnString += renderRecursively(child)
        }
        
        returnString += `</${element.tag}>`;
        
        return returnString;
    } 
    
    if (typeof element.options === "object") {
        for (const [attrName, attrValue] of Object.entries(element.options)) {
            if (typeof attrValue === "object") {
                throw `Attr ${attrName}, for element ${element.tag} has obj type. Got: ${JSON.stringify(element)}`;
            }

            returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
        }
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
