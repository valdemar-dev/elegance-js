import { ClientSubject } from "../client/runtime";
import { ServerSubject } from "../client/state";
import { EleganceElement } from "../elements/element";
type ClientComponentCallback<D extends readonly ServerSubject<unknown>[]> = (...dependencies: {
    [K in keyof D]: ClientSubject<D[K]["value"]>;
}) => void;
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
declare function ClientComponent<const T extends readonly ServerSubject<unknown>[]>(callback: ClientComponentCallback<T>, dependencies: [...T]): EleganceElement<true>;
export { ClientComponent };
