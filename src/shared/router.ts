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

        const parsedDocument = parser.parseFromString(pageData, "text/html");

        const pageInfo = parsedDocument.querySelector(`script[e-pi]`);8

        if (!pageInfo) {
            this.log(`Failed to fatch page, page ${pathname} did not define a <script> in it's head with attribute e-ip (short for elegancePageInfo)`)
            return;
        }

        // below is some seemingly questionable code.
        // let me explain.
        // because SSR puts things like el's info pageinfo,
        // we cannot simply "serialize" it, and "deserialize" it in the client.
        // we MUST treat it as js-code. therefore, we make a new script tag
        // where we insert the page info of this page. that will then modify
        // the global instance of __PAGE_INFOS__, which contains all pages, their els, etc.
        // might come up with a more elegant solution for this that doesn't involve
        // appending to global variables and whatnot. in the meantime, this works.
        const newPageInfo = document.createElement("script");
        newPageInfo.textContent = pageInfo.textContent;
        document.head.appendChild(newPageInfo);

        return;

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
