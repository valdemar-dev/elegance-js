import { getRouter } from "./router";
import { getRenderer } from "./renderer";
import "./bindElements";
import { RenderingMethod } from "./types/Metadata";

(async () => { 
    const pageInfo: PageInfo | null = globalThis.__ELEGANCE_PAGE_INFO__;

    if (!pageInfo) {
        alert("Misconfigured Elegance.JS server, check console.");

        throw `globalThis.__ELEGANCE_PAGE_INFO__ is not set. Make sure your server configuration sets a <script> with this variable.`;
    }

    if (pageInfo.renderingMethod === RenderingMethod.CLIENT_SIDE_RENDERING) {
        const scripts = document.querySelectorAll('script[type="module"]');

        const pageScript = Array.from(scripts).find((script) => {
            const htmlScript = script as HTMLScriptElement;
            return htmlScript.src.includes("/page.js");
        });

        if (!pageScript) {
            throw new Error("Failed to mount elegance. No page script found.");
        }

        const module = await import((pageScript as HTMLScriptElement).src);

        if (!module.page) throw new Error("Page script does not export page function.");

        const renderer = getRenderer();

        const router = getRouter();

        router.addPage(window.location.pathname, module.page);

        renderer.renderPage(module.page);

        return;
    }

    else if (pageInfo.renderingMethod === RenderingMethod.SERVER_SIDE_RENDERING) {
        const storedEventListeners = globalThis.__ELEGANCE_PAGE_INFO__.storedEventListeners ?? [];

        for (const storedEL of storedEventListeners) {
            storedEL.eventListeners.forEach(el => {el.eventListener()});
        }

        return;
    }

    else if (pageInfo.renderingMethod === RenderingMethod.STATIC_GENERATION) {
        throw `SSG Not implemented.`;
    }
})()
