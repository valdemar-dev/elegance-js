
import { allElements } from "../shared/serverElements";

enum ClientTokenType {};

type EventListenerClientToken = {};

type ClientTokenValue = EventListenerClientToken;

type ClientToken = {
    type: ClientTokenType,
    value: ClientTokenValue, 
};

async function load() {
    // ensure the existence of element builders in the browser
    Object.assign(window, allElements);


}

load();

export {
    ClientToken,
}