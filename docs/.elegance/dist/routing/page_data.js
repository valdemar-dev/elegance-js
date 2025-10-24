let url = "/routing";
export const data = { state: [{ id: 18, value: ["/pages/recipes/cake/page.ts"] }, { id: 19, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 18 }, { id: 2 }]));
} }], soa: [{ "id": 19, "key": 19, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
