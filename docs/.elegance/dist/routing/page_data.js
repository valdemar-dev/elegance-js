let url = "/routing";
export const data = { state: [{ id: 37, value: ["/pages/recipes/cake/page.ts"] }, { id: 38, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 37 }, { id: 6 }]));
} }], soa: [{ "id": 38, "key": 29, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
