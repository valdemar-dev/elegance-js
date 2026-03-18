import { Child, eventListener, getCookieStore, getSelf, Link, loadHook, observer, ServerSubject, state } from "elegance-js";
import { readdirSync } from "fs";

import path from "path";
import { fileURLToPath } from "url";
import { ThemeToggle } from "./components/ThemeToggle";
import Arrow from "./components/Arrow";

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

function NavBar(isOpen: ServerSubject<boolean>, activePage: ServerSubject<string>, useDarkMode: ServerSubject<boolean>) {

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
        className: observer((isOpen) => {
            let classList = "pointer-events-auto shadow-xl lg:shadow-none h-full w-max lg:w-auto pt-2 p-4 bg-white dark:bg-black lg:dark:bg-transparent lg:bg-transparent lg:sticky top-0 grid grid-rows-[max-content_1fr_max-content] min-h-0 lg:h-[100dvh] lg:p-8 lg:ml-auto lg:min-w-[230px] lg:duration-0 duration-200 transition-transform ";

            if (isOpen) {
                classList += "translate-x-0 lg:translate-x-0";
            } else {
                classList += "-translate-x-full lg:translate-x-0"
            }

            return classList;
        }, [isOpen])
    },
        EleganceLogo(),

        div({
            className: "flex flex-col min-h-0 overflow-y-auto overflow-x-hidden pb-8 gap-2 pt-4",
        },
            ...navEntries,
        ),

        button({
            className: "hover:cursor-pointer dark:invert-100 origin-center pt-4 w-max ",
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
        className: "mt-12 pt-12 border-t-[1px] border-[#00000033] p-8 dark:border-[#ffffff33] grid md:grid-cols-[minmax(300px,auto)_minmax(300px,auto)]"
    },
        div({
            className: "md:p-8 md:ml-auto min-w-[250px]",
        },

            EleganceLogo(),

            "© 2026. All Rights Reserved.",
        ),

        div({
            className: "md:grid hidden h-full w-full grid-cols-[minmax(300px,700px)_minmax(300px,1fr)]"
        }),
    );
}

function Header(isNavBarOpen: ServerSubject<boolean>) {
    return div({
        className: "lg:hidden pointer-events-auto duration-200 bg-white dark:bg-black w-screen flex py-2"
    },
        button({
            className: "px-2",
            onClick: eventListener((_, isNavBarOpen) => {
                isNavBarOpen.value = !isNavBarOpen.value
            }, [isNavBarOpen])
        }, 
            div({
                className: observer((isNavBarOpen) => {
                    let classList = "origin-center duration-200 dark:invert-0 invert-100 ";

                    if (isNavBarOpen) {
                        classList += "rotate-0"
                    } else {
                        classList += "rotate-180"
                    }

                    return classList;
                }, [isNavBarOpen]),
            },
                Arrow(25, 25)
            ),

        ),

        EleganceLogo(),
    );
}

export function layout({ child }: { child: Child}) {
    const activePage = state("");

    const isNavBarOpen = state(false);
    
    const useDarkMode = state(true);

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
        if (localStorage.getItem("use-dark-mode") === null) {
            localStorage.setItem("use-dark-mode", "true");
        }
        
        useDarkMode.value = (localStorage.getItem("use-dark-mode") === "true" ? true : false);

        const callback = () => {
            localStorage.setItem("use-dark-mode", useDarkMode.value ? "true" : "false");
        };

        window.addEventListener("beforeunload", callback);

        const update = (value: boolean) => {
            if (value === true) {
                document.body.classList.add("dark");
            } else {
                document.body.classList.remove("dark");
            }
        };

        const observerID = eleganceClient.genLocalID().toString();
        
        useDarkMode.observe(observerID, update);

        return () => {
            window.removeEventListener("beforeunload", callback);
            useDarkMode.unobserve(observerID);
        }
    }, [useDarkMode]);

    return html(
        body({
            className: `${useDarkMode.value ? "dark" : ""} font-inter text-black bg-white dark:text-white dark:bg-black duration-200`,
        },
            div({
                className: "grid lg:grid-cols-[minmax(300px,auto)_minmax(300px,auto)] lg:pt-0 pt-[52px]",
            },    
                div({
                    className: observer((isNavBarOpen) => {
                        let classList = "pointer-events-none w-screen lg:h-auto lg:w-auto fixed flex flex-col min-h-0 lg:relative z-50 top-0 inset-0 h-[100dvh] ";

                        if (isNavBarOpen) {
                            classList += "backdrop-blur-md duration-200";
                        }

                        return classList
                    }, [isNavBarOpen]),
                },
                    Header(isNavBarOpen),

                    NavBar(isNavBarOpen, activePage, useDarkMode),
                ),            

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

        meta({
            "http-equiv": "Content-Security-Policy",
            content: "upgrade-insecure-requests",
        }),
    ];
}

export const isDynamic = true;