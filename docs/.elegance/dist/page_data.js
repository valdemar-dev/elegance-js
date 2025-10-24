let url = "/";
export const data = { state: [{ id: 21, value: ["/pages/recipes/cake/page.ts"] }, { id: 22, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 21 }, { id: 5 }]));
} }], soa: [{ "id": 22, "key": 19, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
