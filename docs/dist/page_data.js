let url = "/";
export const data = { state: [{ id: 1, value: function anonymous(state, event) {
  ((params) => {
    const target = new URL(params.event.currentTarget.href);
    const client2 = globalThis.client;
    const sanitizedTarget = client2.sanitizePathname(target.pathname);
    const sanitizedCurrent = client2.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return params.event.preventDefault();
      return;
    }
    params.event.preventDefault();
    client2.navigateLocally(target.href);
  })({ event, ...{} }, ...state.getAll([]));
} }, { id: 2, value: false }], soa: [{ "id": 1, "key": 2, "attribute": "onclick" }, { "id": 1, "key": 3, "attribute": "onclick" }, { "id": 1, "key": 4, "attribute": "onclick" }], ooa: [{ key: 1, attribute: "class", update: (hasUserScrolled2) => {
  const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
  if (hasUserScrolled2) return defaultClass + "border-b-background-800 bg-background-950";
  return defaultClass + "bg-background-900 border-b-transparent";
}, refs: [{ id: 2 }] }], lh: [{ fn: (state) => (() => {
  const anchors = Array.from(document.querySelectorAll("a[prefetch]"));
  const elsToClear = [];
  for (const anchor of anchors) {
    const prefetch = anchor.getAttribute("prefetch");
    const href = new URL(anchor.href);
    switch (prefetch) {
      case "load":
        client.fetchPage(href);
        break;
      case "hover":
        const fn = () => {
          client.fetchPage(href);
        };
        anchor.addEventListener("mouseenter", fn);
        elsToClear.push({
          el: anchor,
          fn
        });
        break;
    }
  }
  return () => {
    for (const listener of elsToClear) {
      listener.el.removeEventListener("mouseenter", listener.fn);
    }
  };
})(state, ...state.getAll([])), bind: "" }, { fn: (state) => ((state2, hasUserScrolled2) => {
  const handleScroll = () => {
    const pos = {
      x: window.scrollX,
      y: window.scrollY
    };
    if (pos.y > 20) {
      if (hasUserScrolled2.value === true) return;
      hasUserScrolled2.value = true;
      hasUserScrolled2.signal();
    } else {
      if (hasUserScrolled2.value === false) return;
      hasUserScrolled2.value = false;
      hasUserScrolled2.signal();
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
})(state, ...state.getAll([{ id: 2 }])), bind: "" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
  globalThis.pd[url] = data;
}
