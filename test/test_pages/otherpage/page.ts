import { eventListener } from "../../../src/client/eventListener";
import { loadHook } from "../../../src/client/loadHook";
import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";
import { clientPackages } from "../../../src/compilation/compiler"; 
import path from "path";

import * as THREE from "three/build/three.cjs";

export const page = () => {
    clientPackages({
        THREE: "three/build/three.cjs",
    });

    const message = state("HELLOTHERE");

    loadHook((message) => {
        const timerId = setTimeout(() => {
            message.value = "SCREW YOU";
        }, 10000);

        return () => {
            clearInterval(timerId);
        }
    }, [message]);

    return div({
        innerText: observer((c) => c.toString(), [message]),
    }, 

        div({
            class: "what the flip"
        }),
    );
};

export const metadata = () => {
    return []
};