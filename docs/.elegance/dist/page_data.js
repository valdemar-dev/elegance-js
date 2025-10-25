let url = "/";
export const data = { state: [{ id: 19, value: ["npx create-elegance-app my-app"] }, { id: 20, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 19 }, { id: 5 }]));
} }, { id: 21, value: ["npx dev"] }, { id: 22, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 21 }, { id: 5 }]));
} }, { id: 23, value: ["http://localhost:3000/"] }, { id: 24, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 23 }, { id: 5 }]));
} }], soa: [{ "id": 20, "key": 20, "attribute": "onclick" }, { "id": 22, "key": 21, "attribute": "onclick" }, { "id": 24, "key": 22, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
