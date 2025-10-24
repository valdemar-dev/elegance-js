let url = "/middleware";
export const data = { state: [{ id: 12, value: ["export async function Middleware(req, res, next) {}"] }, { id: 13, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 12 }, { id: 2 }]));
} }, { id: 14, value: ["const middlewares = await import(middlewareFile);"] }, { id: 15, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 14 }, { id: 2 }]));
} }, { id: 16, value: ["req: http.IncomingMessage, res: http.ServerResponse"] }, { id: 17, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 16 }, { id: 2 }]));
} }], soa: [{ "id": 13, "key": 16, "attribute": "onclick" }, { "id": 15, "key": 17, "attribute": "onclick" }, { "id": 17, "key": 18, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
