import { createEventListener } from "../helpers/createEventListener";
import { createState } from "../server/createState";

export const Link = ({
    href,
}: {
    href: string,
},
    ...children: Child[]
) => {
    return a ({
        href: href,
        onClick: serverState.navigate
    },
        ...children,
    );
};

const serverState = createState({
    navigate: createEventListener((state: State<typeof serverState>, event: MouseEvent) => {
        event.preventDefault();

        navigateLocally((event.target as HTMLLinkElement).href);
    })
});


