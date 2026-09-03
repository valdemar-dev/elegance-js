import type { ElementOptions } from "../types";

const Link = component<{
    href: string,
    preload?: "hover" | "load",
    doViewTransition?: boolean,
} & ElementOptions<"a", any>, {
    counter: number,
}
>({
    atoms: {
        counter: 0,
    },
    onNavigate(_, atoms) {
        atoms.counter.value += 1;
    },
    onMount(self) {
        if (self.props.preload === "load") {
            fetchPage(self.props.href);
        }
    },
    view({ self, children, atoms: { counter, }}) {
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
            `Times navigated: ${counter.value}`
        );
    }
});

export default Link;