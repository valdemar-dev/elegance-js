
import { allElements } from "../shared/serverElements";

async function load() {
    // ensure the existence of element builders in the browser
    Object.assign(globalThis, allElements);
}

load();