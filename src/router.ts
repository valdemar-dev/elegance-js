class Router {
    savedPages: Map<string, Page>;
    onNavigateCallbacks: Array<() => void>
    currentPage: string
    stateController = globalThis.eleganceStateController; 
    renderer = globalThis.eleganceRenderer;
    
    constructor() {
        console.log("%cElegance router is loading..", "font-size: 30px; color: #aaffaa");

        this.savedPages = new Map();
        this.onNavigateCallbacks = [];
        this.currentPage = window.location.pathname;
    }

    log(content: any) {
        console.log(`%c${content}`, "font-size: 15px; color: #aaffaa");
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async navigate(pathname: string, pushState = true) {
        if (!pathname.startsWith("/")) {
            throw new Error("Elegance router can only navigate to local pages.");
        }

        this.log("Calling onNavigateCallbacks..");
        for (const onNavigateCallback of this.onNavigateCallbacks) {
            onNavigateCallback();
        }
        this.onNavigateCallbacks = [];

        this.log("Performing state cleanup..")

        this.stateController.resetEphemeralSubjects();
        this.stateController.cleanSubjectObservers();

        this.log(`Navigating to page: ${pathname}`);

        const page = this.savedPages.get(pathname) ?? await this.getPage(pathname);
        if (!page) throw new Error("Failed to fetch page.");

        if (pushState) {
            history.pushState(null, "", pathname);
        }

        this.currentPage = pathname;

        this.renderer.renderPage(page);
    }

    async getPage(pathname: string) {
        if (this.savedPages.has(pathname)) return;

        if (!pathname.startsWith("/")) {
            throw new Error("Elegance router can only fetch local pages.");
        }

        this.log(`Fetching URL: ${pathname}`);

        const optionalSlash = pathname === "/" ? "" : "/";

        const pageDataRaw = await fetch(pathname);

        if (!pageDataRaw.ok) {
            throw `Could not load page at ${pathname}, received HTTP response status ${pageDataRaw.status}. ${pageDataRaw.statusText}`;
        }

        const pageData = await pageDataRaw.text();
        const parser = new DOMParser();

        const parsedPageData = parser.parseFromString(pageData, "text/html");

        try {
            const { page } = await import(pathname + optionalSlash + "page.js");

            if (!page) {
                throw new Error(`Page at ${pathname} could not be loaded.`);
            }

            this.addPage(pathname, page);

            return page;
        } catch (error) {
            this.log(`Could not load the page at ${pathname}: ${error}`);

            return;
        }
    }

    addPage(pathname: string, page: Page) {
        this.log(`Saving page with pathname: ${pathname}`);
        this.savedPages.set(pathname, page);
    }

    async prefetch(pathname: string) {
        await this.getPage(pathname);
    }

    onNavigate(callback: () => void) {
        this.log("Adding onNavigateCallback.");
        this.onNavigateCallbacks.push(callback);
    }

    setPopState() {
        window.onpopstate = (event: Event) => {
            event.preventDefault();

            const currentOrigin = window.location.origin;
            const target = event.target as Window;

            const newOrigin = target.origin;

            if (newOrigin !== currentOrigin) return;
            if (this.currentPage === target.location.pathname) return;

            const relativeLocation = window.location.href.replace(window.location.origin, "");
            this.navigate(relativeLocation, false);
        };
    }
}

export {
    Router,
};
