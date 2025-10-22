import { Link } from "elegance-js/components/Link";
import { state, loadHook } from "elegance-js";

const SidebarEntry = (content: string, href: string) => {
    return div(
        Link({
            class: "text-xs uppercase font-bold opacity-70 hover:opacity-50",
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
        class: "p-8",
    },
        SidebarCategory("Reference"),
        
        ul({
            class: "flex flex-col gap-0",
        },
            SidebarEntry("Introduction", "/"),
            SidebarEntry("Routing", "/routing"),
            SidebarEntry("Middleware", "/middleware"),
            SidebarEntry("Loadhook", "/loadhook"),
        ),
    );
};

/** Set to anything except "" to show a toast for 3 seconds debounced. */
export const toastContent = state("");

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
            
            // cool thing, we don't actually signal here,
            // cause we have no need to re-trigger observers!
            toastContent.value = "";
            
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
        
        return () => toastContent.observers.delete(id);
    },
)

const Toast = () => {
    return div({
        class: "fixed bottom-0 right-4 w-max h-max p-2 bg-text-00 border-[1px] border-text-05 rounded-full px-4 uppercase font-bold text-xs",
        hidden: false,
        id: "toaster",
    },
    );
};

export const layout: Layout = (child) => {
    return body({
        class: "bg-background-10 text-text-10 font-inter grid grid-cols-[20rem_auto]",
    },
        Toast(),
        
        Sidebar(),

        child,
        
        footer({ class: "h-48", }),
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