let url = "/docs/page-files";
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
} }, { id: 2, value: false }, { id: 3, value: 0 }, { id: 4, value: function anonymous2(state, event) {
  (async (params, isToastShowing2, toastTimeoutId2) => {
    const children = params.event.currentTarget.children;
    const pre2 = children.item(0);
    const content = pre2.innerText;
    await navigator.clipboard.writeText(content);
    if (toastTimeoutId2.value !== 0) clearTimeout(toastTimeoutId2.value);
    isToastShowing2.value = true;
    isToastShowing2.signal();
    const timeoutId = window.setTimeout(() => {
      isToastShowing2.value = false;
      isToastShowing2.signal();
    }, 3e3);
    toastTimeoutId2.value = timeoutId;
  })({ event, ...{} }, ...state.getAll([{ id: 2 }, { id: 3 }]));
} }], binds: { 1: [{ id: 5, value: 0 }] }, soa: [{ "id": 1, "key": 1, "attribute": "onclick" }, { "id": 1, "key": 2, "attribute": "onclick" }, { "id": 1, "key": 5, "attribute": "onclick" }, { "id": 1, "key": 6, "attribute": "onclick" }, { "id": 1, "key": 7, "attribute": "onclick" }, { "id": 1, "key": 8, "attribute": "onclick" }, { "id": 1, "key": 9, "attribute": "onclick" }, { "id": 1, "key": 10, "attribute": "onclick" }, { "id": 1, "key": 11, "attribute": "onclick" }, { "id": 1, "key": 12, "attribute": "onclick" }, { "id": 1, "key": 13, "attribute": "onclick" }, { "id": 1, "key": 14, "attribute": "onclick" }, { "id": 1, "key": 15, "attribute": "onclick" }, { "id": 4, "key": 16, "attribute": "onclick" }, { "id": 1, "key": 17, "attribute": "onclick" }, { "id": 4, "key": 18, "attribute": "onclick" }, { "id": 4, "key": 19, "attribute": "onclick" }, { "id": 1, "key": 20, "attribute": "onclick" }, { "id": 4, "key": 21, "attribute": "onclick" }, { "id": 4, "key": 22, "attribute": "onclick" }, { "id": 4, "key": 23, "attribute": "onclick" }, { "id": 1, "key": 24, "attribute": "onclick" }, { "id": 4, "key": 25, "attribute": "onclick" }, { "id": 4, "key": 26, "attribute": "onclick" }, { "id": 4, "key": 27, "attribute": "onclick" }, { "id": 4, "key": 28, "attribute": "onclick" }, { "id": 4, "key": 29, "attribute": "onclick" }, { "id": 4, "key": 30, "attribute": "onclick" }, { "id": 4, "key": 31, "attribute": "onclick" }], ooa: [{ key: 3, attribute: "class", update: (isShowing) => {
  const modularClass = isShowing ? "right-8" : "right-0 translate-x-full";
  return `fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 ` + modularClass;
}, refs: [{ id: 2 }] }, { key: 4, attribute: "innerText", update: (secondsSpentOnPage2) => {
  const hours = Math.floor(secondsSpentOnPage2 / 60 / 60);
  const minutes = Math.floor(secondsSpentOnPage2 / 60 % 60);
  const seconds = secondsSpentOnPage2 % 60;
  return `${hours}h:${minutes}m:${seconds}s`;
}, refs: [{ id: 5, bind: 1 }] }], lh: [{ fn: (state) => (() => {
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
})(state, ...state.getAll([])), bind: "" }, { fn: (state) => ((state2, time) => {
  const storedTime = localStorage.getItem("time-on-page");
  if (storedTime) {
    time.value = parseInt(storedTime);
    time.signal();
  }
  let intervalId;
  intervalId = setInterval(() => {
    time.value++;
    time.signal();
  }, 1e3);
  const handlePageLeave = () => {
    localStorage.setItem("time-on-page", `${time.value}`);
  };
  window.addEventListener("beforeunload", handlePageLeave);
  return () => {
    window.removeEventListener("beforeunload", handlePageLeave);
    handlePageLeave();
    clearInterval(intervalId);
  };
})(state, ...state.getAll([{ id: 5, bind: 1 }])), bind: "1" }, { fn: (state) => /* @__PURE__ */ ((state2, toastTimeoutId2, isToastShowing2) => {
  return () => {
    clearTimeout(toastTimeoutId2.value);
    isToastShowing2.value = false;
    isToastShowing2.signal();
  };
})(state, ...state.getAll([{ id: 3 }, { id: 2 }])), bind: "1" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
  globalThis.pd[url] = data;
}
