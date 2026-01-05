const PAGE_MAP = /* @__PURE__ */ new Map();
const LAYOUT_MAP = /* @__PURE__ */ new Map();
async function gatherPages(requestId) {
}
async function compileStaticPages(requestId) {
}
async function compileDynamicPage(requestId, pathname) {
}
function resolveRequest(requestId, content) {
  process.send?.({ requestId, content });
}
process.on("message", (request) => {
  switch (request.action) {
    case "compile-static-pages":
      compileStaticPages(request.id);
      break;
    case "gather-pages":
      gatherPages(request.id);
      break;
    case "compile-dynamic-page":
      compileDynamicPage(request.id, request.content);
      break;
  }
});
setTimeout(() => {
}, 1e3);
