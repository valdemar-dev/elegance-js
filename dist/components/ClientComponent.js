import { loadHook } from "../client/loadHook";
import { state } from "../client/state";
import { compilerStore } from "../compilation/compiler";
/**
 * Create a component that will be client-side rendered.
 *
 * You should really only use this for specific things, not as a top-level component.
 * Server-side rendering is not only faster and more efficient, but also gives your components access to more things.
 *
 * This component exists for specific scenarios, such as if you have client-side data fetching that you need to show react-style "suspense" components for.
 *
 * **IMPORTANT** `callback` is sent literally as-is to the browser, and thus has no context of server-side variables, and is untrusted.
 *
 * @param callback The component to send to the browser.
 * @param dependencies Any subjects that the component needs access to.
 * @returns An HTML element to track the position of the Client Component.
 */
function ClientComponent(callback, dependencies) {
    const store = compilerStore.getStore();
    if (!store) {
        throw new Error("ClientComponent() can only be invoked during the compilation of a page or layout, never at the top-level of a file.");
    }
    const callbackState = state(callback);
    const componentId = state(store.generateId());
    loadHook((componentId, callback, ...dependencies) => {
        let node;
        function update() {
            node?.remove();
            const element = callback.value(...dependencies);
            const HTMLElement = eleganceClient.createHTMLElementFromElement(element);
            node = HTMLElement.root;
            const trackedElement = document.querySelector(`template[component-id="${componentId.value}"]`);
            if (!trackedElement)
                return;
            trackedElement.parentElement.insertBefore(HTMLElement.root, trackedElement);
        }
        const observers = [];
        for (const dep of dependencies) {
            const id = `${Math.random() * 1000 + Date.now()}`;
            dep.observe(id, update);
            observers.push({ subject: dep, id, });
        }
        update();
        return () => {
            node?.remove();
            for (const observer of observers) {
                observer.subject.unobserve(observer.id);
            }
        };
    }, [componentId, callbackState, ...dependencies]);
    return template({
        "component-id": componentId.value,
    });
}
export { ClientComponent };
