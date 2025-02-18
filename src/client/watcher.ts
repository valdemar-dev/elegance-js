if (Object.values(pd)[0]?.w) {
    const source = new EventSource("http://localhost:3001/events");
    source.onmessage = async (event: MessageEvent<any>) => { 
        console.log(`hot-reload, command received: ${event.data}`);

        if (event.data === "reload") {
            for (const func of cleanupFunctions) {
                func();
            }

            cleanupFunctions = [];

            const newHTML = await fetch(window.location.href);

            const newDOM = domParser.parseFromString(
                await newHTML.text(),
                "text/html"
            );

            document.body = newDOM.body;
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
}
