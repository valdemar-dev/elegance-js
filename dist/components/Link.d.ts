import { AnyElement, ElementOptionsOrChild, SpecialElementOption } from "../elements/element";
/**
 * Create a custom anchor element that let's you hook into client-side navigation.
 * If provided a URL that is non-local, it will default to normal navigation.
 * @param options Standard element optins, must include href for the link to work properly.
 * @param children Standard element children.
 * @returns A custom anchor element.
 */
type ExtraOptions = {
    /** Mandatory, where this Link should take the user to. */
    href: string | SpecialElementOption;
    /** Set window.scrollTop to 0 whenever this link navigates. */
    resetScrollOnNav?: boolean;
};
declare function Link(options: ElementOptionsOrChild<"a", ExtraOptions>, ...children: AnyElement[]): import("..").EleganceElement<"a", true>;
export { Link, };
