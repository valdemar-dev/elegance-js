import { Child, eventListener, getSelf, Link, loadHook, observer, ServerSubject, state } from "elegance-js";
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

function EleganceLogo() {
    return div({
        className: "select-none"
    },
        span({
            className: "text-3xl font-niconne",

        },
            "Elegance",
        ),

        span({
            className: "text-sm font-semibold font-inter relative -top-1 left-1",
        },
            "JS",
        )
    );
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
                    const self = getSelf();

                    console.log(self);
                    const opacity = (page === this.href) ? "opacity-30" : "opacity-100";

                    return `${opacity}`;
                }, [activePage],
            ),
        },
            d.title
        )
    });

    return div({
        className: "sticky top-0 grid grid-rows-[max-content_1fr_max-content] h-screen p-8 ml-auto min-w-[230px]",
    },
        EleganceLogo(),

        div({
            className: "flex flex-col overflow-auto h-full gap-2 pt-4",
        },
            ...navEntries,
        ),

        button({
            className: "hover:cursor-pointer dark:invert-100 origin-center",
            onClick: eventListener(() => {
                if (document.body.classList.contains("dark")) {
                    document.body.classList.remove("dark");
                } else {
                    document.body.classList.add("dark");
                }
            }, []),
        },
            ThemeToggle(32, 32, "rotate-0 duration-300 dark:rotate-180"),
        ),
    );
}

function Footer() {
    return div({
        className: "mt-12 pt-12 border-t-[1px] border-[#00000033] p-8 dark:border-[#ffffff33] grid grid-cols-[minmax(300px,auto)_minmax(300px,auto)]"
    },
        div({
            className: "p-8 ml-auto min-w-[250px]",
        },

            EleganceLogo(),

            "© 2026. All Rights Reserved.",
        ),

        div({
            className: "grid h-full w-full grid-cols-[minmax(300px,700px)_minmax(300px,1fr)]"
        }),
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
            className: "font-inter text-black bg-white dark:text-white dark:bg-black duration-200",
        },
            div({
                className: "grid grid-cols-[minmax(300px,auto)_minmax(300px,auto)]",
            },
                NavBar(activePage),

                child({}),
            ),

            Footer(),
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