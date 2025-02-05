export const renderRecursively = (element: Child, index: number) => {
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

    for (const [attrName, attrValue] of Object.entries(element.options)) {
        if (typeof attrValue === "object") {
            throw `Internal error, attr ${attrName} has obj type.`;
        }

        returnString += ` ${attrName.toLowerCase()}="${attrValue}"`;
    }

    if (element.children.length < 1) {
        returnString += "/>";

        return returnString;
    }

    returnString += ">";

    for (const child of element.children) {
	    returnString += renderRecursively(child, index+1);  
    }

    returnString += `</${element.tag}>`;

    return returnString;
};
