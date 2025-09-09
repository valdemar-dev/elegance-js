import { ObjectAttributeType } from "../helpers/ObjectAttributeType";

let elementKey = 0;

const processOptionAsObjectAttribute = (
    element: AnyBuiltElement,
    optionName: string,
    optionValue: ObjectAttribute<any>,
    objectAttributes: Array<any>,
) => {
    const lcOptionName = optionName.toLowerCase();

    const options = element.options as ElementOptions;

    let key = options.key;
    if (key == undefined) {
        elementKey -= 1
        
        key = elementKey;
        
        options.key = key;
    }

    if (!optionValue.type) {
        throw `ObjectAttributeType is missing from object attribute. ${element.tag}: ${optionName}/${optionValue}`;
    }

    // TODO: jank lol - val 2025-02-17
    let optionFinal = lcOptionName;
    
    switch (optionValue.type) {
        case ObjectAttributeType.STATE:
            const SOA = optionValue as ObjectAttribute<ObjectAttributeType.STATE>;

            if (typeof SOA.value === "function") {
                delete options[optionName];
                break;
            }

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [SOA.value];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = SOA.value;
            }

            break;

        case ObjectAttributeType.OBSERVER:
            const OOA = optionValue as ObjectAttribute<ObjectAttributeType.OBSERVER>;

            const firstValue = OOA.update(...OOA.initialValues);

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [firstValue];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = firstValue;
            }

            optionFinal = optionName;

            break;

        case ObjectAttributeType.REFERENCE:
            options["ref"] = (optionValue as any).value;

            break;
    }

    objectAttributes.push({ ...optionValue, key: key, attribute: optionFinal, });
};

export const processPageElements = (
    element: Child,
    objectAttributes: Array<any>,
    parent: Child,
): Child => {
    if (
        typeof element === "boolean" ||
        typeof element === "number" ||
        Array.isArray(element)
    ) return element;

    if (typeof element === "string") {
        return (element);
    }

    const processElementOptionsAsChildAndReturn = () => {
        const children = element.children as Child[];
        
        (element.children as Child[]) = [
            (element.options as Child),
            ...children
        ];
        
        element.options = {};
        
        for (let i = 0; i < children.length+1; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes, element)
            
            element.children![i] = processedChild;
        }
        
        return {
            ...element,
            options: {},
        }
    };

    if (typeof element.options !== "object") {
        return processElementOptionsAsChildAndReturn();
    }
    
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
        return processElementOptionsAsChildAndReturn();
    }

    const options = element.options as ElementOptions;

    for (const [optionName, optionValue] of Object.entries(options)) {
        const lcOptionName = optionName.toLowerCase();

        if (typeof optionValue !== "object") {
            if (lcOptionName === "innertext") {
                delete options[optionName];

                if (element.children === null) {
                    throw `Cannot use innerText or innerHTML on childrenless elements.`;
                }
                element.children = [optionValue, ...(element.children as Child[])];

                continue;
            }

            else if (lcOptionName === "innerhtml") {
                if (element.children === null) {
                    throw `Cannot use innerText or innerHTML on childrenless elements.`;
                }

                delete options[optionName];
                element.children = [optionValue];

                continue;
            }
            
            // why cant naming be consistent.
            // this was made to make life easier, eg. dataTest, ariaLabel, into data-test, aria-label. BUt html BAD and they use incosistent casing.
            // means this breaks stuff.
            /*
            delete options[optionName];
            options[camelToKebabCase(optionName)] = optionValue;
            */
            
            continue;
        };

        processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
    }

    if (element.children) {    
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes, element)
    
            element.children![i] = processedChild;
        }
    }

    return element;
};