import { AnyElement, ElementOptionsOrChild } from "../elements/element";
/**
 * Create a custom anchor element that let's you hook into client-side navigation.
 * If provided a URL that is non-local, it will default to normal navigation.
 * @param options Standard element optins, must include href for the link to work properly.
 * @param children Standard element children.
 * @returns A custom anchor element.
 */
declare function Link(options: ElementOptionsOrChild<"a">, ...children: AnyElement[]): import("..").EleganceElement<"a", true>;
export { Link, };
