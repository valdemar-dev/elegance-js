import { eventListener } from "../../../src/client/eventListener";
import { loadHook } from "../../../src/client/loadHook";
import { observer } from "../../../src/client/observer";
import { state } from "../../../src/client/state";
import { clientPackages } from "../../../src/compilation/compiler"; 
import path from "path";

import * as THREE from "three";

export const page = () => {
    clientPackages({
        THREE: "three",
    });

    const message = state("HELLOTHERE");

    loadHook((message) => {
        const timerId = setTimeout(() => {
            message.value = "SCREW YOU";
        }, 10000);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(renderer.domElement);

        const geometry = new THREE.CircleGeometry(100, 64);
        const material = new THREE.MeshBasicMaterial({ wireframe: true });
        const circle = new THREE.Mesh(geometry, material);
        scene.add(circle);

        camera.position.z = 5;

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

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