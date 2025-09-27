let url = "/docs/running";
export const data = { state: [] };
if (!globalThis.pd) {
  globalThis.pd = {};
  globalThis.pd[url] = data;
}
