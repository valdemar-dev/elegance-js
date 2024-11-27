import { getRouter } from './router.esm.mjs';
import { getRenderer } from './renderer.esm.mjs';
import './bindElements.esm.mjs';

const scripts = document.querySelectorAll('script[type="module"]');
const pageScript = Array.from(scripts).find((script) => {
    const htmlScript = script;
    return htmlScript.src.includes("/page.js");
});
if (!pageScript) {
    throw new Error("Failed to mount elegance. No page script found.");
}
import(pageScript.src).then(module => {
    if (!module.page)
        throw new Error("Page script does not export page function.");
    const renderer = getRenderer();
    const router = getRouter();
    router.addPage(window.location.pathname, module.page);
    renderer.renderPage(module.page);
});
//# sourceMappingURL=client.esm.mjs.map
