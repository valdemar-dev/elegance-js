export const renderRecursively = (element: Child) => {
    if (typeof element === "boolean") {
        return null;
    }

    if (typeof element === "number" || typeof element === "string") {
        return document.createTextNode(element.toString());
    }

    if (Array.isArray(element)) {
        const fragment = document.createDocumentFragment();
        element.forEach(item => {
            const childNode = renderRecursively(item);
            if (childNode) fragment.appendChild(childNode);
        });
        return fragment;
    }

    const domElement = document.createElement(element.tag);

    if (typeof element.options === "object" && element.options !== null) {
        for (const [attrName, attrValue] of Object.entries(element.options)) {
            if (typeof attrValue === "object") {
                throw new Error(`Attr ${attrName} for element ${element.tag} has object type. Got: ${JSON.stringify(element)}`);
            }
            domElement.setAttribute(attrName.toLowerCase(), attrValue);
        }
    }

    if (element.children !== null) {
        if (Array.isArray(element.children)) {
            element.children.forEach(child => {
                const childNode = renderRecursively(child);
                if (childNode) domElement.appendChild(childNode);
            });
        } else {
            const childNode = renderRecursively(element.children);
            if (childNode) domElement.appendChild(childNode);
        }
    }

    return domElement;
};