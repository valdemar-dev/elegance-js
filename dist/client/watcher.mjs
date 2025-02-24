// src/client/watcher.ts
var eventSource = new EventSource(`http://localhost:${watchServerPort}/events`);
eventSource.onmessage = async (event) => {
  console.log(`hot-reload, command received: ${event.data}`);
  if (event.data === "reload") {
    for (const cleanupProcedure of cleanupProcedures) {
      cleanupProcedure.cleanupFunction();
      cleanupProcedures.splice(cleanupProcedures.indexOf(cleanupProcedure));
    }
    state.subjects.map((subj) => ({ ...subj, observers: [] }));
    const newHTML = await fetch(window.location.href);
    const newDOM = domParser.parseFromString(
      await newHTML.text(),
      "text/html"
    );
    document.body = newDOM.body;
    document.head.replaceWith(newDOM.head);
    const link = document.querySelector("[rel=stylesheet]");
    if (!link) return;
    const href = link.getAttribute("href");
    link.setAttribute("href", href.split("?")[0] + "?" + (/* @__PURE__ */ new Date()).getTime());
    loadPage();
  } else if (event.data === "hard-reload") {
    window.location.reload();
  }
};
