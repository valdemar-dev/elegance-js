let url = "/routing";
export const data = { state: [{ id: 24, value: function anonymous(state, event) {
  ((event2) => {
    const target = new URL(event2.currentTarget.href);
    const client2 = globalThis.client;
    const sanitizedTarget = client2.sanitizePathname(target.pathname);
    const sanitizedCurrent = client2.sanitizePathname(window.location.pathname);
    if (sanitizedTarget === sanitizedCurrent) {
      if (target.hash === window.location.hash) return event2.preventDefault();
      return;
    }
    event2.preventDefault();
    client2.navigateLocally(target.href);
  })(event, ...state.getAll([]));
} }, { id: 25, value: false }, { id: 26, value: false }, { id: 27, value: "" }, { id: 28, value: ["/pages/recipes/cake/page.ts"] }, { id: 29, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 28 }, { id: 27 }]));
} }], soa: [{ "id": 29, "key": 14, "attribute": "onclick" }], lh: [{ fn: (state) => (() => {
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
})(state, ...state.getAll([])) }, { fn: (state) => ((state2, useDarkMode2) => {
  let userPrefersDarkMode = localStorage.getItem("use-dark-mode");
  if (userPrefersDarkMode === null) {
    userPrefersDarkMode = "false";
  }
  useDarkMode2.value = userPrefersDarkMode === "true";
  useDarkMode2.signal();
  document.body.style.transitionDuration = "0ms";
  void document.body.offsetWidth;
  document.body.style.transitionDuration = "500ms";
  const el = () => {
    const updated = state2.get(useDarkMode2.id);
    localStorage.setItem("use-dark-mode", (updated.value === true).toString());
  };
  window.addEventListener("beforeunload", el);
  return () => window.removeEventListener("beforeunload", el);
})(state, ...state.getAll([{ id: 25 }])) }, { fn: (state) => ((state2, toastContent2) => {
  const toastElement = document.getElementById("toaster");
  if (!toastElement) return;
  const showToast = () => {
    toastElement.hidden = false;
    toastElement.style.transform = "translateY(100%)";
    void toastElement.offsetWidth;
    toastElement.style.transitionDuration = "300ms";
    toastElement.style.transform = "translateY(-1rem)";
  };
  const el = () => {
    toastElement.hidden = true;
    toastContent2.value = "";
    toastElement.removeEventListener("transitionend", el);
  };
  const hideToast = () => {
    toastElement.style.transform = "translateY(100%)";
    toastElement.addEventListener("transitionend", el);
  };
  let timerId;
  const observer = (value) => {
    if (value === "") return;
    toastElement.innerText = value;
    showToast();
    if (timerId) {
      clearTimeout(timerId);
      toastElement.removeEventListener("transitionend", el);
    }
    timerId = setTimeout(() => {
      hideToast();
    }, 3e3);
  };
  const id = Date.now().toString();
  observer(toastContent2.value);
  state2.observe(toastContent2, observer, id);
  return () => toastContent2.observers.delete(id);
})(state, ...state.getAll([{ id: 27 }])) }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
