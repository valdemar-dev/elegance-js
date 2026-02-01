import { Child, eventListener, Link, loadHook, observer, ServerSubject, state } from "elegance-js";
import { readdirSync } from "fs";

import path from "path";
import { fileURLToPath } from "url";
import { ThemeToggle } from "./components/ThemeToggle";

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
        className: "grid grid-rows-[max-content_1fr_max-content] h-screen p-4 ml-auto min-w-[250px]",
    },
        h3({
            className: "text-xl font-semibold mb-4 h-max"
        },
            "Elegance.JS"
        ),

        div({
            className: "flex flex-col overflow-auto h-full gap-2",
        },
            ...navEntries,
        ),

        button({
            className: "hover:cursor-pointer dark:invert-100",
            onClick: eventListener(() => {
                if (document.body.classList.contains("dark")) {
                    document.body.classList.remove("dark");
                } else {
                    document.body.classList.add("dark");
                }
            }, []),
        },
            ThemeToggle(32, 32),
        ),
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
        body({
            className: "font-inter h-screen overflow-hidden grid grid-cols-[minmax(300px,1fr)_minmax(300px,700px)_minmax(300px,1fr)] text-black bg-white dark:text-white dark:bg-black duration-200",
        },
            NavBar(activePage),

            div({
                className: "",
            },
                child({}),
            ),
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