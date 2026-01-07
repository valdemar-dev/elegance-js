import { EleganceElement, SpecialElementOption } from "../elements/element";

type ObserverCallback = () => void;

class Observer extends SpecialElementOption {
    callback: ObserverCallback;
    dependencies: any[];

    constructor(callback: ObserverCallback, dependencies: any[]) {
        super();

        this.callback = callback;
        this.dependencies = dependencies;
    }

    serialize(element: EleganceElement<any>, optionName: string) {
        let result = "{"

        result += `optionName:"${optionName}",`,
        result += `callback:${this.callback},`,
        result += `dependencies:[${this.dependencies}]`,

        result += "}";

        return result;
    }

    mutate(element: EleganceElement<any>, optionName: string) {
        delete element.options[optionName];
    }
}

function observe(callback: ObserverCallback, dependencies: any[]) {
    return new Observer(callback, dependencies);
}

export {
    observe,
    Observer,
}