let url = "/";
export const data = { state: [{ id: 20, value: ["npx create-elegance-app my-app"] }, { id: 21, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 20 }, { id: 2 }]));
} }, { id: 22, value: ["npx dev"] }, { id: 23, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 22 }, { id: 2 }]));
} }, { id: 24, value: ["http://localhost:3000/"] }, { id: 25, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 24 }, { id: 2 }]));
} }], soa: [{ "id": 21, "key": 20, "attribute": "onclick" }, { "id": 23, "key": 21, "attribute": "onclick" }, { "id": 25, "key": 22, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
