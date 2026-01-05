/**
 * Modify this to run whatever basic usage of Elegance you want to test.
 * It's not actual testing, it's more like sanity-testing.
 */
import { allElements, } from "../src/elements/element_list";
import { serializeElement, } from "../src/compilation/compiler";
import { EleganceElement, ProcessSpecialElementOption, SpecialElementOption } from "../src/elements/element";

Object.assign(globalThis, allElements);

class EventListener extends SpecialElementOption {
    value: { callback: () => void, dependencies: any[], };

    constructor(callback: () => void, dependencies: any[]) {
        super();

        this.value = { callback, dependencies };
    }

    serialize(element: EleganceElement<any>, optionName: string) {
        delete element.options[optionName];

        return { clientToken: this.value, }
    }
}

function eventListener(callback: () => void, dependencies: any[]) {
    return new EventListener(callback, dependencies);
}

const onClick = eventListener(() => {}, []);

const h1 = allElements["h1"];

const el = h1({ "onClick": onClick, });

console.log(serializeElement(el))