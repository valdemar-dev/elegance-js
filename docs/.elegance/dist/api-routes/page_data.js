let url = "/api-routes";
export const data = { state: [{ id: 11, value: ["localhost:3000/api/my-route"] }, { id: 12, value: function anonymous(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 11 }, { id: 6 }]));
} }, { id: 13, value: ["/pages/api/my-route/route.ts"] }, { id: 14, value: function anonymous2(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 13 }, { id: 6 }]));
} }, { id: 15, value: ["export async function GET(req, res) {}"] }, { id: 16, value: function anonymous3(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 15 }, { id: 6 }]));
} }, { id: 17, value: ["req: http.IncomingMessage, res: http.ServerResponse"] }, { id: 18, value: function anonymous4(state, event) {
  (async (_, codeContent2, toastContent2) => {
    await navigator.clipboard.writeText(`${codeContent2.value}`);
    toastContent2.value = "Copied to Clipboard";
    toastContent2.signal();
  })(event, ...state.getAll([{ id: 17 }, { id: 6 }]));
} }], soa: [{ "id": 12, "key": 16, "attribute": "onclick" }, { "id": 14, "key": 17, "attribute": "onclick" }, { "id": 16, "key": 18, "attribute": "onclick" }, { "id": 18, "key": 19, "attribute": "onclick" }] };
if (!globalThis.pd) {
  globalThis.pd = {};
}
;
globalThis.pd[url] = data;
