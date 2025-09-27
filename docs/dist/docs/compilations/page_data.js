let url = "/docs/compilations";
export const data = { state: [] };
if (!globalThis.pd) {
  globalThis.pd = {};
  globalThis.pd[url] = data;
}
