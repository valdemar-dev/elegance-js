import { Child, Link, loadHook, observer, ServerSubject, state } from "elegance-js";
import { readdirSync } from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toTitleCase(str: string) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function NavBar(activePage: ServerSubject<string>) {
    const rawDocuments = readdirSync(path.join(__dirname, "content"))
        .filter(f => f.endsWith(".md"))
        .map(f => ({ href: f.slice(0, f.length - 3), title: toTitleCase(f).slice(0, f.length - 3) }));

    const navEntries = rawDocuments.map((d, idx) => {
        return Link({
            href: `/${d.href}`,
            className: observer(
                function (this: HTMLAnchorElement, page) {
                    const opacity = (page === this.href) ? "opacity-30" : "opacity-100";

                    return `${opacity}`;
                }, [activePage],
            ),
        },
            d.title
        )
    });

    return div({
        className: "flex flex-col"
    },
        ...navEntries,
    );
}

export function layout({ child }: { child: Child}) {
    const activePage = state("");

    loadHook((activePage) => {
        activePage.value = window.location.pathname;

        const idx = eleganceClient.onNavigate((newPage) => {
            activePage.value = newPage;
        });

        return () => {
            eleganceClient.removeNavigationCallback(idx);
        }
    }, [activePage])

    return html(
        body(
            NavBar(activePage),
            child({}),
        ),
    )
}

export function metadata() {
    return [
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    ];
}