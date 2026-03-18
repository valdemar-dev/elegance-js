import { Link } from "elegance-js/components/Link";
import { state, eventListener, loadHook, observe } from "elegance-js";

import Menu from "@/pages/components/Menu";
import { Sun, Dark } from "@/pages/components/Theme";

const useDarkMode = state(false);

/** Whether or not the sidebar is open. */
const isOpen = state(false);

/** Set to anything except "" to show a toast for 3 seconds debounced. */
export const toastContent = state("");

loadHook(
    [useDarkMode],
    (state, useDarkMode) => {
        let userPrefersDarkMode = localStorage.getItem("use-dark-mode");
        
        if (userPrefersDarkMode === null) {
            userPrefersDarkMode = "false";
        }
        
        useDarkMode.value = userPrefersDarkMode === "true";
        useDarkMode.signal();
        
        const el = () => {
            const updated = state.get(useDarkMode.id)!;
            
            localStorage.setItem("use-dark-mode", (updated.value === true).toString())
        };
        
        window.addEventListener("beforeunload", el)
        
        return () => window.removeEventListener("beforeunload", el)
    },
);

const closeOnNav = eventListener(
    [isOpen],
    (_, isOpen) => { isOpen.value = false; isOpen.signal(); },
);

const SidebarEntry = (content: string, href: string) => {
    return div({
        onClick: closeOnNav,
    },
        Link({
            class: "text-sm uppercase font-bold text-text-05 dark:text-background-05 hover:opacity-50",
            prefetch: "hover",
            href,
        },
            content
        ),
    );
};

const SidebarCategory = (content: string) => {
    return h5({
        class: "text-lg font-semibold mb-2",
    },
        content
    );
};

    
const Sidebar = () => {    
    
    return div({
        class: observe(
            [isOpen], 
            (value) => {
                let classList = "px-4 sm:p-8 sm:pr-0 inset-0 z-10 sm:bg-transparent top-[calc(24px_+_2rem)] sm:top-0 text-text-10 dark:text-background-10 dark:bg-text-10 bg-background-10 sm:relative fixed flex flex-col h-[calc(100%-calc(24px+2rem))] sm:h-full w-full max-w-[600px]   ";
                
                if (value === true) {
                    classList += "translate-x-0 sm:translate-x-0"
                
                } else {
                    classList += "-translate-x-full sm:translate-x-0"
                }
                
                return classList;
            },
        ),
    },
        SidebarCategory("Reference"),
        
        ul({
            class: "flex flex-col gap-0",
        },
            SidebarEntry("Introduction", "/"),
            SidebarEntry("State", "/state"),
            SidebarEntry("Event Listener", "/eventlistener"),
            SidebarEntry("Loadhook", "/loadhook"),
            SidebarEntry("API Routes", "/api-routes"),
            SidebarEntry("Routing", "/routing"),
            SidebarEntry("Middleware", "/middleware"),
        ),
        
        div({
            class: "mt-auto flex items-center gap-2",
        },
            button({
                onClick: eventListener(
                    [useDarkMode], 
                    (_, useDarkMode) => {
                        useDarkMode.value = false;
                        
                        useDarkMode.signal();
                    },
                ),
            },
            
                Sun({
                    class: "stroke-text-10 dark:stroke-background-10",
                }),
            ),
            
            button({
                onClick: eventListener(
                    [useDarkMode], 
                    (_, useDarkMode) => {
                        useDarkMode.value = true;
                        
                        useDarkMode.signal();
                    },
                ),
            },
            
                Dark({
                    class: "stroke-text-10 dark:stroke-background-10",
                }),
            ),
        ),
    );
};

loadHook(
    [toastContent],
    (state, toastContent) => {
        const toastElement = document.getElementById("toaster") as HTMLDivElement; 
        if (!toastElement) return;
        
        const showToast = () => {
            // unhide offscreen
            toastElement.hidden = false;
            toastElement.style.transform = "translateY(100%)";
            
            void toastElement.offsetWidth;
            
            // move to in-view
            toastElement.style.transitionDuration = "300ms";
            toastElement.style.transform = "translateY(-1rem)";
        };
        
        const el = () => {
            toastElement.hidden = true
            
            toastContent.value = "";
            toastContent.signal();
            
            toastElement.removeEventListener("transitionend", el);
        }
        
        const hideToast = () => {
            toastElement.style.transform = "translateY(100%)";
            
            toastElement.addEventListener("transitionend", el);
        };
        
        let timerId: NodeJS.Timeout;
        
        const observer = (value: string) => {
            if (value === "") return;
            
            toastElement.innerText = value;
            
            showToast();
            
            if (timerId) {
                clearTimeout(timerId);
                
                toastElement.removeEventListener("transitionend", el);
            }
            
            timerId = setTimeout(() => {
                hideToast();
            }, 3000)
        };
        
        const id = Date.now().toString();
    
        observer(toastContent.value);
        state.observe(toastContent, observer, id);
        
        return () => {
            console.log("clearing up toast");
            toastContent.observers.delete(id);
        }
    },
)

const Toast = () => {
    return div({
        class: "fixed z-10 backdrop-blur-md bottom-0 right-4 w-max h-max p-2 bg-darken dark:bg-lighten border-text-10 rounded-full px-4 uppercase font-bold text-xs",
        hidden: false,
        id: "toaster",
    },
    );
};

export const layout: Layout = (child) => {
    
    return body({
        class: observe(
            [useDarkMode],
            (value) => {
                let classList = "ease bg-background-10 text-text-10 dark:bg-text-10 dark:text-background-10 font-inter grid grid-cols-1 sm:gap-8 gap-0 sm:grid-cols-[300px_auto] grid-rows-[auto_auto] sm:grid-rows-1 h-full h-screen w-screen sm:pt-0 pt-[calc(2rem+24px)]";
                
                if (value === true) {
                    classList += " dark"
                }
                
                return classList;
            },
        ), 
    },
        div({
            class: "sm:hidden fixed w-full top-0 flex p-4 backdrop-blur-md flex flex-row items-center gap-2 justify-between",
        },
            h2({
                class: "font-bold",
            },
                "Elegance.JS",
            ),
            
            button({
                class: "",
                onClick: eventListener(
                    [isOpen],
                    (_, isOpen) => { isOpen.value = !isOpen.value; isOpen.signal(); },
                ),
            },
                Menu({ class: "stroke-text-10 dark:stroke-background-10", }),
            ),
            
            
        ),

        Toast(),
        
        Sidebar(),

        div({
            class: "h-full overflow-y-auto p-3 sm:p-0",
        },
            child,
            
            div({ class: "h-48", }),
        ),
    );
};

export const metadata = (child: Child) => {
    return html({
        lang: "en",
    },
        child,
        
        link({
            rel: "stylesheet",
            href: "/index.css",
        }),
    );
};