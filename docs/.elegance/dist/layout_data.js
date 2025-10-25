let url = "/";
export const data = { state: [{ id: 3, value: function anonymous(state, event) {
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
} }, { id: 4, value: false }, { id: 5, value: false }, { id: 6, value: "" }, { id: 7, value: function anonymous2(state, event) {
  ((_, isOpen2) => {
    isOpen2.value = false;
    isOpen2.signal();
  })(event, ...state.getAll([{ id: 5 }]));
} }, { id: 8, value: function anonymous3(state, event) {
  ((_, isOpen2) => {
    isOpen2.value = !isOpen2.value;
    isOpen2.signal();
  })(event, ...state.getAll([{ id: 5 }]));
} }, { id: 9, value: function anonymous4(state, event) {
  ((_, useDarkMode2) => {
    useDarkMode2.value = false;
    useDarkMode2.signal();
  })(event, ...state.getAll([{ id: 4 }]));
} }, { id: 10, value: function anonymous5(state, event) {
  ((_, useDarkMode2) => {
    useDarkMode2.value = true;
    useDarkMode2.signal();
  })(event, ...state.getAll([{ id: 4 }]));
} }], soa: [{ "id": 8, "key": 2, "attribute": "onclick" }, { "id": 7, "key": 4, "attribute": "onclick" }, { "id": 3, "key": 5, "attribute": "onclick" }, { "id": 7, "key": 6, "attribute": "onclick" }, { "id": 3, "key": 7, "attribute": "onclick" }, { "id": 7, "key": 8, "attribute": "onclick" }, { "id": 3, "key": 9, "attribute": "onclick" }, { "id": 7, "key": 10, "attribute": "onclick" }, { "id": 3, "key": 11, "attribute": "onclick" }, { "id": 7, "key": 12, "attribute": "onclick" }, { "id": 3, "key": 13, "attribute": "onclick" }, { "id": 9, "key": 14, "attribute": "onclick" }, { "id": 10, "key": 15, "attribute": "onclick" }], ooa: [{ key: 1, attribute: "class", update: (value) => {
  let classList = "ease bg-background-10 text-text-10 dark:bg-text-10 dark:text-background-10 font-inter grid grid-cols-1 sm:gap-8 gap-0 sm:grid-cols-[300px_auto] grid-rows-[auto_auto] sm:grid-rows-1 h-full h-screen w-screen sm:pt-0 pt-[calc(2rem+24px)]";
  if (value === true) {
    classList += " dark";
  }
  return classList;
}, refs: [{ id: 4 }] }, { key: 3, attribute: "class", update: (value) => {
  let classList = "px-4 sm:p-8 sm:pr-0 inset-0 z-10 sm:bg-transparent top-[calc(24px_+_2rem)] sm:top-0 text-text-10 dark:text-background-10 dark:bg-text-10 bg-background-10 sm:relative fixed flex flex-col h-[calc(100%-calc(24px+2rem))] sm:h-full w-full max-w-[600px]   ";
  if (value === true) {
    classList += "translate-x-0 sm:translate-x-0";
  } else {
    classList += "-translate-x-full sm:translate-x-0";
  }
  return classList;
}, refs: [{ id: 5 }] }], lh: [{ fn: (state) => (() => {
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
  const el = () => {
    const updated = state2.get(useDarkMode2.id);
    localStorage.setItem("use-dark-mode", (updated.value === true).toString());
  };
  window.addEventListener("beforeunload", el);
  return () => window.removeEventListener("beforeunload", el);
})(state, ...state.getAll([{ id: 4 }])) }, { fn: (state) => ((state2, toastContent2) => {
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
})(state, ...state.getAll([{ id: 6 }])) }] };
if (!globalThis.ld) {
  globalThis.ld = {};
}
;
globalThis.ld[url] = data;
