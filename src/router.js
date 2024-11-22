import { getRenderer } from "./renderer";

class Router {
    constructor() {
        this.savedPages = new Map();
        this.onNavigateCallbacks = [];
    }

    log(content) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa");
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async navigate(pathname, pushState = true) {
        if (!pathname.startsWith("/")) {
            throw new Error("Elegance router can only navigate to local pages.");
        }

        if (pathname === window.location.pathname) {
            this.log("Skipping navigation, destination is same as current path.");

            return;
        }

        this.log("Calling onNavigateCallbacks..");

        for (const onNavigateCallback of this.onNavigateCallbacks) {
            onNavigateCallback();
        }

        this.onNavigateCallbacks = [];

        this.log(`Navigating to page: ${pathname}`);

        const page = this.savedPages.get(pathname) ?? await this.getPage(pathname);
        if (!page) throw new Error("Failed to fetch page.");

        if (pushState) {
            history.pushState(null, "", pathname);
        }

        const renderer = getRenderer();
        renderer.renderPage(page);
    }

    async getPage(pathname) {
        if (this.savedPages.has(pathname)) return;

        if (!pathname.startsWith("/")) {
            throw new Error("Elegance router can only fetch local pages.");
        }

        this.log(`Fetching URL: ${pathname}`);

        const optionalSlash = pathname === "/" ? "" : "/";

        try {
            const { page } = await import(pathname + optionalSlash + "page.js");

            if (!page) {
                throw new Error(`Page at ${pathname} could not be loaded.`);
            }

            this.addPage(pathname, page);

            return page;
        } catch (error) {
            this.log(`Could not load the page at ${pathname}: ${error.message}`);

            return;
        }
    }

    addPage(pathname, page) {
        this.log(`Saving page with pathname: ${pathname}`);
        this.savedPages.set(pathname, page);
    }

    // Just a wrapper so it looks nicer syntactically in the Link component
    prefetch(pathname) {
        this.getPage(pathname);
    }

    onNavigate(callback) {
        this.log("Adding onNavigateCallback.");
        this.onNavigateCallbacks.push(callback);
    }

    setPopState() {
        window.onpopstate = (event) => {
            console.log("POP THAT STATE YUHH");
            event.preventDefault();

            const currentOrigin = window.location.origin;
            const target = event.target;

            const newOrigin = target.origin;

            if (newOrigin !== currentOrigin) return console.log("Incorrect origin.");

            const relativeLocation = window.location.href.replace(window.location.origin, "");
            this.navigate(relativeLocation, false);
        };
    }
}

const getRouter = () => {
    if (globalThis.eleganceRouter) return globalThis.eleganceRouter;

    console.log("%cElegance router is loading..", "font-size: 30px; color: #aaffaa");

    globalThis.eleganceRouter = new Router();

    return globalThis.eleganceRouter;
};

export {
    getRouter,
    Router,
};
