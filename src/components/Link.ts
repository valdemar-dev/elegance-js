import type { ElementOptions } from "../types";

const Link = component<{
    href: string,
    preload?: "hover" | "load",
    doViewTransition?: boolean,
} & ElementOptions<"a", any>, {
    counter: number,
}>({
    init(self) {
        if (!self.props.href) {
            throw new Error("Link components require an HREF attribute to be set. Received: " + self.props.href);
        }
    },
    onMount(self) {
        if (self.props.preload === "load") {
            fetchPage(self.props.href);
        }
    },
    view({ self, children, }) {
        return a({
            ...self.props,
            onClick(_, event) {
                event.preventDefault();
                navigate(self.props.href, true, self.props.doViewTransition)
            },
            onMouseenter() {
                if (self.props.preload !== "hover") {
                    return;
                }

                fetchPage(self.props.href)
            }
        }, 
            ...children,
        );
    }
});

export default Link;