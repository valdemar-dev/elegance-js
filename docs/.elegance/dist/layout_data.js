let url = "/";
export const data = { state: [{ id: 7, value: function anonymous(state, event) {
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
} }, { id: 8, value: "" }], soa: [{ "id": 7, "key": 1, "attribute": "onclick" }, { "id": 7, "key": 2, "attribute": "onclick" }], lh: [{ fn: (state) => (() => {
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
})(state, ...state.getAll([])) }, { fn: (state) => ((state2, toastContent2) => {
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
})(state, ...state.getAll([{ id: 8 }])) }] };
if (!globalThis.ld) {
  globalThis.ld = {};
}
;
globalThis.ld[url] = data;
