let url = "/";
export const data = { state: [{ id: 39, value: ["npx create-elegance-app my-app"] }, { id: 40, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 39 }, { id: 6 }]));
} }, { id: 41, value: ["npx dev"] }, { id: 42, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 41 }, { id: 6 }]));
} }, { id: 43, value: ["http://localhost:3000/"] }, { id: 44, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 43 }, { id: 6 }]));
} }], soa: [{ "id": 40, "key": 30, "attribute": "onclick" }, { "id": 42, "key": 31, "attribute": "onclick" }, { "id": 44, "key": 32, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
