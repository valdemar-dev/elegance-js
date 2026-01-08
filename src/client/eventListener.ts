import { EleganceElement, SpecialElementOption } from "../elements/element";

type EventListenerCallback = () => void;

class EventListener extends SpecialElementOption {
    callback: EventListenerCallback;
    dependencies: any[];

    constructor(callback: EventListenerCallback, dependencies: any[]) {
        super();

        this.callback = callback;
        this.dependencies = dependencies;
    }

    serialize(optionName: string) {
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

function eventListener(callback: EventListenerCallback, dependencies: any[]) {
    return new EventListener(callback, dependencies);
}

export {
    eventListener,
    EventListener,
}