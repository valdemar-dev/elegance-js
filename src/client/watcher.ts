// watchServerPort is defined in client.ts, and this is prepended to client.ts
// @ts-nocheck
const eventSource = new EventSource(`http://localhost:${watchServerPort}/events`);

// stub it out baby
eventSource.onerror = async () => {};
eventSource.onmessage = async (event) => { 
    if (event.data === "reload") {
        for (const cleanupProcedure of cleanupProcedures) {
            cleanupProcedure.cleanupFunction();
        }

        cleanupProcedures = [];

        pd[sanitizePathname(loc.pathname)].stateManager.subjects.map(subj => ({ ...subj, observers: [], }))

        const newHTML = await fetch(window.location.href);

        const newDOM = domParser.parseFromString(
            await newHTML.text(),
            "text/html"
        );

        document.body.replaceWith(newDOM.body);
        document.head.replaceWith(newDOM.head);

        const link = document.querySelector('[rel=stylesheet]') as HTMLLinkElement;
        if (!link) return;

        // Sneaky beaky hack!
        // Adding dates to href's on links makes them re-fetch.
        const href = link.getAttribute('href')!;
        link.setAttribute('href', href.split('?')[0] + '?' + new Date().getTime());

        loadPage();
    } else if (event.data === "hard-reload") {
        window.location.reload();
    }
};
