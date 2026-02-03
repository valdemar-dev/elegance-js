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

function NavBar(activePage: ServerSubject<string>, useDarkMode: ServerSubject<boolean>) {
    const rawDocuments = readdirSync(path.join(__dirname, "content"))
        .filter(f => f.endsWith(".md"))
        .map(f => ({ href: f.slice(0, f.length - 3), title: toTitleCase(f).slice(0, f.length - 3) }));

    const navEntries = rawDocuments.map((d, idx) => {
        return Link({
            href: `/${d.href}`,
            className: observer(
                function (this: HTMLAnchorElement, page) {
                    const opacity = (page === new URL(this.href).pathname) ? "dark:opacity-70 opacity-30" : "opacity-100";

                    return `${opacity} duration-200`;
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
            onClick: eventListener((_, useDarkMode) => {
                useDarkMode.value = !useDarkMode.value
            }, [useDarkMode]),
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
    const useDarkMode = state(false);

    loadHook((activePage) => {
        activePage.value = window.location.pathname;

        const idx = eleganceClient.onNavigate((newPage) => {
            activePage.value = newPage;

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        });

        return () => {
            eleganceClient.removeNavigationCallback(idx);
        }
    }, [activePage]);

    loadHook((useDarkMode) => {
        function setCookie(name: string, value: string) {
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=31536000`;
        }

        const callback = () => {
            setCookie("use-dark-mode", useDarkMode.value === true ? "yes" : "no");
        };

        window.addEventListener("beforeunload", callback);

        const update = (value: boolean) => {
            if (value === true) {
                document.body.classList.add("dark");
            } else {
                document.body.classList.remove("dark");
            }
        };

        useDarkMode.observe(eleganceClient.genLocalID().toString(), update);

        return () => window.removeEventListener("beforeunload", callback);
    }, [useDarkMode]);

    return html(
        body({
            className: "dark font-inter text-black bg-white dark:text-white dark:bg-black duration-200",
        },
            div({
                className: "grid grid-cols-[minmax(300px,auto)_minmax(300px,auto)]",
            },
                NavBar(activePage, useDarkMode),

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