let url = "/middleware";
export const data = { state: [{ id: 31, value: ["export async function Middleware(req, res, next) {}"] }, { id: 32, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 31 }, { id: 6 }]));
} }, { id: 33, value: ["const middlewares = await import(middlewareFile);"] }, { id: 34, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 33 }, { id: 6 }]));
} }, { id: 35, value: ["req: http.IncomingMessage, res: http.ServerResponse"] }, { id: 36, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 35 }, { id: 6 }]));
} }], soa: [{ "id": 32, "key": 26, "attribute": "onclick" }, { "id": 34, "key": 27, "attribute": "onclick" }, { "id": 36, "key": 28, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
